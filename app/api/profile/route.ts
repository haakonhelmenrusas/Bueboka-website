import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

async function getCurrentUser() {
	try {
		const reqHeaders = await headers();
		const headerObj: Record<string, string> = {};
		for (const [key, value] of reqHeaders) headerObj[key] = value;
		const session = await auth.api.getSession({ headers: headerObj });
		return session?.user || null;
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'profile', where: 'getCurrentUser' } });
		return null;
	}
}

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const profile = await prisma.user.findUnique({
			where: { id: user.id },
			select: {
				id: true,
				email: true,
				name: true,
				club: true,
				image: true,
			},
		});

		return NextResponse.json({ profile });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'profile', method: 'GET' },
			extra: { message: 'Error fetching profile' },
		});
		return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
	}
}
