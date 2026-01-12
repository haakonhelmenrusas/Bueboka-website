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

		const { name, material, length, weight, arrowsCount, diameter, spine, isFavorite } = await request.json();

		if (!name || !material) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const makeFavorite = Boolean(isFavorite);

		const parsedLength = typeof length === 'number' ? length : length === null || typeof length === 'undefined' ? null : Number(length);
		if (parsedLength !== null && (Number.isNaN(parsedLength) || parsedLength < 0)) {
			return NextResponse.json({ error: 'Invalid length' }, { status: 400 });
		}

		const parsedWeight = typeof weight === 'number' ? weight : weight === null || typeof weight === 'undefined' ? null : Number(weight);
		if (parsedWeight !== null && (Number.isNaN(parsedWeight) || parsedWeight < 0)) {
			return NextResponse.json({ error: 'Invalid weight' }, { status: 400 });
		}

		const parsedDiameter =
			typeof diameter === 'number' ? diameter : diameter === null || typeof diameter === 'undefined' ? null : Number(diameter);
		if (parsedDiameter !== null && (Number.isNaN(parsedDiameter) || parsedDiameter < 0)) {
			return NextResponse.json({ error: 'Invalid diameter' }, { status: 400 });
		}

		const parsedArrowsCount =
			typeof arrowsCount === 'number'
				? arrowsCount
				: arrowsCount === null || typeof arrowsCount === 'undefined'
					? null
					: Number(arrowsCount);
		if (parsedArrowsCount !== null && (!Number.isInteger(parsedArrowsCount) || parsedArrowsCount < 0)) {
			return NextResponse.json({ error: 'Invalid arrowsCount' }, { status: 400 });
		}

		const parsedSpine =
			typeof spine === 'string' ? spine.trim() : spine === null || typeof spine === 'undefined' ? '' : String(spine).trim();
		const spineValue = parsedSpine.length > 0 ? parsedSpine : null;

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
					arrowsCount: parsedArrowsCount,
					diameter: parsedDiameter,
					length: parsedLength,
					weight: parsedWeight,
					spine: spineValue,
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
