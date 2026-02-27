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
		Sentry.captureException(error, { tags: { endpoint: 'stats/detailed', where: 'getCurrentUser' } });
		return null;
	}
}

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check cache first
		const cacheKey = `stats:detailed:${user.id}`;
		const cached = statsCache.get(cacheKey);
		if (cached) {
			return NextResponse.json(cached, {
				headers: {
					'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=300',
				},
			});
		}

		// Fetch all practices with their ends
		const practices = await prisma.practice.findMany({
			where: { userId: user.id },
			orderBy: { date: 'asc' },
			include: {
				ends: true,
			},
		});

		// Return empty series if no practices found
		if (!practices || practices.length === 0) {
			return NextResponse.json({ series: [] });
		}

		// Group data by distance + target combination
		const groupedData = new Map<string, Array<{ date: string; arrows: number; score: number }>>();

		for (const practice of practices) {
			// Skip practices without ends
			if (!practice.ends || !Array.isArray(practice.ends) || practice.ends.length === 0) {
				continue;
			}

			// Convert date to string safely
			let dateStr: string;
			try {
				if (practice.date instanceof Date) {
					dateStr = practice.date.toISOString().split('T')[0];
				} else if (typeof practice.date === 'string') {
					dateStr = new Date(practice.date).toISOString().split('T')[0];
				} else {
					continue;
				}
			} catch (dateError) {
				continue;
			}

			for (const end of practice.ends) {
				try {
					const distance = typeof end.distanceMeters === 'number' ? end.distanceMeters : 0;
					const target = typeof end.targetSizeCm === 'number' ? end.targetSizeCm : 0;
					const key = `${distance}m - ${target}cm`;

					const arrows = typeof end.arrows === 'number' ? end.arrows : 0;
					const score = typeof end.roundScore === 'number' ? end.roundScore : 0;

					if (!groupedData.has(key)) {
						groupedData.set(key, []);
					}

					groupedData.get(key)!.push({
						date: dateStr,
						arrows,
						score,
					});
				} catch (endError) {
					// Skip invalid end data
				}
			}
		}

		// Convert to array format
		const series = Array.from(groupedData.entries()).map(([name, data]) => ({
			name,
			data,
		}));

		const result = { series };

		// Store in cache
		statsCache.set(cacheKey, result);

		return NextResponse.json(result, {
			headers: {
				'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=300',
			},
		});
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'stats/detailed', method: 'GET' },
			extra: {
				message: 'Error fetching detailed stats',
			},
		});

		return NextResponse.json(
			{
				error: 'Failed to fetch detailed stats',
			},
			{ status: 500 }
		);
	}
}
