'use client';

import React, { useState, useEffect } from 'react';
import styles from './PracticeFormModal.module.css';
import { LuChevronLeft, LuChevronRight, LuInfo } from 'react-icons/lu';
import { ARROW_SCORE_OPTIONS, type RoundInput, getRoundSummary } from './PracticeFormModal.types';
import { Environment } from '@/lib/prismaEnums';

const DEFAULT_ARROWS_PER_END = 3;

function getScoreButtonClass(label: string, s: Record<string, string>): string {
	switch (label) {
		case 'X':
			return s.scoreButtonX;
		case '10':
		case '9':
			return s.scoreButtonGold;
		case '8':
		case '7':
			return s.scoreButtonRed;
		case '6':
		case '5':
			return s.scoreButtonBlue;
		case '4':
		case '3':
			return s.scoreButtonBlack;
		case '2':
		case '1':
			return s.scoreButtonWhite;
		case 'M':
			return s.scoreButtonMiss;
		default:
			return '';
	}
}

function getChipColorClass(score: number, s: Record<string, string>): string {
	if (score >= 9) return s.arrowChipGold;
	if (score >= 7) return s.arrowChipRed;
	if (score >= 5) return s.arrowChipBlue;
	if (score >= 3) return s.arrowChipBlack;
	if (score >= 1) return s.arrowChipWhite;
	return s.arrowChipMiss; // 0 = M
}

interface ScoringStepProps {
	rounds: RoundInput[];
	environment: Environment;
	addArrowScore: (roundIndex: number, score: number) => void;
	updateArrowScore: (roundIndex: number, arrowIndex: number, score: number) => void;
}

