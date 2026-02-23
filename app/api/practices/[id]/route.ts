import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Environment } from '@/lib/prismaEnums';
import { updatePracticeSchema } from '@/lib/validations/practice';
import { formatZodErrors } from '@/lib/validations/helpers';

async function getCurrentUser() {
	try {
		const reqHeaders = await headers();
		const headerObj: Record<string, string> = {};
		for (const [key, value] of reqHeaders) headerObj[key] = value;
		const session = await auth.api.getSession({ headers: headerObj });
		return session?.user || null;
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'practices/[id]', where: 'getCurrentUser' },
		});
		return null;
	}
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const { id: practiceId } = await params;

		const body = await request.json();

		// Validate input using Zod schema
		const validation = updatePracticeSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{
					error: 'Validation error',
					fieldErrors: formatZodErrors(validation.error),
				},
				{ status: 400 }
			);
		}

		const { date, location, environment, weather, practiceType, notes, rounds, bowId, arrowsId } = validation.data;

		// Verify practice exists and belongs to user
		const existingPractice = await prisma.practice.findFirst({
			where: { id: practiceId, userId: user.id },
			include: { ends: true },
		});

		if (!existingPractice) {
			return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
		}

		const parsedDate = new Date(date);

		// Calculate total arrows and score from rounds
		const totalArrows = rounds.reduce((sum, round) => sum + (round.numberArrows || 0), 0);
		const totalScore = rounds.reduce((sum, round) => sum + (round.roundScore || 0), 0);

		// Find or create round type for first round (same logic as POST)
		const firstRound = rounds[0];
		let roundTypeId: string | null = null;

		if (firstRound && (firstRound.distanceMeters || firstRound.targetType || firstRound.numberArrows)) {
			const existingRoundType = await prisma.roundType.findFirst({
				where: {
					environment: environment as Environment,
					distanceMeters: firstRound.distanceMeters || null,
				},
			});

			if (existingRoundType) {
				roundTypeId = existingRoundType.id;
			} else {
				const targetTypeJson = firstRound.targetType
					? {
							type: firstRound.targetType,
							sizeCm: parseInt(firstRound.targetType) || 0,
						}
					: undefined;

				const newRoundType = await prisma.roundType.create({
					data: {
						name: `${firstRound.distanceMeters || 0}m - ${firstRound.targetType || 'Custom'}`,
						environment: environment as Environment,
						distanceMeters: firstRound.distanceMeters || null,
						targetType: targetTypeJson,
						numberArrows: firstRound.numberArrows || null,
						roundScore: firstRound.roundScore || null,
					},
				});
				roundTypeId = newRoundType.id;
			}
		}

		// Delete existing ends
		await prisma.end.deleteMany({
			where: { practiceId: practiceId },
		});

		// Create new ends from rounds
		const newEnds = rounds.map((round) => {
			let targetSizeCm = null;
			if (round.targetType) {
				const parsed = parseInt(round.targetType);
				if (!isNaN(parsed)) {
					targetSizeCm = parsed;
				}
			}

			return {
				practiceId: practiceId,
				arrows: round.numberArrows || 0,
				scores: [],
				roundScore: round.roundScore || null,
				distanceMeters: round.distanceMeters || null,
				targetSizeCm,
			};
		});

		await prisma.end.createMany({
			data: newEnds,
		});

		// Update practice
		const updatedPractice = await prisma.practice.update({
			where: { id: practiceId },
			data: {
				date: parsedDate,
				totalScore: totalScore,
				location: location || null,
				environment: environment as Environment,
				weather: weather || [],
				practiceType: practiceType || 'TRENING',
				notes: notes || null,
				roundTypeId: roundTypeId || null,
				bowId: bowId || null,
				arrowsId: arrowsId || null,
			},
			include: {
				ends: true,
				roundType: true,
				bow: true,
				arrows: true,
			},
		});

		// Map totalScore to arrowsShot for frontend compatibility
		const mappedPractice = {
			...updatedPractice,
			arrowsShot: totalArrows,
		};

		return NextResponse.json(mappedPractice);
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'practices/[id]', method: 'PATCH' },
			extra: {
				message: 'Error updating practice',
				errorMessage: error instanceof Error ? error.message : undefined,
			},
		});

		if (error instanceof Error && error.message.includes('Unique constraint failed')) {
			return NextResponse.json({ error: 'A practice with this data already exists' }, { status: 409 });
		}

		return NextResponse.json(
			{
				error: 'Failed to update practice',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const { id: practiceId } = await params;

		// Verify practice exists and belongs to user
		const existingPractice = await prisma.practice.findFirst({
			where: { id: practiceId, userId: user.id },
		});

		if (!existingPractice) {
			return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
		}

		// Delete related ends first, then the practice
		await prisma.$transaction([
			prisma.end.deleteMany({
				where: { practiceId },
			}),
			prisma.practice.delete({
				where: { id: practiceId },
			}),
		]);

		return NextResponse.json({ success: true });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'practices/[id]', method: 'DELETE' },
			extra: { message: 'Error deleting practice' },
		});

		if (error instanceof Error && error.message.includes('Foreign key constraint')) {
			return NextResponse.json({ error: 'Kunne ikke slette trening. Prøv igjen senere.' }, { status: 409 });
		}

		return NextResponse.json({ error: 'Failed to delete practice' }, { status: 500 });
	}
}
