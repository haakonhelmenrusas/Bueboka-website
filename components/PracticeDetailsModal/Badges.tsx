import React from 'react';
import { ArrowsPointingOutIcon, FireIcon, HomeIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { Environment } from '@/lib/prismaEnums';
import styles from './PracticeDetailsModal.module.css';

type PracticeType = 'TRENING' | 'KONKURRANSE';

interface PracticeTypeBadgeProps {
	practiceType?: PracticeType | string | null;
}

export const PracticeTypeBadge: React.FC<PracticeTypeBadgeProps> = ({ practiceType }) => {
	const isCompetition = practiceType === 'KONKURRANSE';
	return isCompetition ? (
		<div className={`${styles.badge} ${styles.competitionBadge}`}>
			<TrophyIcon className="w-3.5 h-3.5" />
			<span>Konkurranse</span>
		</div>
	) : (
		<div className={`${styles.badge} ${styles.trainingBadge}`}>
			<FireIcon className="w-3.5 h-3.5" />
			<span>Trening</span>
		</div>
	);
};

interface EnvironmentBadgeProps {
	environment: Environment;
}

export const EnvironmentBadge: React.FC<EnvironmentBadgeProps> = ({ environment }) => (
	<div className={styles.envBadge}>
		{environment === 'INDOOR' ? (
			<>
				<HomeIcon className="w-4 h-4" />
				<span>Inne</span>
			</>
		) : (
			<>
				<ArrowsPointingOutIcon className="w-4 h-4" />
				<span>Ute</span>
			</>
		)}
	</div>
);
