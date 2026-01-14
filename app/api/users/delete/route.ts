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

		await prisma.$transaction(async (tx) => {
			// Collect practice IDs for this user
			const practices = await tx.practice.findMany({
				where: { userId: user.id },
				select: { id: true },
			});
			const practiceIds = practices.map((p) => p.id);

			// Delete ends for user's practices
			if (practiceIds.length > 0) {
				await tx.end.deleteMany({ where: { practiceId: { in: practiceIds } } });
			}

			// Delete practices
			await tx.practice.deleteMany({ where: { userId: user.id } });

			// Delete equipment
			await tx.bow.deleteMany({ where: { userId: user.id } });
			await tx.arrows.deleteMany({ where: { userId: user.id } });

			// Auth-related
			await tx.account.deleteMany({ where: { userId: user.id } });
			await tx.session.deleteMany({ where: { userId: user.id } });

			// Verifications may exist without FK, but if you store identifier as email, clean those too
			await tx.verification.deleteMany({ where: { identifier: user.email } });

			// Finally delete user
			await tx.user.delete({ where: { id: user.id } });
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
