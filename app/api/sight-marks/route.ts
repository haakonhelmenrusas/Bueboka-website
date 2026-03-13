import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/prisma/prisma/generated/prisma-client/client';
import { parseNumberArray } from '@/lib/utils';
import { getCurrentUser } from '@/lib/session';

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const sightMarks = await prisma.sightMark.findMany({
			where: { userId: user.id },
			include: {
				bowSpec: {
					include: {
						bow: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});

		return NextResponse.json({ sightMarks });
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'sight-marks', method: 'GET' } });
		return NextResponse.json({ error: 'Failed to fetch sight marks' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const body = (await request.json()) as Partial<{
			bowSpecificationId: unknown;
			name: unknown;
			givenMarks: unknown;
			givenDistances: unknown;
			ballisticsParameters: unknown;
		}>;

		const fieldErrors: Record<string, string> = {};
		if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

		if (typeof body.bowSpecificationId !== 'string' || !body.bowSpecificationId)
			fieldErrors.bowSpecificationId = 'bowSpecificationId is required';

		const name = typeof body.name === 'string' ? body.name.trim() || null : null;
		const givenMarks = parseNumberArray(body.givenMarks, 'givenMarks', fieldErrors);
		const givenDistances = parseNumberArray(body.givenDistances, 'givenDistances', fieldErrors);
		const rawBallistics =
			typeof body.ballisticsParameters === 'object' && body.ballisticsParameters !== null
				? body.ballisticsParameters
				: {};
		const ballisticsParameters: Prisma.InputJsonValue = rawBallistics as Prisma.InputJsonValue;

		if (Object.keys(fieldErrors).length) {
			return NextResponse.json({ error: 'Validation error', fieldErrors }, { status: 400 });
		}

		const bowSpec = await prisma.bowSpecification.findFirst({
			where: { id: body.bowSpecificationId as string, userId: user.id },
		});
		if (!bowSpec) return NextResponse.json({ error: 'Bow specification not found' }, { status: 404 });

		const sightMark = await prisma.sightMark.create({
			data: {
				userId: user.id,
				bowSpecificationId: bowSpec.id,
				name,
				givenMarks,
				givenDistances,
				ballisticsParameters,
			},
		});

		return NextResponse.json({ sightMark }, { status: 201 });
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'sight-marks', method: 'POST' } });
		console.error('[POST /api/sight-marks] error:', error);
		return NextResponse.json({ error: 'Failed to create sight mark', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
	}
}
