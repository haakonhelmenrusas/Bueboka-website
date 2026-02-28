import React from 'react';
import styles from './PracticeDetailsModal.module.css';

interface StatCardProps {
	icon: React.ReactNode;
	label: string;
	value: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
	<div className={styles.statCard}>
		<div className={styles.statIcon}>{icon}</div>
		<div className={styles.statLabel}>{label}</div>
		<div className={styles.statValue}>{value}</div>
	</div>
);
