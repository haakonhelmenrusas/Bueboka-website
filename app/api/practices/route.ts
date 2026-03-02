import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/prisma/prisma/generated/prisma-client/client';
import { Environment } from '@/lib/prismaEnums';
import { createPracticeSchema } from '@/lib/validations/practice';
import { formatZodErrors } from '@/lib/validations/helpers';
import { statsCache } from '@/lib/cache';

async function getCurrentUser() {
	try {
		const reqHeaders = await headers();
		const headerObj: Record<string, string> = {};
		for (const [key, value] of reqHeaders) headerObj[key] = value;
		const session = await auth.api.getSession({ headers: headerObj });
		return session?.user || null;
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'practices', where: 'getCurrentUser' },
		});
		return null;
	}
}

export async function POST(request: NextRequest) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const body = await request.json();
		// Validate input using Zod schema
		const validation = createPracticeSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{
					error: 'Validation error',
					fieldErrors: formatZodErrors(validation.error),
				},
				{ status: 400 }
			);
		}

		const { date, location, environment, weather, practiceCategory, notes, rating, rounds, arrowsWithoutScore, bowId, arrowsId } =
			validation.data;

		const parsedDate = new Date(date);

		// Calculate total score from all rounds
		const totalScore = rounds.reduce((sum, round) => sum + (round.roundScore || 0), 0);

		// For now, we'll use the first round's data for the practice
		// TODO: In future, might want to handle multiple rounds differently
		const firstRound = rounds[0];
		let roundTypeId: string | null = null;

		// Try to find or create a matching RoundType for the first round
		if (firstRound && (firstRound.distanceMeters || firstRound.targetType || firstRound.numberArrows)) {
			// Try to find existing round type
			const existingRoundType = await prisma.roundType.findFirst({
				where: {
					distanceMeters: firstRound.distanceMeters || null,
					// Note: targetType is JSON, so we can't easily match on it
					// For now, we'll just match on distance
				},
			});

			if (existingRoundType) {
				roundTypeId = existingRoundType.id;
			} else {
				// Create a new round type
				const targetTypeJson = firstRound.targetType
					? {
							type: firstRound.targetType,
							sizeCm: parseInt(firstRound.targetType) || 0,
						}
					: Prisma.JsonNull;

				const newRoundType = await prisma.roundType.create({
					data: {
						name: `${firstRound.distanceMeters || 0}m - ${firstRound.targetType || 'Custom'}`,
						distanceMeters: firstRound.distanceMeters ?? null,
						targetType: targetTypeJson,
						numberArrows: firstRound.numberArrows ?? null,
						roundScore: firstRound.roundScore ?? null,
					},
				});
				roundTypeId = newRoundType.id;
			}
		}

		const data: any = {
			userId: user.id,
			date: parsedDate,
			totalScore: totalScore, // Sum of all round scores
			location: location || null,
			environment: environment as Environment,
			weather: weather || [],
			practiceCategory: practiceCategory || 'SKIVE_INDOOR',
			notes: notes || null,
			rating: rating ?? null,
			arrowsWithoutScore: arrowsWithoutScore ?? null,
			ends: {
				create: rounds.map((round) => {
					// Parse targetSizeCm from targetType (e.g., "40cm" -> 40)
					let targetSizeCm = null;
					if (round.targetType) {
						const parsed = parseInt(round.targetType);
						if (!isNaN(parsed)) {
							targetSizeCm = parsed;
						}
					}

					const roundAny = round as any;

					return {
						arrows: round.numberArrows || 0,
						scores: [],
						roundScore: round.roundScore || null,
						distanceMeters: round.distanceMeters || null,
						distanceFrom: roundAny.distanceFrom || null,
						distanceTo: roundAny.distanceTo || null,
						targetSizeCm,
					};
				}),
			},
		};

		if (roundTypeId) data.roundTypeId = roundTypeId;
		if (bowId) data.bowId = bowId;
		if (arrowsId) data.arrowsId = arrowsId;

		// Create the practice with ends for each round
		const practice = await prisma.practice.create({
			data,
			include: {
				ends: true,
				roundType: true,
				bow: true,
				arrows: true,
			},
		});

		// Invalidate stats caches for this user
		statsCache.delete(`stats:detailed:${user.id}`);
		statsCache.delete(`stats:summary:${user.id}`);

		return NextResponse.json({ practice }, { status: 201 });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'practices', method: 'POST' },
			extra: {
				message: 'Error creating practice',
				errorName: error instanceof Error ? error.name : typeof error,
				errorMessage: error instanceof Error ? error.message : undefined,
				errorStack: error instanceof Error ? error.stack : undefined,
			},
		});
		return NextResponse.json(
			{
				error: 'Failed to create practice',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const practices = await prisma.practice.findMany({
			where: { userId: user.id },
			orderBy: { date: 'desc' },
			include: {
				bow: true,
				arrows: true,
				roundType: true,
			},
		});

		return NextResponse.json({ practices });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'practices', method: 'GET' },
			extra: { message: 'Error fetching practices' },
		});
		return NextResponse.json({ error: 'Failed to fetch practices' }, { status: 500 });
	}
}
