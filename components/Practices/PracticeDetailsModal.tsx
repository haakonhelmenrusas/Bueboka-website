import React from 'react';
import styles from './PracticeDetailsModal.module.css';
import {
	BowArrow,
	CloudSun,
	Crosshair,
	Footprints,
	Home,
	MapPin,
	MoreHorizontal,
	Navigation,
	NotebookText,
	Target,
	Trash2,
	Trees,
	Trophy,
	X,
} from 'lucide-react';
import type { PracticeCategory, PracticeType, WeatherCondition } from '@/lib/prismaEnums';
import { Environment } from '@/lib/prismaEnums';
import { useModalBehavior } from '@/lib/useModalBehavior';
import { Button } from '@/components';
import { formatWeatherConditions } from '@/lib/weatherUtils';
import { getArrowMaterialLabel, getBowTypeLabel, getPracticeCategoryLabel } from '@/lib/labels';

export interface PracticeDetails {
	id: string;
	date: string; // ISO
	arrowsShot?: number;
	arrowsWithoutScore?: number | null;
	location?: string | null;
	environment: Environment;
	weather: WeatherCondition[];
	notes?: string | null;
	rating?: number | null;
	practiceType?: PracticeType | null;
	practiceCategory?: PracticeCategory | null;
	totalScore?: number;
	roundType?: {
		name: string;
		distanceMeters?: number | null;
		targetType?: { sizeCm: number; type: string; scoringZones?: number } | null;
		numberArrows?: number | null;
		arrowsWithoutScore?: number | null;
		roundScore?: number | null;
	};
	bow?: {
		name: string;
		type: string;
	};
	arrows?: {
		name: string;
		material: string;
	};
	ends?: Array<{
		id: string;
		arrows: number;
		arrowsPerEnd?: number | null;
		distanceMeters?: number | null;
		targetSizeCm?: number | null;
		scores: number[];
		roundScore?: number | null;
	}>;
}

interface PracticeDetailsModalProps {
	open: boolean;
	practice?: PracticeDetails;
	onClose: () => void;
	onEdit?: () => void;
	onDeleted?: (id: string) => void;
}

// Practice category icons
const practiceCategoryIcons: Record<string, React.ReactNode> = {
	FELT: <Crosshair size={20} />,
	JAKT_3D: <Footprints size={20} />,
	SKIVE: <Target size={20} />,
	ANNET: <MoreHorizontal size={20} />,
};

