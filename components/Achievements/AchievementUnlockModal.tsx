'use client';

import React, { useEffect } from 'react';
import {
	LuArrowUpRight,
	LuChevronRight,
	LuCloud,
	LuCompass,
	LuFlame,
	LuHouse,
	LuMoon,
	LuSparkles,
	LuStar,
	LuSun,
	LuTrendingUp,
	LuTrophy,
	LuX,
	LuZap,
} from 'react-icons/lu';
import { Achievement } from '@/lib/achievements/types';
import { Button } from '@/components';
import styles from './AchievementUnlockModal.module.css';
import { CiTrophy } from 'react-icons/ci';

interface AchievementUnlockModalProps {
	achievements: Achievement[];
	onClose: () => void;
	onViewAll?: () => void;
}

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
	Target: LuFlame,
	Award: LuTrophy,
	Trophy: LuTrophy,
	Crown: LuTrophy,
	Flame: LuFlame,
	Zap: LuZap,
	Star: LuStar,
	ArrowRight: LuChevronRight,
	Crosshair: LuFlame,
	TrendingUp: LuTrendingUp,
	Sparkles: LuSparkles,
	Activity: LuZap,
	Medal: LuTrophy,
	Compass: LuCompass,
	Home: LuHouse,
	Trees: LuArrowUpRight,
	Footprints: LuArrowUpRight,
	Mountain: LuArrowUpRight,
	CloudRain: LuCloud,
	Sunrise: LuSun,
	Moon: LuMoon,
};

export const AchievementUnlockModal: React.FC<AchievementUnlockModalProps> = ({ achievements, onClose, onViewAll }) => {
	// Prevent body scroll when modal is open
	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, []);

	// Handle escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};
		window.addEventListener('keydown', handleEscape);
		return () => window.removeEventListener('keydown', handleEscape);
	}, [onClose]);

	// Handle backdrop click
	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);

	return (
		<div className={styles.modal} onClick={handleBackdropClick}>
			<div className={styles.modalContent}>
				<button className={styles.closeButton} onClick={onClose} aria-label="Lukk" type="button">
					<LuX className="w-6 h-6" />
				</button>

				<div className={styles.header}>
					<div className={styles.celebration}>🎉</div>
					<h2 className={styles.title}>{achievements.length === 1 ? 'Nytt Merke!' : `${achievements.length} Nye Merker!`}</h2>
					<p className={styles.subtitle}>Gratulerer! Du har låst opp {achievements.length === 1 ? 'et nytt merke' : 'nye merker'}</p>
				</div>

				<div className={styles.achievementList}>
					{achievements.map((achievement) => {
						const IconComponent = ICON_MAP[achievement.icon] || CiTrophy;
						return (
							<div key={achievement.id} className={styles.achievementItem}>
								<div className={styles.achievementIcon}>
									<IconComponent className="w-8 h-8" />
								</div>
								<div className={styles.achievementContent}>
									<h3 className={styles.achievementName}>{achievement.name}</h3>
									<p className={styles.achievementDescription}>{achievement.description}</p>
									<p className={styles.achievementPoints}>+{achievement.points} poeng</p>
								</div>
							</div>
						);
					})}
				</div>

				<div className={styles.footer}>
					<Button label="Lukk" onClick={onClose} size="normal" buttonType="outline" />
					{onViewAll && (
						<Button label="Se Alle Merker" onClick={onViewAll} size="normal" buttonType="filled" icon={<LuTrophy className="w-4 h-4" />} />
					)}
				</div>

				{totalPoints > 0 && (
					<p
						style={{
							textAlign: 'center',
							marginTop: 'var(--space-4)',
							fontSize: '0.875rem',
							color: 'var(--text-gray-600)',
							fontWeight: 600,
						}}
					>
						Totalt: +{totalPoints} poeng
					</p>
				)}
			</div>
		</div>
	);
};
