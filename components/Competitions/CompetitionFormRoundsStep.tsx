'use client';

import React from 'react';
import styles from './CompetitionFormModal.module.css';
import { LuPlus, LuX } from 'react-icons/lu';
import type { PracticeCategory } from '@/lib/prismaEnums';
import { NumberInput, Select } from '@/components';
import { TARGET_TYPE_OPTIONS } from '@/lib/Contants';
import { type CompetitionRoundInput, isRangeCategory } from './CompetitionFormModal.types';

interface RoundsStepProps {
	rounds: CompetitionRoundInput[];
	practiceCategory: PracticeCategory;
	addRound: () => void;
	removeRound: (index: number) => void;
	updateRound: (index: number, field: keyof CompetitionRoundInput, value: CompetitionRoundInput[keyof CompetitionRoundInput]) => void;
}

export const CompetitionFormRoundsStep: React.FC<RoundsStepProps> = ({ rounds, practiceCategory, addRound, removeRound, updateRound }) => {
	const rangeCategory = isRangeCategory(practiceCategory);

	return (
		<div className={styles.stepContent}>
			<div className={styles.roundsSection}>
				{rounds.map((round, index) => (
					<div key={index} className={styles.roundCard}>
						<div className={styles.roundHeader}>
							<span className={styles.roundNumber}>Runde {index + 1}</span>
							{rounds.length > 1 && (
								<button type="button" className={styles.removeRoundBtn} onClick={() => removeRound(index)} aria-label="Fjern runde">
									<LuX size={16} />
								</button>
							)}
						</div>

						<div className={styles.roundInputs}>
							{rangeCategory ? (
								<>
									<NumberInput
										label="Fra"
										value={round.distanceFrom ?? 0}
										onChange={(v) => updateRound(index, 'distanceFrom', v || undefined)}
										min={0}
										step={1}
										startEmpty
										unit="m"
										containerClassName={styles.roundField}
									/>
									<NumberInput
										label="Til"
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
										label="Avstand"
										value={round.distanceMeters ?? 0}
										onChange={(v) => updateRound(index, 'distanceMeters', v || undefined)}
										min={0}
										step={1}
										startEmpty
										unit="m"
										containerClassName={styles.roundField}
									/>
									<Select
										label="Skive"
										value={round.targetType}
										onChange={(v) => updateRound(index, 'targetType', v as string)}
										placeholderLabel="Velg"
										searchable
										options={TARGET_TYPE_OPTIONS}
										containerClassName={styles.skiveField}
									/>
								</>
							)}
						</div>

						<div className={styles.roundInputs}>
							<NumberInput
								label="Piler m/score"
								value={round.numberArrows ?? 0}
								onChange={(v) => updateRound(index, 'numberArrows', v || undefined)}
								min={0}
								step={1}
								startEmpty
								optional
								containerClassName={styles.roundField}
							/>
							<NumberInput
								label="Score"
								value={round.roundScore}
								onChange={(v) => updateRound(index, 'roundScore', v)}
								min={0}
								step={1}
								startEmpty
								optional
								containerClassName={styles.roundField}
							/>
						</div>

						<div className={styles.roundInputsNarrow}>
							<NumberInput
								label="Piler u/score"
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
					Legg til runde
				</button>
				{rounds.length >= 20 && <p className={styles.limitMessage}>Maksimalt 20 runder er tillatt</p>}
			</div>
		</div>
	);
};

