import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getCurrentUser() {
	try {
		const reqHeaders = await headers();
		const headerObj: Record<string, string> = {};
		for (const [key, value] of reqHeaders) headerObj[key] = value;
		const session = await auth.api.getSession({ headers: headerObj });
		return session?.user || null;
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'competitions/[id]/details', where: 'getCurrentUser' } });
		return null;
	}
}

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

		// Map calculated arrowsShot for frontend compatibility
		const mappedCompetition = {
			...competition,
			arrowsShot: totalArrows,
			practiceType: 'KONKURRANSE', // Add practiceType for frontend
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
