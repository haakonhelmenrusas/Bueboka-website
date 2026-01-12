import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Environment, WeatherCondition } from '@/lib/prismaEnums';

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

		const body = (await request.json()) as unknown;
		if (!body || typeof body !== 'object') {
			return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
		}

		const { date, totalScore, arrowsShot, location, environment, weather, notes, roundTypeId, bowId, arrowsId } = body as {
			date?: unknown;
			totalScore?: unknown;
			arrowsShot?: unknown;
			location?: unknown;
			environment?: unknown;
			weather?: unknown;
			notes?: unknown;
			roundTypeId?: unknown;
			bowId?: unknown;
			arrowsId?: unknown;
		};

		const fieldErrors: Record<string, string> = {};

		if (typeof date !== 'string' || !date) fieldErrors.date = 'Dato er påkrevd';
		if (typeof arrowsShot !== 'number' || Number.isNaN(arrowsShot)) fieldErrors.arrowsShot = 'Antall skutte piler må være et tall';
		if (typeof arrowsShot === 'number' && arrowsShot < 0) fieldErrors.arrowsShot = 'Antall skutte piler kan ikke være negativt';
		if (typeof environment !== 'string' || !environment) fieldErrors.environment = 'Miljø er påkrevd';

		// Validate date string (avoid silently passing Invalid Date into Prisma)
		let parsedDate: Date | null = null;
		if (typeof date === 'string' && date) {
			const d = new Date(date);
			if (Number.isNaN(d.getTime())) fieldErrors.date = 'Ugyldig datoformat';
			else parsedDate = d;
		}

		// Validate environment enum
		if (typeof environment === 'string' && environment) {
			const envValues = Object.values(Environment) as string[];
			if (!envValues.includes(environment)) fieldErrors.environment = 'Ugyldig miljøverdi';
		}

		// Validate weather enums; if invalid values come in, treat it as a validation error
		let normalizedWeather: WeatherCondition[] = [];
		if (weather === undefined) {
			normalizedWeather = [];
		} else if (!Array.isArray(weather)) {
			fieldErrors.weather = 'Vær må være en liste';
		} else {
			const allowed = new Set(Object.values(WeatherCondition) as string[]);
			const invalid = weather.filter((w) => typeof w !== 'string' || !allowed.has(w));
			if (invalid.length) {
				fieldErrors.weather = 'Vær inneholder ugyldige verdier';
			} else {
				normalizedWeather = weather as WeatherCondition[];
			}
		}

		if (Object.keys(fieldErrors).length) {
			return NextResponse.json(
				{
					error: 'Validation error',
					fieldErrors,
				},
				{ status: 400 }
			);
		}

		const normalizedLocation = typeof location === 'string' && location.trim() ? location.trim() : null;
		const normalizedNotes = typeof notes === 'string' && notes.trim() ? notes.trim() : null;
		const normalizedRoundTypeId = typeof roundTypeId === 'string' && roundTypeId.trim() ? roundTypeId.trim() : null;
		const normalizedBowId = typeof bowId === 'string' && bowId.trim() ? bowId.trim() : null;
		const normalizedArrowsId = typeof arrowsId === 'string' && arrowsId.trim() ? arrowsId.trim() : null;

		const normalizedTotalScore = typeof totalScore === 'number' && !Number.isNaN(totalScore) ? totalScore : 0;

		const data: any = {
			userId: user.id,
			date: parsedDate!,
			totalScore: normalizedTotalScore,
			location: normalizedLocation,
			environment: environment as Environment,
			weather: normalizedWeather,
			notes: normalizedNotes,
			ends: {
				create: {
					arrows: arrowsShot as number,
					scores: [],
				},
			},
		};

		if (normalizedRoundTypeId) data.roundTypeId = normalizedRoundTypeId;
		if (normalizedBowId) data.bowId = normalizedBowId;
		if (normalizedArrowsId) data.arrowsId = normalizedArrowsId;

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
