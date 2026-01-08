import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Environment, WeatherCondition } from '@/prisma/prisma/generated/prisma-client/enums';

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
		const { date, totalScore, arrowsShot, location, environment, weather, notes, roundTypeId, bowId, arrowsId } = body as {
			date: string;
			totalScore: number;
			arrowsShot: number;
			location?: string;
			environment: Environment;
			weather: WeatherCondition[];
			notes?: string;
			roundTypeId?: string;
			bowId?: string;
			arrowsId?: string;
		};

		if (!date || typeof totalScore !== 'number' || typeof arrowsShot !== 'number' || !environment) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const practice = await prisma.practice.create({
			data: {
				userId: user.id,
				date: new Date(date),
				totalScore,
				location: location ?? null,
				environment,
				weather: Array.isArray(weather) ? weather : [],
				notes: notes ?? null,
				roundTypeId: roundTypeId ?? undefined,
				bowId: bowId ?? undefined,
				arrowsId: arrowsId ?? undefined,
				// ends are created in a separate API if needed
			},
		});

		return NextResponse.json({ practice }, { status: 201 });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'practices', method: 'POST' },
			extra: { message: 'Error creating practice' },
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
