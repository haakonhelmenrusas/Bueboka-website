import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { statsCache } from '@/lib/cache';
import { getCurrentUser } from '@/lib/session';
import { TARGET_TYPE_OPTIONS } from '@/lib/Contants';

/** Map a stored targetType string or a numeric targetSizeCm to a human-readable label. */
function formatTargetLabel(targetType: string | null, targetSizeCm: number | null): string {
	if (targetType) {
		const option = TARGET_TYPE_OPTIONS.find((o) => o.value === targetType);
		if (option) return option.label;
		return targetType;
	}
	if (typeof targetSizeCm === 'number' && targetSizeCm > 0) return `${targetSizeCm}cm`;
	return 'Ukjent skive';
}

/** Format a distance label, preferring a from–to range over a single distance. */
function formatDistanceLabel(
	distanceMeters: number | null,
	distanceFrom: number | null,
	distanceTo: number | null
): string {
	if ((typeof distanceFrom === 'number' && distanceFrom > 0) || (typeof distanceTo === 'number' && distanceTo > 0)) {
		return `${distanceFrom ?? 0}m–${distanceTo ?? 0}m`;
	}
	if (typeof distanceMeters === 'number' && distanceMeters > 0) return `${distanceMeters}m`;
	return '0m';
}

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check cache first
		const cacheKey = `stats:detailed:${user.id}`;
		const cached = statsCache.get(cacheKey);
		if (cached) {
			return NextResponse.json(cached, {
				headers: {
					'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=300',
				},
			});
		}

		// Fetch all practices with their ends
		const practices = await prisma.practice.findMany({
			where: { userId: user.id },
			orderBy: { date: 'asc' },
			include: {
				ends: true,
			},
		});

		// Fetch all competitions with their rounds
		const competitions = await prisma.competition.findMany({
			where: { userId: user.id },
			orderBy: { date: 'asc' },
			include: {
				rounds: true,
			},
		});

		// Return empty series if no practices or competitions found
		if ((!practices || practices.length === 0) && (!competitions || competitions.length === 0)) {
			return NextResponse.json({ series: [] });
		}

		// Group data by distance + target combination
		const groupedData = new Map<
			string,
			Array<{
				date: string;
				arrows: number;
				scoredArrows: number;
				score: number;
				practiceType: string;
				practiceCategory: string;
				sessionId: string;
			}>
		>();

		for (const practice of practices) {
			// Skip practices without ends
			if (!practice.ends || !Array.isArray(practice.ends) || practice.ends.length === 0) {
				continue;
			}

			// Convert date to string safely
			let dateStr: string;
			try {
				if (practice.date instanceof Date) {
					dateStr = practice.date.toISOString().split('T')[0];
				} else if (typeof practice.date === 'string') {
					dateStr = new Date(practice.date).toISOString().split('T')[0];
				} else {
					continue;
				}
			} catch (dateError) {
				continue;
			}

			// Practices are always TRENING type (competitions are handled separately)
			const practiceType = 'TRENING';
			const practiceCategory = practice.practiceCategory || 'SKIVE_INDOOR';

			for (const end of practice.ends) {
				try {
					const distanceLabel = formatDistanceLabel(
						typeof end.distanceMeters === 'number' ? end.distanceMeters : null,
						typeof end.distanceFrom === 'number' ? end.distanceFrom : null,
						typeof end.distanceTo === 'number' ? end.distanceTo : null
					);
					const targetLabel = formatTargetLabel(
						(end as any).targetType ?? null,
						typeof end.targetSizeCm === 'number' ? end.targetSizeCm : null
					);
					const key = `${distanceLabel} - ${targetLabel}`;

					// Include both arrows with score and arrowsWithoutScore
					const scoredArrows = typeof end.arrows === 'number' ? end.arrows : 0;
					const arrows = scoredArrows + (typeof end.arrowsWithoutScore === 'number' ? end.arrowsWithoutScore : 0);
					const score = typeof end.roundScore === 'number' ? end.roundScore : 0;

					// Only add if there are arrows
					if (arrows > 0) {
						if (!groupedData.has(key)) {
							groupedData.set(key, []);
						}

						groupedData.get(key)!.push({
							date: dateStr,
							arrows,
							scoredArrows,
							score,
							practiceType,
							practiceCategory,
							sessionId: practice.id, // Add session ID to track individual sessions
						});
					}
				} catch (endError) {
					// Skip invalid end data
				}
			}
		}

		// Process competitions
		for (const competition of competitions) {
			// Skip competitions without rounds
			if (!competition.rounds || !Array.isArray(competition.rounds) || competition.rounds.length === 0) {
				continue;
			}

			// Convert date to string safely
			let dateStr: string;
			try {
				if (competition.date instanceof Date) {
					dateStr = competition.date.toISOString().split('T')[0];
				} else if (typeof competition.date === 'string') {
					dateStr = new Date(competition.date).toISOString().split('T')[0];
				} else {
					continue;
				}
			} catch (dateError) {
				continue;
			}

			const practiceType = 'KONKURRANSE';
			const practiceCategory = competition.practiceCategory || 'SKIVE_INDOOR';

			for (const round of competition.rounds) {
				try {
					const distance = typeof round.distanceMeters === 'number' ? round.distanceMeters : 0;
					const targetLabel = formatTargetLabel(
						(round as any).targetType ?? null,
						typeof round.targetSizeCm === 'number' ? round.targetSizeCm : null
					);
					const key = `${distance}m - ${targetLabel}`;

					// Include both arrows with score and arrowsWithoutScore
					const scoredArrows = typeof round.arrows === 'number' ? round.arrows : 0;
					const arrows = scoredArrows + (typeof round.arrowsWithoutScore === 'number' ? round.arrowsWithoutScore : 0);
					const score = typeof round.roundScore === 'number' ? round.roundScore : 0;

					// Only add if there are arrows
					if (arrows > 0) {
						if (!groupedData.has(key)) {
							groupedData.set(key, []);
						}

						groupedData.get(key)!.push({
							date: dateStr,
							arrows,
							scoredArrows,
							score,
							practiceType,
							practiceCategory,
							sessionId: competition.id, // Add session ID to track individual sessions
						});
					}
				} catch (roundError) {
					// Skip invalid round data
				}
			}
		}

		// Convert to array format
		const series = Array.from(groupedData.entries()).map(([name, data]) => ({
			name,
			data,
		}));

		const result = { series };

		// Store in cache
		statsCache.set(cacheKey, result);

		return NextResponse.json(result, {
			headers: {
				'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=300',
			},
		});
	} catch (error) {

		return NextResponse.json(
			{
				error: 'Failed to fetch detailed stats',
			},
			{ status: 500 }
		);
	}
}
