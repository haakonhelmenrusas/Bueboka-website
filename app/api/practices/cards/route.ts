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

		// Filter by type: 'all', 'TRENING', or 'KONKURRANSE'
		const filterType = url.searchParams.get('filter') ?? 'all';

		// Fetch practices and competitions separately based on filter
		let practicesPromise;
		let competitionsPromise;
		let practiceCountPromise;
		let competitionCountPromise;

		// When fetching 'all', we need to get enough records from each type to fill the page after sorting
		// So we fetch more than needed and then sort/slice
		const fetchLimit = filterType === 'all' ? pageSize * 2 : pageSize;

		if (filterType === 'all' || filterType === 'TRENING') {
			practicesPromise = prisma.practice.findMany({
				where: { userId: user.id },
				orderBy: { date: 'desc' },
				skip: filterType === 'TRENING' ? skip : 0,
				take: fetchLimit,
				select: {
					id: true,
					date: true,
					location: true,
					environment: true,
					rating: true,
					totalScore: true,
					practiceCategory: true,
					bow: { select: { name: true, type: true } },
					arrows: { select: { name: true } },
					roundType: { select: { name: true } },
					ends: { select: { arrows: true, arrowsWithoutScore: true, distanceMeters: true, targetSizeCm: true } },
				},
			});
			practiceCountPromise = prisma.practice.count({ where: { userId: user.id } });
		} else {
			practicesPromise = Promise.resolve([]);
			practiceCountPromise = Promise.resolve(0);
		}

		if (filterType === 'all' || filterType === 'KONKURRANSE') {
			competitionsPromise = prisma.competition.findMany({
				where: { userId: user.id },
				orderBy: { date: 'desc' },
				skip: filterType === 'KONKURRANSE' ? skip : 0,
				take: fetchLimit,
				select: {
					id: true,
					date: true,
					name: true,
					location: true,
					environment: true,
					totalScore: true,
					placement: true,
					practiceCategory: true,
					bow: { select: { name: true } },
					arrows: { select: { name: true } },
					rounds: { select: { arrows: true, arrowsWithoutScore: true, distanceMeters: true, targetSizeCm: true } },
				},
			});
			competitionCountPromise = prisma.competition.count({ where: { userId: user.id } });
		} else {
			competitionsPromise = Promise.resolve([]);
			competitionCountPromise = Promise.resolve(0);
		}

		const [practices, competitions, practiceCount, competitionCount] = await Promise.all([
			practicesPromise,
			competitionsPromise,
			practiceCountPromise,
			competitionCountPromise,
		]);

		// Transform practices to card format
		const practiceCards = practices.map((p) => {
			const arrowsShot = p.ends.reduce(
				(sum: number, e: { arrows: number | null; arrowsWithoutScore: number | null }) =>
					sum + (e.arrows ?? 0) + (e.arrowsWithoutScore ?? 0),
				0
			);
			const combinations = p.ends
				.filter((e: any) => e.distanceMeters && e.targetSizeCm)
				.map((e: any) => `${e.distanceMeters}m - ${e.targetSizeCm}cm`)
				.filter((value, index, self) => self.indexOf(value) === index);
			const roundTypeName = combinations.length > 0 ? combinations[0] : ((p.roundType?.name as string) ?? null);

			return {
				id: p.id,
				date: p.date,
				arrowsShot,
				location: p.location ?? null,
				environment: p.environment ?? null,
				rating: p.rating ?? null,
				practiceType: 'TRENING' as const,
				totalScore: p.totalScore ?? null,
				bowName: p.bow?.name ?? null,
				arrowsName: p.arrows?.name ?? null,
				roundTypeName,
			};
		});

		// Transform competitions to card format
		const competitionCards = competitions.map((c) => {
			const arrowsShot = c.rounds.reduce(
				(sum: number, r: { arrows: number | null; arrowsWithoutScore: number | null }) =>
					sum + (r.arrows ?? 0) + (r.arrowsWithoutScore ?? 0),
				0
			);
			const combinations = c.rounds
				.filter((r: any) => r.distanceMeters && r.targetSizeCm)
				.map((r: any) => `${r.distanceMeters}m - ${r.targetSizeCm}cm`)
				.filter((value, index, self) => self.indexOf(value) === index);
			const roundTypeName = combinations.length > 0 ? combinations[0] : null;

			return {
				id: c.id,
				date: c.date,
				arrowsShot,
				location: c.location ?? null,
				environment: c.environment ?? null,
				rating: null, // Competitions don't have ratings
				practiceType: 'KONKURRANSE' as const,
				totalScore: c.totalScore ?? null,
				bowName: c.bow?.name ?? null,
				arrowsName: c.arrows?.name ?? null,
				roundTypeName,
				competitionName: c.name,
				placement: c.placement ?? null,
			};
		});

		// Merge and sort by date
		const allCards = [...practiceCards, ...competitionCards].sort((a, b) => {
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		});

		// Calculate total and paginate
		const total = practiceCount + competitionCount;

		// If filter is 'all', we need to paginate the merged results
		// Otherwise, results are already paginated from the database query
		const paginatedCards = filterType === 'all' ? allCards.slice(skip, skip + pageSize) : allCards;

		return NextResponse.json(
			{ practices: paginatedCards, page, pageSize, total },
			{
				headers: {
					'Cache-Control':
						process.env.NODE_ENV === 'development' ? 'no-store, no-cache, must-revalidate' : 'private, max-age=10, must-revalidate',
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
