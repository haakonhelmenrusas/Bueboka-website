import { scoredArrowCount, totalArrowCount, sumArrowCounts } from './arrows';

describe('lib/arrows', () => {
	describe('scoredArrowCount', () => {
		it('uses the explicit arrows field when set', () => {
			expect(scoredArrowCount({ arrows: 30, scores: [10, 9] })).toBe(30);
		});

		it('falls back to the number of stored scores when arrows is null (rows saved by older app versions)', () => {
			expect(scoredArrowCount({ arrows: null, scores: [10, 10, 9, 8, 7] })).toBe(5);
		});

		it('returns 0 when both arrows and scores are empty/null', () => {
			expect(scoredArrowCount({ arrows: null, scores: null })).toBe(0);
			expect(scoredArrowCount({ arrows: null, scores: [] })).toBe(0);
			expect(scoredArrowCount({ arrows: 0, scores: [] })).toBe(0);
		});
	});

	describe('totalArrowCount', () => {
		it('sums scored arrows (via scores fallback) and arrowsWithoutScore', () => {
			expect(totalArrowCount({ arrows: null, arrowsWithoutScore: 3, scores: [10, 9, 8] })).toBe(6);
			expect(totalArrowCount({ arrows: 30, arrowsWithoutScore: null, scores: [] })).toBe(30);
		});
	});

	describe('sumArrowCounts', () => {
		it('sums totalArrowCount over a list of ends/rounds', () => {
			const rounds = [
				{ arrows: 30, arrowsWithoutScore: null, scores: [] },
				{ arrows: null, arrowsWithoutScore: 2, scores: [10, 9, 10, 9, 8, 8] },
			];
			expect(sumArrowCounts(rounds)).toBe(38);
			expect(sumArrowCounts([])).toBe(0);
		});
	});
});
