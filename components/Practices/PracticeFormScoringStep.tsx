'use client';

import React from 'react';
import styles from './PracticeFormModal.module.css';
import { LuDelete } from 'react-icons/lu';
import { ARROW_SCORE_OPTIONS, type RoundInput, getRoundSummary } from './PracticeFormModal.types';

interface ScoringStepProps {
	rounds: RoundInput[];
	addArrowScore: (roundIndex: number, score: number) => void;
	removeLastArrowScore: (roundIndex: number) => void;
}

export const PracticeFormScoringStep: React.FC<ScoringStepProps> = ({ rounds, addArrowScore, removeLastArrowScore }) => {
	const roundsWithArrows = rounds.filter((r) => (r.numberArrows ?? 0) > 0);

	return (
		<div className={styles.stepContent}>
			<p className={styles.stepDescription}>
				Legg inn poengsetting per pil (valgfritt). Poengsummen beregnes automatisk og oppdaterer rundescore.
			</p>

			{roundsWithArrows.length === 0 && (
				<div className={styles.emptyScoring}>
					<p className={styles.emptyScoringText}>
						Ingen runder med definert antall piler. Gå tilbake til «Runder» og fyll inn «Piler m/score».
					</p>
				</div>
			)}

			{rounds.map((round, roundIndex) => {
				const maxArrows = round.numberArrows ?? 0;
				if (maxArrows === 0) return null;

				const currentScores = round.scores ?? [];
				const filledCount = currentScores.length;
				const total = currentScores.reduce((a, b) => a + b, 0);
				const isFull = filledCount >= maxArrows;

				return (
					<div key={roundIndex} className={styles.scoringCard}>
						<div className={styles.scoringCardHeader}>
							<span className={styles.scoringRoundTitle}>Runde {roundIndex + 1}</span>
							<span className={styles.scoringRoundMeta}>{getRoundSummary(round)}</span>
						</div>

						<div className={styles.arrowChipsRow}>
							{Array.from({ length: maxArrows }).map((_, i) => {
								const scored = currentScores[i] !== undefined;
								return (
									<div key={i} className={`${styles.arrowChip}${scored ? ` ${styles.arrowChipFilled}` : ` ${styles.arrowChipEmpty}`}`}>
										{scored ? currentScores[i] : '–'}
									</div>
								);
							})}
						</div>

						<div className={styles.scoringProgress}>
							<span className={styles.scoringProgressText}>
								{filledCount} av {maxArrows} piler registrert
							</span>
							{filledCount > 0 && <span className={styles.scoringTotal}>Sum: {total}</span>}
						</div>

						{!isFull ? (
							<div className={styles.scoreButtonsGrid}>
								{ARROW_SCORE_OPTIONS.map((opt) => (
									<button
										key={opt.label}
										type="button"
										className={`${styles.scoreButton}${opt.label === 'X' ? ` ${styles.scoreButtonX}` : ''}${opt.label === 'M' ? ` ${styles.scoreButtonMiss}` : ''}`}
										onClick={() => addArrowScore(roundIndex, opt.value)}
									>
										{opt.label}
									</button>
								))}
							</div>
						) : (
							<div className={styles.scoringComplete}>✓ Alle piler registrert – score: {total}</div>
						)}

						{filledCount > 0 && (
							<button type="button" className={styles.backspaceBtn} onClick={() => removeLastArrowScore(roundIndex)}>
								<LuDelete size={15} />
								Fjern siste
							</button>
						)}
					</div>
				);
			})}
		</div>
	);
};
