'use client';

import { useEffect, useState } from 'react';
import { LuArrowRight, LuTarget } from 'react-icons/lu';
import { Button, Modal } from '@/components';
import type { CalculatedMarks, SightMark } from '@/types/SightMarks';
import styles from './SightMarkChooserModal.module.css';

interface SightMarkChooserModalProps {
	open: boolean;
	onClose: () => void;
	sightMarks: SightMark[];
	currentId?: string | null;
	/** Called with the chosen SightMark when the user confirms. */
	onChoose: (sightMark: SightMark) => void;
}

export function SightMarkChooserModal({
	open,
	onClose,
	sightMarks,
	currentId,
	onChoose,
}: SightMarkChooserModalProps) {
	const [selected, setSelected] = useState<string | null>(null);

	// Sync selection when modal opens
	useEffect(() => {
		if (open) {
			setSelected(currentId ?? sightMarks[0]?.id ?? null);
		}
	}, [open, currentId, sightMarks]);

	function handleConfirm() {
		const sm = sightMarks.find((s) => s.id === selected);
		if (sm) {
			onChoose(sm);
			onClose();
		}
	}

	return (
		<Modal open={open} onClose={onClose} title="Velg siktemerke" maxWidth={460}>
			<p className={styles.hint}>
				Velg hvilket sett med innskytingsmerker som skal brukes som grunnlag for beregningen.
			</p>

			<div className={styles.list}>
				{sightMarks.map((sm) => {
					const calc = sm.ballisticsParameters as CalculatedMarks;
					const bowName = sm.bowSpec?.bow?.name ?? 'Ukjent bue';
					const title = sm.name || bowName;
					const arrowName = calc?.arrow_name ?? null;
					const distCount = sm.givenDistances.length;
					const isSelected = selected === sm.id;

					return (
						<button
							key={sm.id}
							type="button"
							className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
							onClick={() => setSelected(sm.id)}
							aria-pressed={isSelected}
						>
							<div className={styles.optionIcon} aria-hidden>
								<LuTarget size={18} />
							</div>
							<div className={styles.optionContent}>
								<span className={styles.optionTitle}>{title}</span>
								<span className={styles.optionMeta}>
									{arrowName && (
										<>
											<LuArrowRight size={11} aria-hidden />
											{arrowName}
											{' · '}
										</>
									)}
									{distCount} merker
								</span>
							</div>
							<span className={`${styles.radioCircle} ${isSelected ? styles.radioCircleSelected : ''}`} aria-hidden />
						</button>
					);
				})}
			</div>

			<div className={styles.actions}>
				<Button label="Avbryt" buttonType="outline" onClick={onClose} />
				<Button label="Velg og beregn" onClick={handleConfirm} disabled={!selected} />
			</div>
		</Modal>
	);
}

