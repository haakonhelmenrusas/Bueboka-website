import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { userProfileCache } from '@/lib/cache';
import { getCurrentUser } from '@/lib/session';

export async function GET(request: NextRequest) {
	try {
		const user = await getCurrentUser(request);
		if (!user) {
			return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
		}

		const users = await prisma.user.findMany({
			where: {
				id: user.id,
			},
			orderBy: [{ createdAt: 'desc' }],
			select: {
				id: true,
				email: true,
				name: true,
				club: true,
				image: true,
				skytternr: true,
			},
		});

		return NextResponse.json({ users });
	} catch (error) {
		return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const user = await getCurrentUser(request);
		if (!user) {
			return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
		}

		const { club, name, image, skytternr, isPublic, publicName, publicClub, publicStats, publicSkytternr, publicAchievements } = await request.json();

		// Validate image if provided
		if (image !== undefined && image !== null) {
			// Check if it's a valid base64 image or external URL
			if (typeof image !== 'string') {
				return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
			}

			// If it's a base64 string, validate it's not too large (max ~4MB base64 = ~3MB file)
			if (image.startsWith('data:image/')) {
				const base64Length = image.length;
				const maxSize = 5 * 1024 * 1024; // 5MB
				if (base64Length > maxSize) {
					return NextResponse.json({ error: 'Image too large. Max 5MB.' }, { status: 400 });
				}
			}
		}

		const updatedUser = await prisma.user.update({
			where: { id: user.id },
			data: {
				...(club !== undefined && { club }),
				...(name !== undefined && { name }),
				...(image !== undefined && { image }),
				...(skytternr !== undefined && { skytternr }),
				...(isPublic !== undefined && { isPublic }),
				...(publicName !== undefined && { publicName }),
				...(publicClub !== undefined && { publicClub }),
				...(publicStats !== undefined && { publicStats }),
				...(publicSkytternr !== undefined && { publicSkytternr }),
				...(publicAchievements !== undefined && { publicAchievements }),
			},
		});

		// Invalidate profile cache
		userProfileCache.delete(`profile:${user.id}`);

		return NextResponse.json({ user: updatedUser });
	} catch (error) {
		return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
	}
}
