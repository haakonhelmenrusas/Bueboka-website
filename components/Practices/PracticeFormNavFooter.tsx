'use client';

import React from 'react';
import styles from './PracticeFormModal.module.css';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { Button } from '@/components';
import { STEP_LABELS, TOTAL_STEPS } from './PracticeFormModal.types';

interface NavFooterProps {
	step: number;
	onPrev: () => void;
	onNext: () => void;
	isEditMode: boolean;
	submitting: boolean;
	canSave: boolean;
	onClose: () => void;
	onSubmit: () => void;
}

export const PracticeFormNavFooter: React.FC<NavFooterProps> = ({ step, onPrev, onNext, isEditMode, submitting, canSave, onClose, onSubmit }) => {
	const isFirstStep = step === 0;
	const isLastStep = step === TOTAL_STEPS - 1;

	return (
		<div className={styles.navFooter}>
			<div className={styles.navRow}>
				<Button type="button" label="Avbryt" onClick={onClose} variant="standard" buttonType="outline" disabled={submitting} />
				<div className={styles.navCenter}>
					<button
						type="button"
						className={`${styles.navArrow}${isFirstStep ? ` ${styles.navArrowDisabled}` : ''}`}
						onClick={onPrev}
						disabled={isFirstStep}
						aria-label="Forrige steg"
					>
						<LuChevronLeft size={22} />
					</button>
					<span className={styles.navStepName}>{STEP_LABELS[step]}</span>
					{isLastStep ? (
						<div className={styles.navArrow} style={{ visibility: 'hidden' }} />
					) : (
						<button type="button" className={styles.navArrow} onClick={onNext} aria-label="Neste steg">
							<LuChevronRight size={22} />
						</button>
					)}
				</div>
				<div className={styles.navRight}>
					<Button
						type="button"
						label={submitting ? 'Lagrer...' : isEditMode ? 'Lagre endringer' : 'Lagre trening'}
						onClick={onSubmit}
						variant="standard"
						disabled={submitting || !canSave}
						loading={submitting}
					/>
				</div>
			</div>
		</div>
	);
};
