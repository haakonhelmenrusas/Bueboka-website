import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/prisma/prisma/generated/prisma-client/client';
import { parseNumberArray } from '@/lib/utils';
import { getCurrentUser } from '@/lib/session';

export async function GET(request: NextRequest) {
	try {
		const user = await getCurrentUser(request);
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const sightMarks = await prisma.sightMark.findMany({
			where: { userId: user.id },
			include: {
				bow: true,
			},
			orderBy: { createdAt: 'desc' },
		});

		return NextResponse.json({ sightMarks });
	} catch (error) {
		console.error('Sight marks API error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const user = await getCurrentUser(request);
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const body = (await request.json()) as Partial<{
			bowId: unknown;
			name: unknown;
			givenMarks: unknown;
			givenDistances: unknown;
			ballisticsParameters: unknown;
		}>;

		const fieldErrors: Record<string, string> = {};
		if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

		if (typeof body.bowId !== 'string' || !body.bowId)
			fieldErrors.bowId = 'bowId is required';

		const name = typeof body.name === 'string' ? body.name.trim() || null : null;
		const givenMarks = parseNumberArray(body.givenMarks, 'givenMarks', fieldErrors);
		const givenDistances = parseNumberArray(body.givenDistances, 'givenDistances', fieldErrors);
		const rawBallistics =
			typeof body.ballisticsParameters === 'object' && body.ballisticsParameters !== null ? body.ballisticsParameters : {};
		const ballisticsParameters: Prisma.InputJsonValue = rawBallistics as Prisma.InputJsonValue;

		if (Object.keys(fieldErrors).length) {
			return NextResponse.json({ error: 'Validation error', fieldErrors }, { status: 400 });
		}

		const bow = await prisma.bow.findFirst({
			where: { id: body.bowId as string, userId: user.id },
		});
		if (!bow) return NextResponse.json({ error: 'Bow not found' }, { status: 404 });

		const sightMark = await prisma.sightMark.create({
			data: {
				userId: user.id,
				bowId: bow.id,
				name,
				givenMarks,
				givenDistances,
				ballisticsParameters,
			},
		});

		return NextResponse.json({ sightMark }, { status: 201 });
	} catch (error) {
		console.error('Sight marks API error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
