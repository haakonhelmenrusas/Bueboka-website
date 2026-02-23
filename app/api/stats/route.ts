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

		const now = new Date();
		const from7 = startOfDay(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
		const from30 = startOfDay(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));

		// Count arrows shot from ends
		// Each practice creates ends with the arrows shot per round
		const [overallEnds, last7Ends, last30Ends] = await Promise.all([
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
		]);

		return NextResponse.json({
			stats: {
				last7Days: overallNumber(last7Ends._sum.arrows),
				last30Days: overallNumber(last30Ends._sum.arrows),
				overall: overallNumber(overallEnds._sum.arrows),
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
