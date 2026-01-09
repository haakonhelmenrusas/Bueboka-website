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
		Sentry.captureException(error, { tags: { endpoint: 'practices', where: 'getCurrentUser' } });
		return null;
	}
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const { id } = await params;
		if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

		const existing = await prisma.practice.findFirst({
			where: { id, userId: user.id },
			select: { id: true },
		});
		if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

		// Delete children first to avoid FK constraint errors
		await prisma.$transaction([prisma.end.deleteMany({ where: { practiceId: id } }), prisma.practice.delete({ where: { id } })]);
		return NextResponse.json({ ok: true });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'practices', method: 'DELETE' },
			extra: { message: 'Error deleting practice' },
		});
		return NextResponse.json({ error: 'Failed to delete practice' }, { status: 500 });
	}
}
