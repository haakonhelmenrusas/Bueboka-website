import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { prisma } from '@/lib/prisma';
import { statsCache } from '@/lib/cache';
import { getCurrentUser } from '@/lib/session';

function startOfDay(d: Date) {
	const x = new Date(d);
	x.setHours(0, 0, 0, 0);
	return x;
}

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		// Check cache first
		const cacheKey = `stats:summary:${user.id}`;
		const cached = statsCache.get(cacheKey);
		if (cached) {
			return NextResponse.json(cached, {
				headers: {
					'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=300',
				},
			});
		}

		const now = new Date();
		const from7 = startOfDay(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
		const from30 = startOfDay(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));

		// Use two raw SQL queries with conditional aggregation instead of 18 separate queries.
		// This reduces the number of database round trips from 18 to 2.
		type StatsRow = {
			total_arrows: bigint | number | null;
			total_no_score: bigint | number | null;
			total_round_score: bigint | number | null;
			last7_arrows: bigint | number | null;
			last7_no_score: bigint | number | null;
			last7_round_score: bigint | number | null;
			last30_arrows: bigint | number | null;
			last30_no_score: bigint | number | null;
			last30_round_score: bigint | number | null;
		};

		const [endRows, compRows] = await Promise.all([
			prisma.$queryRaw<StatsRow[]>`
				SELECT
					COALESCE(SUM(e.arrows), 0)::int                                                                    AS total_arrows,
					COALESCE(SUM(e."arrowsWithoutScore"), 0)::int                                                      AS total_no_score,
					COALESCE(SUM(e."roundScore"), 0)::int                                                              AS total_round_score,
					COALESCE(SUM(CASE WHEN p.date >= ${from7}  THEN COALESCE(e.arrows, 0) END), 0)::int               AS last7_arrows,
					COALESCE(SUM(CASE WHEN p.date >= ${from7}  THEN COALESCE(e."arrowsWithoutScore", 0) END), 0)::int AS last7_no_score,
					COALESCE(SUM(CASE WHEN p.date >= ${from7}  THEN COALESCE(e."roundScore", 0) END), 0)::int         AS last7_round_score,
					COALESCE(SUM(CASE WHEN p.date >= ${from30} THEN COALESCE(e.arrows, 0) END), 0)::int               AS last30_arrows,
					COALESCE(SUM(CASE WHEN p.date >= ${from30} THEN COALESCE(e."arrowsWithoutScore", 0) END), 0)::int AS last30_no_score,
					COALESCE(SUM(CASE WHEN p.date >= ${from30} THEN COALESCE(e."roundScore", 0) END), 0)::int         AS last30_round_score
				FROM ends e
				JOIN practices p ON e."practiceId" = p.id
				WHERE p."userId" = ${user.id}
			`,
			prisma.$queryRaw<StatsRow[]>`
				SELECT
					COALESCE(SUM(cr.arrows), 0)::int                                                                     AS total_arrows,
					COALESCE(SUM(cr."arrowsWithoutScore"), 0)::int                                                       AS total_no_score,
					COALESCE(SUM(cr."roundScore"), 0)::int                                                               AS total_round_score,
					COALESCE(SUM(CASE WHEN c.date >= ${from7}  THEN COALESCE(cr.arrows, 0) END), 0)::int                AS last7_arrows,
					COALESCE(SUM(CASE WHEN c.date >= ${from7}  THEN COALESCE(cr."arrowsWithoutScore", 0) END), 0)::int  AS last7_no_score,
					COALESCE(SUM(CASE WHEN c.date >= ${from7}  THEN COALESCE(cr."roundScore", 0) END), 0)::int          AS last7_round_score,
					COALESCE(SUM(CASE WHEN c.date >= ${from30} THEN COALESCE(cr.arrows, 0) END), 0)::int                AS last30_arrows,
					COALESCE(SUM(CASE WHEN c.date >= ${from30} THEN COALESCE(cr."arrowsWithoutScore", 0) END), 0)::int  AS last30_no_score,
					COALESCE(SUM(CASE WHEN c.date >= ${from30} THEN COALESCE(cr."roundScore", 0) END), 0)::int          AS last30_round_score
				FROM competition_rounds cr
				JOIN competitions c ON cr."competitionId" = c.id
				WHERE c."userId" = ${user.id}
			`,
		]);

		const endRow = endRows[0];
		const compRow = compRows[0];

		// Helper to build PeriodStats for a given period
		const buildPeriod = (
			endArrows: number, compArrows: number,
			endUnscored: number, compUnscored: number,
			endScore: number, compScore: number,
		) => {
			const scoredArrows = endArrows + compArrows;
			const unscoredArrows = endUnscored + compUnscored;
			const totalScore = endScore + compScore;
			return {
				totalArrows: scoredArrows + unscoredArrows,
				scoredArrows,
				unscoredArrows,
				avgScorePerArrow: scoredArrows > 0 ? Math.round((totalScore / scoredArrows) * 100) / 100 : null,
			};
		};

		const result = {
			stats: {
				last7Days: buildPeriod(
					overallNumber(endRow?.last7_arrows), overallNumber(compRow?.last7_arrows),
					overallNumber(endRow?.last7_no_score), overallNumber(compRow?.last7_no_score),
					overallNumber(endRow?.last7_round_score), overallNumber(compRow?.last7_round_score),
				),
				last30Days: buildPeriod(
					overallNumber(endRow?.last30_arrows), overallNumber(compRow?.last30_arrows),
					overallNumber(endRow?.last30_no_score), overallNumber(compRow?.last30_no_score),
					overallNumber(endRow?.last30_round_score), overallNumber(compRow?.last30_round_score),
				),
				overall: buildPeriod(
					overallNumber(endRow?.total_arrows), overallNumber(compRow?.total_arrows),
					overallNumber(endRow?.total_no_score), overallNumber(compRow?.total_no_score),
					overallNumber(endRow?.total_round_score), overallNumber(compRow?.total_round_score),
				),
			},
		};

		// Store in cache
		statsCache.set(cacheKey, result);

		return NextResponse.json(result, {
			headers: {
				'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=300',
			},
		});
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'stats', method: 'GET' }, extra: { message: 'Error fetching stats' } });
		return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
	}
}

function overallNumber(v: bigint | number | null | undefined) {
	if (typeof v === 'bigint') return Number(v);
	return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}
