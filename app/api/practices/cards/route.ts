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
			prisma.practice.count({
				where: { userId: user.id },
			}),
			prisma.practice.findMany({
				where: { userId: user.id },
				orderBy: { date: 'desc' },
				skip,
				take: pageSize,
				select: {
					id: true,
					date: true,
					location: true,
					environment: true,
					rating: true,
					practiceType: true,
					totalScore: true,
					bow: { select: { name: true } },
					arrows: { select: { name: true } },
					roundType: { select: { name: true } },
					ends: { select: { arrows: true, distanceMeters: true, targetSizeCm: true } },
				},
			}),
		]);

		type PracticeRow = (typeof practices)[number];

		const cards = practices.map((p: PracticeRow) => {
			// Calculate arrows shot
			const arrowsShot = p.ends.reduce((sum: number, e: { arrows: number }) => sum + (e.arrows ?? 0), 0);

			// Get unique distance/target combinations from ends
			const combinations = p.ends
				.filter((e) => e.distanceMeters && e.targetSizeCm)
				.map((e) => `${e.distanceMeters}m - ${e.targetSizeCm}cm`)
				.filter((value, index, self) => self.indexOf(value) === index); // unique values

			// Create display text: show first combination or fallback to roundType name
			const roundTypeName = combinations.length > 0 ? combinations[0] : (p.roundType?.name ?? null);

			return {
				id: p.id,
				date: p.date,
				arrowsShot,
				location: p.location ?? null,
				environment: p.environment ?? null,
				rating: p.rating ?? null,
				practiceType: p.practiceType ?? 'TRENING',
				totalScore: p.totalScore ?? null,
				bowName: p.bow?.name ?? null,
				arrowsName: p.arrows?.name ?? null,
				roundTypeName,
			};
		});

		return NextResponse.json(
			{ practices: cards, page, pageSize, total },
			{
				headers: {
					// In development, don't cache. In production, cache for 10 seconds.
					'Cache-Control':
						process.env.NODE_ENV === 'development' ? 'no-store, no-cache, must-revalidate' : 'private, max-age=10, must-revalidate',
					// Include page in the cache key via Vary header
					Vary: 'Cookie',
				},
			}
		);
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'practices/cards', method: 'GET' },
			extra: { message: 'Error fetching practice cards' },
		});
		return NextResponse.json({ error: 'Failed to fetch practice cards' }, { status: 500 });
	}
}
