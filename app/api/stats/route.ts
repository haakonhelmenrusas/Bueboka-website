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

		// Count arrows shot from ends (practices) and competition rounds
		// Include both arrows and arrowsWithoutScore
		const [
			overallEnds,
			last7Ends,
			last30Ends,
			overallCompRounds,
			last7CompRounds,
			last30CompRounds,
			overallEndsWithoutScore,
			last7EndsWithoutScore,
			last30EndsWithoutScore,
			overallCompRoundsWithoutScore,
			last7CompRoundsWithoutScore,
			last30CompRoundsWithoutScore,
			// Score aggregations
			overallEndsScore,
			last7EndsScore,
			last30EndsScore,
			overallCompRoundsScore,
			last7CompRoundsScore,
			last30CompRoundsScore,
		] = await Promise.all([
			prisma.end.aggregate({
				where: { Practice: { userId: user.id } },
				_sum: { arrows: true },
			}),
			prisma.end.aggregate({
				where: { Practice: { userId: user.id, date: { gte: from7 } } },
				_sum: { arrows: true },
			}),
			prisma.end.aggregate({
				where: { Practice: { userId: user.id, date: { gte: from30 } } },
				_sum: { arrows: true },
			}),
			prisma.competitionRound.aggregate({
				where: { competition: { userId: user.id } },
				_sum: { arrows: true },
			}),
			prisma.competitionRound.aggregate({
				where: { competition: { userId: user.id, date: { gte: from7 } } },
				_sum: { arrows: true },
			}),
			prisma.competitionRound.aggregate({
				where: { competition: { userId: user.id, date: { gte: from30 } } },
				_sum: { arrows: true },
			}),
			// Count arrowsWithoutScore for practices
			prisma.end.aggregate({
				where: { Practice: { userId: user.id } },
				_sum: { arrowsWithoutScore: true },
			}),
			prisma.end.aggregate({
				where: { Practice: { userId: user.id, date: { gte: from7 } } },
				_sum: { arrowsWithoutScore: true },
			}),
			prisma.end.aggregate({
				where: { Practice: { userId: user.id, date: { gte: from30 } } },
				_sum: { arrowsWithoutScore: true },
			}),
			// Count arrowsWithoutScore for competitions
			prisma.competitionRound.aggregate({
				where: { competition: { userId: user.id } },
				_sum: { arrowsWithoutScore: true },
			}),
			prisma.competitionRound.aggregate({
				where: { competition: { userId: user.id, date: { gte: from7 } } },
				_sum: { arrowsWithoutScore: true },
			}),
			prisma.competitionRound.aggregate({
				where: { competition: { userId: user.id, date: { gte: from30 } } },
				_sum: { arrowsWithoutScore: true },
			}),
			// Score sums for practices
			prisma.end.aggregate({
				where: { Practice: { userId: user.id } },
				_sum: { roundScore: true },
			}),
			prisma.end.aggregate({
				where: { Practice: { userId: user.id, date: { gte: from7 } } },
				_sum: { roundScore: true },
			}),
			prisma.end.aggregate({
				where: { Practice: { userId: user.id, date: { gte: from30 } } },
				_sum: { roundScore: true },
			}),
			// Score sums for competitions
			prisma.competitionRound.aggregate({
				where: { competition: { userId: user.id } },
				_sum: { roundScore: true },
			}),
			prisma.competitionRound.aggregate({
				where: { competition: { userId: user.id, date: { gte: from7 } } },
				_sum: { roundScore: true },
			}),
			prisma.competitionRound.aggregate({
				where: { competition: { userId: user.id, date: { gte: from30 } } },
				_sum: { roundScore: true },
			}),
		]);

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
					overallNumber(last7Ends._sum.arrows), overallNumber(last7CompRounds._sum.arrows),
					overallNumber(last7EndsWithoutScore._sum.arrowsWithoutScore), overallNumber(last7CompRoundsWithoutScore._sum.arrowsWithoutScore),
					overallNumber(last7EndsScore._sum.roundScore), overallNumber(last7CompRoundsScore._sum.roundScore),
				),
				last30Days: buildPeriod(
					overallNumber(last30Ends._sum.arrows), overallNumber(last30CompRounds._sum.arrows),
					overallNumber(last30EndsWithoutScore._sum.arrowsWithoutScore), overallNumber(last30CompRoundsWithoutScore._sum.arrowsWithoutScore),
					overallNumber(last30EndsScore._sum.roundScore), overallNumber(last30CompRoundsScore._sum.roundScore),
				),
				overall: buildPeriod(
					overallNumber(overallEnds._sum.arrows), overallNumber(overallCompRounds._sum.arrows),
					overallNumber(overallEndsWithoutScore._sum.arrowsWithoutScore), overallNumber(overallCompRoundsWithoutScore._sum.arrowsWithoutScore),
					overallNumber(overallEndsScore._sum.roundScore), overallNumber(overallCompRoundsScore._sum.roundScore),
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

function overallNumber(v: number | null | undefined) {
	return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}
