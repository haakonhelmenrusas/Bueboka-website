import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function GET(request: NextRequest) {
	try {
		const currentUser = await getCurrentUser();
		if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const { searchParams } = new URL(request.url);
		const query = searchParams.get('q')?.trim() ?? '';

		const where = {
			isPublic: true,
			...(query.length > 0 && {
				OR: [
					{ name: { contains: query, mode: 'insensitive' as const } },
					{ club: { contains: query, mode: 'insensitive' as const }, publicClub: true },
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
		return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
	}
}
