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
	} catch {
		return null;
	}
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;
		const { name, material, length, weight, arrowsCount, isFavorite } = await request.json();

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

		const parsedArrowsCount =
			typeof arrowsCount === 'number'
				? arrowsCount
				: arrowsCount === null || typeof arrowsCount === 'undefined'
					? null
					: Number(arrowsCount);
		if (parsedArrowsCount !== null && (!Number.isInteger(parsedArrowsCount) || parsedArrowsCount < 0)) {
			return NextResponse.json({ error: 'Invalid arrowsCount' }, { status: 400 });
		}

		const existing = await prisma.arrows.findFirst({
			where: { id, userId: user.id },
		});
		if (!existing) {
			return NextResponse.json({ error: 'Not found' }, { status: 404 });
		}

		const arrows = await prisma.$transaction(async (tx) => {
			if (makeFavorite) {
				await tx.arrows.updateMany({
					where: { userId: user.id, isFavorite: true, NOT: { id } },
					data: { isFavorite: false },
				});
			}

			return tx.arrows.update({
				where: { id },
				data: {
					name,
					material,
					isFavorite: makeFavorite,
					arrowsCount: parsedArrowsCount,
					length: parsedLength,
					weight: parsedWeight,
				},
			});
		});

		return NextResponse.json({ arrows });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'arrows', method: 'PATCH' },
			extra: { message: 'Error updating arrows' },
		});
		console.error('Error updating arrows:', error);
		return NextResponse.json({ error: 'Failed to update arrows' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;

		const existing = await prisma.arrows.findFirst({ where: { id, userId: user.id } });
		if (!existing) {
			return NextResponse.json({ error: 'Not found' }, { status: 404 });
		}

		await prisma.arrows.delete({ where: { id } });
		return NextResponse.json({ ok: true });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'arrows', method: 'DELETE' },
			extra: { message: 'Error deleting arrows' },
		});
		return NextResponse.json({ error: 'Failed to delete arrows' }, { status: 500 });
	}
}
