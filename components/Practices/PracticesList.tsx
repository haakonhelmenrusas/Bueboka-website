import React from 'react';
import styles from './PracticesList.module.css';
import { PracticeCard, PracticeCardProps } from './PracticeCard';

export interface PracticesListProps {
	practices: PracticeCardProps[];
	onSelectPractice?: (id: string) => void;
}

export const PracticesList: React.FC<PracticesListProps> = ({ practices, onSelectPractice }) => {
	return (
		<div className={styles.wrapper}>
			<div className={styles.list}>
				{practices.length === 0 ? (
					<div className={styles.empty}>Ingen treninger registrert ennå.</div>
				) : (
					practices.map((practice) => <PracticeCard key={practice.id} {...practice} onClick={onSelectPractice} />)
				)}
			</div>
		</div>
	);
};
