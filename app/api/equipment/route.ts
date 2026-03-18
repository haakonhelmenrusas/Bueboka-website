import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as Sentry from '@sentry/nextjs';
import { getCurrentUser } from '@/lib/session';
import { equipmentCache } from '@/lib/cache';

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const cacheKey = `equipment:${user.id}`;
		const cached = equipmentCache.get(cacheKey);
		if (cached) {
			return NextResponse.json(cached);
		}

		// Fetch bows and arrows in parallel with a single auth check
		const [bows, arrows] = await Promise.all([
			prisma.bow.findMany({ where: { userId: user.id } }),
			prisma.arrows.findMany({ where: { userId: user.id } }),
		]);

		const payload = { bows, arrows };
		equipmentCache.set(cacheKey, payload);

		return NextResponse.json(payload);
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'equipment', method: 'GET' },
			extra: { message: 'Error fetching equipment' },
		});
		return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
	}
}

