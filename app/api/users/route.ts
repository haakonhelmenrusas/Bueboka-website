import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

async function getCurrentUser() {
	try {
		const reqHeaders = await headers();
		const headerObj: Record<string, string> = {};
		for (const [key, value] of reqHeaders) {
			headerObj[key] = value;
		}
		const session = await auth.api.getSession({ headers: headerObj });
		return session?.user || null;
	} catch (error) {
		Sentry.captureException(error);
		return null;
	}
}

export async function GET() {
	try {
		const user = await getCurrentUser();
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
			},
		});

		return NextResponse.json({ users });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'users', method: 'GET' },
			extra: { message: 'Error fetching users' },
		});
		return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
		}

		const { club, name } = await request.json();

		const updatedUser = await prisma.user.update({
			where: { id: user.id },
			data: {
				...(club !== undefined && { club }),
				...(name !== undefined && { name }),
			},
		});

		return NextResponse.json({ user: updatedUser });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'users', method: 'PATCH' },
			extra: { message: 'Error updating user' },
		});
		return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
	}
}
