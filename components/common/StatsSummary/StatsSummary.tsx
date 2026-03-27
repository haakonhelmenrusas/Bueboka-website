'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './StatsSummary.module.css';
import { LuCalendarDays, LuChartBar, LuCircleCheck, LuCircleX, LuTarget, LuTrendingUp } from 'react-icons/lu';
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
	const [activeIndex, setActiveIndex] = useState(0);
	const trackRef = useRef<HTMLDivElement>(null);

	const cards = [
		{ title: 'Totalt', icon: <LuChartBar size={18} />, data: overall },
		{ title: 'Siste 30 dager', icon: <LuTrendingUp size={18} />, data: last30Days },
		{ title: 'Siste 7 dager', icon: <LuCalendarDays size={18} />, data: last7Days },
	];

	// Keep active dot in sync with the snapped card as the user swipes.
	useEffect(() => {
		const track = trackRef.current;
		if (!track) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const index = Array.from(track.children).indexOf(entry.target as HTMLElement);
						if (index !== -1) setActiveIndex(index);
					}
				});
			},
			{ root: track, threshold: 0.6 }
		);

		Array.from(track.children).forEach((child) => observer.observe(child));
		return () => observer.disconnect();
	}, []);

	const scrollToIndex = (index: number) => {
		const track = trackRef.current;
		if (!track) return;
		const slide = track.children[index] as HTMLElement;
		slide?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
		setActiveIndex(index);
	};

	return (
		<>
			{/* Grid view for larger screens */}
			<div className={styles.grid}>
				{cards.map((card) => (
					<PeriodCard key={card.title} title={card.title} icon={card.icon} data={card.data} />
				))}
			</div>

			{/* Swipeable carousel for smaller screens */}
			<div className={styles.carouselWrapper}>
				<div className={styles.track} ref={trackRef}>
					{cards.map((card) => (
						<div key={card.title} className={styles.slide}>
							<PeriodCard title={card.title} icon={card.icon} data={card.data} />
						</div>
					))}
				</div>
				<div className={styles.dots}>
					{cards.map((_, index) => (
						<button
							key={index}
							type="button"
							className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
							onClick={() => scrollToIndex(index)}
							aria-label={`Gå til ${cards[index].title}`}
						/>
					))}
				</div>
			</div>
		</>
	);
};
