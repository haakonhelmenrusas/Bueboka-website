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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;
		const { name, type, eyeToNock, aimMeasure, eyeToSight, isFavorite, notes } = await request.json();

		// Verify the bow belongs to the user
		const existingBow = await prisma.bow.findUnique({
			where: { id },
		});

		if (!existingBow || existingBow.userId !== user.id) {
			return NextResponse.json({ error: 'Bow not found or unauthorized' }, { status: 404 });
		}

		if (!name || !type) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const bow = await prisma.bow.update({
			where: { id },
			data: {
				name,
				type,
				eyeToNock: eyeToNock !== undefined ? eyeToNock : null,
				aimMeasure: aimMeasure !== undefined ? aimMeasure : null,
				eyeToSight: eyeToSight !== undefined ? eyeToSight : null,
				isFavorite: isFavorite || false,
				notes: notes || null,
			},
		});

		return NextResponse.json({ bow }, { status: 200 });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'bows/[id]', method: 'PATCH' },
			extra: { message: 'Error updating bow' },
		});
		console.error('Error updating bow:', error);
		return NextResponse.json({ error: 'Failed to update bow' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;

		// Verify the bow belongs to the user
		const existingBow = await prisma.bow.findUnique({
			where: { id },
		});

		if (!existingBow || existingBow.userId !== user.id) {
			return NextResponse.json({ error: 'Bow not found or unauthorized' }, { status: 404 });
		}

		await prisma.bow.delete({
			where: { id },
		});

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'bows/[id]', method: 'DELETE' },
			extra: { message: 'Error deleting bow' },
		});
		console.error('Error deleting bow:', error);
		return NextResponse.json({ error: 'Failed to delete bow' }, { status: 500 });
	}
}
