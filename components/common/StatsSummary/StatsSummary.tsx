'use client';

import React from 'react';
import styles from './StatsSummary.module.css';
import { LuCalendarDays, LuChartBar, LuCircleCheck, LuCircleX, LuStar, LuTarget, LuTrendingUp } from 'react-icons/lu';
import type { PeriodStats } from '@/lib/types';

export type StatsSummaryProps = {
	last7Days: PeriodStats;
	last30Days: PeriodStats;
	overall: PeriodStats;
};

function PeriodCard({ title, icon, data }: { title: string; icon: React.ReactNode; data: PeriodStats }) {
	return (
		<div className={styles.card}>
			<div className={styles.cardHeader}>
				<div className={styles.cardIcon}>{icon}</div>
				<span className={styles.cardTitle}>{title}</span>
			</div>
			<div className={styles.cardStats}>
				<div className={styles.statRow}>
					<div className={styles.statLabel}>
						<LuTarget className={styles.rowIcon} />
						<span>Totalt antall piler</span>
					</div>
					<span className={styles.statValue}>{data.totalArrows}</span>
				</div>
				<div className={styles.divider} />
				<div className={styles.statRow}>
					<div className={styles.statLabel}>
						<LuCircleCheck className={styles.rowIcon} />
						<span>Med score</span>
					</div>
					<span className={styles.statValue}>{data.scoredArrows}</span>
				</div>
				<div className={styles.statRow}>
					<div className={styles.statLabel}>
						<LuCircleX className={styles.rowIcon} />
						<span>Uten score</span>
					</div>
					<span className={styles.statValue}>{data.unscoredArrows}</span>
				</div>
			</div>
		</div>
	);
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ last7Days, last30Days, overall }) => {
	return (
		<div className={styles.grid}>
			<PeriodCard title="Siste 7 dager" icon={<LuCalendarDays size={18} />} data={last7Days} />
			<PeriodCard title="Siste 30 dager" icon={<LuTrendingUp size={18} />} data={last30Days} />
			<PeriodCard title="Totalt" icon={<LuChartBar size={18} />} data={overall} />
		</div>
	);
};
