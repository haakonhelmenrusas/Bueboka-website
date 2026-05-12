'use client';

import React from 'react';
import styles from './PracticeFormModal.module.css';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { Button } from '@/components';
import { getStepLabels, TOTAL_STEPS } from './PracticeFormModal.types';
import { useTranslation } from '@/context/LanguageProvider';

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

export const PracticeFormNavFooter: React.FC<NavFooterProps> = ({
	step,
	onPrev,
	onNext,
	isEditMode,
	submitting,
	canSave,
	onSubmit,
}) => {
	const { t } = useTranslation();
	const stepLabels = getStepLabels(t);
	const isFirstStep = step === 0;
	const isLastStep = step === TOTAL_STEPS - 1;

	return (
		<div className={styles.navFooter}>
			<div className={styles.navRow}>
				<button
					type="button"
					className={`${styles.navArrow}${isFirstStep ? ` ${styles.navArrowDisabled}` : ''}`}
					onClick={onPrev}
					disabled={isFirstStep}
					aria-label={t['form.prevStep']}
				>
					<LuChevronLeft size={26} />
				</button>

				<span className={styles.navStepName}>{stepLabels[step]}</span>

				<div className={styles.navRowRight}>
					{isLastStep ? (
						<Button
							type="button"
							label={submitting ? t['common.saving'] : isEditMode ? t['practice.saveChanges'] : t['practice.savePractice']}
							onClick={onSubmit}
							variant="standard"
							disabled={submitting || !canSave}
							loading={submitting}
						/>
					) : (
						<button type="button" className={styles.navArrow} onClick={onNext} aria-label={t['form.nextStep']}>
							<LuChevronRight size={26} />
						</button>
					)}
				</div>
			</div>
		</div>
	);
};
