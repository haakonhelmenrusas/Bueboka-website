import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function GET(request: NextRequest) {
	try {
		const user = await getCurrentUser(request);
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const specs = await prisma.bowSpecification.findMany({
			where: { userId: user.id },
			include: { bow: true },
			orderBy: { createdAt: 'desc' },
		});

		return NextResponse.json({ bowSpecifications: specs });
	} catch (error) {
		console.error('[bow-specifications GET]', error);
		return NextResponse.json({ error: 'Failed to fetch bow specifications' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const user = await getCurrentUser(request);
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const body = (await request.json()) as Partial<{
			bowId: unknown;
			intervalSightReal: unknown;
			intervalSightMeasured: unknown;
			placement: unknown;
		}>;

		const fieldErrors: Record<string, string> = {};
		if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

		if (typeof body.bowId !== 'string' || !body.bowId) fieldErrors.bowId = 'bowId is required';

		const parseIntOrNull = (val: unknown) => (typeof val === 'number' && !Number.isNaN(val) ? Math.trunc(val) : null);

		const intervalSightReal = parseIntOrNull(body.intervalSightReal);
		const intervalSightMeasured = parseIntOrNull(body.intervalSightMeasured);
		const placement = typeof body.placement === 'string' && body.placement ? body.placement : null;

		if (Object.keys(fieldErrors).length) {
			return NextResponse.json({ error: 'Validation error', fieldErrors }, { status: 400 });
		}

		const spec = await prisma.bowSpecification.create({
			data: {
				userId: user.id,
				bowId: body.bowId as string,
				intervalSightReal,
				intervalSightMeasured,
				placement: placement as any,
			},
		});

		return NextResponse.json({ bowSpecification: spec }, { status: 201 });
	} catch (error) {
		console.error('[bow-specifications POST]', error);
		return NextResponse.json({ error: 'Failed to create bow specification' }, { status: 500 });
	}
}
