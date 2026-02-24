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
	Star,
	Target,
	Trash2,
	Trees,
	X,
} from 'lucide-react';
import type { PracticeCategory, WeatherCondition } from '@/lib/prismaEnums';
import { Environment } from '@/lib/prismaEnums';
import { useModalBehavior } from '@/lib/useModalBehavior';
import { Button } from '@/components';
import { formatWeatherConditions } from '@/lib/weatherUtils';

export interface PracticeDetails {
	id: string;
	date: string; // ISO
	arrowsShot?: number;
	location?: string | null;
	environment: Environment;
	weather: WeatherCondition[];
	notes?: string | null;
	rating?: number | null;
	practiceCategory?: PracticeCategory | null;
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

// Bow type translations
const bowTypeLabels: Record<string, string> = {
	RECURVE: 'Recurve',
	COMPOUND: 'Compound',
	LONGBOW: 'Langbue',
	BAREBOW: 'Barebow',
	HORSEBOW: 'Rytterbue',
	TRADITIONAL: 'Tradisjonell',
	OTHER: 'Annet',
};

// Arrow material translations
const arrowMaterialLabels: Record<string, string> = {
	KARBON: 'Karbon',
	ALUMINIUM: 'Aluminium',
	TREVERK: 'Treverk',
};

// Practice category translations
const practiceCategoryLabels: Record<string, string> = {
	FELT: 'Felt',
	JAKT_3D: 'Jakt/3D',
	SKIVE: 'Skive',
	ANNET: 'Annet',
};

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
	const totalArrows = practice.arrowsShot ?? practice.ends?.reduce((sum, end) => sum + (end.arrows ?? end.scores?.length ?? 0), 0) ?? 0;

	// Calculate total score from round scores in ends
	// First check if ends have a roundScore property (from the new structure)
	// Otherwise fallback to summing individual arrow scores
	const totalScore =
		practice.ends?.reduce((sum, end) => {
			// @ts-ignore - roundScore might exist on end
			if (end.roundScore !== undefined) {
				// @ts-ignore
				return sum + (end.roundScore || 0);
			}
			// Fallback to summing scores array
			return sum + (end.scores?.reduce((s, v) => s + v, 0) || 0);
		}, 0) || 0;

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
					{practice.rating && (
						<div className={styles.statCard}>
							<Star size={20} className={styles.statIcon} fill="currentColor" />
							<div className={styles.statLabel}>Vurdering</div>
							<div className={styles.statValue}>{practice.rating}/10</div>
						</div>
					)}
					{practice.practiceCategory && (
						<div className={styles.statCard}>
							{practiceCategoryIcons[practice.practiceCategory] && (
								<div className={styles.statIcon}>{practiceCategoryIcons[practice.practiceCategory]}</div>
							)}
							<div className={styles.statLabel}>Kategori</div>
							<div className={styles.statValue}>{practiceCategoryLabels[practice.practiceCategory] || practice.practiceCategory}</div>
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
								{practice.bow.name} • {bowTypeLabels[practice.bow.type] || practice.bow.type}
							</div>
						</div>
					)}
					{practice.arrows && (
						<div className={styles.statCard}>
							<Navigation size={20} className={styles.statIcon} fill="currentColor" />
							<div className={styles.statLabel}>Piler</div>
							<div className={styles.statValue}>
								{practice.arrows.name} • {arrowMaterialLabels[practice.arrows.material] || practice.arrows.material}
							</div>
						</div>
					)}
				</div>
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
										{scoreSum > 0 && <div className={styles.roundScore}>{scoreSum} poeng</div>}
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
