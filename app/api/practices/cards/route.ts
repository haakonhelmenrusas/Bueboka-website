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
		Sentry.captureException(error, { tags: { endpoint: 'practices/cards', where: 'getCurrentUser' } });
		return null;
	}
}

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		// Minimal payload for list/cards: compute arrowsShot on the server to avoid fetching ends.
		const practices = await prisma.practice.findMany({
			where: { userId: user.id },
			orderBy: { date: 'desc' },
			take: 12,
			select: {
				id: true,
				date: true,
				ends: { select: { arrows: true } },
			},
		});

		const cards = practices.map((p) => ({
			id: p.id,
			date: p.date,
			arrowsShot: p.ends.reduce((sum, e) => sum + (e.arrows ?? 0), 0),
		}));

		return NextResponse.json({ practices: cards });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'practices/cards', method: 'GET' },
			extra: { message: 'Error fetching practice cards' },
		});
		return NextResponse.json({ error: 'Failed to fetch practice cards' }, { status: 500 });
	}
}
