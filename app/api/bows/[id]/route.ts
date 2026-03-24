import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateBowSchema } from '@/lib/validations/bow';
import { validateRequest } from '@/lib/validations/helpers';
import { getCurrentUser } from '@/lib/session';
import { equipmentCache } from '@/lib/cache';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser(request);
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;

		const body = await request.json();
		const validation = validateRequest(updateBowSchema, body);

		if (!validation.success) {
			return validation.error;
		}

		const { name, type, eyeToNock, aimMeasure, eyeToSight, limbs, riser, handOrientation, drawWeight, bowLength, isFavorite, notes } = validation.data;

		// Verify the bow belongs to the user
		const existingBow = await prisma.bow.findUnique({
			where: { id },
		});

		if (!existingBow || existingBow.userId !== user.id) {
			return NextResponse.json({ error: 'Bow not found or unauthorized' }, { status: 404 });
		}

		const makeFavorite = Boolean(isFavorite);

		const bow = await prisma.$transaction(async (tx) => {
			if (makeFavorite) {
				await tx.bow.updateMany({
					where: { userId: user.id, isFavorite: true, NOT: { id } },
					data: { isFavorite: false },
				});
			}

			return tx.bow.update({
				where: { id },
				data: {
					name,
					type,
					eyeToNock: eyeToNock ?? null,
					aimMeasure: aimMeasure ?? null,
					eyeToSight: eyeToSight ?? null,
					limbs: limbs ?? null,
					riser: riser ?? null,
					handOrientation: handOrientation ?? null,
					drawWeight: drawWeight ?? null,
					bowLength: bowLength ?? null,
					isFavorite: makeFavorite,
					notes: notes ?? null,
				},
			});
		});

		equipmentCache.delete(`equipment:${user.id}`);
		return NextResponse.json({ bow }, { status: 200 });
	} catch (error) {
		console.error('Error updating bow:', error);
		return NextResponse.json({ error: 'Failed to update bow' }, { status: 500 });
	}
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser(_request);
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;

		const existingBow = await prisma.bow.findUnique({ where: { id } });
		if (!existingBow || existingBow.userId !== user.id) {
			return NextResponse.json({ error: 'Bow not found or unauthorized' }, { status: 404 });
		}

		// Disconnect from practices first to avoid FK constraint errors
		await prisma.practice.updateMany({
			where: { bowId: id, userId: user.id },
			data: { bowId: null },
		});

		await prisma.bow.delete({ where: { id } });

		equipmentCache.delete(`equipment:${user.id}`);
		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		console.error('Error deleting bow:', error);
		return NextResponse.json({ error: 'Failed to delete bow' }, { status: 500 });
	}
}
