'use client';

import { useEffect, useState } from 'react';
import { LuPlus, LuX } from 'react-icons/lu';
import { Button, Select } from '@/components';
import styles from './SightMarksSection.module.css';
import { SightMarksTable } from './SightMarksTable';
import { SightMarkFormModal } from '@/components';
import { BowModal } from '@/components/BowModal/BowModal';
import type { BowType } from '@/components/ProfileEditModal/BowForm';
import { useSightMarks } from './useSightMarks';
import { useEquipmentData } from '@/components/EquipmentSection/useEquipmentData';
import type { Bow } from '@/lib/types';
import type { AimDistanceMark, SightMark } from '@/types/SightMarks';
import { Ballistics } from '@/lib/Contants';
import { useTranslation } from '@/context/LanguageProvider';

interface SightMarksSectionProps {
	onRefresh?: number;
	/** Called after any create / delete so a parent page can silently refresh its own state. */
	onChanged?: () => void;
}

export function SightMarksSection({ onRefresh, onChanged }: SightMarksSectionProps) {
	const { t } = useTranslation();
	const { sightMarks, loading, error, fetchSightMarks, deleteSightMark, clearError } = useSightMarks();
	const { bows, arrows, refresh: refreshEquipment } = useEquipmentData();
	const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingSightMark, setEditingSightMark] = useState<SightMark | null>(null);
	const [createError, setCreateError] = useState<string | null>(null);
	const [editingBow, setEditingBow] = useState<Bow | null>(null);

	useEffect(() => {
		fetchSightMarks();
		refreshEquipment();
	}, [fetchSightMarks, refreshEquipment, onRefresh]);

	const handleDeleteMark = async (sightMarkId: string, index: number) => {
		setIsDeletingId(sightMarkId);
		try {
			const sm = sightMarks.find((s) => s.id === sightMarkId);
			if (!sm) return;

			const newMarks = sm.givenMarks.filter((_, i) => i !== index);
			const newDistances = sm.givenDistances.filter((_, i) => i !== index);

			if (newMarks.length === 0) {
				// No marks left – delete the whole record
				await deleteSightMark(sightMarkId);
				onChanged?.();
			} else {
				// Patch the record with the mark removed; also filter calculated_marks from stored ballistics
				const calc = sm.ballisticsParameters as import('@/types/SightMarks').CalculatedMarks;
				const newCalculated = Array.isArray(calc?.calculated_marks) ? calc.calculated_marks.filter((_, i) => i !== index) : undefined;
				const updatedBallistics = newCalculated
					? { ...calc, calculated_marks: newCalculated, given_marks: newMarks, given_distances: newDistances }
					: sm.ballisticsParameters;

				const res = await fetch(`/api/sight-marks/${sightMarkId}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						givenMarks: newMarks,
						givenDistances: newDistances,
						ballisticsParameters: updatedBallistics,
					}),
				});
				if (!res.ok) throw new Error(t['sightMarks.updateError']);
				fetchSightMarks();
				onChanged?.();
			}
		} catch (err) {
			console.error('Error deleting mark:', err);
		} finally {
			setIsDeletingId(null);
		}
	};

	const handleCardClick = (sm: SightMark) => {
		setEditingSightMark(sm);
		setIsModalOpen(true);
	};

	const handleModalClose = () => {
		setIsModalOpen(false);
		setEditingSightMark(null);
	};

	const handleCreate = async (data: { distance: number; mark: number; bowId: string; arrowId: string; name: string }) => {
		setCreateError(null);
		try {
			const activeBow = bows.find((b) => b.id === data.bowId);
			const activeArrow = arrows.find((a) => a.id === data.arrowId) ?? arrows.find((a) => a.isFavorite) ?? arrows[0];

			if (!activeBow) {
				const msg = t['sightMarks.noBow'];
				setCreateError(msg);
				throw new Error(msg);
			}

			// Only append to an existing set when the user explicitly clicked a card to edit it.
			// In "Nytt merke" mode (editingSightMark === null) always create a fresh record.
			const activeSightMark = editingSightMark;

			// Prepare accumulated marks
			const existingMarks = activeSightMark?.givenMarks ?? [];
			const existingDistances = activeSightMark?.givenDistances ?? [];
			const givenMarks = [...existingMarks, data.mark];
			const givenDistances = [...existingDistances, data.distance];

			const payload: AimDistanceMark = {
				...Ballistics,
				new_given_mark: data.mark,
				new_given_distance: data.distance,
				given_marks: givenMarks,
				given_distances: givenDistances,
				bow_category: activeBow.type || 'recurve',
				interval_sight_measured: activeBow.aimMeasure ?? Ballistics.interval_sight_measured,
				arrow_diameter_mm: activeArrow?.diameter ?? 5,
				arrow_mass_gram: activeArrow?.weight ?? 21.2,
				length_eye_sight_cm: activeBow.eyeToSight ?? 0,
				length_nock_eye_cm: activeBow.eyeToNock ?? 0,
			};

			const response = await fetch('/api/ballistics/calculate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`${t['sightMarks.calculateError']} ${errorText}`);
			}

			const aimMarkResponse = await response.json();

			// Enrich with arrow name so the card can display it without a separate lookup
			if (activeArrow?.name) {
				aimMarkResponse.arrow_name = activeArrow.name;
			}

			// Persist (Update or Create)
			let saveRes;
			if (activeSightMark) {
				// Update existing
				saveRes = await fetch(`/api/sight-marks/${activeSightMark.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						name: data.name || undefined,
						givenMarks,
						givenDistances,
						ballisticsParameters: aimMarkResponse,
					}),
				});
			} else {
				// Create new
				saveRes = await fetch('/api/sight-marks', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						bowId: activeBow.id,
						name: data.name || undefined,
						givenMarks,
						givenDistances,
						ballisticsParameters: aimMarkResponse,
					}),
				});
			}

			if (!saveRes.ok) {
				throw new Error(t['sightMarks.saveError']);
			}

			// Refresh list after save
			fetchSightMarks();
			onChanged?.();
		} catch (err) {
			setCreateError(err instanceof Error ? err.message : t['sightMarks.unknownError']);
			throw err; // Re-throw to be caught by modal if needed, or handle error display here
		}
	};

	if (loading) {
		return (
			<section className={styles.section}>
				<div className={styles.header}>
					<h2 className={styles.title}>{t['sightMarks.title']}</h2>
				</div>
				<div className={styles.container}>
					<div className={styles.loading}>{t['common.loading']}</div>
				</div>
			</section>
		);
	}

	return (
		<section className={styles.section}>
			<div className={styles.header}>
				<h2 className={styles.title}>{t['sightMarks.title']}</h2>
				<div className={styles.headerActions}>
					{bows.length > 0 && (
						<Select
							label={t['sightMarks.editBow']}
							options={bows.map((b) => ({
								value: b.id,
								label: b.name,
								subtitle: b.isFavorite ? t['common.favorite'] : undefined,
							}))}
							value=""
							onChange={(v) => {
								const bow = bows.find((b) => b.id === v);
								if (bow) setEditingBow(bow);
							}}
							placeholderLabel={t['sightMarks.editBow']}
							containerClassName={styles.bowSelect}
							labelClassName={styles.bowSelectLabel}
						/>
					)}
					<Button
						label={t['sightMarks.new']}
						onClick={() => {
							setEditingSightMark(null);
							setIsModalOpen(true);
						}}
						icon={<LuPlus size={18} />}
					/>
				</div>
			</div>
			<div className={styles.container}>
				{error && (
					<div className={styles.error}>
						<span>{error}</span>
						<button onClick={clearError} className={styles.closeButton} aria-label={t['sightMarks.closeError']}>
							<LuX size={18} />
						</button>
					</div>
				)}
				{createError && (
					<div className={styles.error}>
						<span>{createError}</span>
						<button onClick={() => setCreateError(null)} className={styles.closeButton} aria-label={t['sightMarks.closeError']}>
							<LuX size={18} />
						</button>
					</div>
				)}
				<SightMarksTable
					sightMarks={sightMarks}
					onDeleteMark={handleDeleteMark}
					onCardClick={handleCardClick}
					isDeleting={isDeletingId !== null}
				/>
			</div>
			<SightMarkFormModal
				open={isModalOpen}
				onClose={handleModalClose}
				onSave={handleCreate}
				onDelete={
					editingSightMark
						? async () => {
								await deleteSightMark(editingSightMark.id);
								fetchSightMarks();
							}
						: undefined
				}
				bows={bows}
				arrows={arrows}
				initialData={
					editingSightMark
						? {
								bowId: editingSightMark.bow?.id ?? '',
								bowName: editingSightMark.bow?.name ?? 'Ukjent bue',
								name: editingSightMark.name ?? '',
							}
						: undefined
				}
			/>
			{editingBow && (
				<BowModal
					open={!!editingBow}
					onClose={() => setEditingBow(null)}
					editingBow={{ ...editingBow, type: editingBow.type as BowType }}
					onSaved={() => {
						refreshEquipment();
						onChanged?.();
					}}
				/>
			)}
		</section>
	);
}
