import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getCurrentUser() {
	try {
		const reqHeaders = await headers();
		const headerObj: Record<string, string> = {};
		for (const [key, value] of reqHeaders) headerObj[key] = value;
		const session = await auth.api.getSession({ headers: headerObj });
		return session?.user || null;
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'practices/[id]/details', where: 'getCurrentUser' } });
		return null;
	}
}

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

		// Map totalScore to arrowsShot for frontend compatibility
		const mappedPractice = {
			...practice,
			arrowsShot: practice.totalScore,
		};

		return NextResponse.json({ practice: mappedPractice });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'practices/[id]/details', method: 'GET' },
			extra: { message: 'Error fetching practice details' },
		});
		return NextResponse.json({ error: 'Failed to fetch practice details' }, { status: 500 });
	}
}
