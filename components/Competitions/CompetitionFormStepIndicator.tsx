'use client';

import React from 'react';
import styles from './CompetitionFormModal.module.css';
import { STEP_LABELS, TOTAL_STEPS } from './CompetitionFormModal.types';

interface StepIndicatorProps {
	step: number;
	onStepChange: (index: number) => void;
}

export const CompetitionFormStepIndicator: React.FC<StepIndicatorProps> = ({ step, onStepChange }) => (
	<div className={styles.stepIndicator}>
		{STEP_LABELS.map((label, i) => {
			const isActive = i === step;
			const isCompleted = i < step;
			return (
				<React.Fragment key={i}>
					<button type="button" className={styles.stepItem} onClick={() => onStepChange(i)} aria-label={`Gå til ${label}`}>
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

