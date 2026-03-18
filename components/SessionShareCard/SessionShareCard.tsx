'use client';

import React from 'react';
import styles from './SessionShareCard.module.css';
import { LuTarget, LuCalendar, LuArrowUp, LuMapPin } from 'react-icons/lu';
import { GiBowArrow } from 'react-icons/gi';
import { getBowTypeLabel, getPracticeCategoryLabel, getEnvironmentLabel } from '@/lib/labels';
import { Badge } from '@/components/common/Badge/Badge';

export interface SessionShareData {
	date: string;
	practiceType: 'TRENING' | 'KONKURRANSE' | null;
	totalScore: number;
	arrowsShot: number;
	arrowsWithoutScore?: number | null;
	bowName: string | null;
	bowType: string | null;
	distanceMeters: number | null;
	category: string | null;
	environment: string | null;
	location?: string | null;
}

interface SessionShareCardProps {
	data: SessionShareData;
}


export const SessionShareCard = React.forwardRef<HTMLDivElement, SessionShareCardProps>(({ data }, ref) => {
	const formattedDate = new Date(data.date).toLocaleDateString('nb-NO', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	const categoryLabel = data.category ? getPracticeCategoryLabel(data.category) : null;
	const bowTypeLabel = data.bowType ? getBowTypeLabel(data.bowType) : null;
	const envLabel = data.environment ? getEnvironmentLabel(data.environment) : null;
	const typeLabel = data.practiceType === 'KONKURRANSE' ? 'Konkurranse' : 'Trening';

	const unscoredArrows = data.arrowsWithoutScore ?? 0;
	const scoredArrows = Math.max(0, data.arrowsShot - unscoredArrows);

	return (
		<div className={styles.card} ref={ref}>
			<div className={styles.header}>
				<div className={styles.brand}>
					<div className={styles.brandLogoCircle}>
						<img
							src="/assets/logo.png"
							alt="Bueboka"
							className={styles.brandLogo}
						/>
					</div>
					<span className={styles.brandName}>Bueboka</span>
				</div>
				<Badge variant="ghost" uppercase>{typeLabel}</Badge>
			</div>
			{data.totalScore > 0 ? (
				<div className={styles.scoreHero}>
					<div className={styles.scoreLabel}>Totalscore</div>
					<div className={styles.scoreValue}>{data.totalScore}</div>
					<div className={styles.scoreArrowsRow}>
						<span className={styles.scoreArrowsChip}>
							{scoredArrows} med scoring
						</span>
						{unscoredArrows > 0 && (
							<span className={styles.scoreArrowsChipDim}>
								{unscoredArrows} uten scoring
							</span>
						)}
					</div>
				</div>
			) : (
				<div className={styles.scoreHero}>
					<div className={styles.scoreLabel}>Piler skutt</div>
					<div className={styles.scoreValue}>{data.arrowsShot}</div>
					<div className={styles.scoreArrowsRow}>
						{unscoredArrows > 0 ? (
							<>
								<span className={styles.scoreArrowsChip}>{scoredArrows} med scoring</span>
								<span className={styles.scoreArrowsChipDim}>{unscoredArrows} uten scoring</span>
							</>
						) : (
							<span className={styles.scoreArrowsChip}>Treningsøkt</span>
						)}
					</div>
				</div>
			)}
			<div className={styles.statsGrid}>
				<div className={styles.statItem}>
					<LuCalendar size={18} className={styles.statIcon} />
					<div className={styles.statContent}>
						<span className={styles.statLabel}>Dato</span>
						<span className={styles.statValue}>{formattedDate}</span>
					</div>
				</div>
				{categoryLabel && (
					<div className={styles.statItem}>
						<LuTarget size={18} className={styles.statIcon} />
						<div className={styles.statContent}>
							<span className={styles.statLabel}>Kategori</span>
							<span className={styles.statValue}>{categoryLabel}</span>
						</div>
					</div>
				)}
				{data.bowName && (
					<div className={styles.statItem}>
						<GiBowArrow size={18} className={styles.statIcon} />
						<div className={styles.statContent}>
							<span className={styles.statLabel}>Bue</span>
							<span className={styles.statValue}>
								{data.bowName}
								{bowTypeLabel && <span className={styles.statSub}>{bowTypeLabel}</span>}
							</span>
						</div>
					</div>
				)}
				{data.distanceMeters && (
					<div className={styles.statItem}>
						<LuArrowUp size={18} className={styles.statIcon} />
						<div className={styles.statContent}>
							<span className={styles.statLabel}>Avstand</span>
							<span className={styles.statValue}>{data.distanceMeters} m</span>
						</div>
					</div>
				)}
				{envLabel && (
					<div className={styles.statItem}>
						<LuMapPin size={18} className={styles.statIcon} />
						<div className={styles.statContent}>
							<span className={styles.statLabel}>Miljø</span>
							<span className={styles.statValue}>{envLabel}</span>
						</div>
					</div>
				)}
				{data.location && (
					<div className={styles.statItem}>
						<LuMapPin size={18} className={styles.statIcon} />
						<div className={styles.statContent}>
							<span className={styles.statLabel}>Sted</span>
							<span className={styles.statValue}>{data.location}</span>
						</div>
					</div>
				)}
			</div>
			<div className={styles.footer}>
				<span className={styles.footerText}>bueboka.no</span>
			</div>
		</div>
	);
});

SessionShareCard.displayName = 'SessionShareCard';

