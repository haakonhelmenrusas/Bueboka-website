import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAlmostUnlockedAchievements, getNewlyUnlockedAchievements } from '@/lib/achievements/checker';

async function getCurrentUser() {
	try {
		const reqHeaders = await headers();
		const headerObj: Record<string, string> = {};
		for (const [key, value] of reqHeaders) headerObj[key] = value;
		const session = await auth.api.getSession({ headers: headerObj });
		return session?.user || null;
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'achievements/check', where: 'getCurrentUser' } });
		return null;
	}
}

/**
 * POST /api/achievements/check
 * Check for newly unlocked achievements after a practice is saved
 * Body: { practiceId?: string } (optional - if omitted, checks all practices)
 */
export async function POST(request: Request) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Fetch all user's practices with ends
		const practices = await prisma.practice.findMany({
			where: { userId: user.id },
			include: {
				ends: {
					select: {
						arrows: true,
						scores: true,
						roundScore: true,
					},
				},
			},
			orderBy: { date: 'desc' },
		});

		// Fetch currently unlocked achievements in database
		const existingAchievements = await prisma.userAchievement.findMany({
			where: { userId: user.id },
			select: {
				achievementId: true,
			},
		});

		const existingAchievementIds = existingAchievements.map((a) => a.achievementId);

		// Check what achievements should be unlocked based on current practice data
		const newlyUnlocked = getNewlyUnlockedAchievements(practices, existingAchievementIds);

		// These are truly NEW - they weren't in the database before
		const justUnlockedIds = newlyUnlocked.map((a) => a.id);

		// Save newly unlocked achievements to database
		if (justUnlockedIds.length > 0) {
			await prisma.userAchievement.createMany({
				data: justUnlockedIds.map((achievementId) => ({
					userId: user.id,
					achievementId,
					progress: 100,
					notified: true, // Mark as notified immediately since we're showing the modal
				})),
				skipDuplicates: true,
			});
		}

		// Get achievements that are close to being unlocked (80%+)
		const allUnlockedIds = [...existingAchievementIds, ...justUnlockedIds];
		const almostUnlocked = getAlmostUnlockedAchievements(practices, allUnlockedIds);

		return NextResponse.json({
			newAchievements: newlyUnlocked, // Only the ones that were just unlocked
			almostThere: almostUnlocked,
			totalNewlyUnlocked: newlyUnlocked.length,
		});
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'achievements/check', method: 'POST' },
			extra: { message: 'Error checking achievements' },
		});

		return NextResponse.json(
			{
				error: 'Failed to check achievements',
			},
			{ status: 500 }
		);
	}
}
