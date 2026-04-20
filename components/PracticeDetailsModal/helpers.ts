import type { PracticeDetails, PracticeEnd } from './types';

/**
 * Calculate total arrows shot in a practice
 */
export const calculateTotalArrows = (practice: PracticeDetails): number => {
	return practice.arrowsShot ?? practice.ends?.reduce((sum, end) => sum + (end.arrows ?? end.scores?.length ?? 0), 0) ?? 0;
};

/**
 * Calculate total score for a practice
 */
export const calculateTotalScore = (practice: PracticeDetails): number => {
	if (practice.totalScore) return practice.totalScore;
	return (
		practice.ends?.reduce((sum, end) => {
			const score = end.roundScore ?? end.scores?.reduce((s, v) => s + v, 0) ?? 0;
			return sum + score;
		}, 0) ?? 0
	);
};

/**
 * Calculate total arrows without score across all ends
 */
export const calculateArrowsWithoutScore = (practice: PracticeDetails): number => {
	const fromEnds = practice.ends?.reduce((sum, end) => sum + (end.arrowsWithoutScore ?? 0), 0) ?? 0;
	// Fall back to top-level field if ends don't carry it
	return fromEnds > 0 ? fromEnds : (practice.arrowsWithoutScore ?? 0);
};

/**
 * Calculate score for a single end/round
 */
export const calculateEndScore = (end: PracticeEnd): number => {
	return end.roundScore ?? (Array.isArray(end.scores) ? end.scores.reduce((s, v) => s + v, 0) : 0);
};
