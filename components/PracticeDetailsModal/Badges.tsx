import React from 'react';
import { LuHouse, LuMaximize2 } from 'react-icons/lu';
import { Environment } from '@/lib/prismaEnums';
import styles from './PracticeDetailsModal.module.css';
import { GiArcher } from 'react-icons/gi';
import { CiTrophy } from 'react-icons/ci';

type PracticeType = 'TRENING' | 'KONKURRANSE';

interface PracticeTypeBadgeProps {
	practiceType?: PracticeType | string | null;
}

export const PracticeTypeBadge: React.FC<PracticeTypeBadgeProps> = ({ practiceType }) => {
	const isCompetition = practiceType === 'KONKURRANSE';
	return isCompetition ? (
		<div className={`${styles.badge} ${styles.competitionBadge}`}>
			<CiTrophy className="w-3.5 h-3.5" />
			<span>Konkurranse</span>
		</div>
	) : (
		<div className={`${styles.badge} ${styles.trainingBadge}`}>
			<GiArcher className="w-3.5 h-3.5" />
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
				<LuHouse className="w-4 h-4" />
				<span>Inne</span>
			</>
		) : (
			<>
				<LuMaximize2 className="w-4 h-4" />
				<span>Ute</span>
			</>
		)}
	</div>
);
