import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { createBowSchema } from '@/lib/validations/bow';
import { validateRequest } from '@/lib/validations/helpers';

async function getCurrentUser() {
	try {
		const reqHeaders = await headers();
		const headerObj: Record<string, string> = {};
		for (const [key, value] of reqHeaders) {
			headerObj[key] = value;
		}
		const session = await auth.api.getSession({ headers: headerObj });
		return session?.user || null;
	} catch (error) {
		return null;
	}
}

export async function POST(request: NextRequest) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const validation = validateRequest(createBowSchema, body);

		if (!validation.success) {
			return validation.error;
		}

		const { name, type, eyeToNock, aimMeasure, eyeToSight, isFavorite, notes } = validation.data;

		const makeFavorite = Boolean(isFavorite);

		const bow = await prisma.$transaction(async (tx) => {
			if (makeFavorite) {
				await tx.bow.updateMany({
					where: { userId: user.id, isFavorite: true },
					data: { isFavorite: false },
				});
			}

			return tx.bow.create({
				data: {
					userId: user.id,
					name,
					type,
					eyeToNock: eyeToNock ?? null,
					aimMeasure: aimMeasure ?? null,
					eyeToSight: eyeToSight ?? null,
					isFavorite: makeFavorite,
					notes: notes ?? null,
				},
			});
		});

		return NextResponse.json({ bow }, { status: 201 });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'bows', method: 'POST' },
			extra: { message: 'Error creating bow' },
		});
		console.error('Error creating bow:', error);
		return NextResponse.json({ error: 'Failed to create bow' }, { status: 500 });
	}
}

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const bows = await prisma.bow.findMany({
			where: { userId: user.id },
		});

		return NextResponse.json({ bows });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'bows', method: 'GET' },
			extra: { message: 'Error fetching bows' },
		});
		console.error('Error fetching bows:', error);
		return NextResponse.json({ error: 'Failed to fetch bows' }, { status: 500 });
	}
}
