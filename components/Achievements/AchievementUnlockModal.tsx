/**
 * Achievement Unlock Modal Component
 * Displays a celebration modal when achievements are unlocked
 */

'use client';

import React, { useEffect } from 'react';
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
	X,
	Zap,
} from 'lucide-react';
import { Achievement } from '@/lib/achievements/types';
import { Button } from '@/components';
import styles from './AchievementUnlockModal.module.css';

interface AchievementUnlockModalProps {
	achievements: Achievement[];
	onClose: () => void;
	onViewAll?: () => void;
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
					<X size={24} />
				</button>

				<div className={styles.header}>
					<div className={styles.celebration}>🎉</div>
					<h2 className={styles.title}>{achievements.length === 1 ? 'Nytt Merke!' : `${achievements.length} Nye Merker!`}</h2>
					<p className={styles.subtitle}>Gratulerer! Du har låst opp {achievements.length === 1 ? 'et nytt merke' : 'nye merker'}</p>
				</div>

				<div className={styles.achievementList}>
					{achievements.map((achievement) => {
						const IconComponent = ICON_MAP[achievement.icon] || Trophy;
						return (
							<div key={achievement.id} className={styles.achievementItem}>
								<div className={styles.achievementIcon}>
									<IconComponent size={32} />
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
					{onViewAll && <Button label="Se Alle Merker" onClick={onViewAll} size="normal" buttonType="filled" icon={<Trophy size={18} />} />}
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
