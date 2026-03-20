import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

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

			// Delete competitions
			await tx.competition.deleteMany({ where: { userId: user.id } });

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
		return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
	}
}
