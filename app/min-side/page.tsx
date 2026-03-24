'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import {
	AchievementUnlockModal,
	ArrowsModal,
	BowModal,
	Button,
	CompetitionFormModal,
	EquipmentSection,
	Footer,
	Header,
	MobileActionButton,
	PracticeDetailsModal,
	PracticeFormModal,
	PracticesSection,
	ProfileCard,
	StatsSummary,
	usePracticeDetails,
	useWhatsNew,
	WhatsNewModal,
} from '@/components';
import { MyPageSkeleton } from './Skeleton';
import { useEquipmentData } from '@/components/EquipmentSection/useEquipmentData';
import { PracticeFormInput } from '@/components/Practices/PracticeFormModal';
import { CompetitionFormInput } from '@/components/Competitions/CompetitionFormModal';
import type { Arrow, Bow, Practice, StatsResponse, User } from '@/lib/types';
import type { Achievement } from '@/lib/achievements/types';

export default function MyPage() {
	const [profile, setProfile] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [practiceModalOpen, setPracticeModalOpen] = useState(false);
	const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
	const [practiceFormOpen, setPracticeFormOpen] = useState(false);
	const [practiceFormMode, setPracticeFormMode] = useState<'create' | 'edit'>('create');
	const [competitionFormOpen, setCompetitionFormOpen] = useState(false);
	const [competitionFormMode, setCompetitionFormMode] = useState<'create' | 'edit'>('create');
	const [selectedCompetition, setSelectedCompetition] = useState<any>(null);
	const [bowModalOpen, setBowModalOpen] = useState(false);
	const [arrowsModalOpen, setArrowsModalOpen] = useState(false);
	const [selectedBow, setSelectedBow] = useState<Bow | null>(null);
	const [selectedArrows, setSelectedArrows] = useState<Arrow | null>(null);
	const emptyPeriod = { totalArrows: 0, scoredArrows: 0, unscoredArrows: 0, avgScorePerArrow: null };
	const [stats, setStats] = useState<StatsResponse['stats']>({ last7Days: emptyPeriod, last30Days: emptyPeriod, overall: emptyPeriod });
	const [practiceReloadKey, setPracticeReloadKey] = useState(0);
	const [deletedPracticeId, setDeletedPracticeId] = useState<string | null>(null);
	const [achievementModalOpen, setAchievementModalOpen] = useState(false);
	const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
	const { fetchPracticeDetails } = usePracticeDetails();
	const { bows, arrows, loading: equipmentLoading } = useEquipmentData();
	const { hasSeenWhatsNew, isLoading: whatsNewLoading, markAsSeen } = useWhatsNew();
	const [whatsNewOpen, setWhatsNewOpen] = useState(false);
	const router = useRouter();

	useEffect(() => {
		Promise.all([fetchProfile(), fetchStats()]).finally(() => setLoading(false));
	}, []);

	// Show WhatsNew modal for users who haven't seen it
	useEffect(() => {
		if (!whatsNewLoading && !hasSeenWhatsNew && profile) {
			setWhatsNewOpen(true);
		}
	}, [whatsNewLoading, hasSeenWhatsNew, profile]);

	const fetchProfile = async () => {
		try {
			const response = await fetch('/api/profile');
			if (!response.ok) {
				if (response.status === 401) {
					router.replace('/logg-inn');
					return;
				}
				setError('Kunne ikke hente brukerdata');
				return;
			}
			const data = await response.json();
			setProfile(data.profile);
		} catch (err) {
			setError('En feil oppstod');
			// error logged to console
		}
	};

	const handleProfileImageUpdate = async (newImage: string | null) => {
		if (!profile) return;

		try {
			// Optimistically update the UI
			setProfile((prev) => (prev ? { ...prev, image: newImage } : null));

			const response = await fetch('/api/users', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: profile.name, // Keep existing name
					club: profile.club, // Keep existing club
					image: newImage,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to update profile image');
			}

			// Re-fetch to ensure sync (optional, but good for consistency)
			await fetchProfile();
		} catch (error) {
			console.error('Error updating profile image:', error);
			setError('Kunne ikke oppdatere profilbilde');
			// Revert on error could be complex without storing previous state,
			// but fetchProfile() would fix it eventually.
			await fetchProfile(); // Revert to server state
		}
	};

	const fetchStats = async () => {
		try {
			const res = await fetch('/api/stats');
			if (!res.ok) return;
			const data = (await res.json()) as StatsResponse;
			if (data && data.stats) {
				setStats(data.stats);
			}
		} catch (err) {
			// error logged to console
		}
	};

	const handleSavePractice = async (input: PracticeFormInput) => {
		const isEditMode = practiceFormMode === 'edit';
		const url = isEditMode && selectedPractice ? `/api/practices/${selectedPractice.id}` : '/api/practices';
		const method = isEditMode ? 'PATCH' : 'POST';

		try {
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input),
			});

			if (!res.ok) {
				let details: any = null;
				try {
					details = await res.json();
				} catch {
					// ignore
				}

				let errMsg: string = `Kunne ikke ${isEditMode ? 'oppdatere' : 'lagre'} trening`;
				const fieldErrors = details && typeof details === 'object' ? (details as any).fieldErrors : undefined;
				if (res.status === 400 && fieldErrors && typeof fieldErrors === 'object') {
					const msgs = Object.entries(fieldErrors)
						.map(([field, msg]) => `${field}: ${msg}`)
						.join('\n');
					errMsg = `Manglende/ugyldige felt:\n${msgs}`;
				} else if (details && typeof details === 'object' && (details as any).error) {
					errMsg = (details as any).error;
				}

				return Promise.reject(new Error(errMsg));
			}

			setPracticeReloadKey((k) => k + 1);
			await fetchStats();
			setPracticeFormOpen(false);
			if (isEditMode) {
				setSelectedPractice(null);
			}

			// Check for newly unlocked achievements (only for new practices, not edits)
			if (!isEditMode) {
				try {
					const achievementRes = await fetch('/api/achievements/check', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
					});

					if (achievementRes.ok) {
						const achievementData = await achievementRes.json();
						if (achievementData.newAchievements && achievementData.newAchievements.length > 0) {
							setUnlockedAchievements(achievementData.newAchievements);
							setAchievementModalOpen(true);
						}
					}
				} catch (achievementErr) {
					// Don't fail the whole operation if achievement check fails
					// error logged to console
				}
			}
		} catch (err) {
			// error logged to console
			throw err;
		}
	};

	const handleSaveCompetition = async (input: CompetitionFormInput) => {
		const isEditMode = competitionFormMode === 'edit';
		const url = isEditMode && selectedCompetition ? `/api/competitions/${selectedCompetition.id}` : '/api/competitions';
		const method = isEditMode ? 'PATCH' : 'POST';

		try {
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input),
			});

			if (!res.ok) {
				let details: any = null;
				try {
					details = await res.json();
				} catch {
					// ignore
				}

				let errMsg: string = `Kunne ikke ${isEditMode ? 'oppdatere' : 'lagre'} konkurranse`;
				const fieldErrors = details && typeof details === 'object' ? (details as any).fieldErrors : undefined;
				if (res.status === 400 && fieldErrors && typeof fieldErrors === 'object') {
					const msgs = Object.entries(fieldErrors)
						.map(([field, msg]) => `${field}: ${msg}`)
						.join('\n');
					errMsg = `Manglende/ugyldige felt:\n${msgs}`;
				} else if (details && typeof details === 'object' && (details as any).error) {
					errMsg = (details as any).error;
				}

				return Promise.reject(new Error(errMsg));
			}

			setPracticeReloadKey((k) => k + 1);
			await fetchStats();
			setCompetitionFormOpen(false);
			if (isEditMode) {
				setSelectedCompetition(null);
			}

			// Check for newly unlocked achievements (only for new competitions, not edits)
			if (!isEditMode) {
				try {
					const achievementRes = await fetch('/api/achievements/check', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
					});

					if (achievementRes.ok) {
						const achievementData = await achievementRes.json();
						if (achievementData.newAchievements && achievementData.newAchievements.length > 0) {
							setUnlockedAchievements(achievementData.newAchievements);
							setAchievementModalOpen(true);
						}
					}
				} catch (achievementErr) {
					// error logged to console
				}
			}
		} catch (err) {
			// error logged to console
			throw err;
		}
	};

	const handlePracticeDeleted = async (id: string) => {
		setDeletedPracticeId(id);
		setSelectedPractice((prev) => (prev?.id === id ? null : prev));
		setPracticeModalOpen(false);
		await fetchStats();
	};

	const handleSelectPractice = async (id: string, practiceType?: string) => {
		const full = await fetchPracticeDetails(id, practiceType);
		if (full) {
			setSelectedPractice(full);
			setPracticeModalOpen(true);
		}
	};

	const handleWhatsNewClose = () => {
		setWhatsNewOpen(false);
		markAsSeen();
	};

	if (loading) {
		return <MyPageSkeleton />;
	}

	if (error || !profile) {
		return (
			<div className={styles.page}>
				<Header />
				<main className={styles.main}>
					<div className={styles.card}>
						<div className={styles.empty}>{error || 'Du må være logget inn for å se denne siden.'}</div>
					</div>
				</main>
			</div>
		);
	}

	const summarySubtitle = `Piler skutt siste 7 dager, siste 30 dager og totalt`;

	return (
		<div className={styles.page}>
			<Header />
			<main id="main-content" className={styles.main}>
				<div className={styles.profileContainer}>
					<div className={styles.profileSummaryGrid}>
						<div>
							<ProfileCard
								name={profile.name}
								email={profile.email}
								club={profile.club}
								image={profile.image}
								skytternr={profile.skytternr}
								onImageUpdate={handleProfileImageUpdate}
							/>
						</div>
						<div className={styles.summaryCard}>
							<h3 className={styles.summaryTitle}>Oppsummering</h3>
							<p className={styles.summarySubtitle}>{summarySubtitle}</p>
							<StatsSummary last7Days={stats.last7Days} last30Days={stats.last30Days} overall={stats.overall} />
							<div className={styles.statsButtonContainer}>
								<Button label="Se detaljert statistikk" onClick={() => router.push('/statistikk')} width={240} />
							</div>
						</div>
					</div>
				</div>
				<EquipmentSection
					bows={bows}
					arrows={arrows}
					isLoading={equipmentLoading}
					onCreateBow={() => {
						setSelectedBow(null);
						setBowModalOpen(true);
					}}
					onCreateArrows={() => setArrowsModalOpen(true)}
					onSelectBow={(bow) => {
						setSelectedBow(bow);
						setBowModalOpen(true);
					}}
					onSelectArrows={(a) => {
						setSelectedArrows(a);
						setArrowsModalOpen(true);
					}}
				/>
				<PracticesSection
					onCreate={() => {
						setPracticeFormMode('create');
						setPracticeFormOpen(true);
					}}
					onCreateCompetition={() => {
						setCompetitionFormMode('create');
						setCompetitionFormOpen(true);
					}}
					onSelectPractice={handleSelectPractice}
					reloadKey={practiceReloadKey}
					deletedPracticeId={deletedPracticeId}
				/>
			</main>
			<Footer />
			<WhatsNewModal open={whatsNewOpen} onClose={handleWhatsNewClose} />
			<BowModal
				open={bowModalOpen}
				onClose={() => {
					setBowModalOpen(false);
					setSelectedBow(null);
				}}
				editingBow={
					selectedBow
						? {
								id: selectedBow.id,
								name: selectedBow.name,
								type: selectedBow.type as any,
								eyeToNock: selectedBow.eyeToNock,
								aimMeasure: selectedBow.aimMeasure,
								eyeToSight: selectedBow.eyeToSight,
								isFavorite: selectedBow.isFavorite,
								notes: selectedBow.notes,
							}
						: undefined
				}
			/>
			<ArrowsModal
				open={arrowsModalOpen}
				onClose={() => {
					setArrowsModalOpen(false);
					setSelectedArrows(null);
				}}
				editingArrows={
					selectedArrows
						? {
								id: selectedArrows.id,
								name: selectedArrows.name,
								material: selectedArrows.material as any,
								isFavorite: (selectedArrows as any).isFavorite,
								arrowsCount: (selectedArrows as any).arrowsCount ?? null,
								diameter: (selectedArrows as any).diameter ?? null,
								length: selectedArrows.length ?? null,
								weight: (selectedArrows as any).weight ?? null,
								spine: (selectedArrows as any).spine ?? '',
							}
						: undefined
				}
			/>
			<PracticeDetailsModal
				open={practiceModalOpen}
				practice={selectedPractice || undefined}
				onClose={() => {
					setPracticeModalOpen(false);
					setSelectedPractice(null);
				}}
				onEdit={() => {
					setPracticeModalOpen(false);
					if (selectedPractice?.practiceType === 'KONKURRANSE') {
						setSelectedCompetition(selectedPractice);
						setCompetitionFormMode('edit');
						setCompetitionFormOpen(true);
					} else {
						setPracticeFormMode('edit');
						setPracticeFormOpen(true);
					}
				}}
				onDeleted={handlePracticeDeleted}
			/>
			<PracticeFormModal
				open={practiceFormOpen}
				mode={practiceFormMode}
				onClose={() => {
					setPracticeFormOpen(false);
					if (practiceFormMode === 'edit') {
						setSelectedPractice(null);
					}
				}}
				onSave={handleSavePractice}
				practice={
					practiceFormMode === 'edit' && selectedPractice
						? {
								id: selectedPractice.id,
								date: selectedPractice.date,
								arrowsShot: selectedPractice.arrowsShot,
								location: selectedPractice.location,
								environment: selectedPractice.environment,
								weather: selectedPractice.weather,
								practiceCategory: (selectedPractice as any).practiceCategory,
								notes: selectedPractice.notes,
								rating: (selectedPractice as any).rating,
								bowId: selectedPractice.bowId,
								arrowsId: selectedPractice.arrowsId,
								ends: selectedPractice.ends,
							}
						: undefined
				}
				bows={bows.map((b) => ({ id: b.id, name: b.name, type: b.type, isFavorite: (b as any).isFavorite }))}
				arrows={arrows.map((a) => ({ id: a.id, name: a.name, material: a.material, isFavorite: (a as any).isFavorite }))}
			/>
			<CompetitionFormModal
				open={competitionFormOpen}
				mode={competitionFormMode}
				onClose={() => {
					setCompetitionFormOpen(false);
					if (competitionFormMode === 'edit') {
						setSelectedCompetition(null);
					}
				}}
				onSave={handleSaveCompetition}
				competition={
					competitionFormMode === 'edit' && selectedCompetition
						? {
								id: selectedCompetition.id,
								date: selectedCompetition.date,
								name: selectedCompetition.name,
								location: selectedCompetition.location,
								organizerName: selectedCompetition.organizerName,
								environment: selectedCompetition.environment,
								weather: selectedCompetition.weather,
								practiceCategory: selectedCompetition.practiceCategory,
								notes: selectedCompetition.notes,
								placement: selectedCompetition.placement,
								numberOfParticipants: selectedCompetition.numberOfParticipants,
								personalBest: selectedCompetition.personalBest,
								bowId: selectedCompetition.bowId,
								arrowsId: selectedCompetition.arrowsId,
								// Support both rounds (from competition state) and ends (from practice details modal)
								rounds:
									selectedCompetition.rounds ??
									selectedCompetition.ends?.map((e: any, i: number) => ({
										id: e.id,
										roundNumber: i + 1,
										arrows: e.arrows,
										distanceMeters: e.distanceMeters ?? null,
										targetSizeCm: e.targetSizeCm ?? null,
										roundScore: e.roundScore ?? null,
									})),
							}
						: undefined
				}
				bows={bows.map((b) => ({ id: b.id, name: b.name, type: b.type, isFavorite: (b as any).isFavorite }))}
				arrows={arrows.map((a) => ({ id: a.id, name: a.name, material: a.material, isFavorite: (a as any).isFavorite }))}
			/>
			<WhatsNewModal open={whatsNewOpen} onClose={handleWhatsNewClose} />
			{achievementModalOpen && unlockedAchievements.length > 0 && (
				<AchievementUnlockModal
					achievements={unlockedAchievements}
					onClose={() => setAchievementModalOpen(false)}
					onViewAll={() => {
						setAchievementModalOpen(false);
						router.push('/achievements');
					}}
				/>
			)}
			<MobileActionButton
				onCreatePractice={() => {
					setPracticeFormMode('create');
					setPracticeFormOpen(true);
				}}
				onCreateCompetition={() => {
					setCompetitionFormMode('create');
					setCompetitionFormOpen(true);
				}}
				onCreateBow={() => {
					setSelectedBow(null);
					setBowModalOpen(true);
				}}
				onCreateArrows={() => setArrowsModalOpen(true)}
			/>
		</div>
	);
}
