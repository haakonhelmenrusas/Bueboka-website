import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as Sentry from '@sentry/nextjs';
import { updateArrowsSchema } from '@/lib/validations/arrows';
import { validateRequest } from '@/lib/validations/helpers';
import { getCurrentUser } from '@/lib/session';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;

		const body = await request.json();
		const validation = validateRequest(updateArrowsSchema, body);

		if (!validation.success) {
			return validation.error;
		}

		const { name, material, length, weight, arrowsCount, diameter, spine, pointType, pointWeight, vanes, nock, notes, isFavorite } =
			validation.data;

		const existing = await prisma.arrows.findFirst({
			where: { id, userId: user.id },
		});
		if (!existing) {
			return NextResponse.json({ error: 'Not found' }, { status: 404 });
		}

		const makeFavorite = Boolean(isFavorite);

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
