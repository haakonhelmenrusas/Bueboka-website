import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseNumberArray } from '@/lib/utils';
import { getCurrentUser } from '@/lib/session';

async function getOwnedSightMark(userId: string, sightMarkId: string) {
	return prisma.sightMark.findFirst({ where: { id: sightMarkId, userId } });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser(_request);
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		const { id: sightMarkId } = await params;

		const sightMark = await getOwnedSightMark(user.id, sightMarkId);
		if (!sightMark) return NextResponse.json({ error: 'Sight mark not found' }, { status: 404 });

		const results = await prisma.sightMarkResult.findMany({
			where: { sightMarkId },
			orderBy: { createdAt: 'desc' },
		});

		return NextResponse.json({ sightMarkResults: results });
	} catch (error) {}
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser(request);
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		const { id: sightMarkId } = await params;

		const sightMark = await getOwnedSightMark(user.id, sightMarkId);
		if (!sightMark) return NextResponse.json({ error: 'Sight mark not found' }, { status: 404 });

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
		if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

		const toFloat = (val: unknown, key: string) => {
			if (typeof val !== 'number' || Number.isNaN(val)) {
				fieldErrors[key] = `${key} must be a number`;
				return null;
			}
			return val;
		};

		const distanceFrom = toFloat(body.distanceFrom, 'distanceFrom');
		const distanceTo = toFloat(body.distanceTo, 'distanceTo');
		const interval = toFloat(body.interval, 'interval');

		const angles = parseNumberArray(body.angles, 'angles', fieldErrors);
		const distances = parseNumberArray(body.distances, 'distances', fieldErrors);
		const sightMarksByAngle = typeof body.sightMarksByAngle === 'object' && body.sightMarksByAngle !== null ? body.sightMarksByAngle : {};
		const arrowSpeedByAngle = typeof body.arrowSpeedByAngle === 'object' && body.arrowSpeedByAngle !== null ? body.arrowSpeedByAngle : {};

		if (Object.keys(fieldErrors).length) {
			return NextResponse.json({ error: 'Validation error', fieldErrors }, { status: 400 });
		}

		const result = await prisma.sightMarkResult.create({
			data: {
				userId: user.id,
				sightMarkId,
				distanceFrom: distanceFrom as number,
				distanceTo: distanceTo as number,
				interval: interval as number,
				angles,
				distances,
				sightMarksByAngle,
				arrowSpeedByAngle,
			},
		});

		return NextResponse.json({ sightMarkResult: result }, { status: 201 });
	} catch (error) {}
}
