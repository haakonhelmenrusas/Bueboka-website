import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { roundTypesCache } from '@/lib/cache';
import { getCurrentUser } from '@/lib/session';

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
		return NextResponse.json({ error: 'Failed to fetch round types' }, { status: 500 });
	}
}
