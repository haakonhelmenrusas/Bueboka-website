/**
 * Achievement Badge Component
 * Displays a single achievement with icon, name, progress, and status
 */

import React from 'react';
import {
	Activity,
	ArrowRight,
	Award,
	CloudRain,
	Compass,
	Crosshair,
	Crown,
	Flame,
	Footprints,
	Home,
	Medal,
	Moon,
	Mountain,
	Sparkles,
	Star,
	Sunrise,
	Target,
	Trees,
	TrendingUp,
	Trophy,
	Zap,
} from 'lucide-react';
import { AchievementProgress } from '@/lib/achievements/types';
import styles from './AchievementBadge.module.css';

interface AchievementBadgeProps {
	progress: AchievementProgress;
	size?: 'small' | 'medium' | 'large';
	showProgress?: boolean;
}

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
	Target,
	Award,
	Trophy,
	Crown,
	Flame,
	Zap,
	Star,
	ArrowRight,
	Crosshair,
	TrendingUp,
	Sparkles,
	Activity,
	Medal,
	Compass,
	Home,
	Trees,
	Footprints,
	Mountain,
	CloudRain,
	Sunrise,
	Moon,
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ progress, size = 'medium', showProgress = true }) => {
	const { achievement, percentage, isUnlocked, current, required } = progress;
	const IconComponent = ICON_MAP[achievement.icon] || Award;

	const sizeClass = {
		small: styles.small,
		medium: styles.medium,
		large: styles.large,
	}[size];

	const rarityClass = {
		COMMON: styles.rarityCommon,
		UNCOMMON: styles.rarityUncommon,
		RARE: styles.rarityRare,
		EPIC: styles.rarityEpic,
		LEGENDARY: styles.rarityLegendary,
	}[achievement.rarity];

	const tierClass = achievement.tier
		? {
				BRONZE: styles.tierBronze,
				SILVER: styles.tierSilver,
				GOLD: styles.tierGold,
				PLATINUM: styles.tierPlatinum,
				DIAMOND: styles.tierDiamond,
			}[achievement.tier]
		: '';

	const iconSize = size === 'small' ? 24 : size === 'large' ? 40 : 32;

	return (
		<div
			className={`${styles.achievementBadge} ${sizeClass} ${isUnlocked ? styles.unlocked : styles.locked} ${rarityClass} ${tierClass}`}
			aria-label={`${achievement.name}: ${achievement.description}. ${isUnlocked ? 'Låst opp' : `${percentage}% ferdig`}`}
		>
			<div className={styles.iconContainer}>
				<IconComponent className={styles.icon} size={iconSize} />
				{achievement.tier && <div className={styles.tierBadge}>{achievement.tier}</div>}
			</div>

			<div className={styles.content}>
				<h3 className={styles.name}>{achievement.name}</h3>
				<p className={styles.description}>{achievement.description}</p>

				{showProgress && !isUnlocked && (
					<div className={styles.progressContainer}>
						<div className={styles.progressBar}>
							<div className={styles.progressFill} style={{ width: `${percentage}%` }} />
						</div>
						<span className={styles.progressText}>
							{current} / {required}
						</span>
					</div>
				)}

				{isUnlocked && (
					<div className={styles.unlockedBadge}>
						<Star size={14} />
						<span>Låst opp!</span>
					</div>
				)}
			</div>
		</div>
	);
};
