import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get('q')?.trim() ?? '';

		const where = {
			isPublic: true,
			...(query.length > 0 && {
				OR: [
					{ name: { contains: query, mode: 'insensitive' as const } },
					{ club: { contains: query, mode: 'insensitive' as const } },
				],
			}),
		};

		const users = await prisma.user.findMany({
			where,
			select: {
				id: true,
				name: true,
				club: true,
				image: true,
				skytternr: true,
				publicName: true,
				publicClub: true,
				publicSkytternr: true,
				publicStats: true,
			},
			orderBy: { name: 'asc' },
			take: 50,
		});

		const profiles = users.map((u) => ({
			id: u.id,
			name: u.publicName ? u.name : null,
			club: u.publicClub ? u.club : null,
			image: u.image,
			skytternr: u.publicSkytternr ? u.skytternr : null,
		}));

		return NextResponse.json({ profiles });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'public/profiles', method: 'GET' },
			extra: { message: 'Error fetching public profiles' },
		});
		return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
	}
}
