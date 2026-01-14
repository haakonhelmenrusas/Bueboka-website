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

		const body = (await request.json()) as unknown;
		if (!body || typeof body !== 'object') {
			return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
		}

		const { date, arrowsShot, location, environment, weather, notes, roundTypeId, bowId, arrowsId } = body as {
			date?: unknown;
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

		let parsedDate: Date | null = null;
		if (typeof date === 'string' && date) {
			const d = new Date(date);
			if (Number.isNaN(d.getTime())) fieldErrors.date = 'Ugyldig datoformat';
			else parsedDate = d;
		}

		if (typeof environment === 'string' && environment) {
			const envValues = Object.values(Environment) as string[];
			if (!envValues.includes(environment)) fieldErrors.environment = 'Ugyldig miljøverdi';
		}

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

		if (Object.keys(fieldErrors).length > 0) {
			return NextResponse.json({ errors: fieldErrors }, { status: 400 });
		}

		// Verify practice exists and belongs to user
		const existingPractice = await prisma.practice.findFirst({
			where: { id: practiceId, userId: user.id },
		});

		if (!existingPractice) {
			return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
		}

		const updatedPractice = await prisma.practice.update({
			where: { id: practiceId },
			data: {
				...(parsedDate ? { date: parsedDate } : {}),
				totalScore: typeof arrowsShot === 'number' ? arrowsShot : 0,
				location: location || null,
				environment: environment as Environment,
				weather: normalizedWeather,
				notes: notes || null,
				roundTypeId: roundTypeId || null,
				bowId: bowId || null,
				arrowsId: arrowsId || null,
			},
			include: {
				roundType: true,
				bow: true,
				arrows: true,
			},
		});

		// Map totalScore to arrowsShot for frontend compatibility
		const mappedPractice = {
			...updatedPractice,
			arrowsShot: updatedPractice.totalScore,
		};

		return NextResponse.json(mappedPractice);
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'practices/[id]', method: 'PATCH' },
			extra: { message: 'Error updating practice' },
		});

		if (error instanceof Error && error.message.includes('Unique constraint failed')) {
			return NextResponse.json({ error: 'A practice with this data already exists' }, { status: 409 });
		}

		return NextResponse.json({ error: 'Failed to update practice' }, { status: 500 });
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
