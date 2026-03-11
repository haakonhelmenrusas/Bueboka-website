import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const { id } = await params;
		if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

		const competition = await prisma.competition.findFirst({
			where: { id, userId: user.id },
			include: {
				rounds: { orderBy: { roundNumber: 'asc' } },
				bow: true,
				arrows: true,
			},
		});

		if (!competition) return NextResponse.json({ error: 'Not found' }, { status: 404 });

		// Calculate total arrows shot from rounds (including both arrows and arrowsWithoutScore)
		const totalArrows = competition.rounds?.reduce((sum, round) => sum + (round.arrows || 0) + (round.arrowsWithoutScore || 0), 0) || 0;

		// Map rounds to ends format for PracticeDetailsModal compatibility
		const mappedEnds =
			competition.rounds?.map((round) => ({
				id: round.id,
				arrows: round.arrows ?? 0,
				arrowsWithoutScore: round.arrowsWithoutScore ?? null,
				distanceMeters: round.distanceMeters ?? null,
				targetSizeCm: round.targetSizeCm ?? null,
				scores: [],
				roundScore: round.roundScore ?? null,
			})) ?? [];

		// Map calculated arrowsShot for frontend compatibility
		const mappedCompetition = {
			...competition,
			arrowsShot: totalArrows,
			practiceType: 'KONKURRANSE' as const,
			ends: mappedEnds,
		};

		return NextResponse.json(
			{ practice: mappedCompetition },
			{
				headers: {
					// In development, don't cache. In production, cache for 10 seconds.
					'Cache-Control':
						process.env.NODE_ENV === 'development' ? 'no-store, no-cache, must-revalidate' : 'private, max-age=10, must-revalidate',
				},
			}
		);
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'competitions/[id]/details', method: 'GET' },
			extra: { message: 'Error fetching competition details' },
		});
		return NextResponse.json({ error: 'Failed to fetch competition details' }, { status: 500 });
	}
}
