import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { prisma } from '@/lib/prisma';
import { checkAllAchievements } from '@/lib/achievements/checker';
import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/achievements
 * Returns all achievements with user's progress
 */
export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Fetch user's practices and competitions
		const [practices, competitions] = await Promise.all([
			prisma.practice.findMany({
				where: { userId: user.id },
				include: {
					ends: {
						select: {
							arrows: true,
							scores: true,
							roundScore: true,
						},
					},
					bow: {
						select: {
							type: true,
						},
					},
				},
				orderBy: { date: 'desc' },
			}),
			prisma.competition.findMany({
				where: { userId: user.id },
				include: {
					rounds: {
						select: {
							arrows: true,
							scores: true,
							roundScore: true,
						},
					},
					bow: {
						select: {
							type: true,
						},
					},
				},
				orderBy: { date: 'desc' },
			}),
		]);

		// Transform practices to ensure arrows field has default value
		const practicesWithDefaults = practices.map((practice) => ({
			...practice,
			practiceType: 'TRENING',
			ends: practice.ends.map((end) => ({
				arrows: end.arrows || 0,
				scores: end.scores,
				roundScore: end.roundScore,
			})),
		}));

		// Transform competitions to practice-like format for achievement checking
		const competitionsAsPractices = competitions.map((comp) => ({
			...comp,
			practiceType: 'KONKURRANSE',
			practiceCategory: comp.practiceCategory,
			ends: comp.rounds.map((round) => ({
				arrows: round.arrows || 0,
				scores: round.scores,
				roundScore: round.roundScore,
			})),
		}));

		// Merge practices and competitions
		const allActivities = [...practicesWithDefaults, ...(competitionsAsPractices as any)];

		// Fetch user's unlocked achievements
		const unlockedAchievements = await prisma.userAchievement.findMany({
			where: { userId: user.id },
			select: {
				achievementId: true,
				unlockedAt: true,
				progress: true,
			},
		});

		const unlockedIds = unlockedAchievements.map((a) => a.achievementId);

		// Check all achievements and calculate progress
		// Pass autoUnlock=false so achievements are only marked as unlocked if they're in the database
		const achievementProgress = checkAllAchievements(allActivities, unlockedIds, false);

		// Merge with unlock timestamps
		const achievementsWithData = achievementProgress.map((progress) => {
			const unlockData = unlockedAchievements.find((u) => u.achievementId === progress.achievement.id);
			return {
				...progress,
				unlockedAt: unlockData?.unlockedAt || null,
			};
		});

		// Calculate summary statistics based on actual unlocked achievements
		const actuallyUnlocked = achievementsWithData.filter((a) => a.isUnlocked);

		const summary = {
			totalUnlocked: actuallyUnlocked.length,
			totalPoints: actuallyUnlocked.reduce((sum, a) => sum + a.achievement.points, 0),
			totalAchievements: achievementProgress.length,
			completionPercentage: Math.round((actuallyUnlocked.length / achievementProgress.length) * 100),
		};

		return NextResponse.json(
			{
				achievements: achievementsWithData,
				summary,
			},
			{
				headers: {
					'Cache-Control': 'private, max-age=60, must-revalidate',
				},
			}
		);
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'achievements', method: 'GET' },
			extra: { message: 'Error fetching achievements' },
		});

		return NextResponse.json(
			{
				error: 'Failed to fetch achievements',
			},
			{ status: 500 }
		);
	}
}
