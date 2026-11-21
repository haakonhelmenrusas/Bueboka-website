/**
 * Arrow-count helpers for ends (practices) and rounds (competitions).
 *
 * `arrows` is nullable in the schema: rows saved by older app versions stored
 * null when the user entered individual arrow scores instead of a count.
 * In that case the stored `scores` array is authoritative for the scored
 * arrow count — same rule the write paths use ("scores are authoritative").
 */

interface ArrowCountSource {
	arrows: number | null;
	arrowsWithoutScore?: number | null;
	scores?: number[] | null;
}

/** Scored arrow count: explicit `arrows` when set, otherwise the number of stored individual scores. */
export function scoredArrowCount(item: Pick<ArrowCountSource, 'arrows' | 'scores'>): number {
	return item.arrows || (Array.isArray(item.scores) ? item.scores.length : 0) || 0;
}

/** Total arrows shot in an end/round: scored arrows plus arrows without score. */
export function totalArrowCount(item: ArrowCountSource): number {
	return scoredArrowCount(item) + (item.arrowsWithoutScore || 0);
}

/** Sum of totalArrowCount over a list of ends/rounds. */
export function sumArrowCounts(items: ArrowCountSource[]): number {
	return items.reduce((sum, item) => sum + totalArrowCount(item), 0);
}
