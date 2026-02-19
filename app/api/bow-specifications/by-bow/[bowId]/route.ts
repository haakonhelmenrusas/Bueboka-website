import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
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
		Sentry.captureException(error, { tags: { endpoint: 'bow-specifications/by-bow', where: 'getCurrentUser' } });
		return null;
	}
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ bowId: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const { bowId } = await params;

		// First, verify the bow belongs to the user
		const bow = await prisma.bow.findFirst({
			where: { id: bowId, userId: user.id },
		});

		if (!bow) {
			return NextResponse.json({ error: 'Bow not found' }, { status: 404 });
		}

		// Try to find existing specification
		let spec = await prisma.bowSpecification.findFirst({
			where: { userId: user.id, bowId },
			include: { bow: true },
		});

		// If no specification exists, create one
		if (!spec) {
			spec = await prisma.bowSpecification.create({
				data: {
					userId: user.id,
					bowId,
				},
				include: { bow: true },
			});
		}

		return NextResponse.json({ bowSpecification: spec });
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'bow-specifications/by-bow', method: 'GET' } });
		return NextResponse.json({ error: 'Failed to fetch or create bow specification' }, { status: 500 });
	}
}