export const PracticeFormScoringStep: React.FC<ScoringStepProps> = ({ rounds, environment, addArrowScore, updateArrowScore }) => {
	const hasAnyActionable = rounds.some((r) => (r.numberArrows ?? 0) > 0 || r.roundScore > 0);

	const scoreOptions = environment === Environment.OUTDOOR ? ARROW_SCORE_OPTIONS : ARROW_SCORE_OPTIONS.filter((opt) => opt.label !== 'X');

	// Track which end page is visible per round
	const [endPages, setEndPages] = useState<Record<number, number>>({});
	// Track which absolute arrow index is being edited per round (null = append mode)
	const [editingIndices, setEditingIndices] = useState<Record<number, number | null>>({});

	// Clamp endPages whenever scores change (e.g. after backspace)
	useEffect(() => {
		setEndPages((prev) => {
			const next: Record<number, number> = {};
			rounds.forEach((round, idx) => {
				const maxArrows = round.numberArrows ?? 0;
				if (maxArrows === 0) return;
				const arrowsPerEnd = round.arrowsPerEnd ?? DEFAULT_ARROWS_PER_END;
				const filledCount = (round.scores ?? []).length;
				const totalEnds = Math.ceil(maxArrows / arrowsPerEnd);
				const activeEndPage = filledCount >= maxArrows ? totalEnds - 1 : Math.floor(filledCount / arrowsPerEnd);
				const currentPage = prev[idx] ?? activeEndPage;
				next[idx] = Math.max(0, Math.min(currentPage, activeEndPage));
			});
			return next;
		});
	}, [rounds]);

	const setEndPage = (roundIndex: number, page: number) => {
		// Clear editing when navigating between ends
		setEditingIndices((prev) => ({ ...prev, [roundIndex]: null }));
		setEndPages((prev) => ({ ...prev, [roundIndex]: page }));
	};

	const setEditingIndex = (roundIndex: number, idx: number | null) => {
		setEditingIndices((prev) => ({ ...prev, [roundIndex]: idx }));
	};

	return (
		<div className={styles.stepContent}>
			{!hasAnyActionable && (
				<div className={styles.emptyScoring}>
					<p className={styles.emptyScoringText}>
						Ingen runder med definert antall piler. Gå tilbake til «Runder» og fyll inn «Piler m/score».
					</p>
				</div>
			)}

			{rounds.map((round, roundIndex) => {
				const maxArrows = round.numberArrows ?? 0;
				const hasManualScore = round.roundScore > 0 && (round.scores ?? []).length === 0;

				// Nothing to show for this round
				if (maxArrows === 0 && !hasManualScore) return null;

				// Round has a manually entered total score – show informational notice
				if (hasManualScore) {
					return (
						<div key={roundIndex} className={styles.scoringCard}>
							<div className={styles.scoringCardHeader}>
								<span className={styles.scoringRoundTitle}>Runde {roundIndex + 1}</span>
								<span className={styles.scoringRoundMeta}>{getRoundSummary(round)}</span>
							</div>
							<div className={styles.manualScoreNotice}>
								<LuInfo size={16} className={styles.manualScoreNoticeIcon} />
								<div className={styles.manualScoreNoticeBody}>
									<span className={styles.manualScoreNoticeMain}>Totalscore: {round.roundScore} poeng</span>
									<span className={styles.manualScoreNoticeHint}>
										Du har registrert en totalscore for denne runden. Vil du score enkeltpiler i stedet, fjern totalscoren under
										«Runder»-steget.
									</span>
								</div>
							</div>
						</div>
					);
				}

				const currentScores = round.scores ?? [];
				const filledCount = currentScores.length;
				const total = currentScores.reduce((a, b) => a + b, 0);
				const isFull = filledCount >= maxArrows;

				const arrowsPerEnd = round.arrowsPerEnd ?? DEFAULT_ARROWS_PER_END;
				const totalEnds = Math.ceil(maxArrows / arrowsPerEnd);
				const activeEndPage = isFull ? totalEnds - 1 : Math.floor(filledCount / arrowsPerEnd);
				const currentEndPage = Math.min(endPages[roundIndex] ?? activeEndPage, activeEndPage);

				const startIdx = currentEndPage * arrowsPerEnd;
				const endIdx = Math.min(startIdx + arrowsPerEnd, maxArrows);
				const arrowsInThisEnd = endIdx - startIdx;
				const endScores = currentScores.slice(startIdx, endIdx);
				const endTotal = endScores.reduce((a, b) => a + b, 0);

				const isActiveEnd = !isFull && currentEndPage === activeEndPage;
				const isEndFilled = endScores.length >= arrowsInThisEnd;

				const canGoPrev = currentEndPage > 0;
				const canGoNext = currentEndPage < activeEndPage;

				const editingIdx = editingIndices[roundIndex] ?? null;
				const isEditing = editingIdx !== null;
				const showScoreButtons = (isActiveEnd && !isEndFilled) || isEditing;

				return (
					<div key={roundIndex} className={styles.scoringCard}>
						<div className={styles.scoringCardHeader}>
							<span className={styles.scoringRoundTitle}>Runde {roundIndex + 1}</span>
							<span className={styles.scoringRoundMeta}>{getRoundSummary(round)}</span>
						</div>

						{totalEnds > 1 && (
							<div className={styles.endNav}>
								<button
									type="button"
									className={`${styles.endNavBtn}${!canGoPrev ? ` ${styles.endNavBtnDisabled}` : ''}`}
									onClick={() => setEndPage(roundIndex, currentEndPage - 1)}
									disabled={!canGoPrev}
									aria-label="Forrige serie"
								>
									<LuChevronLeft size={18} />
								</button>
								<span className={styles.endNavLabel}>
									Serie {currentEndPage + 1} / {totalEnds}
								</span>
								<button
									type="button"
									className={`${styles.endNavBtn}${!canGoNext ? ` ${styles.endNavBtnDisabled}` : ''}`}
									onClick={() => setEndPage(roundIndex, currentEndPage + 1)}
									disabled={!canGoNext}
									aria-label="Neste serie"
								>
									<LuChevronRight size={18} />
								</button>
							</div>
						)}

						<div className={styles.arrowChipsRow}>
							{Array.from({ length: arrowsInThisEnd }).map((_, i) => {
								const absIdx = startIdx + i;
								const scored = endScores[i] !== undefined;
								const isThisChipEditing = editingIdx === absIdx;

								let chipClass = `${styles.arrowChip} ${styles.arrowChipLarge}`;
								if (isThisChipEditing) chipClass += ` ${styles.arrowChipEditing}`;
								else if (scored) chipClass += ` ${styles.arrowChipFilled} ${getChipColorClass(endScores[i], styles)}`;
								else chipClass += ` ${styles.arrowChipEmpty}`;

								return (
									<div
										key={i}
										className={chipClass}
										onClick={scored ? () => setEditingIndex(roundIndex, isThisChipEditing ? null : absIdx) : undefined}
										role={scored ? 'button' : undefined}
										aria-label={scored ? `Endre pil ${i + 1}: ${endScores[i]} poeng` : undefined}
										title={scored ? 'Klikk for å endre' : undefined}
									>
										{scored ? endScores[i] : '–'}
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

						{showScoreButtons && (
							<>
								{isEditing && <p className={styles.editingHint}>Velg ny verdi for pil {editingIdx! - startIdx + 1}</p>}
								<div className={styles.scoreButtonsGrid}>
									{scoreOptions.map((opt) => (
										<button
											key={opt.label}
											type="button"
											className={`${styles.scoreButton} ${getScoreButtonClass(opt.label, styles)}`}
											onClick={() => {
												if (isEditing) {
													updateArrowScore(roundIndex, editingIdx!, opt.value);
													setEditingIndex(roundIndex, null);
												} else {
													addArrowScore(roundIndex, opt.value);
												}
											}}
										>
											{opt.label}
										</button>
									))}
								</div>
							</>
						)}

						{/* End complete / all done banners */}
						{isFull && !isEditing && currentEndPage === totalEnds - 1 && (
							<div className={styles.scoringComplete}>✓ Alle piler registrert – score: {total}</div>
						)}
						{!isFull && isEndFilled && !isActiveEnd && !isEditing && (
							<div className={styles.endComplete}>
								<span className={styles.endCompleteText}>
									Serie {currentEndPage + 1} ferdig – {endTotal} poeng
								</span>
								{canGoNext && (
									<button type="button" className={styles.endNextBtn} onClick={() => setEndPage(roundIndex, currentEndPage + 1)}>
										Neste serie →
									</button>
								)}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};
