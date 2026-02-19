import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseNumberArray } from '@/lib/utils';

async function getCurrentUser() {
	try {
		const reqHeaders = await headers();
		const headerObj: Record<string, string> = {};
		for (const [key, value] of reqHeaders) headerObj[key] = value;
		const session = await auth.api.getSession({ headers: headerObj });
		return session?.user || null;
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'sight-marks', where: 'getCurrentUser' } });
		return null;
	}
}

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const sightMarks = await prisma.sightMark.findMany({
			where: { userId: user.id },
			include: { bowSpec: true },
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
			givenMarks: unknown;
			givenDistances: unknown;
			ballisticsParameters: unknown;
		}>;

		const fieldErrors: Record<string, string> = {};
		if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

		if (typeof body.bowSpecificationId !== 'string' || !body.bowSpecificationId)
			fieldErrors.bowSpecificationId = 'bowSpecificationId is required';

		const givenMarks = parseNumberArray(body.givenMarks, 'givenMarks', fieldErrors);
		const givenDistances = parseNumberArray(body.givenDistances, 'givenDistances', fieldErrors);
		const ballisticsParameters =
			typeof body.ballisticsParameters === 'object' && body.ballisticsParameters !== null ? body.ballisticsParameters : {};

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
				givenMarks,
				givenDistances,
				ballisticsParameters,
			},
		});

		return NextResponse.json({ sightMark }, { status: 201 });
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'sight-marks', method: 'POST' } });
		return NextResponse.json({ error: 'Failed to create sight mark' }, { status: 500 });
	}
}
