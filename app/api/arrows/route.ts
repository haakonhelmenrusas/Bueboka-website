import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { createArrowsSchema } from '@/lib/validations/arrows';
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
		const validation = validateRequest(createArrowsSchema, body);

		if (!validation.success) {
			return validation.error;
		}

		const { name, material, length, weight, arrowsCount, diameter, spine, pointType, pointWeight, vanes, nock, notes, isFavorite } =
			validation.data;

		const makeFavorite = Boolean(isFavorite);

		const arrows = await prisma.$transaction(async (tx) => {
			if (makeFavorite) {
				await tx.arrows.updateMany({
					where: { userId: user.id, isFavorite: true },
					data: { isFavorite: false },
				});
			}

			return tx.arrows.create({
				data: {
					userId: user.id,
					name,
					material,
					isFavorite: makeFavorite,
					arrowsCount: arrowsCount ?? null,
					diameter: diameter ?? null,
					length: length ?? null,
					weight: weight ?? null,
					spine: spine ?? null,
					pointType: pointType ?? null,
					pointWeight: pointWeight ?? null,
					vanes: vanes ?? null,
					nock: nock ?? null,
					notes: notes ?? null,
				},
			});
		});

		return NextResponse.json({ arrows }, { status: 201 });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'arrows', method: 'POST' },
			extra: { message: 'Error creating arrows' },
		});
		console.error('Error creating arrows:', error);
		return NextResponse.json({ error: 'Failed to create arrows' }, { status: 500 });
	}
}

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const arrows = await prisma.arrows.findMany({
			where: { userId: user.id },
		});

		return NextResponse.json({ arrows });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'arrows', method: 'GET' },
			extra: { message: 'Error fetching arrows' },
		});
		console.error('Error fetching arrows:', error);
		return NextResponse.json({ error: 'Failed to fetch arrows' }, { status: 500 });
	}
}
