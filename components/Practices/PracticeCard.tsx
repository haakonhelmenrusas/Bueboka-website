import React from 'react';
import styles from './PracticeCard.module.css';
import { ArrowRight, BowArrow, Home, MapPin, Star, Target, Trees, Wind } from 'lucide-react';

export interface PracticeCardProps {
	id: string;
	date: string; // ISO string
	arrowsShot: number;
	totalScore?: number;
	location?: string | null;
	environment?: string | null;
	rating?: number | null;
	bowName?: string | null;
	arrowsName?: string | null;
	roundTypeName?: string | null;
	roundTypeEnvironment?: string | null;
	onClick?: (id: string) => void;
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
	if (normalized === 'inne' || normalized === 'indoor') return <Home size={14} />;
	if (normalized === 'ute' || normalized === 'outdoor') return <Trees size={14} />;
	return <Wind size={14} />;
}

export const PracticeCard: React.FC<PracticeCardProps> = ({
	id,
	date,
	arrowsShot,
	totalScore,
	location,
	environment,
	rating,
	bowName,
	arrowsName,
	roundTypeName,
	roundTypeEnvironment,
	onClick,
}) => {
	const formattedDate = new Date(date).toLocaleDateString('nb-NO', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});

	const extraRoundEnv = formatEnvironment(roundTypeEnvironment);
	const roundText = roundTypeName ? (extraRoundEnv ? `${roundTypeName} • ${extraRoundEnv}` : roundTypeName) : null;
	const envText = formatEnvironment(environment);

	// Use totalScore if available, otherwise fallback to arrowsShot for backwards compatibility
	const displayScore = totalScore ?? arrowsShot;

	// Build accessible label
	const ariaLabel = [
		`Trening fra ${formattedDate}`,
		`${displayScore} poeng`,
		`${arrowsShot} piler skutt`,
		rating && `Vurdering: ${rating}/10`,
		roundText && `Runde: ${roundText}`,
		location && `Sted: ${location}`,
		bowName && `Bue: ${bowName}`,
		arrowsName && `Piler: ${arrowsName}`,
	]
		.filter(Boolean)
		.join(', ');

	return (
		<button className={styles.card} onClick={() => onClick?.(id)} type="button" aria-label={ariaLabel}>
			<div className={styles.main}>
				<div className={styles.date}>{formattedDate}</div>
				{rating ? (
					<div className={styles.detailItem}>
						<span className={styles.detailIcon} aria-hidden="true">
							<Star size={14} />
						</span>
						<span className={styles.detailText}>{rating}/10</span>
					</div>
				) : null}
				{roundText ? (
					<div className={styles.detailItem}>
						<span className={styles.detailIcon} aria-hidden="true">
							<Target size={14} />
						</span>
						<span className={styles.detailText}>{roundText}</span>
					</div>
				) : null}
				{location ? (
					<div className={styles.detailItem}>
						<span className={styles.detailIcon} aria-hidden="true">
							<MapPin size={14} />
						</span>
						<span className={styles.detailText}>{location}</span>
					</div>
				) : null}
				{envText ? (
					<div className={`${styles.detailItem} ${styles.hideOnMobile}`}>
						<span className={styles.detailIcon} aria-hidden="true">
							{envIcon(environment)}
						</span>
						<span className={styles.detailText}>{envText}</span>
					</div>
				) : null}
				{bowName ? (
					<div className={`${styles.detailItem} ${styles.hideOnMobile}`}>
						<span className={styles.detailIcon} aria-hidden="true">
							<BowArrow size={14} />
						</span>
						<span className={styles.detailText}>{bowName}</span>
					</div>
				) : null}
				{arrowsName ? (
					<div className={`${styles.detailItem} ${styles.hideOnMobile}`}>
						<span className={styles.detailIcon} aria-hidden="true">
							<ArrowRight size={14} />
						</span>
						<span className={styles.detailText}>{arrowsName}</span>
					</div>
				) : null}
				<div className={styles.arrowsCount}>
					<span className={styles.arrowsNumber}>{displayScore}</span>
					<span className={styles.arrowsLabel}>Score</span>
				</div>
			</div>
		</button>
	);
};
