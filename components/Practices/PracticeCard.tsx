import React from 'react';
import styles from './PracticeCard.module.css';
import { ArrowRight, BowArrow, Home, MapPin, Target, Trees, Wind } from 'lucide-react';

export interface PracticeCardProps {
	id: string;
	date: string; // ISO string
	arrowsShot: number;
	location?: string | null;
	environment?: string | null;
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
	location,
	environment,
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

	return (
		<button className={styles.card} onClick={() => onClick?.(id)} type="button">
			<div className={styles.main}>
				<div className={styles.date}>{formattedDate}</div>
				{roundText ? (
					<div className={styles.detailItem}>
						<span className={styles.detailIcon}>
							<Target size={14} />
						</span>
						<span className={styles.detailText}>{roundText}</span>
					</div>
				) : null}
				{location ? (
					<div className={styles.detailItem}>
						<span className={styles.detailIcon}>
							<MapPin size={14} />
						</span>
						<span className={styles.detailText}>{location}</span>
					</div>
				) : null}
				{envText ? (
					<div className={`${styles.detailItem} ${styles.hideOnMobile}`}>
						<span className={styles.detailIcon}>{envIcon(environment)}</span>
						<span className={styles.detailText}>{envText}</span>
					</div>
				) : null}
				{bowName ? (
					<div className={`${styles.detailItem} ${styles.hideOnMobile}`}>
						<span className={styles.detailIcon}>
							<BowArrow size={14} />
						</span>
						<span className={styles.detailText}>{bowName}</span>
					</div>
				) : null}
				{arrowsName ? (
					<div className={`${styles.detailItem} ${styles.hideOnMobile}`}>
						<span className={styles.detailIcon}>
							<ArrowRight size={14} />
						</span>
						<span className={styles.detailText}>{arrowsName}</span>
					</div>
				) : null}
				<div className={styles.arrowsCount}>
					<span className={styles.arrowsNumber}>{arrowsShot}</span>
					<span className={styles.arrowsLabel}>piler</span>
				</div>
			</div>
		</button>
	);
};
