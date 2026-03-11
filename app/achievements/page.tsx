'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuArrowLeft, LuTrophy } from 'react-icons/lu';
import { Button, Header } from '@/components';
import { AchievementBadge } from '@/components/Achievements/AchievementBadge';
import { AchievementProgress } from '@/lib/achievements/types';
import styles from './page.module.css';

interface AchievementData {
	achievements: AchievementProgress[];
	summary: {
		totalUnlocked: number;
		totalPoints: number;
		totalAchievements: number;
		completionPercentage: number;
	};
}

type FilterStatus = 'all' | 'unlocked' | 'locked';
type FilterCategory = 'all' | 'MILESTONE' | 'STREAK' | 'PERFORMANCE' | 'COMPETITION' | 'DEDICATION' | 'EXPLORATION' | 'SPECIAL';
type FilterRarity = 'all' | 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export default function AchievementsPage() {
	const [data, setData] = useState<AchievementData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
	const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
	const [filterRarity, setFilterRarity] = useState<FilterRarity>('all');
	const router = useRouter();

	useEffect(() => {
		fetchAchievements();
	}, []);

	const fetchAchievements = async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/achievements');

			if (response.status === 401) {
				router.push('/logg-inn');
				return;
			}

			if (!response.ok) {
				throw new Error('Kunne ikke hente merker');
			}

			const result = await response.json();
			setData(result);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'En feil oppstod');
		} finally {
			setLoading(false);
		}
	};

	const filteredAchievements =
		data?.achievements.filter((achievement) => {
			// Filter by status
			if (filterStatus === 'unlocked' && !achievement.isUnlocked) return false;
			if (filterStatus === 'locked' && achievement.isUnlocked) return false;

			// Filter by category
			if (filterCategory !== 'all' && achievement.achievement.category !== filterCategory) return false;

			// Filter by rarity
			if (filterRarity !== 'all' && achievement.achievement.rarity !== filterRarity) return false;

			return true;
		}) || [];

	if (loading) {
		return (
			<>
				<Header />
				<div className={styles.container}>
					<div className={styles.loading}>
						<div className={styles.spinner} />
						<p>Laster prestasjoner...</p>
					</div>
				</div>
			</>
		);
	}

	if (error) {
		return (
			<>
				<Header />
				<div className={styles.container}>
					<div className={styles.error}>
						<p>❌ {error}</p>
					</div>
				</div>
			</>
		);
	}

	if (!data) {
		return null;
	}

	return (
		<>
			<Header />
			<main className={styles.page}>
					<div className={styles.backButtonContainer}>
						<Button label="Tilbake" onClick={() => router.back()} icon={<LuArrowLeft size={18} />} size="small" buttonType="outline" />
					</div>
					<div className={styles.header}>
						<h1 className={styles.title}>
							<LuTrophy size={40} />
							Mine prestasjoner
						</h1>
						<p className={styles.subtitle}>Lås opp prestasjoner ved å trene og delta i konkurranser</p>
					</div>
					<div className={styles.summaryGrid}>
						<div className={styles.summaryCard}>
							<h3>Låst Opp</h3>
							<p className={styles.value}>{data.summary.totalUnlocked}</p>
						</div>
						<div className={styles.summaryCard}>
							<h3>Totalt</h3>
							<p className={styles.value}>{data.summary.totalAchievements}</p>
						</div>
						<div className={styles.summaryCard}>
							<h3>Fullført</h3>
							<p className={styles.value}>{data.summary.completionPercentage}%</p>
						</div>
						<div className={styles.summaryCard}>
							<h3>Poeng</h3>
							<p className={styles.value}>{data.summary.totalPoints}</p>
						</div>
					</div>
					<div className={styles.filters}>
						<div className={styles.filterGroup}>
							<span className={styles.filterLabel}>Status:</span>
							<div className={styles.filterButtons}>
								<button
									className={`${styles.filterButton} ${filterStatus === 'all' ? styles.active : ''}`}
									onClick={() => setFilterStatus('all')}
								>
									Alle
								</button>
								<button
									className={`${styles.filterButton} ${filterStatus === 'unlocked' ? styles.active : ''}`}
									onClick={() => setFilterStatus('unlocked')}
								>
									Låst Opp
								</button>
								<button
									className={`${styles.filterButton} ${filterStatus === 'locked' ? styles.active : ''}`}
									onClick={() => setFilterStatus('locked')}
								>
									Låst
								</button>
							</div>
						</div>
						<div className={styles.filterGroup}>
							<span className={styles.filterLabel}>Kategori:</span>
							<div className={styles.filterButtons}>
								<button
									className={`${styles.filterButton} ${filterCategory === 'all' ? styles.active : ''}`}
									onClick={() => setFilterCategory('all')}
								>
									Alle
								</button>
								<button
									className={`${styles.filterButton} ${filterCategory === 'MILESTONE' ? styles.active : ''}`}
									onClick={() => setFilterCategory('MILESTONE')}
								>
									Milepæler
								</button>
								<button
									className={`${styles.filterButton} ${filterCategory === 'STREAK' ? styles.active : ''}`}
									onClick={() => setFilterCategory('STREAK')}
								>
									Rekker
								</button>
								<button
									className={`${styles.filterButton} ${filterCategory === 'PERFORMANCE' ? styles.active : ''}`}
									onClick={() => setFilterCategory('PERFORMANCE')}
								>
									Prestasjon
								</button>
								<button
									className={`${styles.filterButton} ${filterCategory === 'COMPETITION' ? styles.active : ''}`}
									onClick={() => setFilterCategory('COMPETITION')}
								>
									Konkurranse
								</button>
							</div>
						</div>
						<div className={styles.filterGroup}>
							<span className={styles.filterLabel}>Sjeldenhet:</span>
							<div className={styles.filterButtons}>
								<button
									className={`${styles.filterButton} ${filterRarity === 'all' ? styles.active : ''}`}
									onClick={() => setFilterRarity('all')}
								>
									Alle
								</button>
								<button
									className={`${styles.filterButton} ${filterRarity === 'COMMON' ? styles.active : ''}`}
									onClick={() => setFilterRarity('COMMON')}
								>
									Vanlig
								</button>
								<button
									className={`${styles.filterButton} ${filterRarity === 'UNCOMMON' ? styles.active : ''}`}
									onClick={() => setFilterRarity('UNCOMMON')}
								>
									Uvanlig
								</button>
								<button
									className={`${styles.filterButton} ${filterRarity === 'RARE' ? styles.active : ''}`}
									onClick={() => setFilterRarity('RARE')}
								>
									Sjelden
								</button>
								<button
									className={`${styles.filterButton} ${filterRarity === 'EPIC' ? styles.active : ''}`}
									onClick={() => setFilterRarity('EPIC')}
								>
									Episk
								</button>
								<button
									className={`${styles.filterButton} ${filterRarity === 'LEGENDARY' ? styles.active : ''}`}
									onClick={() => setFilterRarity('LEGENDARY')}
								>
									Legendarisk
								</button>
							</div>
						</div>
					</div>
					{filteredAchievements.length > 0 ? (
						<div className={styles.achievementGrid}>
							{filteredAchievements.map((progress) => (
								<AchievementBadge key={progress.achievement.id} progress={progress} size="medium" showProgress={true} />
							))}
						</div>
					) : (
						<div className={styles.empty}>
							<h3>Ingen merker funnet</h3>
							<p>Prøv å endre filtrene dine</p>
						</div>
					)}
			</main>
		</>
	);
}
