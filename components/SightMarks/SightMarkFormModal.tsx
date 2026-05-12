'use client';

import React, { useEffect, useState } from 'react';
import { LuInfo, LuTrash2 } from 'react-icons/lu';
import styles from './SightMarkFormModal.module.css';
import { Button, Modal, NumberInput, Select } from '@/components';
import type { SelectOption } from '@/components/common/Select/Select';
import type { Arrow, Bow } from '@/lib/types';
import { useTranslation } from '@/context/LanguageProvider';

interface InitialData {
	bowId: string;
	bowName: string;
	name: string;
}

interface SightMarkFormModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (data: { distance: number; mark: number; bowId: string; arrowId: string; name: string }) => Promise<void>;
	onDelete?: () => Promise<void>;
	bows: Bow[];
	arrows: Arrow[];
	/** When set the form opens in "edit existing" mode */
	initialData?: InitialData;
}

export function SightMarkFormModal({ open, onClose, onSave, onDelete, bows, arrows, initialData }: SightMarkFormModalProps) {
	const { t } = useTranslation();
	const isEditing = !!initialData;

	const [name, setName] = useState('');
	const [distance, setDistance] = useState<number>(0);
	const [mark, setMark] = useState<number>(0);
	const [selectedBowId, setSelectedBowId] = useState<string>('');
	const [selectedArrowId, setSelectedArrowId] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Sync default bow/arrow when data loads asynchronously
	useEffect(() => {
		if (bows.length > 0 && !selectedBowId && !initialData) {
			setSelectedBowId((bows.find((b) => b.isFavorite) ?? bows[0]).id);
		}
	}, [bows, selectedBowId, initialData]);

	useEffect(() => {
		if (arrows.length > 0 && !selectedArrowId) {
			setSelectedArrowId((arrows.find((a) => a.isFavorite) ?? arrows[0]).id);
		}
	}, [arrows, selectedArrowId]);

	// Reset form every time the modal opens
	useEffect(() => {
		if (!open) return;
		setDistance(0);
		setMark(0);
		setError(null);
		if (initialData) {
			setSelectedBowId(initialData.bowId);
			setName(initialData.name);
		} else {
			setName('');
			const preferredBow = bows.find((b) => b.isFavorite) ?? bows[0];
			const preferredArrow = arrows.find((a) => a.isFavorite) ?? arrows[0];
			if (preferredBow) setSelectedBowId(preferredBow.id);
			if (preferredArrow) setSelectedArrowId(preferredArrow.id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	const bowOptions: SelectOption[] = bows.map((b) => ({
		value: b.id,
		label: b.name,
		subtitle: b.isFavorite ? t['common.favorite'] : undefined,
	}));

	const arrowOptions: SelectOption[] = arrows.map((a) => ({
		value: a.id,
		label: a.name,
		subtitle: a.isFavorite ? t['common.favorite'] : undefined,
	}));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedBowId) {
			setError(t['sightMarkForm.selectBowFirst']);
			return;
		}
		if (!selectedArrowId) {
			setError(t['sightMarkForm.selectArrowsFirst']);
			return;
		}
		if (distance <= 0 || mark <= 0) {
			setError(t['sightMarkForm.fillPositiveValues']);
			return;
		}

		setLoading(true);
		setError(null);
		try {
			await onSave({ distance, mark, bowId: selectedBowId, arrowId: selectedArrowId, name });
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : t['sightMarkForm.saveError']);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!onDelete) return;
		setDeleting(true);
		setError(null);
		try {
			await onDelete();
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : t['sightMarkForm.deleteError']);
		} finally {
			setDeleting(false);
		}
	};

	if (!open) return null;

	const noBows = bows.length === 0;
	const noArrows = arrows.length === 0;
	const busy = loading || deleting;

	return (
		<Modal open={open} onClose={onClose} title={isEditing ? t['sightMarkForm.editTitle'] : t['sightMarkForm.newTitle']} maxWidth={560}>
			{!isEditing && (
				<div className={styles.infoBox}>
					<LuInfo size={18} className={styles.infoIcon} />
					<p className={styles.infoText}>{t['sightMarkForm.infoText']}</p>
				</div>
			)}

			<form onSubmit={handleSubmit} className={styles.form}>
				<div className={styles.field}>
					<label className={styles.label} htmlFor="sm-name">
						{t['sightMarkForm.nameLabel']}
					</label>
					<input
						id="sm-name"
						type="text"
						className={styles.textInput}
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder={t['sightMarkForm.namePlaceholder']}
					/>
				</div>

				<div className={styles.selectRow}>
					<Select
						label={t['sightMarkForm.bowLabel']}
						value={selectedBowId}
						onChange={(v) => setSelectedBowId(v as string)}
						options={bowOptions}
						placeholderLabel={t['sightMarkForm.selectBow']}
						emptyText={t['sightMarkForm.noBows']}
						disabled={noBows}
						errorMessage={noBows ? t['sightMarkForm.addBowFirst'] : undefined}
						containerClassName={styles.selectField}
					/>
					<Select
						label={t['sightMarkForm.arrowsLabel']}
						value={selectedArrowId}
						onChange={(v) => setSelectedArrowId(v as string)}
						options={arrowOptions}
						placeholderLabel={t['sightMarkForm.selectArrows']}
						emptyText={t['sightMarkForm.noArrows']}
						disabled={noArrows}
						errorMessage={noArrows ? t['sightMarkForm.addArrowsFirst'] : undefined}
						containerClassName={styles.selectField}
					/>
				</div>

				{isEditing && (
					<div className={styles.divider}>
						<span className={styles.dividerLabel}>{t['sightMarkForm.addMarkDivider']}</span>
					</div>
				)}

				<div className={styles.inputsRow}>
					<NumberInput label={t['sightMarkForm.distanceLabel']} value={distance} onChange={setDistance} min={0} max={150} startEmpty required width="100%" />
					<NumberInput label={t['sightMarkForm.markLabel']} value={mark} onChange={setMark} step={0.01} startEmpty required width="100%" />
				</div>

				{error && <div className={styles.error}>{error}</div>}

				<div className={styles.footer}>
					{isEditing && onDelete && (
						<Button
							label={t['sightMarkForm.deleteSet']}
							type="button"
							buttonType="outline"
							variant="warning"
							icon={<LuTrash2 size={16} />}
							onClick={handleDelete}
							disabled={busy}
							loading={deleting}
						/>
					)}
					<div className={styles.footerActions}>
						<Button label={t['common.cancel']} type="button" buttonType="outline" onClick={onClose} disabled={busy} />
						<Button
							label={isEditing ? t['sightMarkForm.addMarkDivider'] : t['sightMarkForm.saveMark']}
							type="submit"
							loading={loading}
							disabled={busy || noBows || noArrows}
						/>
					</div>
				</div>
			</form>
		</Modal>
	);
}
