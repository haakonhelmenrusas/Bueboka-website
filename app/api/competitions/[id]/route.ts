import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { prisma } from '@/lib/prisma';
import type { Environment, PracticeCategory, WeatherCondition } from '@/lib/prismaEnums';
import { statsCache } from '@/lib/cache';
import { getCurrentUser } from '@/lib/session';

interface RouteParams {
	params: Promise<{ id: string }>;
}

/**
 * GET /api/competitions/[id]
 * Get a single competition by ID
 */
export async function GET(request: Request, { params }: RouteParams) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;

		const competition = await prisma.competition.findUnique({
			where: { id },
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
		});

		if (!competition) {
			return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
		}

		// Check ownership
		if (competition.userId !== user.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		// Calculate total arrows (including both scored and unscored arrows)
		const arrowsShot = competition.rounds.reduce((sum, round) => sum + (round.arrows || 0) + (round.arrowsWithoutScore || 0), 0);

		return NextResponse.json({
			competition: {
				...competition,
				arrowsShot,
			},
		});
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'competitions/[id]', method: 'GET' },
		});

		return NextResponse.json(
			{
				error: 'Failed to fetch competition',
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

interface CompetitionUpdateInput {
	date?: string;
	name?: string;
	location?: string;
	organizerName?: string;
	environment?: Environment;
	weather?: WeatherCondition[];
	practiceCategory?: PracticeCategory;
	notes?: string;
	placement?: number;
	numberOfParticipants?: number;
	personalBest?: boolean;
	rounds?: CompetitionRoundInput[];
	bowId?: string;
	arrowsId?: string;
}

/**
 * PATCH /api/competitions/[id]
 * Update a competition
 */
export async function PATCH(request: Request, { params }: RouteParams) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;
		const body: CompetitionUpdateInput = await request.json();

		// Check if competition exists and user owns it
		const existing = await prisma.competition.findUnique({
			where: { id },
			select: { userId: true },
		});

		if (!existing) {
			return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
		}

		if (existing.userId !== user.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		// If rounds are being updated, delete old rounds and create new ones
		let roundsUpdate = {};
		let totalScore = undefined;

		if (body.rounds) {
			// Calculate new total score
			totalScore = body.rounds.reduce((sum, round) => sum + (round.roundScore || 0), 0);

			roundsUpdate = {
				rounds: {
					deleteMany: {},
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
						};
					}),
				},
			};
		}

		// Update competition
		const competition = await prisma.competition.update({
			where: { id },
			data: {
				...(body.date && { date: new Date(body.date) }),
				...(body.name && { name: body.name.trim() }),
				...(body.location !== undefined && { location: body.location?.trim() || null }),
				...(body.organizerName !== undefined && { organizerName: body.organizerName?.trim() || null }),
				...(body.environment && { environment: body.environment }),
				...(body.weather && { weather: body.weather }),
				...(body.practiceCategory && { practiceCategory: body.practiceCategory }),
				...(body.notes !== undefined && { notes: body.notes?.trim() || null }),
				...(body.placement !== undefined && { placement: body.placement || null }),
				...(body.numberOfParticipants !== undefined && { numberOfParticipants: body.numberOfParticipants || null }),
				...(body.personalBest !== undefined && { personalBest: body.personalBest }),
				...(totalScore !== undefined && { totalScore }),
				...(body.bowId !== undefined && { bowId: body.bowId || null }),
				...(body.arrowsId !== undefined && { arrowsId: body.arrowsId || null }),
				...roundsUpdate,
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

		return NextResponse.json({ competition });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'competitions/[id]', method: 'PATCH' },
		});

		return NextResponse.json(
			{
				error: 'Failed to update competition',
			},
			{ status: 500 }
		);
	}
}

/**
 * DELETE /api/competitions/[id]
 * Delete a competition
 */
export async function DELETE(request: Request, { params }: RouteParams) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;

		// Check if competition exists and user owns it
		const existing = await prisma.competition.findUnique({
			where: { id },
			select: { userId: true },
		});

		if (!existing) {
			return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
		}

		if (existing.userId !== user.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		// Delete competition (rounds will be cascade deleted)
		await prisma.competition.delete({
			where: { id },
		});

		// Invalidate stats caches for this user
		statsCache.delete(`stats:detailed:${user.id}`);
		statsCache.delete(`stats:summary:${user.id}`);

		return NextResponse.json({ success: true });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'competitions/[id]', method: 'DELETE' },
		});

		return NextResponse.json(
			{
				error: 'Failed to delete competition',
			},
			{ status: 500 }
		);
	}
}
