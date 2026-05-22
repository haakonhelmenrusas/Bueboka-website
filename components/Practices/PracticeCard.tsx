import React from 'react';
import styles from './PracticeCard.module.css';
import { LuChevronRight, LuHouse, LuMapPin, LuStar, LuTarget, LuTrees, LuTrophy, LuWind } from 'react-icons/lu';
import { Badge } from '@/components/common/Badge/Badge';
import { useTranslation } from '@/context/LanguageProvider';

export interface PracticeCardProps {
	id: string;
	date: string; // ISO string
	arrowsShot: number;
	arrowsWithScore?: number | null;
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
	arrowsWithScore,
	location,
	environment,
	practiceType,
	totalScore,
	roundTypeName,
	onClick,
}) => {
	const { t } = useTranslation();

	const formattedDate = new Date(date).toLocaleDateString('nb-NO', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});

	const envText = environment === 'INDOOR' || environment?.toLowerCase() === 'inne'
		? t['badge.indoor']
		: environment === 'OUTDOOR' || environment?.toLowerCase() === 'ute'
			? t['badge.outdoor']
			: null;

	const ariaLabel = [
		`${practiceType === 'KONKURRANSE' ? t['badge.competition'] : t['badge.training']} ${t['practiceCard.from']} ${formattedDate}`,
		`${arrowsShot} ${t['practiceCard.arrowsShot']}`,
		totalScore && `${t['practiceCard.score']}: ${totalScore}`,
		`${t['practiceCard.round']}: ${roundTypeName ? formatRoundTypeName(roundTypeName) : t['practiceCard.noTarget']}`,
		location && `${t['practiceCard.location']}: ${location}`,
	]
		.filter(Boolean)
		.join(', ');

	const isCompetition = practiceType === 'KONKURRANSE';

	return (
		<button className={styles.card} onClick={() => onClick?.(id)} type="button" aria-label={`${ariaLabel}. ${t['practiceCard.clickForDetails']}`}>
			<div className={styles.main}>
				<div className={styles.topRow}>
					<div className={styles.date}>{formattedDate}</div>
					<div className={styles.badgeGroup}>
						{isCompetition ? (
							<Badge variant="competition" icon={<LuTrophy size={12} />}>
								{t['badge.competition']}
							</Badge>
						) : (
							<Badge variant="training" icon={<LuTarget size={12} />}>
								{t['badge.training']}
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
						<span className={styles.detailText}>{arrowsShot} {t['practiceCard.arrows']}</span>
					</div>
					{totalScore !== null && totalScore !== undefined && totalScore > 0 && (
						<div className={styles.detailItem}>
							<span className={styles.detailIcon} aria-hidden="true">
								<LuStar size={14} fill="currentColor" />
							</span>
							<span className={styles.detailText}>
								{totalScore}
								{arrowsWithScore != null && arrowsWithScore > 0 ? ` / ${arrowsWithScore}` : ''}
							</span>
						</div>
					)}
					<div className={styles.detailItem}>
						<span className={styles.detailIcon} aria-hidden="true">
							<LuTarget size={14} />
						</span>
						<span className={styles.detailText}>{roundTypeName ? formatRoundTypeName(roundTypeName) : t['practiceCard.noTarget']}</span>
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
