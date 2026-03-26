import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { statsCache, practicesCache } from '@/lib/cache';
import { getCurrentUser } from '@/lib/session';
import { createCompetitionSchema } from '@/lib/validations/competition';
import { formatZodErrors } from '@/lib/validations/helpers';

/**
 * GET /api/competitions
 * Fetch all competitions for the current user
 */
export async function GET(request: Request) {
	try {
		const user = await getCurrentUser(request);
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const competitions = await prisma.competition.findMany({
			where: { userId: user.id },
			include: {
				rounds: {
					orderBy: { roundNumber: 'asc' },
				},
				bow: {
					select: {
						id: true,
						name: true,
						type: true,
					},
				},
				arrows: {
					select: {
						id: true,
						name: true,
						material: true,
					},
				},
			},
			orderBy: { date: 'desc' },
		});

		// Calculate total arrows for each competition
		const competitionsWithStats = competitions.map((competition) => {
			const totalArrows = competition.rounds.reduce((sum, round) => sum + (round.arrows || 0) + (round.arrowsWithoutScore || 0), 0);
			return {
				...competition,
				arrowsShot: totalArrows,
			};
		});

		return NextResponse.json({ competitions: competitionsWithStats });
	} catch (error) {

		return NextResponse.json(
			{
				error: 'Failed to fetch competitions',
			},
			{ status: 500 }
		);
	}
}

/**
 * POST /api/competitions
 * Create a new competition
 */
export async function POST(request: Request) {
	try {
		const user = await getCurrentUser(request);
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		console.log('Received competition body:', JSON.stringify(body, null, 2));

		// Validate input using Zod schema
		const validation = createCompetitionSchema.safeParse(body);
		if (!validation.success) {
			console.error('Validation failed:', validation.error);
			return NextResponse.json(
				{
					error: 'Validation error',
					fieldErrors: formatZodErrors(validation.error),
				},
				{ status: 400 }
			);
		}

		const {
			date,
			name,
			location,
			organizerName,
			environment,
			weather,
			practiceCategory,
			notes,
			placement,
			numberOfParticipants,
			personalBest,
			rounds,
			bowId,
			arrowsId,
		} = validation.data;

		// Calculate total score
		const totalScore = rounds.reduce((sum, round) => sum + (round.roundScore || 0), 0);

		// Create competition with rounds
		const competition = await prisma.competition.create({
			data: {
				userId: user.id,
				date: new Date(date),
				name: name.trim(),
				location: location?.trim() || null,
				organizerName: organizerName?.trim() || null,
				environment: environment,
				weather: weather || [],
				practiceCategory: practiceCategory || 'SKIVE_OUTDOOR',
				notes: notes?.trim() || null,
				placement: placement || null,
				numberOfParticipants: numberOfParticipants || null,
				personalBest: personalBest || false,
				totalScore: totalScore,
				bowId: bowId || null,
				arrowsId: arrowsId || null,
				rounds: {
					create: rounds.map((round) => {
						// Parse targetSizeCm from targetType (e.g., "40cm" -> 40) or use existing targetSizeCm
						let targetSizeCm = round.targetSizeCm || null;
						if (!targetSizeCm && round.targetType) {
							const parsed = parseInt(round.targetType);
							if (!isNaN(parsed)) {
								targetSizeCm = parsed;
							}
						}

						return {
							roundNumber: round.roundNumber,
							arrows: round.numberArrows || null,
							arrowsWithoutScore: round.arrowsWithoutScore || null,
							scores: round.scores || [],
							roundScore: round.roundScore || 0,
							distanceMeters: round.distanceMeters,
							targetSizeCm,
							targetType: round.targetType || null,
						};
					}),
				},
			},
			include: {
				rounds: {
					orderBy: { roundNumber: 'asc' },
				},
			},
		});

		// Invalidate stats caches for this user
		statsCache.delete(`stats:detailed:${user.id}`);
		statsCache.delete(`stats:summary:${user.id}`);
		practicesCache.deleteByPrefix(`practices:cards:${user.id}`);

		return NextResponse.json({ competition }, { status: 201 });
	} catch (error) {
		console.error('Error creating competition:', error);
		return NextResponse.json(
			{
				error: 'Failed to create competition',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
