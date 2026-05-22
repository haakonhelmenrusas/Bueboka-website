'use client';

import React, { useState, useEffect } from 'react';
import styles from './PracticeFormModal.module.css';
import { LuChevronLeft, LuChevronRight, LuInfo } from 'react-icons/lu';
import { ARROW_SCORE_OPTIONS, type RoundInput, getRoundSummary } from './PracticeFormModal.types';
import { Environment } from '@/lib/prismaEnums';
import { Button, Modal } from '@/components';
import { useTranslation } from '@/context/LanguageProvider';

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
	return s.arrowChipMiss;
}

interface ScoringModalProps {
	open: boolean;
	round: RoundInput;
	roundIndex: number;
	environment: Environment;
	endPage: number;
	editingIndex: number | null;
	onClose: () => void;
	onSetEndPage: (page: number) => void;
	onSetEditingIndex: (idx: number | null) => void;
	onAddArrowScore: (score: number) => void;
	onUpdateArrowScore: (arrowIndex: number, score: number) => void;
}

export const PracticeFormScoringModal: React.FC<ScoringModalProps> = ({
	open,
	round,
	roundIndex,
	environment,
	endPage,
	editingIndex,
	onClose,
	onSetEndPage,
	onSetEditingIndex,
	onAddArrowScore,
	onUpdateArrowScore,
}) => {
	const { t } = useTranslation();

	const scoreOptions = environment === Environment.OUTDOOR ? ARROW_SCORE_OPTIONS : ARROW_SCORE_OPTIONS.filter((opt) => opt.label !== 'X');

	const [localEndPage, setLocalEndPage] = useState(endPage);

	useEffect(() => {
		setLocalEndPage(endPage);
	}, [endPage]);

	const handleSetEndPage = (page: number) => {
		onSetEditingIndex(null);
		setLocalEndPage(page);
		onSetEndPage(page);
	};

	const maxArrows = round.numberArrows ?? 0;
	const hasManualScore = round.roundScore > 0 && (round.scores ?? []).length === 0;

	if (!open) return null;

	if (maxArrows === 0 && !hasManualScore) return null;

	const currentScores = round.scores ?? [];
	const filledCount = currentScores.length;
	const total = currentScores.reduce((a, b) => a + b, 0);
	const isFull = filledCount >= maxArrows;

	const arrowsPerEnd = round.arrowsPerEnd ?? DEFAULT_ARROWS_PER_END;
	const totalEnds = Math.ceil(maxArrows / arrowsPerEnd);
	const activeEndPage = isFull ? totalEnds - 1 : Math.floor(filledCount / arrowsPerEnd);
	const currentEndPage = Math.min(localEndPage ?? activeEndPage, activeEndPage);

	const startIdx = currentEndPage * arrowsPerEnd;
	const endIdx = Math.min(startIdx + arrowsPerEnd, maxArrows);
	const arrowsInThisEnd = endIdx - startIdx;
	const endScores = currentScores.slice(startIdx, endIdx);
	const endTotal = endScores.reduce((a, b) => a + b, 0);

	const isActiveEnd = !isFull && currentEndPage === activeEndPage;
	const isEndFilled = endScores.length >= arrowsInThisEnd;

	const canGoPrev = currentEndPage > 0;
	const canGoNext = currentEndPage < activeEndPage;

	const editingIdx = editingIndex ?? null;
	const isEditing = editingIdx !== null;
	const showScoreButtons = (isActiveEnd && !isEndFilled) || isEditing;

	const modalTitle = `${t['scoring.arrowScoring']} — ${t['form.round']} ${roundIndex + 1}`;

	return (
		<Modal open={open} onClose={onClose} title={modalTitle} maxWidth={600} fullScreenMobile>
			<div className={styles.scoringModalContent}>
				<div className={styles.scoringCardHeader}>
					<span className={styles.scoringRoundMeta}>{getRoundSummary(round, t)}</span>
				</div>

				{hasManualScore ? (
					<div className={styles.manualScoreNotice}>
						<LuInfo size={16} className={styles.manualScoreNoticeIcon} />
						<div className={styles.manualScoreNoticeBody}>
							<span className={styles.manualScoreNoticeMain}>
								{t['scoring.totalScoreLabel']} {round.roundScore} {t['scoring.points']}
							</span>
							<span className={styles.manualScoreNoticeHint}>{t['scoring.manualScoreHint']}</span>
						</div>
					</div>
				) : (
					<>
						{totalEnds > 1 && (
							<div className={styles.endNav}>
								<button
									type="button"
									className={`${styles.endNavBtn}${!canGoPrev ? ` ${styles.endNavBtnDisabled}` : ''}`}
									onClick={() => handleSetEndPage(currentEndPage - 1)}
									disabled={!canGoPrev}
									aria-label={t['scoring.previousEnd']}
								>
									<LuChevronLeft size={18} />
								</button>
								<span className={styles.endNavLabel}>
									{t['scoring.endLabel']} {currentEndPage + 1} / {totalEnds}
								</span>
								<button
									type="button"
									className={`${styles.endNavBtn}${!canGoNext ? ` ${styles.endNavBtnDisabled}` : ''}`}
									onClick={() => handleSetEndPage(currentEndPage + 1)}
									disabled={!canGoNext}
									aria-label={t['scoring.nextEnd']}
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
										onClick={scored ? () => onSetEditingIndex(isThisChipEditing ? null : absIdx) : undefined}
										role={scored ? 'button' : undefined}
										aria-label={scored ? `${t['scoring.editingArrowPrefix']} ${i + 1}: ${endScores[i]} ${t['scoring.points']}` : undefined}
									>
										{scored ? endScores[i] : '–'}
									</div>
								);
							})}
						</div>

						<div className={styles.scoringProgress}>
							<span className={styles.scoringProgressText}>
								{filledCount} {t['scoring.of']} {maxArrows} {t['scoring.arrowsRecorded']}
							</span>
							{filledCount > 0 && (
								<span className={styles.scoringTotal}>
									{t['scoring.sum']} {total}
								</span>
							)}
						</div>

						{showScoreButtons && (
							<>
								{isEditing && (
									<p className={styles.editingHint}>
										{t['scoring.editingArrowPrefix']} {editingIdx! - startIdx + 1}
									</p>
								)}
								<div className={styles.scoreButtonsGrid}>
									{scoreOptions.map((opt) => (
										<button
											key={opt.label}
											type="button"
											className={`${styles.scoreButton} ${getScoreButtonClass(opt.label, styles)}`}
											onClick={() => {
												if (isEditing) {
													onUpdateArrowScore(editingIdx!, opt.value);
													onSetEditingIndex(null);
												} else {
													onAddArrowScore(opt.value);
												}
											}}
										>
											{opt.label}
										</button>
									))}
								</div>
							</>
						)}

						{isFull && !isEditing && currentEndPage === totalEnds - 1 && (
							<div className={styles.scoringComplete}>
								{t['scoring.allRegistered']} {t['scoring.scoreSuffix']} {total}
							</div>
						)}
						{!isFull && isEndFilled && !isActiveEnd && !isEditing && (
							<div className={styles.endComplete}>
								<span className={styles.endCompleteText}>
									{t['scoring.endLabel']} {currentEndPage + 1} {t['scoring.done']} – {endTotal} {t['scoring.points']}
								</span>
								{canGoNext && (
									<Button
										type="button"
										label={`${t['scoring.nextEnd']} →`}
										onClick={() => handleSetEndPage(currentEndPage + 1)}
										variant="standard"
										width="100%"
									/>
								)}
							</div>
						)}
					</>
				)}

				<div className={styles.scoringModalFooter}>
					<Button type="button" label={t['scoring.done']} onClick={onClose} variant="standard" />
				</div>
			</div>
		</Modal>
	);
};
