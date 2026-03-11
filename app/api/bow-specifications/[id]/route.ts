import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

async function getOwnedSpec(userId: string, specId: string) {
	return prisma.bowSpecification.findFirst({ where: { id: specId, userId } });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		const { id } = await params;

		const spec = await getOwnedSpec(user.id, id);
		if (!spec) return NextResponse.json({ error: 'Not found' }, { status: 404 });

		return NextResponse.json({ bowSpecification: spec });
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'bow-specifications/[id]', method: 'GET' } });
		return NextResponse.json({ error: 'Failed to fetch bow specification' }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		const { id } = await params;

		const existing = await getOwnedSpec(user.id, id);
		if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

		const body = (await request.json()) as Partial<{
			intervalSightReal: unknown;
			intervalSightMeasured: unknown;
			placement: unknown;
		}>;

		const parseIntOrNull = (val: unknown) => (typeof val === 'number' && !Number.isNaN(val) ? Math.trunc(val) : null);

		const updated = await prisma.bowSpecification.update({
			where: { id },
			data: {
				intervalSightReal: parseIntOrNull(body.intervalSightReal),
				intervalSightMeasured: parseIntOrNull(body.intervalSightMeasured),
				placement: typeof body.placement === 'string' && body.placement ? (body.placement as any) : null,
			},
		});

		return NextResponse.json({ bowSpecification: updated });
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'bow-specifications/[id]', method: 'PUT' } });
		return NextResponse.json({ error: 'Failed to update bow specification' }, { status: 500 });
	}
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		const { id } = await params;

		const existing = await getOwnedSpec(user.id, id);
		if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

		await prisma.bowSpecification.delete({ where: { id } });
		return NextResponse.json({ success: true });
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'bow-specifications/[id]', method: 'DELETE' } });
		return NextResponse.json({ error: 'Failed to delete bow specification' }, { status: 500 });
	}
}
