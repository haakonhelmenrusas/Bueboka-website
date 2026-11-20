import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { userProfileCache } from '@/lib/cache';
import { getCurrentUser } from '@/lib/session';
import { edgeCacheHeaders } from '@/lib/apiCache';

export async function GET(request: Request) {
	try {
		const user = await getCurrentUser(request);
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const cacheKey = `profile:${user.id}`;
		const cached = userProfileCache.get(cacheKey);
		if (cached) {
			return NextResponse.json({ profile: cached }, { headers: edgeCacheHeaders() });
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
				publicAchievements: true,
				locale: true,
			},
		});

		userProfileCache.set(cacheKey, profile);

		return NextResponse.json({ profile }, { headers: edgeCacheHeaders() });
	} catch (error) {
		return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
	}
}
