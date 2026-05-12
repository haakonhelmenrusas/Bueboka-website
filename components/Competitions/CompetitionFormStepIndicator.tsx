'use client';

import React from 'react';
import styles from './CompetitionFormModal.module.css';
import { getStepLabels, TOTAL_STEPS } from './CompetitionFormModal.types';
import { useTranslation } from '@/context/LanguageProvider';

interface StepIndicatorProps {
	step: number;
	onStepChange: (index: number) => void;
}

export const CompetitionFormStepIndicator: React.FC<StepIndicatorProps> = ({ step, onStepChange }) => {
	const { t } = useTranslation();
	const stepLabels = getStepLabels(t);
	return (
		<div className={styles.stepIndicator}>
			{stepLabels.map((label, i) => {
				const isActive = i === step;
				const isCompleted = i < step;
				return (
					<React.Fragment key={i}>
						<button type="button" className={styles.stepItem} onClick={() => onStepChange(i)} aria-label={`${t['competition.stepGoTo']} ${label}`}>
							<div
								className={`${styles.stepDot}${isActive ? ` ${styles.stepDotActive}` : ''}${isCompleted ? ` ${styles.stepDotCompleted}` : ''}`}
							>
								<span className={`${styles.stepDotText}${isActive || isCompleted ? ` ${styles.stepDotTextActive}` : ''}`}>{i + 1}</span>
							</div>
							<span
								className={`${styles.stepLabel}${isActive ? ` ${styles.stepLabelActive}` : ''}${isCompleted ? ` ${styles.stepLabelCompleted}` : ''}`}
							>
								{label}
							</span>
						</button>
						{i < TOTAL_STEPS - 1 && <div className={`${styles.stepConnector}${isCompleted ? ` ${styles.stepConnectorCompleted}` : ''}`} />}
					</React.Fragment>
				);
			})}
		</div>
	);
};
