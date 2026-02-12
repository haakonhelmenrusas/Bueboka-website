import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Environment } from '@/lib/prismaEnums';
import { createPracticeSchema } from '@/lib/validations/practice';
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

		const { date, arrowsShot, location, environment, weather, notes, roundTypeId, bowId, arrowsId } = validation.data;

		const parsedDate = new Date(date);

		const data: any = {
			userId: user.id,
			date: parsedDate,
			totalScore: arrowsShot,
			location: location || null,
			environment: environment as Environment,
			weather: weather || [],
			notes: notes || null,
			ends: {
				create: {
					arrows: arrowsShot,
					scores: [],
				},
			},
		};

		if (roundTypeId) data.roundTypeId = roundTypeId;
		if (bowId) data.bowId = bowId;
		if (arrowsId) data.arrowsId = arrowsId;

		// Create the practice + a first end that stores arrowsShot (so we can show arrowsShot without a second call)
		const practice = await prisma.practice.create({
			data,
			include: {
				ends: true,
			},
		});

		return NextResponse.json({ practice }, { status: 201 });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'practices', method: 'POST' },
			extra: {
				message: 'Error creating practice',
				errorName: error instanceof Error ? error.name : typeof error,
				errorMessage: error instanceof Error ? error.message : undefined,
			},
		});
		return NextResponse.json({ error: 'Failed to create practice' }, { status: 500 });
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
