'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import {
	ArrowsModal,
	BowModal,
	Button,
	EquipmentSection,
	PracticeCreateModal,
	PracticeDetailsModal,
	PracticesList,
	ProfileCard,
	ProfileEditModal,
	ProfileMenu,
	StatsSummary,
} from '@/components';
import { Plus } from 'lucide-react';
import { signOut } from '@/lib/auth-client';
import * as Sentry from '@sentry/nextjs';
import { PracticeCreateInput } from '@/components/Practices/PracticeCreateModal';
import { MyPageSkeleton } from './Skeleton';
import type { Arrow, Bow, Practice, StatsResponse, User } from '@/lib/types';

type PracticeCardItem = { id: string; date: string; arrowsShot: number };

export default function MyPage() {
	const [profile, setProfile] = useState<User | null>(null);
	const [bows, setBows] = useState<Bow[]>([]);
	const [arrows, setArrows] = useState<Arrow[]>([]);
	const [practiceCards, setPracticeCards] = useState<PracticeCardItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [practiceModalOpen, setPracticeModalOpen] = useState(false);
	const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
	const [createPracticeOpen, setCreatePracticeOpen] = useState(false);
	const [profileModalOpen, setProfileModalOpen] = useState(false);
	const [bowModalOpen, setBowModalOpen] = useState(false);
	const [arrowsModalOpen, setArrowsModalOpen] = useState(false);
	const [selectedBow, setSelectedBow] = useState<Bow | null>(null);
	const [selectedArrows, setSelectedArrows] = useState<Arrow | null>(null);
	const [stats, setStats] = useState<StatsResponse['stats']>({ last7Days: 0, last30Days: 0, overall: 0 });
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await signOut();
			router.push('/');
		} catch (err) {
			Sentry.captureException(err, {
				tags: { page: 'min-side', action: 'logout' },
				extra: { message: 'Logout failed' },
			});
			console.error('Logout failed', err);
		}
	};

	useEffect(() => {
		Promise.all([fetchProfile(), fetchBows(), fetchArrows(), fetchPracticeCards(), fetchStats()]).finally(() => setLoading(false));
	}, []);

	const fetchProfile = async () => {
		try {
			const response = await fetch('/api/profile');
			if (!response.ok) {
				if (response.status === 401) setError('Du må være logget inn');
				else setError('Kunne ikke hente brukerdata');
				return;
			}
			const data = await response.json();
			setProfile(data.profile);
		} catch (err) {
			setError('En feil oppstod');
			Sentry.captureException(err, { tags: { page: 'min-side', action: 'fetchProfile' } });
		}
	};

	const fetchBows = async () => {
		try {
			const res = await fetch('/api/bows');
			if (!res.ok) return;
			const data = await res.json();
			setBows(data.bows ?? []);
		} catch (err) {
			Sentry.captureException(err, { tags: { page: 'min-side', action: 'fetchBows' } });
		}
	};

	const fetchArrows = async () => {
		try {
			const res = await fetch('/api/arrows');
			if (!res.ok) return;
			const data = await res.json();
			setArrows(data.arrows ?? []);
		} catch (err) {
			Sentry.captureException(err, { tags: { page: 'min-side', action: 'fetchArrows' } });
		}
	};

	const fetchPracticeCards = async () => {
		try {
			const res = await fetch('/api/practices/cards');
			if (!res.ok) return;
			const data = await res.json();
			setPracticeCards(data.practices ?? []);
		} catch (err) {
			Sentry.captureException(err, { tags: { page: 'min-side', action: 'fetchPracticeCards' } });
		}
	};

	const fetchPracticeDetails = async (id: string): Promise<Practice | null> => {
		try {
			const res = await fetch(`/api/practices/${id}/details`);
			if (!res.ok) return null;
			const data = await res.json();
			return (data.practice ?? null) as Practice | null;
		} catch (err) {
			Sentry.captureException(err, { tags: { page: 'min-side', action: 'fetchPracticeDetails' } });
			return null;
		}
	};

	const fetchStats = async () => {
		try {
			const res = await fetch('/api/stats');
			if (!res.ok) return;
			const data = (await res.json()) as StatsResponse;
			if (data && data.stats) {
				setStats({
					last7Days: data.stats.last7Days ?? 0,
					last30Days: data.stats.last30Days ?? 0,
					overall: data.stats.overall ?? 0,
				});
			}
		} catch (err) {
			Sentry.captureException(err, { tags: { page: 'min-side', action: 'fetchStats' } });
		}
	};

	const handleCreatePractice = async (input: PracticeCreateInput) => {
		try {
			const res = await fetch('/api/practices', {
				method: 'POST',
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

				let errMsg: string = 'Kunne ikke lagre trening';
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

			await fetchPracticeCards();
			await fetchStats();
		} catch (err) {
			Sentry.captureException(err, { tags: { page: 'min-side', action: 'create-practice' } });
			throw err;
		}
	};

	const handlePracticeDeleted = async (id: string) => {
		setPracticeCards((prev) => prev.filter((p) => p.id !== id));
		setSelectedPractice((prev) => {
			if (prev?.id === id) return null;
			return prev;
		});
		if (selectedPractice?.id === id) {
			setPracticeModalOpen(false);
		}
		await fetchStats();
	};

	const handleSelectPractice = async (id: string) => {
		const full = await fetchPracticeDetails(id);
		if (full) {
			setSelectedPractice(full);
			setPracticeModalOpen(true);
		}
	};

	if (loading) {
		return <MyPageSkeleton />;
	}

	if (error || !profile) {
		return (
			<div className={styles.page}>
				<div className={styles.headerBar}>
					<div className={styles.logoBox}>
						<Image src="/assets/logo.png" alt="Bueboka Logo" width={28} height={28} />
					</div>
					<div className={styles.brand}>Bueboka</div>
				</div>
				<main className={styles.main}>
					<div className={styles.card}>
						<div className={styles.empty}>{error || 'Du må være logget inn for å se denne siden.'}</div>
					</div>
				</main>
			</div>
		);
	}

	const hasPractices = practiceCards.length > 0;

	const summarySubtitle = `Piler skutt siste 7 dager, siste 30 dager og totalt`;

	return (
		<div className={styles.page}>
			<header className={styles.headerBar}>
				<div className={styles.logoBox}>
					<Image src="/assets/logo.png" alt="Bueboka Logo" width={28} height={28} />
				</div>
				<div className={styles.brand}>Bueboka</div>

				<ProfileMenu onLogout={handleLogout} />
			</header>

			<main className={styles.main}>
				<div className={styles.profileContainer}>
					<div className={styles.profileSummaryGrid}>
						<div>
							<ProfileCard
								name={profile.name}
								email={profile.email}
								club={profile.club}
								image={profile.image}
								onEdit={() => setProfileModalOpen(true)}
							/>
						</div>

						<div className={styles.summaryCard}>
							<h3 className={styles.summaryTitle}>Oppsummering</h3>
							<p className={styles.summarySubtitle}>{summarySubtitle}</p>
							<StatsSummary last7Days={stats.last7Days} last30Days={stats.last30Days} overall={stats.overall} />
						</div>
					</div>
				</div>
			</main>

			{/* Utstyr section */}
			<EquipmentSection
				bows={bows}
				arrows={arrows}
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

			{/* Practices moved to dedicated section below main card */}
			<section className={styles.practicesSection}>
				<div className={styles.practicesHeader}>
					<h2 className={styles.sectionTitleLight}>Treninger</h2>
					<Button
						label="Ny trening"
						onClick={() => setCreatePracticeOpen(true)}
						icon={<Plus size={18} />}
						width={240}
						buttonStyle={{ marginLeft: 'auto' }}
					/>
				</div>
				<div className={styles.practicesList}>
					{hasPractices ? (
						<PracticesList practices={practiceCards} onSelectPractice={handleSelectPractice} />
					) : (
						<div className={styles.placeholderCard}>Ingen treninger registrert ennå.</div>
					)}
				</div>
			</section>

			<ProfileEditModal
				isOpen={profileModalOpen}
				onClose={() => setProfileModalOpen(false)}
				user={{
					id: profile.id,
					name: profile.name,
					email: profile.email,
					club: profile.club,
				}}
				onProfileUpdate={fetchProfile}
			/>

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
				onSaved={fetchBows}
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
							}
						: undefined
				}
				onSaved={() => {
					setArrowsModalOpen(false);
					setSelectedArrows(null);
					fetchArrows();
				}}
			/>

			<PracticeDetailsModal
				open={practiceModalOpen}
				practice={selectedPractice || undefined}
				onClose={() => {
					setPracticeModalOpen(false);
					setSelectedPractice(null);
				}}
				onDeleted={handlePracticeDeleted}
			/>

			<PracticeCreateModal
				open={createPracticeOpen}
				onClose={() => setCreatePracticeOpen(false)}
				onCreate={handleCreatePractice}
				bows={bows}
				roundTypes={[]}
				arrows={arrows}
			/>
		</div>
	);
}
