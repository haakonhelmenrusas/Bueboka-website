import React from 'react';
import styles from './PracticeCard.module.css';
import { LuChevronRight, LuHouse, LuMapPin, LuStar, LuTarget, LuTrees, LuTrophy, LuWind } from 'react-icons/lu';
import { Badge } from '@/components/common/Badge/Badge';

export interface PracticeCardProps {
	id: string;
	date: string; // ISO string
	arrowsShot: number;
	location?: string | null;
	environment?: string | null;
	practiceType?: string | null;
	totalScore?: number | null;
	roundTypeName?: string | null;
	onClick?: (id: string) => void;
}

function formatRoundTypeName(name?: string | null) {
	if (!name) return name;
	return name.replace(/(\d)(c?m)\b/g, '$1 $2');
}

function formatEnvironment(env?: string | null) {
	if (!env) return null;
	const normalized = env.toLowerCase();
	if (normalized === 'inne' || normalized === 'indoor') return 'Inne';
	if (normalized === 'ute' || normalized === 'outdoor') return 'Ute';
	return env;
}

function envIcon(env?: string | null) {
	const normalized = (env ?? '').toLowerCase();
	if (normalized === 'inne' || normalized === 'indoor') return <LuHouse size={14} />;
	if (normalized === 'ute' || normalized === 'outdoor') return <LuTrees size={14} />;
	return <LuWind size={14} />;
}

export const PracticeCard: React.FC<PracticeCardProps> = ({
	id,
	date,
	arrowsShot,
	location,
	environment,
	practiceType,
	totalScore,
	roundTypeName,
	onClick,
}) => {
	const formattedDate = new Date(date).toLocaleDateString('nb-NO', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});

	const envText = formatEnvironment(environment);

	// Build accessible label
	const ariaLabel = [
		`${practiceType === 'KONKURRANSE' ? 'Konkurranse' : 'Trening'} fra ${formattedDate}`,
		`${arrowsShot} piler skutt`,
		totalScore && `Score: ${totalScore}`,
		`Runde: ${roundTypeName ? formatRoundTypeName(roundTypeName) : 'Ingen skive'}`,
		location && `Sted: ${location}`,
	]
		.filter(Boolean)
		.join(', ');

	const isCompetition = practiceType === 'KONKURRANSE';

	return (
		<button className={styles.card} onClick={() => onClick?.(id)} type="button" aria-label={`${ariaLabel}. Klikk for å se detaljer`}>
			<div className={styles.main}>
				<div className={styles.topRow}>
					<div className={styles.date}>{formattedDate}</div>
					<div className={styles.badgeGroup}>
						{isCompetition ? (
							<Badge variant="competition" icon={<LuTrophy size={12} />}>
								Konkurranse
							</Badge>
						) : (
							<Badge variant="training" icon={<LuTarget size={12} />}>
								Trening
							</Badge>
						)}
					</div>
				</div>
				<span className={styles.separator} aria-hidden="true">
					|
				</span>
				<div className={styles.details}>
					<div className={styles.detailItem}>
						<span className={styles.detailIcon} aria-hidden="true">
							<LuTarget size={14} />
						</span>
						<span className={styles.detailText}>{arrowsShot} piler</span>
					</div>
					{totalScore !== null && totalScore !== undefined && totalScore > 0 && (
						<div className={styles.detailItem}>
							<span className={styles.detailIcon} aria-hidden="true">
								<LuStar size={14} fill="currentColor" />
							</span>
							<span className={styles.detailText}>{totalScore} poeng</span>
						</div>
					)}
					<div className={styles.detailItem}>
						<span className={styles.detailIcon} aria-hidden="true">
							<LuTarget size={14} />
						</span>
						<span className={styles.detailText}>{roundTypeName ? formatRoundTypeName(roundTypeName) : 'Ingen skive'}</span>
					</div>
					{location && (
						<div className={styles.detailItem}>
							<span className={styles.detailIcon} aria-hidden="true">
								<LuMapPin size={14} />
							</span>
							<span className={styles.detailText}>{location}</span>
						</div>
					)}
					{envText && (
						<div className={styles.detailItem}>
							<span className={styles.detailIcon} aria-hidden="true">
								{envIcon(environment)}
							</span>
							<span className={styles.detailText}>{envText}</span>
						</div>
					)}
				</div>
				<div className={styles.openIcon}>
					<LuChevronRight size={20} aria-hidden="true" />
				</div>
			</div>
		</button>
	);
};
