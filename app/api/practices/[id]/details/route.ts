import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const { id } = await params;
		if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

		const practice = await prisma.practice.findFirst({
			where: { id, userId: user.id },
			include: {
				ends: { orderBy: { createdAt: 'asc' } },
				bow: true,
				arrows: true,
				roundType: true,
			},
		});

		if (!practice) return NextResponse.json({ error: 'Not found' }, { status: 404 });

		// Calculate total arrows shot from ends (including both arrows and arrowsWithoutScore)
		const totalArrows = practice.ends?.reduce((sum, end) => sum + (end.arrows || 0) + (end.arrowsWithoutScore || 0), 0) || 0;

		// Map calculated arrowsShot for frontend compatibility
		const mappedPractice = {
			...practice,
			arrowsShot: totalArrows,
			practiceType: 'TRENING', // Add practiceType for frontend
		};

		return NextResponse.json(
			{ practice: mappedPractice },
			{
				headers: {
					// In development, don't cache. In production, cache for 10 seconds.
					'Cache-Control':
						process.env.NODE_ENV === 'development' ? 'no-store, no-cache, must-revalidate' : 'private, max-age=10, must-revalidate',
				},
			}
		);
	} catch (error) {
		return NextResponse.json({ error: 'Failed to fetch practice details' }, { status: 500 });
	}
}
