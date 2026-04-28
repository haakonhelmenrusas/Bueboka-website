'use client';

import React from 'react';
import { Button, Modal, SessionShareModal } from '@/components';
import type { SessionShareData } from '@/components/SessionShareCard/SessionShareCard';
import { formatWeatherConditions } from '@/lib/weatherUtils';
import { getArrowMaterialLabel, getBowTypeLabel, getPracticeCategoryLabel } from '@/lib/labels';
import type { PracticeDetailsModalProps } from './types';
import { calculateTotalArrows, calculateTotalScore, calculateArrowsWithoutScore } from './helpers';
import { PRACTICE_CATEGORY_ICONS } from './constants';
import { EnvironmentBadge, PracticeTypeBadge } from './Badges';
import { StatCard } from './StatCard';
import { RoundCard } from './RoundCard';
import styles from './PracticeDetailsModal.module.css';
import { LuCloud, LuMapPin, LuTarget, LuTrash, LuShare2 } from 'react-icons/lu';
import { GiArrowhead, GiBowArrow, GiBrokenArrow } from 'react-icons/gi';
import { CgNotes } from 'react-icons/cg';
import { useTranslation } from '@/context/LanguageProvider';

export const PracticeDetailsModal: React.FC<PracticeDetailsModalProps> = ({ open, practice, onClose, onEdit, onDeleted }) => {
	const { t } = useTranslation();
	const [deleting, setDeleting] = React.useState(false);
	const [deleteError, setDeleteError] = React.useState<string | null>(null);
	const [shareOpen, setShareOpen] = React.useState(false);

	if (!practice) return null;

	const formattedDate = new Date(practice.date).toLocaleDateString('nb-NO', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});

	const totalArrows = calculateTotalArrows(practice);
	const totalScore = calculateTotalScore(practice);
	const arrowsWithoutScore = calculateArrowsWithoutScore(practice);

	// Derive distance from first end
	const distanceMeters = practice.ends?.[0]?.distanceMeters ?? null;

	const shareData: SessionShareData = {
		date: practice.date,
		practiceType: practice.practiceType ?? null,
		totalScore,
		arrowsShot: totalArrows,
		arrowsWithoutScore: practice.arrowsWithoutScore ?? 0,
		bowName: practice.bow?.name ?? null,
		bowType: practice.bow?.type ?? null,
		distanceMeters,
		category: practice.practiceCategory ?? null,
		environment: practice.environment ?? null,
		location: practice.location ?? null,
	};

	const handleDelete = async () => {
		setDeleting(true);
		setDeleteError(null);
		try {
			const endpoint = practice.practiceType === 'KONKURRANSE' ? `/api/competitions/${practice.id}` : `/api/practices/${practice.id}`;
			const res = await fetch(endpoint, { method: 'DELETE' });
			if (!res.ok) {
				const details = await res.json().catch(() => null);
				setDeleteError(details?.error || t['practiceDetails.deleteError']);
				return;
			}
			onDeleted?.(practice.id);
			onClose();
		} catch (e) {
			setDeleteError(e instanceof Error ? e.message : t['practiceDetails.deleteError']);
		} finally {
			setDeleting(false);
		}
	};

	return (
		<>
			<Modal open={open} onClose={onClose} title={formattedDate} maxWidth={900}>
				<div className={styles.badges}>
					<PracticeTypeBadge practiceType={practice.practiceType} />
					<EnvironmentBadge environment={practice.environment} />
				</div>
				{totalScore > 0 && (
					<div className={styles.scoreCard}>
						<div className={styles.scoreLabel}>{t['practiceDetails.totalScore']}</div>
						<div className={styles.scoreValue}>{totalScore}</div>
						<div className={styles.scoreSubtext}>{totalArrows - arrowsWithoutScore} {t['practiceDetails.arrowsShot']}</div>
					</div>
				)}
				<div className={styles.statsGrid}>
					{practice.practiceCategory && (
						<StatCard
							icon={PRACTICE_CATEGORY_ICONS[practice.practiceCategory]}
							label={t['practiceDetails.category']}
							value={getPracticeCategoryLabel(practice.practiceCategory)}
						/>
					)}
					{practice.location && <StatCard icon={<LuMapPin className="w-5 h-5" />} label={t['practiceDetails.location']} value={practice.location} />}
					{practice.weather?.length > 0 && (
						<StatCard icon={<LuCloud className="w-5 h-5" />} label={t['practiceDetails.weather']} value={formatWeatherConditions(practice.weather)} />
					)}
					{practice.bow && (
						<StatCard
							icon={<GiBowArrow className="w-5 h-5" />}
							label={t['practiceDetails.bow']}
							value={`${practice.bow.name} • ${getBowTypeLabel(practice.bow.type)}`}
						/>
					)}
					{practice.arrows && (
						<StatCard
							icon={<GiArrowhead className="w-5 h-5" style={{ transform: 'rotate(225deg)' }} />}
							label={t['practiceDetails.arrowsLabel']}
							value={`${practice.arrows.name} • ${getArrowMaterialLabel(practice.arrows.material)}`}
						/>
					)}
				</div>
				{arrowsWithoutScore > 0 && (
					<div className={styles.statCardFull}>
						<GiBrokenArrow className="w-5 h-5" />
						<div className={styles.statLabel}>{t['practiceDetails.unscoredArrows']}</div>
						<div className={styles.statValue}>{arrowsWithoutScore} {t['practiceDetails.arrows']}</div>
					</div>
				)}
				{practice.ends && practice.ends.length > 0 && (
					<div className={styles.roundsSection}>
						<h4 className={styles.sectionTitle}>
							<LuTarget size={20} />
							{t['practiceDetails.rounds']}
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
							{t['practiceDetails.notesLabel']}
						</h4>
						<div className={styles.notesContent}>{practice.notes}</div>
					</div>
				)}
				{deleteError && <div className={styles.errorBox}>{deleteError}</div>}
				<div className={styles.actions}>
					{onEdit && <Button label={t['practiceDetails.edit']} onClick={onEdit} width={140} disabled={deleting} />}
					<div className={styles.closeShareRow}>
						<Button label={t['common.close']} buttonType="outline" onClick={onClose} width={140} disabled={deleting} />
						<Button
							label={t['practiceDetails.share']}
							onClick={() => setShareOpen(true)}
							width={140}
							buttonType="outline"
							disabled={deleting}
							icon={<LuShare2 size={16} />}
						/>
					</div>
					<Button
						label={deleting ? t['common.deleting'] : t['common.delete']}
						onClick={handleDelete}
						width={140}
						variant="warning"
						buttonType="outline"
						disabled={deleting}
						icon={<LuTrash className="w-4 h-4" />}
					/>
				</div>
			</Modal>

			<SessionShareModal open={shareOpen} onClose={() => setShareOpen(false)} data={shareData} />
		</>
	);
};
