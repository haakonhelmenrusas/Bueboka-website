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
		Sentry.captureException(error, { tags: { endpoint: 'round-types', where: 'getCurrentUser' } });
		return null;
	}
}

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const roundTypes = await prisma.roundType.findMany({
			orderBy: [{ environment: 'asc' }, { name: 'asc' }],
			select: {
				id: true,
				name: true,
				environment: true,
				distanceMeters: true,
				targetType: true,
				numberArrows: true,
				arrowsWithoutScore: true,
				roundScore: true,
			},
		});

		return NextResponse.json({ roundTypes });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'round-types', method: 'GET' },
			extra: { message: 'Error fetching round types' },
		});
		return NextResponse.json({ error: 'Failed to fetch round types' }, { status: 500 });
	}
}
