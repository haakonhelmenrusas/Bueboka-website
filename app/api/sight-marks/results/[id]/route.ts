import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getCurrentUser() {
	try {
		const reqHeaders = await headers();
		const headerObj: Record<string, string> = {};
		for (const [key, value] of reqHeaders) headerObj[key] = value;
		const session = await auth.api.getSession({ headers: headerObj });
		return session?.user || null;
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'sight-marks/results/[id]', where: 'getCurrentUser' } });
		return null;
	}
}

async function getOwnedResult(userId: string, resultId: string) {
	return prisma.sightMarkResult.findFirst({ where: { id: resultId, userId } });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		const { id } = await params;

		const result = await getOwnedResult(user.id, id);
		if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });

		return NextResponse.json({ sightMarkResult: result });
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'sight-marks/results/[id]', method: 'GET' } });
		return NextResponse.json({ error: 'Failed to fetch sight mark result' }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
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

		const parseNumberArray = (val: unknown, key: string) => {
			if (val === undefined) return undefined;
			if (!Array.isArray(val)) {
				fieldErrors[key] = `${key} must be an array`;
				return undefined;
			}
			const nums = val.filter((item) => typeof item === 'number' && !Number.isNaN(item)) as number[];
			if (nums.length !== val.length) fieldErrors[key] = `${key} contains invalid numbers`;
			return nums;
		};

		const updateData: Record<string, unknown> = {};
		const distanceFrom = toFloat(body.distanceFrom, 'distanceFrom');
		const distanceTo = toFloat(body.distanceTo, 'distanceTo');
		const interval = toFloat(body.interval, 'interval');
		const angles = parseNumberArray(body.angles, 'angles');
		const distances = parseNumberArray(body.distances, 'distances');

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
		Sentry.captureException(error, { tags: { endpoint: 'sight-marks/results/[id]', method: 'PUT' } });
		return NextResponse.json({ error: 'Failed to update sight mark result' }, { status: 500 });
	}
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		const { id } = await params;

		const existing = await getOwnedResult(user.id, id);
		if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

		await prisma.sightMarkResult.delete({ where: { id } });
		return NextResponse.json({ success: true });
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'sight-marks/results/[id]', method: 'DELETE' } });
		return NextResponse.json({ error: 'Failed to delete sight mark result' }, { status: 500 });
	}
}
