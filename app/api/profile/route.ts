import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { prisma } from '@/lib/prisma';
import { userProfileCache } from '@/lib/cache';
import { getCurrentUser } from '@/lib/session';

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const cacheKey = `profile:${user.id}`;
		const cached = userProfileCache.get(cacheKey);
		if (cached) {
			return NextResponse.json({ profile: cached });
		}

		const profile = await prisma.user.findUnique({
			where: { id: user.id },
			select: {
				id: true,
				email: true,
				name: true,
				club: true,
				image: true,
				skytternr: true,
				isPublic: true,
				publicName: true,
				publicClub: true,
				publicStats: true,
				publicSkytternr: true,
			},
		});

		userProfileCache.set(cacheKey, profile);

		return NextResponse.json({ profile });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'profile', method: 'GET' },
			extra: { message: 'Error fetching profile' },
		});
		return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
	}
}
