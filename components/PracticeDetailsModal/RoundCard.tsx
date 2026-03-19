import React from 'react';
import type { PracticeEnd } from './types';
import { calculateEndScore } from './helpers';
import styles from './PracticeDetailsModal.module.css';

interface MetaItemProps {
	label: string;
	value: string | number;
}

const MetaItem: React.FC<MetaItemProps> = ({ label, value }) => (
	<div className={styles.roundMetaItem}>
		<span className={styles.roundMetaLabel}>{label}</span>
		<span className={styles.roundMetaValue}>{value}</span>
	</div>
);

interface RoundCardProps {
	end: PracticeEnd;
}

export const RoundCard: React.FC<RoundCardProps> = ({ end }) => {
	const arrows = end.arrows ?? end.scores?.length ?? 0;
	const scoreSum = calculateEndScore(end);

	// Check if we have distance range instead of single distance
	const hasDistanceRange = (end as any).distanceFrom || (end as any).distanceTo;

	return (
		<div className={styles.roundCard}>
			<div className={styles.roundMeta}>
				{hasDistanceRange ? (
					<>
						{(end as any).distanceFrom && <MetaItem label="Fra" value={`${(end as any).distanceFrom}m`} />}
						{(end as any).distanceTo && <MetaItem label="Til" value={`${(end as any).distanceTo}m`} />}
					</>
				) : (
					end.distanceMeters && <MetaItem label="Avstand" value={`${end.distanceMeters} m`} />
				)}
				{end.targetSizeCm && <MetaItem label="Blink" value={`${end.targetSizeCm} cm`} />}
				{arrows > 0 && <MetaItem label="Piler" value={`${arrows} stk`} />}
				{scoreSum > 0 && <MetaItem label="Poeng" value={scoreSum} />}
			</div>
			{Array.isArray(end.scores) && end.scores.length > 0 && (
				<div className={styles.roundScores}>
					{end.scores.map((score, i) => (
						<div key={i} className={styles.scoreChip}>
							{score}
						</div>
					))}
				</div>
			)}
		</div>
	);
};
