import { NextResponse } from 'next/server';
import { Prisma } from '@/prisma/prisma/generated/prisma-client/client';
import { prisma } from '@/lib/prisma';
import { practicesCache } from '@/lib/cache';
import { getCurrentUser } from '@/lib/session';

export async function GET(request: Request) {
	try {
		const user = await getCurrentUser(request);
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const url = new URL(request.url);
		const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
		const pageSizeRaw = Number(url.searchParams.get('pageSize') ?? '10') || 10;
		const pageSize = Math.min(50, Math.max(1, pageSizeRaw));
		const skip = (page - 1) * pageSize;

		// Filter by type: 'all', 'TRENING', or 'KONKURRANSE'
		const filterType = url.searchParams.get('filter') ?? 'all';

		// Check server-side cache (skip in development).
		// The server cache TTL (30 s) is intentionally longer than the HTTP max-age (10 s):
		// the HTTP header controls browser/CDN freshness while the server cache avoids
		// repeated DB queries across concurrent requests within the same server instance.
		if (process.env.NODE_ENV !== 'development') {
			const cacheKey = `practices:cards:${user.id}:${page}:${pageSize}:${filterType}`;
			const cached = practicesCache.get(cacheKey);
			if (cached) {
				return NextResponse.json(cached, {
					headers: {
						'Cache-Control': 'private, max-age=10, must-revalidate',
						Vary: 'Cookie',
					},
				});
			}
		}

		// When fetching 'all', we need all records up to the current page's end offset
		// so we can sort them together and slice correctly.
		// For single-type filters, the DB handles pagination directly.
		const fetchLimit = filterType === 'all' ? skip + pageSize : pageSize;

		const practiceSelect = {
			id: true,
			date: true,
			location: true,
			environment: true,
			rating: true,
			totalScore: true,
			practiceCategory: true,
			roundType: { select: { name: true } },
			ends: { select: { arrows: true, arrowsWithoutScore: true, distanceMeters: true, distanceFrom: true, distanceTo: true, targetSizeCm: true } },
		} satisfies Prisma.PracticeSelect;

		const competitionSelect = {
			id: true,
			date: true,
			name: true,
			location: true,
			environment: true,
			totalScore: true,
			placement: true,
			practiceCategory: true,
			rounds: { select: { arrows: true, arrowsWithoutScore: true, distanceMeters: true, targetSizeCm: true } },
		} satisfies Prisma.CompetitionSelect;

		type PracticeRow = Prisma.PracticeGetPayload<{ select: typeof practiceSelect }>;
		type CompetitionRow = Prisma.CompetitionGetPayload<{ select: typeof competitionSelect }>;

		const practicesPromise: Promise<PracticeRow[]> =
			filterType === 'all' || filterType === 'TRENING'
				? prisma.practice.findMany({
						where: { userId: user.id },
						orderBy: { date: 'desc' },
						skip: filterType === 'TRENING' ? skip : 0,
						take: fetchLimit,
						select: practiceSelect,
					})
				: Promise.resolve([]);

		const practiceCountPromise: Promise<number> =
			filterType === 'all' || filterType === 'TRENING'
				? prisma.practice.count({ where: { userId: user.id } })
				: Promise.resolve(0);

		const competitionsPromise: Promise<CompetitionRow[]> =
			filterType === 'all' || filterType === 'KONKURRANSE'
				? prisma.competition.findMany({
						where: { userId: user.id },
						orderBy: { date: 'desc' },
						skip: filterType === 'KONKURRANSE' ? skip : 0,
						take: fetchLimit,
						select: competitionSelect,
					})
				: Promise.resolve([]);

		const competitionCountPromise: Promise<number> =
			filterType === 'all' || filterType === 'KONKURRANSE'
				? prisma.competition.count({ where: { userId: user.id } })
				: Promise.resolve(0);

		const [practices, competitions, practiceCount, competitionCount] = await Promise.all([
			practicesPromise,
			competitionsPromise,
			practiceCountPromise,
			competitionCountPromise,
		]);

		// Transform practices to card format
		const practiceCards = practices.map((p) => {
			const arrowsShot = p.ends.reduce(
				(sum, e) => sum + (e.arrows ?? 0) + (e.arrowsWithoutScore ?? 0),
				0
			);

			// For range categories (FELT, JAKT_3D), build label from distanceFrom/distanceTo
			let roundTypeName = p.roundType?.name ?? null;
			if (!roundTypeName) {
				const isRangeCategory = p.practiceCategory === 'FELT' || p.practiceCategory === 'JAKT_3D';
				if (isRangeCategory) {
					const rangeParts = [
						...new Set(
							p.ends
								.filter((e) => e.distanceFrom != null || e.distanceTo != null)
								.map((e) => {
									const from = e.distanceFrom != null ? `${e.distanceFrom} m` : null;
									const to = e.distanceTo != null ? `${e.distanceTo} m` : null;
									if (from && to) return `${from} – ${to}`;
									return from ?? to ?? null;
								})
								.filter(Boolean)
						),
					];
					if (rangeParts.length > 0) roundTypeName = rangeParts[0] as string;
				}
			}

			return {
				id: p.id,
				date: p.date,
				arrowsShot,
				location: p.location ?? null,
				environment: p.environment ?? null,
				rating: p.rating ?? null,
				practiceType: 'TRENING' as const,
				totalScore: p.totalScore ?? null,
				roundTypeName,
				practiceCategory: p.practiceCategory ?? null,
			};
		});

		// Transform competitions to card format
		const competitionCards = competitions.map((c) => {
			const arrowsShot = c.rounds.reduce(
				(sum, r) => sum + (r.arrows ?? 0) + (r.arrowsWithoutScore ?? 0),
				0
			);
			const combinations = [
				...new Set(
					c.rounds
						.filter((r) => r.distanceMeters && r.targetSizeCm)
						.map((r) => `${r.distanceMeters}m - ${r.targetSizeCm}cm`)
				),
			];
			const roundTypeName = combinations.length > 0 ? combinations[0] : null;

			return {
				id: c.id,
				date: c.date,
				arrowsShot,
				location: c.location ?? null,
				environment: c.environment ?? null,
				rating: null,
				practiceType: 'KONKURRANSE' as const,
				totalScore: c.totalScore ?? null,
				roundTypeName,
				competitionName: c.name,
				placement: c.placement ?? null,
				practiceCategory: c.practiceCategory ?? null,
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

		const responseData = { practices: paginatedCards, page, pageSize, total };

		// Store in server-side cache (skip in development)
		if (process.env.NODE_ENV !== 'development') {
			const cacheKey = `practices:cards:${user.id}:${page}:${pageSize}:${filterType}`;
			practicesCache.set(cacheKey, responseData);
		}

		return NextResponse.json(
			responseData,
			{
				headers: {
					'Cache-Control':
						process.env.NODE_ENV === 'development' ? 'no-store, no-cache, must-revalidate' : 'private, max-age=10, must-revalidate',
					Vary: 'Cookie',
				},
			}
		);
	} catch (error) {
		return NextResponse.json({ error: 'Failed to fetch practice cards' }, { status: 500 });
	}
}
