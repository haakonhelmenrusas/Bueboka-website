import React from 'react';
import styles from './PracticeCard.module.css';
import { ArrowRight, BowArrow, ChevronRight, Home, MapPin, Star, Target, Trees, Wind } from 'lucide-react';

export interface PracticeCardProps {
	id: string;
	date: string; // ISO string
	arrowsShot: number;
	location?: string | null;
	environment?: string | null;
	rating?: number | null;
	bowName?: string | null;
	arrowsName?: string | null;
	roundTypeName?: string | null;
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
	location,
	environment,
	rating,
	bowName,
	arrowsName,
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
		`Trening fra ${formattedDate}`,
		`${arrowsShot} piler skutt`,
		rating && `Vurdering: ${rating}/10`,
		roundTypeName && `Runde: ${roundTypeName}`,
		location && `Sted: ${location}`,
		bowName && `Bue: ${bowName}`,
		arrowsName && `Piler: ${arrowsName}`,
	]
		.filter(Boolean)
		.join(', ');

	return (
		<button className={styles.card} onClick={() => onClick?.(id)} type="button" aria-label={`${ariaLabel}. Klikk for å se detaljer`}>
			<div className={styles.main}>
				<div className={styles.date}>{formattedDate}</div>
				<span className={styles.separator} aria-hidden="true">
					|
				</span>
				<div className={styles.detailItem}>
					<span className={styles.detailIcon} aria-hidden="true">
						<Target size={14} />
					</span>
					<span className={styles.detailText}>{arrowsShot} piler</span>
				</div>
				{rating ? (
					<>
						<span className={styles.separator} aria-hidden="true">
							|
						</span>
						<div className={styles.detailItem}>
							<span className={styles.detailIcon} aria-hidden="true">
								<Star size={14} />
							</span>
							<span className={styles.detailText}>{rating}/10</span>
						</div>
					</>
				) : null}
				{roundTypeName ? (
					<>
						<span className={styles.separator} aria-hidden="true">
							|
						</span>
						<div className={styles.detailItem}>
							<span className={styles.detailIcon} aria-hidden="true">
								<Target size={14} />
							</span>
							<span className={styles.detailText}>{roundTypeName}</span>
						</div>
					</>
				) : null}
				{location ? (
					<>
						<span className={styles.separator} aria-hidden="true">
							|
						</span>
						<div className={styles.detailItem}>
							<span className={styles.detailIcon} aria-hidden="true">
								<MapPin size={14} />
							</span>
							<span className={styles.detailText}>{location}</span>
						</div>
					</>
				) : null}
				{envText ? (
					<>
						<span className={styles.separator} aria-hidden="true">
							|
						</span>
						<div className={`${styles.detailItem} ${styles.hideOnMobile}`}>
							<span className={styles.detailIcon} aria-hidden="true">
								{envIcon(environment)}
							</span>
							<span className={styles.detailText}>{envText}</span>
						</div>
					</>
				) : null}
				{bowName ? (
					<>
						<span className={styles.separator} aria-hidden="true">
							|
						</span>
						<div className={`${styles.detailItem} ${styles.hideOnMobile}`}>
							<span className={styles.detailIcon} aria-hidden="true">
								<BowArrow size={14} />
							</span>
							<span className={styles.detailText}>{bowName}</span>
						</div>
					</>
				) : null}
				{arrowsName ? (
					<>
						<span className={styles.separator} aria-hidden="true">
							|
						</span>
						<div className={`${styles.detailItem} ${styles.hideOnMobile}`}>
							<span className={styles.detailIcon} aria-hidden="true">
								<ArrowRight size={14} />
							</span>
							<span className={styles.detailText}>{arrowsName}</span>
						</div>
					</>
				) : null}
				<div className={styles.openIcon}>
					<ChevronRight size={20} aria-hidden="true" />
				</div>
			</div>
		</button>
	);
};
