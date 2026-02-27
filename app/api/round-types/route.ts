import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { roundTypesCache } from '@/lib/cache';

async function getCurrentUser() {
	try {
		const reqHeaders = await headers();
		const headerObj: Record<string, string> = {};
		for (const [key, value] of reqHeaders) headerObj[key] = value;
		const session = await auth.api.getSession({ headers: headerObj });
		return session?.user || null;
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'round-types', where: 'getCurrentUser' } });
		return null;
	}
}

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		// Check cache first
		const cacheKey = 'round-types:all';
		const cached = roundTypesCache.get(cacheKey);
		if (cached) {
			return NextResponse.json(
				{ roundTypes: cached },
				{
					headers: {
						'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
					},
				}
			);
		}

		const roundTypes = await prisma.roundType.findMany({
			orderBy: [{ name: 'asc' }],
			select: {
				id: true,
				name: true,
				distanceMeters: true,
				targetType: true,
				numberArrows: true,
				arrowsWithoutScore: true,
				roundScore: true,
			},
		});

		// Store in cache
		roundTypesCache.set(cacheKey, roundTypes);

		return NextResponse.json(
			{ roundTypes },
			{
				headers: {
					'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
				},
			}
		);
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'round-types', method: 'GET' },
			extra: { message: 'Error fetching round types' },
		});
		return NextResponse.json({ error: 'Failed to fetch round types' }, { status: 500 });
	}
}
