import React from 'react';
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
import { LuCloud, LuCompass, LuMapPin, LuTarget, LuTrash, LuX } from 'react-icons/lu';
import { GiArcher, GiBrokenArrow } from 'react-icons/gi';
import { CgNotes } from 'react-icons/cg';

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
			// Use the correct endpoint based on practice type
			const endpoint = practice.practiceType === 'KONKURRANSE' ? `/api/competitions/${practice.id}` : `/api/practices/${practice.id}`;

			const res = await fetch(endpoint, { method: 'DELETE' });
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
						<LuX className="w-6 h-6" />
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
						<StatCard
							icon={PRACTICE_CATEGORY_ICONS[practice.practiceCategory]}
							label="Kategori"
							value={getPracticeCategoryLabel(practice.practiceCategory)}
						/>
					)}
					{practice.location && <StatCard icon={<LuMapPin className="w-5 h-5" />} label="Sted" value={practice.location} />}
					{practice.weather?.length > 0 && (
						<StatCard icon={<LuCloud className="w-5 h-5" />} label="Vær" value={formatWeatherConditions(practice.weather)} />
					)}
					{practice.bow && (
						<StatCard
							icon={<GiArcher className="w-5 h-5" />}
							label="Bue"
							value={`${practice.bow.name} • ${getBowTypeLabel(practice.bow.type)}`}
						/>
					)}
					{practice.arrows && (
						<StatCard
							icon={<LuCompass className="w-5 h-5" />}
							label="Piler"
							value={`${practice.arrows.name} • ${getArrowMaterialLabel(practice.arrows.material)}`}
						/>
					)}
				</div>
				{practice.arrowsWithoutScore && practice.arrowsWithoutScore > 0 && (
					<div className={styles.statCardFull}>
						<GiBrokenArrow className="w-5 h-5" />
						<div className={styles.statLabel}>Piler uten scoring</div>
						<div className={styles.statValue}>{practice.arrowsWithoutScore} piler</div>
					</div>
				)}
				{practice.ends && practice.ends.length > 0 && (
					<div className={styles.roundsSection}>
						<h4 className={styles.sectionTitle}>
							<LuTarget size={20} />
							Runder
						</h4>
						<div className={styles.roundsList}>
							{practice.ends.map((end) => (
								<RoundCard key={end.id} end={end} />
							))}
						</div>
					</div>
				)}
				{practice.notes && (
					<div className={styles.notesSection}>
						<h4 className={styles.sectionTitle}>
							<CgNotes className="w-5 h-5" />
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
						icon={<LuTrash className="w-4 h-4" />}
					/>
				</div>
			</div>
		</div>
	);
};
