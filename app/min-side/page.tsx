'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import {
	ArrowsModal,
	BowModal,
	EquipmentSection,
	PracticeCreateModal,
	PracticeDetailsModal,
	PracticesSection,
	ProfileCard,
	ProfileEditModal,
	ProfileMenu,
	StatsSummary,
	usePracticeDetails,
	useRoundTypes,
} from '@/components';
import { useEquipmentData } from '@/components/EquipmentSection/useEquipmentData';
import * as Sentry from '@sentry/nextjs';
import { PracticeCreateInput } from '@/components/Practices/PracticeCreateModal';
import { MyPageSkeleton } from './Skeleton';
import type { Arrow, Bow, Practice, StatsResponse, User } from '@/lib/types';

export default function MyPage() {
	const [profile, setProfile] = useState<User | null>(null);
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
	const [practiceReloadKey, setPracticeReloadKey] = useState(0);
	const [deletedPracticeId, setDeletedPracticeId] = useState<string | null>(null);
	const { fetchPracticeDetails } = usePracticeDetails();
	const { roundTypes } = useRoundTypes();
	const { bows, arrows } = useEquipmentData();
	const router = useRouter();

	useEffect(() => {
		Promise.all([fetchProfile(), fetchStats()]).finally(() => setLoading(false));
	}, []);

	const fetchProfile = async () => {
		try {
			const response = await fetch('/api/profile');
			if (!response.ok) {
				if (response.status === 401) {
					// Best practice: redirect to login rather than rendering a partially broken page.
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
			Sentry.captureException(err, { tags: { page: 'min-side', action: 'fetchProfile' } });
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

			setPracticeReloadKey((k) => k + 1);
			await fetchStats();
		} catch (err) {
			Sentry.captureException(err, { tags: { page: 'min-side', action: 'create-practice' } });
			throw err;
		}
	};

	const handlePracticeDeleted = async (id: string) => {
		setDeletedPracticeId(id);
		setSelectedPractice((prev) => (prev?.id === id ? null : prev));
		setPracticeModalOpen(false);
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

	const summarySubtitle = `Piler skutt siste 7 dager, siste 30 dager og totalt`;

	return (
		<div className={styles.page}>
			<header className={styles.headerBar}>
				<div className={styles.logoBox}>
					<Image src="/assets/logo.png" alt="Bueboka Logo" width={28} height={28} />
				</div>
				<div className={styles.brand}>Bueboka</div>

				<ProfileMenu />
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
			<PracticesSection
				onCreate={() => setCreatePracticeOpen(true)}
				onSelectPractice={handleSelectPractice}
				reloadKey={practiceReloadKey}
				deletedPracticeId={deletedPracticeId}
			/>

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
								length: selectedArrows.length ?? null,
								weight: (selectedArrows as any).weight ?? null,
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
				onDeleted={handlePracticeDeleted}
			/>

			<PracticeCreateModal
				open={createPracticeOpen}
				onClose={() => setCreatePracticeOpen(false)}
				onCreate={handleCreatePractice}
				roundTypes={roundTypes}
				bows={bows.map((b) => ({ id: b.id, name: b.name, type: b.type, isFavorite: (b as any).isFavorite }))}
				arrows={arrows.map((a) => ({ id: a.id, name: a.name, material: a.material, isFavorite: (a as any).isFavorite }))}
			/>
		</div>
	);
}
