import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createBowSchema } from '@/lib/validations/bow';
import { validateRequest } from '@/lib/validations/helpers';
import { getCurrentUser } from '@/lib/session';
import { equipmentCache } from '@/lib/cache';

export async function POST(request: NextRequest) {
	try {
		const user = await getCurrentUser(request);
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
		equipmentCache.delete(`equipment:${user.id}`);
		return NextResponse.json({ bow }, { status: 201 });
	} catch (error) {
		console.error('Error creating bow:', error);
		return NextResponse.json({ error: 'Failed to create bow' }, { status: 500 });
	}
}

export async function GET(request: NextRequest) {
	try {
		const user = await getCurrentUser(request);
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const bows = await prisma.bow.findMany({
			where: { userId: user.id },
		});

		return NextResponse.json({ bows });
	} catch (error) {
		console.error('Error fetching bows:', error);
		return NextResponse.json({ error: 'Failed to fetch bows' }, { status: 500 });
	}
}
