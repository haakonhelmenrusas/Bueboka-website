'use client';

import React from 'react';
import styles from './PracticeFormModal.module.css';
import { LuPlus, LuX } from 'react-icons/lu';
import type { PracticeCategory } from '@/lib/prismaEnums';
import { Button, NumberInput, Select } from '@/components';
import { getTargetTypeOptions } from '@/lib/Contants';
import { type RoundInput, isRangeCategory } from './PracticeFormModal.types';
import { useTranslation } from '@/context/LanguageProvider';

interface RoundsStepProps {
	rounds: RoundInput[];
	practiceCategory: PracticeCategory;
	addRound: () => void;
	removeRound: (index: number) => void;
	updateRound: (index: number, field: keyof RoundInput, value: RoundInput[keyof RoundInput]) => void;
	onOpenScoring: (roundIndex: number) => void;
}

export const PracticeFormRoundsStep: React.FC<RoundsStepProps> = ({ rounds, practiceCategory, addRound, removeRound, updateRound, onOpenScoring }) => {
	const { t } = useTranslation();
	const rangeCategory = isRangeCategory(practiceCategory);
	const targetTypeOptions = getTargetTypeOptions(t);

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
										options={targetTypeOptions}
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

						{(() => {
							const maxArrows = round.numberArrows ?? 0;
							const currentScores = round.scores ?? [];
							const filledCount = currentScores.length;
							const isFull = maxArrows > 0 && filledCount >= maxArrows;
							const hasPartialScores = filledCount > 0 && !isFull;
							const hasManualScore = round.roundScore > 0 && filledCount === 0;
							const showScoreButton = maxArrows > 0 && !hasManualScore;
							const total = currentScores.reduce((a, b) => a + b, 0);

							if (!showScoreButton) return null;

							const buttonLabel = isFull
								? t['scoring.editScores']
								: hasPartialScores
									? t['scoring.continueScoring']
									: t['scoring.scoreNow'];

							return (
								<div className={styles.roundScoringSection}>
									{filledCount > 0 && (
										<span className={styles.roundScoringProgress}>
											{isFull
												? `${t['scoring.allRegistered']} ${t['scoring.scoreSuffix']} ${total}`
												: `${filledCount}/${maxArrows} ${t['scoring.arrowsRecorded']} · ${t['scoring.sum']} ${total}`}
										</span>
									)}
									<Button
										type="button"
										label={buttonLabel}
										onClick={() => onOpenScoring(index)}
										variant="standard"
										width="100%"
									/>
								</div>
							);
						})()}
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
