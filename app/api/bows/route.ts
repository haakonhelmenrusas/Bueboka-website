import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';

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

		const { name, type, eyeToNock, aimMeasure, eyeToSight, isFavorite, notes } = await request.json();

		if (!name || !type) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

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
					eyeToNock: eyeToNock !== undefined ? eyeToNock : null,
					aimMeasure: aimMeasure !== undefined ? aimMeasure : null,
					eyeToSight: eyeToSight !== undefined ? eyeToSight : null,
					isFavorite: makeFavorite,
					notes: notes || null,
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