export const PracticeDetailsModal: React.FC<PracticeDetailsModalProps> = ({ open, practice, onClose, onEdit, onDeleted }) => {
	useModalBehavior({ open, onClose });
	const [deleting, setDeleting] = React.useState(false);
	const [deleteError, setDeleteError] = React.useState<string | null>(null);

	if (!open || !practice) return null;

	const formattedDate = new Date(practice.date).toLocaleDateString('nb-NO', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});

	// Use arrowsShot if available, otherwise fallback to calculating from ends
	const totalArrows =
		practice.arrowsShot ??
		(practice.ends
			? practice.ends.reduce((sum, end) => {
					const arrows = end.arrows ?? end.scores?.length ?? 0;
					return sum + arrows;
				}, 0)
			: 0);

	// Use totalScore from practice if available, otherwise calculate from ends
	let totalScore = 0;
	if (practice.totalScore !== null && practice.totalScore !== undefined) {
		totalScore = practice.totalScore;
	} else if (practice.ends) {
		totalScore = practice.ends.reduce((sum, end) => {
			// @ts-ignore - roundScore might exist on end
			if (end.roundScore !== undefined) {
				// @ts-ignore
				const score = end.roundScore;
				return sum + (score !== null && score !== undefined ? score : 0);
			}
			// Fallback to summing scores array
			const scoresSum = end.scores?.reduce((s, v) => s + v, 0);
			return sum + (scoresSum !== null && scoresSum !== undefined ? scoresSum : 0);
		}, 0);
	}

	const isCompetition = practice.practiceType === 'KONKURRANSE';

	const handleDelete = async () => {
		setDeleting(true);
		setDeleteError(null);
		try {
			const res = await fetch(`/api/practices/${practice.id}`, { method: 'DELETE' });
			if (!res.ok) {
				let details: any = null;
				try {
					details = await res.json();
				} catch {
					// ignore
				}
				setDeleteError(details?.error || 'Kunne ikke slette trening.');
				return;
			}
			onDeleted?.(practice.id);
			onClose();
		} catch (e) {
			setDeleteError(e instanceof Error ? e.message : 'Kunne ikke slette trening.');
		} finally {
			setDeleting(false);
		}
	};

	return (
		<div className={styles.overlay} onClick={onClose} role="presentation">
			<div
				className={styles.modal}
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="practice-details-title"
			>
				<div className={styles.header}>
					<div className={styles.headerContent}>
						<h3 id="practice-details-title" className={styles.title}>
							{formattedDate}
						</h3>
						<div className={styles.badges}>
							{isCompetition ? (
								<div className={`${styles.badge} ${styles.competitionBadge}`}>
									<Trophy size={14} />
									<span>Konkurranse</span>
								</div>
							) : (
								<div className={`${styles.badge} ${styles.trainingBadge}`}>
									<Target size={14} />
									<span>Trening</span>
								</div>
							)}
							<div className={styles.envBadge}>
								{practice.environment === 'INDOOR' ? (
									<>
										<Home size={16} />
										<span>Inne</span>
									</>
								) : (
									<>
										<Trees size={16} />
										<span>Ute</span>
									</>
								)}
							</div>
						</div>
					</div>
					<button className={styles.closeBtn} onClick={onClose} aria-label="Lukk">
						<X size={24} />
					</button>
				</div>
				{totalScore > 0 && (
					<div className={styles.scoreCard}>
						<div className={styles.scoreLabel}>Total Score</div>
						<div className={styles.scoreValue}>{totalScore}</div>
						<div className={styles.scoreSubtext}>{totalArrows} piler skutt</div>
					</div>
				)}
				<div className={styles.statsGrid}>
					{practice.practiceCategory && (
						<div className={styles.statCard}>
							{practiceCategoryIcons[practice.practiceCategory] && (
								<div className={styles.statIcon}>{practiceCategoryIcons[practice.practiceCategory]}</div>
							)}
							<div className={styles.statLabel}>Kategori</div>
							<div className={styles.statValue}>{getPracticeCategoryLabel(practice.practiceCategory)}</div>
						</div>
					)}
					{practice.location && (
						<div className={styles.statCard}>
							<MapPin size={20} className={styles.statIcon} fill="currentColor" />
							<div className={styles.statLabel}>Sted</div>
							<div className={styles.statValue}>{practice.location}</div>
						</div>
					)}
					{practice.weather?.length > 0 && (
						<div className={styles.statCard}>
							<CloudSun size={20} className={styles.statIcon} fill="currentColor" />
							<div className={styles.statLabel}>Vær</div>
							<div className={styles.statValue}>{formatWeatherConditions(practice.weather)}</div>
						</div>
					)}
					{practice.bow && (
						<div className={styles.statCard}>
							<BowArrow size={20} className={styles.statIcon} fill="currentColor" />
							<div className={styles.statLabel}>Bue</div>
							<div className={styles.statValue}>
								{practice.bow.name} • {getBowTypeLabel(practice.bow.type)}
							</div>
						</div>
					)}
					{practice.arrows && (
						<div className={styles.statCard}>
							<Navigation size={20} className={styles.statIcon} fill="currentColor" />
							<div className={styles.statLabel}>Piler</div>
							<div className={styles.statValue}>
								{practice.arrows.name} • {getArrowMaterialLabel(practice.arrows.material)}
							</div>
						</div>
					)}
				</div>
				{practice.arrowsWithoutScore && practice.arrowsWithoutScore > 0 && (
					<div className={styles.statCardFull}>
						<BowArrow size={20} className={styles.statIcon} fill="currentColor" />
						<div className={styles.statLabel}>Piler uten scoring</div>
						<div className={styles.statValue}>{practice.arrowsWithoutScore} piler</div>
					</div>
				)}
				{practice.ends && practice.ends.length > 0 && (
					<div className={styles.roundsSection}>
						<h4 className={styles.sectionTitle}>
							<Target size={20} />
							Runder
						</h4>
						<div className={styles.roundsList}>
							{practice.ends.map((end) => {
								const arrows = end.arrows ?? end.scores?.length ?? 0;
								// Use roundScore if available, otherwise sum scores array
								const scoreSum = end.roundScore ?? (Array.isArray(end.scores) ? end.scores.reduce((s, v) => s + v, 0) : 0);
								return (
									<div key={end.id} className={styles.roundCard}>
										{scoreSum > 0 && (
											<div className={styles.roundScore}>
												<span className={styles.roundScoreNumber}>{scoreSum}</span> poeng
											</div>
										)}
										<div className={styles.roundMeta}>
											{end.distanceMeters && (
												<div className={styles.roundMetaItem}>
													<span className={styles.roundMetaLabel}>Avstand</span>
													<span className={styles.roundMetaValue}>{end.distanceMeters}m</span>
												</div>
											)}
											{end.targetSizeCm && (
												<div className={styles.roundMetaItem}>
													<span className={styles.roundMetaLabel}>Blink</span>
													<span className={styles.roundMetaValue}>{end.targetSizeCm}cm</span>
												</div>
											)}
											{arrows > 0 && (
												<div className={styles.roundMetaItem}>
													<span className={styles.roundMetaLabel}>Piler</span>
													<span className={styles.roundMetaValue}>{arrows} stk</span>
												</div>
											)}
										</div>
										{Array.isArray(end.scores) && end.scores.length > 0 && (
											<div className={styles.roundScores}>
												{end.scores.map((score, i) => (
													<div key={i} className={styles.scoreChip}>
														{score}
													</div>
												))}
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				)}
				{practice.notes && (
					<div className={styles.notesSection}>
						<h4 className={styles.sectionTitle}>
							<NotebookText size={20} />
							Notater
						</h4>
						<div className={styles.notesContent}>{practice.notes}</div>
					</div>
				)}
				{deleteError && <div className={styles.errorBox}>{deleteError}</div>}
				<div className={styles.actions}>
					<Button label="Lukk" buttonType="outline" onClick={onClose} width={140} disabled={deleting} />
					{onEdit && <Button label="Rediger" onClick={onEdit} width={140} disabled={deleting} />}
					<Button
						label={deleting ? 'Sletter...' : 'Slett'}
						onClick={handleDelete}
						width={140}
						variant="warning"
						buttonType="outline"
						disabled={deleting}
						icon={<Trash2 size={18} />}
					/>
				</div>
			</div>
		</div>
	);
};
