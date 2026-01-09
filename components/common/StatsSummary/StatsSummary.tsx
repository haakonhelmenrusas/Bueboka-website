'use client';

import React from 'react';
import styles from './StatsSummary.module.css';
import { CalendarDays, Gauge, TrendingUp } from 'lucide-react';

export type StatsSummaryProps = {
	last7Days: number;
	last30Days: number;
	overall: number;
};

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
	return (
		<div className={styles.card}>
			<div className={styles.icon}>{icon}</div>
			<div className={styles.meta}>
				<div className={styles.title}>{title}</div>
				<div className={styles.value}>{value}</div>
			</div>
		</div>
	);
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ last7Days, last30Days, overall }) => {
	return (
		<div className={styles.grid}>
			<StatCard title="Siste 7 dager" value={last7Days} icon={<CalendarDays size={18} />} />
			<StatCard title="Siste 30 dager" value={last30Days} icon={<TrendingUp size={18} />} />
			<StatCard title="Totalt" value={overall} icon={<Gauge size={18} />} />
		</div>
	);
};
