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

export async function GET(request: Request) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const url = new URL(request.url);
		const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
		const pageSizeRaw = Number(url.searchParams.get('pageSize') ?? '10') || 10;
		const pageSize = Math.min(50, Math.max(1, pageSizeRaw));
		const skip = (page - 1) * pageSize;

		const [total, practices] = await prisma.$transaction([
			prisma.practice.count({ where: { userId: user.id } }),
			prisma.practice.findMany({
				where: { userId: user.id },
				orderBy: { date: 'desc' },
				skip,
				take: pageSize,
				select: {
					id: true,
					date: true,
					totalScore: true,
					location: true,
					environment: true,
					bow: { select: { name: true } },
					arrows: { select: { name: true } },
					roundType: { select: { name: true, environment: true } },
					ends: { select: { arrows: true } },
				},
			}),
		]);

		type PracticeRow = (typeof practices)[number];

		const cards = practices.map((p: PracticeRow) => ({
			id: p.id,
			date: p.date,
			totalScore: p.totalScore,
			arrowsShot: p.ends.reduce((sum: number, e: { arrows: number }) => sum + (e.arrows ?? 0), 0),
			location: p.location ?? null,
			environment: p.environment ?? null,
			bowName: p.bow?.name ?? null,
			arrowsName: p.arrows?.name ?? null,
			roundTypeName: p.roundType?.name ?? null,
			roundTypeEnvironment: p.roundType?.environment ?? null,
		}));

		return NextResponse.json({ practices: cards, page, pageSize, total });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'practices/cards', method: 'GET' },
			extra: { message: 'Error fetching practice cards' },
		});
		return NextResponse.json({ error: 'Failed to fetch practice cards' }, { status: 500 });
	}
}
