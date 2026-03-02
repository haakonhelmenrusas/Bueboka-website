import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { statsCache } from '@/lib/cache';

async function getCurrentUser() {
	try {
		const reqHeaders = await headers();
		const headerObj: Record<string, string> = {};
		for (const [key, value] of reqHeaders) headerObj[key] = value;
		const session = await auth.api.getSession({ headers: headerObj });
		return session?.user || null;
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'stats', where: 'getCurrentUser' } });
		return null;
	}
}

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
		] = await Promise.all([
			prisma.end.aggregate({
				where: {
					Practice: { userId: user.id },
				},
				_sum: { arrows: true },
			}),
			prisma.end.aggregate({
				where: {
					Practice: { userId: user.id, date: { gte: from7 } },
				},
				_sum: { arrows: true },
			}),
			prisma.end.aggregate({
				where: {
					Practice: { userId: user.id, date: { gte: from30 } },
				},
				_sum: { arrows: true },
			}),
			prisma.competitionRound.aggregate({
				where: {
					competition: { userId: user.id },
				},
				_sum: { arrows: true },
			}),
			prisma.competitionRound.aggregate({
				where: {
					competition: { userId: user.id, date: { gte: from7 } },
				},
				_sum: { arrows: true },
			}),
			prisma.competitionRound.aggregate({
				where: {
					competition: { userId: user.id, date: { gte: from30 } },
				},
				_sum: { arrows: true },
			}),
			// Count arrowsWithoutScore for practices
			prisma.end.aggregate({
				where: {
					Practice: { userId: user.id },
				},
				_sum: { arrowsWithoutScore: true },
			}),
			prisma.end.aggregate({
				where: {
					Practice: { userId: user.id, date: { gte: from7 } },
				},
				_sum: { arrowsWithoutScore: true },
			}),
			prisma.end.aggregate({
				where: {
					Practice: { userId: user.id, date: { gte: from30 } },
				},
				_sum: { arrowsWithoutScore: true },
			}),
			// Count arrowsWithoutScore for competitions
			prisma.competitionRound.aggregate({
				where: {
					competition: { userId: user.id },
				},
				_sum: { arrowsWithoutScore: true },
			}),
			prisma.competitionRound.aggregate({
				where: {
					competition: { userId: user.id, date: { gte: from7 } },
				},
				_sum: { arrowsWithoutScore: true },
			}),
			prisma.competitionRound.aggregate({
				where: {
					competition: { userId: user.id, date: { gte: from30 } },
				},
				_sum: { arrowsWithoutScore: true },
			}),
		]);

		const result = {
			stats: {
				last7Days:
					overallNumber(last7Ends._sum.arrows) +
					overallNumber(last7CompRounds._sum.arrows) +
					overallNumber(last7EndsWithoutScore._sum.arrowsWithoutScore) +
					overallNumber(last7CompRoundsWithoutScore._sum.arrowsWithoutScore),
				last30Days:
					overallNumber(last30Ends._sum.arrows) +
					overallNumber(last30CompRounds._sum.arrows) +
					overallNumber(last30EndsWithoutScore._sum.arrowsWithoutScore) +
					overallNumber(last30CompRoundsWithoutScore._sum.arrowsWithoutScore),
				overall:
					overallNumber(overallEnds._sum.arrows) +
					overallNumber(overallCompRounds._sum.arrows) +
					overallNumber(overallEndsWithoutScore._sum.arrowsWithoutScore) +
					overallNumber(overallCompRoundsWithoutScore._sum.arrowsWithoutScore),
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
