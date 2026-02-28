import React from 'react';
import { BowArrow, CloudSun, MapPin, Navigation, NotebookText, Target, Trash2, X } from 'lucide-react';
import { useModalBehavior } from '@/lib/useModalBehavior';
import { Button } from '@/components';
import { formatWeatherConditions } from '@/lib/weatherUtils';
import { getArrowMaterialLabel, getBowTypeLabel, getPracticeCategoryLabel } from '@/lib/labels';
import type { PracticeDetailsModalProps } from './types';
import { calculateTotalArrows, calculateTotalScore } from './helpers';
import { PRACTICE_CATEGORY_ICONS } from './constants';
import { EnvironmentBadge, PracticeTypeBadge } from './Badges';
import { StatCard } from './StatCard';
import { RoundCard } from './RoundCard';
import styles from './PracticeDetailsModal.module.css';

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

	const totalArrows = calculateTotalArrows(practice);
	const totalScore = calculateTotalScore(practice);

	const handleDelete = async () => {
		setDeleting(true);
		setDeleteError(null);
		try {
			const res = await fetch(`/api/practices/${practice.id}`, { method: 'DELETE' });
			if (!res.ok) {
				const details = await res.json().catch(() => null);
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
				{/* Header */}
				<div className={styles.header}>
					<div className={styles.headerContent}>
						<h3 id="practice-details-title" className={styles.title}>
							{formattedDate}
						</h3>
						<div className={styles.badges}>
							<PracticeTypeBadge practiceType={practice.practiceType} />
							<EnvironmentBadge environment={practice.environment} />
						</div>
					</div>
					<button className={styles.closeBtn} onClick={onClose} aria-label="Lukk">
						<X size={24} />
					</button>
				</div>

				{/* Total Score Card */}
				{totalScore > 0 && (
					<div className={styles.scoreCard}>
						<div className={styles.scoreLabel}>Total Score</div>
						<div className={styles.scoreValue}>{totalScore}</div>
						<div className={styles.scoreSubtext}>{totalArrows} piler skutt</div>
					</div>
				)}

				{/* Stats Grid */}
				<div className={styles.statsGrid}>
					{practice.practiceCategory && (
						<StatCard
							icon={PRACTICE_CATEGORY_ICONS[practice.practiceCategory]}
							label="Kategori"
							value={getPracticeCategoryLabel(practice.practiceCategory)}
						/>
					)}
					{practice.location && <StatCard icon={<MapPin size={20} fill="currentColor" />} label="Sted" value={practice.location} />}
					{practice.weather?.length > 0 && (
						<StatCard icon={<CloudSun size={20} fill="currentColor" />} label="Vær" value={formatWeatherConditions(practice.weather)} />
					)}
					{practice.bow && (
						<StatCard
							icon={<BowArrow size={20} fill="currentColor" />}
							label="Bue"
							value={`${practice.bow.name} • ${getBowTypeLabel(practice.bow.type)}`}
						/>
					)}
					{practice.arrows && (
						<StatCard
							icon={<Navigation size={20} fill="currentColor" />}
							label="Piler"
							value={`${practice.arrows.name} • ${getArrowMaterialLabel(practice.arrows.material)}`}
						/>
					)}
				</div>

				{/* Arrows Without Score */}
				{practice.arrowsWithoutScore && practice.arrowsWithoutScore > 0 && (
					<div className={styles.statCardFull}>
						<BowArrow size={20} className={styles.statIcon} fill="currentColor" />
						<div className={styles.statLabel}>Piler uten scoring</div>
						<div className={styles.statValue}>{practice.arrowsWithoutScore} piler</div>
					</div>
				)}

				{/* Rounds Section */}
				{practice.ends && practice.ends.length > 0 && (
					<div className={styles.roundsSection}>
						<h4 className={styles.sectionTitle}>
							<Target size={20} />
							Runder
						</h4>
						<div className={styles.roundsList}>
							{practice.ends.map((end) => (
								<RoundCard key={end.id} end={end} />
							))}
						</div>
					</div>
				)}

				{/* Notes Section */}
				{practice.notes && (
					<div className={styles.notesSection}>
						<h4 className={styles.sectionTitle}>
							<NotebookText size={20} />
							Notater
						</h4>
						<div className={styles.notesContent}>{practice.notes}</div>
					</div>
				)}

				{/* Error Message */}
				{deleteError && <div className={styles.errorBox}>{deleteError}</div>}

				{/* Actions */}
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
