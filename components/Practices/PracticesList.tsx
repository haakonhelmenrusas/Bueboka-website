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
			<div className={styles.list} role="list" aria-label="Treninger">
				{practices.length === 0 ? (
					<div className={styles.empty} role="status">
						Ingen treninger registrert ennå.
					</div>
				) : (
					practices.map((practice) => (
						<div key={practice.id} role="listitem">
							<PracticeCard {...practice} onClick={onSelectPractice} />
						</div>
					))
				)}
			</div>
		</div>
	);
};
