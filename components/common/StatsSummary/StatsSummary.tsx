'use client';

import React from 'react';
import styles from './StatsSummary.module.css';
import { LuCalendarDays, LuChartBar, LuChevronLeft, LuChevronRight, LuCircleCheck, LuCircleX, LuTarget, LuTrendingUp } from 'react-icons/lu';
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
	const [activeIndex, setActiveIndex] = React.useState(0);

	const cards = [
		{ title: 'Siste 7 dager', icon: <LuCalendarDays size={18} />, data: last7Days },
		{ title: 'Siste 30 dager', icon: <LuTrendingUp size={18} />, data: last30Days },
		{ title: 'Totalt', icon: <LuChartBar size={18} />, data: overall },
	];

	const handlePrev = () => {
		setActiveIndex((prev) => Math.max(0, prev - 1));
	};

	const handleNext = () => {
		setActiveIndex((prev) => Math.min(cards.length - 1, prev + 1));
	};

	const currentCard = cards[activeIndex];

	return (
		<>
			{/* Grid view for larger screens */}
			<div className={styles.grid}>
				{cards.map((card) => (
					<PeriodCard key={card.title} title={card.title} icon={card.icon} data={card.data} />
				))}
			</div>

			{/* Carousel view for smaller screens */}
			<div className={styles.carouselWrapper}>
				<div className={styles.carousel}>
					<button
						type="button"
						className={styles.chevronButton}
						onClick={handlePrev}
						disabled={activeIndex === 0}
						aria-label="Forrige periode"
					>
						<LuChevronLeft size={24} />
					</button>
					<div className={styles.cardContainer}>
						<PeriodCard title={currentCard.title} icon={currentCard.icon} data={currentCard.data} />
					</div>
					<button
						type="button"
						className={styles.chevronButton}
						onClick={handleNext}
						disabled={activeIndex === cards.length - 1}
						aria-label="Neste periode"
					>
						<LuChevronRight size={24} />
					</button>
				</div>
				<div className={styles.dots}>
					{cards.map((_, index) => (
						<button
							key={index}
							type="button"
							className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
							onClick={() => setActiveIndex(index)}
							aria-label={`Gå til ${cards[index].title}`}
						/>
					))}
				</div>
			</div>
		</>
	);
};
