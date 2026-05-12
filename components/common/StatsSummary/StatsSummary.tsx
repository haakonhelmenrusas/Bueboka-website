'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './StatsSummary.module.css';
import { LuCalendarDays, LuChartBar, LuCircleCheck, LuCircleX, LuTarget, LuTrendingUp } from 'react-icons/lu';
import type { PeriodStats } from '@/lib/types';
import { useTranslation } from '@/context/LanguageProvider';

export type StatsSummaryProps = {
	last7Days: PeriodStats;
	last30Days: PeriodStats;
	overall: PeriodStats;
};

function PeriodCard({ title, icon, data }: { title: string; icon: React.ReactNode; data: PeriodStats }) {
	const { t } = useTranslation();
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
						<span>{t['statsSummary.totalArrows']}</span>
					</div>
					<span className={styles.statValue}>{data.totalArrows}</span>
				</div>
				<div className={styles.divider} />
				<div className={styles.statRow}>
					<div className={styles.statLabel}>
						<LuCircleCheck className={styles.rowIcon} />
						<span>{t['statsSummary.withScore']}</span>
					</div>
					<span className={styles.statValue}>{data.scoredArrows}</span>
				</div>
				<div className={styles.statRow}>
					<div className={styles.statLabel}>
						<LuCircleX className={styles.rowIcon} />
						<span>{t['statsSummary.withoutScore']}</span>
					</div>
					<span className={styles.statValue}>{data.unscoredArrows}</span>
				</div>
			</div>
		</div>
	);
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ last7Days, last30Days, overall }) => {
	const { t } = useTranslation();
	const [activeIndex, setActiveIndex] = useState(0);
	const trackRef = useRef<HTMLDivElement>(null);

	const cards = [
		{ title: t['statsSummary.overall'], icon: <LuChartBar size={18} />, data: overall },
		{ title: t['statsSummary.last30days'], icon: <LuTrendingUp size={18} />, data: last30Days },
		{ title: t['statsSummary.last7days'], icon: <LuCalendarDays size={18} />, data: last7Days },
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
				<div
					className={styles.track}
					ref={trackRef}
					role="region"
					aria-label={t['statsSummary.ariaLabel']}
					aria-live="polite"
				>
					{cards.map((card, index) => (
						<div
							key={card.title}
							className={styles.slide}
							role="group"
							aria-label={card.title}
							aria-hidden={index !== activeIndex}
						>
							<PeriodCard title={card.title} icon={card.icon} data={card.data} />
						</div>
					))}
				</div>
				<div className={styles.dots} role="tablist" aria-label={t['statsSummary.periods']}>
					{cards.map((card, index) => (
						<button
							key={index}
							type="button"
							role="tab"
							className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
							onClick={() => scrollToIndex(index)}
							aria-label={card.title}
							aria-selected={index === activeIndex}
						/>
					))}
				</div>
			</div>
		</>
	);
};
