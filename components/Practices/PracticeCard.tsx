import React from 'react';
import styles from './PracticeCard.module.css';
import { Target } from 'lucide-react';

export interface PracticeCardProps {
	id: string;
	date: string; // ISO string
	arrowsShot: number;
	onClick?: (id: string) => void;
}

export const PracticeCard: React.FC<PracticeCardProps> = ({ id, date, arrowsShot, onClick }) => {
	const formattedDate = new Date(date).toLocaleDateString('nb-NO', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});

	return (
		<div className={styles.card} onClick={() => onClick?.(id)} role="button" tabIndex={0}>
			<div className={styles.meta}>
				<div className={styles.date}>{formattedDate}</div>
			</div>
			<div className={styles.badge}>
				<span className={styles.iconCircle}>
					<Target size={16} />
				</span>
				{arrowsShot} piler
			</div>
		</div>
	);
};
