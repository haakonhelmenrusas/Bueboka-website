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
		Sentry.captureException(error, { tags: { endpoint: 'users/delete', where: 'getCurrentUser' } });
		return null;
	}
}

export async function DELETE() {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Delete user and all related data (cascading deletes are configured in schema)
		await prisma.user.delete({
			where: { id: user.id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'users/delete', method: 'DELETE' },
			extra: { message: 'Error deleting user account' },
		});
		return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
	}
}
