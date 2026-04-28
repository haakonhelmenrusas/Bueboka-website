'use client';

import React from 'react';
import styles from './PracticeFormModal.module.css';
import { LuPlus, LuX } from 'react-icons/lu';
import type { PracticeCategory } from '@/lib/prismaEnums';
import { NumberInput, Select } from '@/components';
import { TARGET_TYPE_OPTIONS } from '@/lib/Contants';
import { type RoundInput, isRangeCategory } from './PracticeFormModal.types';
import { useTranslation } from '@/context/LanguageProvider';

interface RoundsStepProps {
	rounds: RoundInput[];
	practiceCategory: PracticeCategory;
	addRound: () => void;
	removeRound: (index: number) => void;
	updateRound: (index: number, field: keyof RoundInput, value: RoundInput[keyof RoundInput]) => void;
}

export const PracticeFormRoundsStep: React.FC<RoundsStepProps> = ({ rounds, practiceCategory, addRound, removeRound, updateRound }) => {
	const { t } = useTranslation();
	const rangeCategory = isRangeCategory(practiceCategory);

	return (
		<div className={styles.stepContent}>
			<div className={styles.roundsSection}>
				{rounds.map((round, index) => (
					<div key={index} className={styles.roundCard}>
						<div className={styles.roundHeader}>
							<span className={styles.roundNumber}>{t['form.round']} {index + 1}</span>
							{rounds.length > 1 && (
								<button type="button" className={styles.removeRoundBtn} onClick={() => removeRound(index)} aria-label={t['practice.removeRound']}>
									<LuX size={16} />
								</button>
							)}
						</div>

						<div className={styles.roundInputs}>
							{rangeCategory ? (
								<>
									<NumberInput
										label={t['form.from']}
										value={round.distanceFrom ?? 0}
										onChange={(v) => updateRound(index, 'distanceFrom', v || undefined)}
										min={0}
										step={1}
										startEmpty
										unit="m"
										containerClassName={styles.roundField}
									/>
									<NumberInput
										label={t['form.to']}
										value={round.distanceTo ?? 0}
										onChange={(v) => updateRound(index, 'distanceTo', v || undefined)}
										min={0}
										step={1}
										startEmpty
										unit="m"
										containerClassName={styles.roundField}
									/>
								</>
							) : (
								<>
									<NumberInput
										label={t['form.distance']}
										value={round.distanceMeters ?? 0}
										onChange={(v) => updateRound(index, 'distanceMeters', v || undefined)}
										min={0}
										step={1}
										startEmpty
										unit="m"
										containerClassName={styles.roundField}
									/>
									<Select
										label={t['form.target']}
										value={round.targetType}
										onChange={(v) => updateRound(index, 'targetType', v as string)}
										placeholderLabel={t['form.choose']}
										searchable
										options={TARGET_TYPE_OPTIONS}
										containerClassName={styles.skiveField}
									/>
								</>
							)}
						</div>

						<div className={styles.roundInputs}>
							<NumberInput
								label={t['form.arrowsWithScore']}
								value={round.numberArrows ?? 0}
								onChange={(v) => updateRound(index, 'numberArrows', v || undefined)}
								min={0}
								step={1}
								startEmpty
								optional
								containerClassName={styles.roundField}
							/>
							<NumberInput
								label={t['form.arrowsPerEnd']}
								value={round.arrowsPerEnd ?? 0}
								onChange={(v) => updateRound(index, 'arrowsPerEnd', v || undefined)}
								min={1}
								max={20}
								step={1}
								startEmpty
								optional
								containerClassName={styles.roundField}
							/>
						</div>

						<div className={styles.roundInputs}>
							<NumberInput
								label={t['form.score']}
								value={round.roundScore}
								onChange={(v) => updateRound(index, 'roundScore', v)}
								min={0}
								step={1}
								startEmpty
								optional
								containerClassName={styles.roundField}
							/>
							<NumberInput
								label={t['form.arrowsWithoutScore']}
								value={round.arrowsWithoutScore ?? 0}
								onChange={(v) => updateRound(index, 'arrowsWithoutScore', v || undefined)}
								min={0}
								step={1}
								startEmpty
								optional
								containerClassName={styles.roundField}
							/>
						</div>
					</div>
				))}

				<button type="button" className={styles.addRoundBtn} onClick={addRound} disabled={rounds.length >= 20}>
					<LuPlus size={14} />
					{t['practice.addRound']}
				</button>
				{rounds.length >= 20 && <p className={styles.limitMessage}>{t['practice.maxRounds']}</p>}
			</div>
		</div>
	);
};
