import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { prisma } from '@/lib/prisma';
import type { Environment, PracticeCategory, WeatherCondition } from '@/lib/prismaEnums';
import { statsCache } from '@/lib/cache';
import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/competitions
 * Fetch all competitions for the current user
 */
export async function GET() {
	try {
		const user = await getCurrentUser();
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
		Sentry.captureException(error, {
			tags: { endpoint: 'competitions', method: 'GET' },
		});

		return NextResponse.json(
			{
				error: 'Failed to fetch competitions',
			},
			{ status: 500 }
		);
	}
}

interface CompetitionRoundInput {
	roundNumber: number;
	distanceMeters?: number;
	targetType?: string; // Changed to accept targetType string (e.g., "40cm")
	targetSizeCm?: number; // Keep for backward compatibility
	numberArrows?: number;
	arrowsWithoutScore?: number;
	roundScore: number;
	scores?: number[];
}

interface CompetitionInput {
	date: string;
	name: string;
	location?: string;
	organizerName?: string;
	environment: Environment;
	weather: WeatherCondition[];
	practiceCategory: PracticeCategory;
	notes?: string;
	placement?: number;
	numberOfParticipants?: number;
	personalBest?: boolean;
	rounds: CompetitionRoundInput[];
	bowId?: string;
	arrowsId?: string;
}

/**
 * POST /api/competitions
 * Create a new competition
 */
export async function POST(request: Request) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body: CompetitionInput = await request.json();

		// Validation
		if (!body.name || body.name.trim() === '') {
			return NextResponse.json({ error: 'Competition name is required', fieldErrors: { name: 'Required' } }, { status: 400 });
		}

		if (!body.rounds || body.rounds.length === 0) {
			return NextResponse.json({ error: 'At least one round is required', fieldErrors: { rounds: 'Required' } }, { status: 400 });
		}

		// Calculate total score
		const totalScore = body.rounds.reduce((sum, round) => sum + (round.roundScore || 0), 0);

		// Create competition with rounds
		const competition = await prisma.competition.create({
			data: {
				userId: user.id,
				date: new Date(body.date),
				name: body.name.trim(),
				location: body.location?.trim(),
				organizerName: body.organizerName?.trim(),
				environment: body.environment,
				weather: body.weather || [],
				practiceCategory: body.practiceCategory,
				notes: body.notes?.trim(),
				placement: body.placement,
				numberOfParticipants: body.numberOfParticipants,
				personalBest: body.personalBest || false,
				totalScore,
				bowId: body.bowId || null,
				arrowsId: body.arrowsId || null,
				rounds: {
					create: body.rounds.map((round) => {
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

		return NextResponse.json({ competition }, { status: 201 });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'competitions', method: 'POST' },
		});

		return NextResponse.json(
			{
				error: 'Failed to create competition',
			},
			{ status: 500 }
		);
	}
}
