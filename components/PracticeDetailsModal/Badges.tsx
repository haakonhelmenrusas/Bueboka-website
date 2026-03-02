import React from 'react';
import { Home, Target, Trees, Trophy } from 'lucide-react';
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
			<Trophy size={14} />
			<span>Konkurranse</span>
		</div>
	) : (
		<div className={`${styles.badge} ${styles.trainingBadge}`}>
			<Target size={14} />
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
				<Home size={16} />
				<span>Inne</span>
			</>
		) : (
			<>
				<Trees size={16} />
				<span>Ute</span>
			</>
		)}
	</div>
);
