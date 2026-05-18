'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuArrowLeft, LuTrophy } from 'react-icons/lu';
import { Button, Footer, Header } from '@/components';
import { AchievementBadge } from '@/components/Achievements/AchievementBadge';
import { AchievementProgress } from '@/lib/achievements/types';
import { useTranslation } from '@/context/LanguageProvider';
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
	const { t } = useTranslation();
	const [data, setData] = useState<AchievementData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
	const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
	const [filterRarity, setFilterRarity] = useState<FilterRarity>('all');
	const router = useRouter();

	const fetchAchievements = async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/achievements');

			if (response.status === 401) {
				router.push('/logg-inn');
				return;
			}

			if (!response.ok) {
				throw new Error(t['common.error']);
			}

			const result = await response.json();
			setData(result);
		} catch (err) {
			setError(err instanceof Error ? err.message : t['common.error']);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAchievements();
	}, []);

	const filteredAchievements =
		data?.achievements.filter((achievement) => {
			if (filterStatus === 'unlocked' && !achievement.isUnlocked) return false;
			if (filterStatus === 'locked' && achievement.isUnlocked) return false;
			if (filterCategory !== 'all' && achievement.achievement.category !== filterCategory) return false;
			if (filterRarity !== 'all' && achievement.achievement.rarity !== filterRarity) return false;
			return true;
		}) || [];

	if (loading) {
		return (
			<>
				<Header />
				<main className={styles.page}>
					<div className={styles.container}>
						<div className={styles.loading}>
							<div className={styles.spinner} />
							<p>{t['achievements.loading']}</p>
						</div>
					</div>
				</main>
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
				<div className={styles.container}>
					<div className={styles.backButtonContainer}>
						<Button label={t['achievements.back']} onClick={() => router.back()} icon={<LuArrowLeft size={18} />} size="small" buttonType="outline" />
					</div>
					<div className={styles.header}>
						<h1 className={styles.title}>
							<LuTrophy size={40} />
							{t['achievements.title']}
						</h1>
						<p className={styles.subtitle}>{t['achievements.subtitle']}</p>
					</div>
					<div className={styles.summaryGrid}>
						<div className={styles.summaryCard}>
							<h3>{t['achievements.unlocked']}</h3>
							<p className={styles.value}>{data.summary.totalUnlocked}</p>
						</div>
						<div className={styles.summaryCard}>
							<h3>{t['achievements.total']}</h3>
							<p className={styles.value}>{data.summary.totalAchievements}</p>
						</div>
						<div className={styles.summaryCard}>
							<h3>{t['achievements.completed']}</h3>
							<p className={styles.value}>{data.summary.completionPercentage}%</p>
						</div>
						<div className={styles.summaryCard}>
							<h3>{t['achievements.points']}</h3>
							<p className={styles.value}>{data.summary.totalPoints}</p>
						</div>
					</div>
					<div className={styles.filters}>
						<div className={styles.filterGroup}>
							<span className={styles.filterLabel}>{t['achievements.statusFilter']}</span>
							<div className={styles.filterButtons}>
								<button className={`${styles.filterButton} ${filterStatus === 'all' ? styles.active : ''}`} onClick={() => setFilterStatus('all')}>
									{t['achievements.filterAll']}
								</button>
								<button
									className={`${styles.filterButton} ${filterStatus === 'unlocked' ? styles.active : ''}`}
									onClick={() => setFilterStatus('unlocked')}
								>
									{t['achievements.filterUnlocked']}
								</button>
								<button
									className={`${styles.filterButton} ${filterStatus === 'locked' ? styles.active : ''}`}
									onClick={() => setFilterStatus('locked')}
								>
									{t['achievements.filterLocked']}
								</button>
							</div>
						</div>
						<div className={styles.filterGroup}>
							<span className={styles.filterLabel}>{t['achievements.categoryFilter']}</span>
							<div className={styles.filterButtons}>
								<button
									className={`${styles.filterButton} ${filterCategory === 'all' ? styles.active : ''}`}
									onClick={() => setFilterCategory('all')}
								>
									{t['achievements.filterAll']}
								</button>
								<button
									className={`${styles.filterButton} ${filterCategory === 'MILESTONE' ? styles.active : ''}`}
									onClick={() => setFilterCategory('MILESTONE')}
								>
									{t['achievements.categoryMilestone']}
								</button>
								<button
									className={`${styles.filterButton} ${filterCategory === 'STREAK' ? styles.active : ''}`}
									onClick={() => setFilterCategory('STREAK')}
								>
									{t['achievements.categoryStreak']}
								</button>
								<button
									className={`${styles.filterButton} ${filterCategory === 'PERFORMANCE' ? styles.active : ''}`}
									onClick={() => setFilterCategory('PERFORMANCE')}
								>
									{t['achievements.categoryPerformance']}
								</button>
								<button
									className={`${styles.filterButton} ${filterCategory === 'COMPETITION' ? styles.active : ''}`}
									onClick={() => setFilterCategory('COMPETITION')}
								>
									{t['achievements.categoryCompetition']}
								</button>
							</div>
						</div>
						<div className={styles.filterGroup}>
							<span className={styles.filterLabel}>{t['achievements.rarityFilter']}</span>
							<div className={styles.filterButtons}>
								<button
									className={`${styles.filterButton} ${filterRarity === 'all' ? styles.active : ''}`}
									onClick={() => setFilterRarity('all')}
								>
									{t['achievements.filterAll']}
								</button>
								<button
									className={`${styles.filterButton} ${filterRarity === 'COMMON' ? styles.active : ''}`}
									onClick={() => setFilterRarity('COMMON')}
								>
									{t['achievements.rarityCommon']}
								</button>
								<button
									className={`${styles.filterButton} ${filterRarity === 'UNCOMMON' ? styles.active : ''}`}
									onClick={() => setFilterRarity('UNCOMMON')}
								>
									{t['achievements.rarityUncommon']}
								</button>
								<button
									className={`${styles.filterButton} ${filterRarity === 'RARE' ? styles.active : ''}`}
									onClick={() => setFilterRarity('RARE')}
								>
									{t['achievements.rarityRare']}
								</button>
								<button
									className={`${styles.filterButton} ${filterRarity === 'EPIC' ? styles.active : ''}`}
									onClick={() => setFilterRarity('EPIC')}
								>
									{t['achievements.rarityEpic']}
								</button>
								<button
									className={`${styles.filterButton} ${filterRarity === 'LEGENDARY' ? styles.active : ''}`}
									onClick={() => setFilterRarity('LEGENDARY')}
								>
									{t['achievements.rarityLegendary']}
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
							<h3>{t['achievements.noResults']}</h3>
							<p>{t['achievements.noResultsHint']}</p>
						</div>
					)}
				</div>
			</main>
			<Footer />
		</>
	);
}
