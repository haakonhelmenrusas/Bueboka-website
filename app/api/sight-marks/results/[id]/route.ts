import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseOptionalNumberArray } from '@/lib/utils';
import { getCurrentUser } from '@/lib/session';

async function getOwnedResult(userId: string, resultId: string) {
	return prisma.sightMarkResult.findFirst({ where: { id: resultId, userId } });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser(_request);
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		const { id } = await params;

		const result = await getOwnedResult(user.id, id);
		if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });

		return NextResponse.json({ sightMarkResult: result });
	} catch (error) {
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser(request);
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		const { id } = await params;

		const existing = await getOwnedResult(user.id, id);
		if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

		const body = (await request.json()) as Partial<{
			distanceFrom: unknown;
			distanceTo: unknown;
			interval: unknown;
			angles: unknown;
			distances: unknown;
			sightMarksByAngle: unknown;
			arrowSpeedByAngle: unknown;
		}>;

		const fieldErrors: Record<string, string> = {};

		const toFloat = (val: unknown, key: string) => {
			if (val === undefined) return undefined;
			if (typeof val !== 'number' || Number.isNaN(val)) {
				fieldErrors[key] = `${key} must be a number`;
				return undefined;
			}
			return val;
		};

		const updateData: Record<string, unknown> = {};
		const distanceFrom = toFloat(body.distanceFrom, 'distanceFrom');
		const distanceTo = toFloat(body.distanceTo, 'distanceTo');
		const interval = toFloat(body.interval, 'interval');
		const angles = parseOptionalNumberArray(body.angles, 'angles', fieldErrors);
		const distances = parseOptionalNumberArray(body.distances, 'distances', fieldErrors);

		if (distanceFrom !== undefined) updateData.distanceFrom = distanceFrom;
		if (distanceTo !== undefined) updateData.distanceTo = distanceTo;
		if (interval !== undefined) updateData.interval = interval;
		if (angles !== undefined) updateData.angles = angles;
		if (distances !== undefined) updateData.distances = distances;
		if (body.sightMarksByAngle !== undefined) updateData.sightMarksByAngle = body.sightMarksByAngle;
		if (body.arrowSpeedByAngle !== undefined) updateData.arrowSpeedByAngle = body.arrowSpeedByAngle;

		if (Object.keys(fieldErrors).length) {
			return NextResponse.json({ error: 'Validation error', fieldErrors }, { status: 400 });
		}

		const updated = await prisma.sightMarkResult.update({ where: { id }, data: updateData });
		return NextResponse.json({ sightMarkResult: updated });
	} catch (error) {
	}
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser(_request);
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		const { id } = await params;

		const existing = await getOwnedResult(user.id, id);
		if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

		await prisma.sightMarkResult.delete({ where: { id } });
		return NextResponse.json({ success: true });
	} catch (error) {
	}
}
