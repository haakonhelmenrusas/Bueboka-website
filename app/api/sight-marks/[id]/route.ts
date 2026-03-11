import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/prisma/prisma/generated/prisma-client/client';
import { parseOptionalNumberArray } from '@/lib/utils';
import { getCurrentUser } from '@/lib/session';

async function getOwnedSightMark(userId: string, sightMarkId: string) {
	return prisma.sightMark.findFirst({ where: { id: sightMarkId, userId } });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		const { id } = await params;

		const sightMark = await getOwnedSightMark(user.id, id);
		if (!sightMark) return NextResponse.json({ error: 'Not found' }, { status: 404 });

		return NextResponse.json({ sightMark });
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'sight-marks/[id]', method: 'GET' } });
		return NextResponse.json({ error: 'Failed to fetch sight mark' }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	return PUT(request, { params });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		const { id } = await params;

		const existing = await getOwnedSightMark(user.id, id);
		if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

		const body = (await request.json()) as Partial<{
			givenMarks: unknown;
			givenDistances: unknown;
			ballisticsParameters: unknown;
		}>;

		const fieldErrors: Record<string, string> = {};

		const givenMarks = parseOptionalNumberArray(body.givenMarks, 'givenMarks', fieldErrors);
		const givenDistances = parseOptionalNumberArray(body.givenDistances, 'givenDistances', fieldErrors);
		const rawBallistics =
			body.ballisticsParameters === undefined || body.ballisticsParameters === null
				? existing.ballisticsParameters
				: body.ballisticsParameters;
		const ballisticsParameters: Prisma.InputJsonValue = rawBallistics === null ? {} : (rawBallistics as Prisma.InputJsonValue);

		if (Object.keys(fieldErrors).length) {
			return NextResponse.json({ error: 'Validation error', fieldErrors }, { status: 400 });
		}

		const updated = await prisma.sightMark.update({
			where: { id },
			data: {
				...(givenMarks ? { givenMarks } : {}),
				...(givenDistances ? { givenDistances } : {}),
				ballisticsParameters,
			},
		});

		return NextResponse.json({ sightMark: updated });
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'sight-marks/[id]', method: 'PUT' } });
		return NextResponse.json({ error: 'Failed to update sight mark' }, { status: 500 });
	}
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		const { id } = await params;

		const existing = await getOwnedSightMark(user.id, id);
		if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

		await prisma.$transaction([
			prisma.sightMarkResult.deleteMany({ where: { sightMarkId: id } }),
			prisma.sightMark.delete({ where: { id } }),
		]);

		return NextResponse.json({ success: true });
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'sight-marks/[id]', method: 'DELETE' } });
		return NextResponse.json({ error: 'Failed to delete sight mark' }, { status: 500 });
	}
}
