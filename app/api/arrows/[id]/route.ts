import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';

async function getCurrentUser() {
	try {
		const reqHeaders = await headers();
		const headerObj: Record<string, string> = {};
		for (const [key, value] of reqHeaders) {
			headerObj[key] = value;
		}
		const session = await auth.api.getSession({ headers: headerObj });
		return session?.user || null;
	} catch {
		return null;
	}
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;
		const { name, material } = await request.json();

		if (!name || !material) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const existing = await prisma.arrows.findFirst({
			where: { id, userId: user.id },
		});
		if (!existing) {
			return NextResponse.json({ error: 'Not found' }, { status: 404 });
		}

		const arrows = await prisma.arrows.update({
			where: { id },
			data: {
				name,
				material,
			},
		});

		return NextResponse.json({ arrows });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'arrows', method: 'PATCH' },
			extra: { message: 'Error updating arrows' },
		});
		console.error('Error updating arrows:', error);
		return NextResponse.json({ error: 'Failed to update arrows' }, { status: 500 });
	}
}
