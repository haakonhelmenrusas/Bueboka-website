import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/challenges/statistics
 * Get challenge statistics for the current user
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all challenges where user is either challenger or challenged
    const challenges = await prisma.challenge.findMany({
      where: {
        OR: [
          { challengerId: user.id },
          { challengedId: user.id },
        ],
      },
    });

    // Calculate statistics
    let totalChallenges = 0;
    let wins = 0;
    let losses = 0;
    let pendingChallenges = 0;
    let completedChallenges = 0;

    challenges.forEach((challenge) => {
      totalChallenges++;

      switch (challenge.status) {
        case 'PENDING':
          pendingChallenges++;
          break;
        case 'COMPLETED':
          completedChallenges++;
          // Check if this user won
          if (challenge.winnerId === user.id) {
            wins++;
          } else if (challenge.winnerId && challenge.winnerId !== user.id) {
            losses++;
          }
          // If no winner (tie), don't count as win or loss
          break;
        case 'ACCEPTED':
          // Accepted but not yet completed - count as pending for stats
          pendingChallenges++;
          break;
      }
    });

    // Calculate win rate (avoid division by zero)
    const completedWithResult = wins + losses;
    const winRate = completedWithResult > 0 ? wins / completedWithResult : 0;

    return NextResponse.json({
      totalChallenges,
      wins,
      losses,
      winRate: Math.round(winRate * 100) / 100, // Round to 2 decimal places
      pendingChallenges,
      completedChallenges,
    });
  } catch (error) {
    console.error('Error fetching challenge statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch challenge statistics' }, { status: 500 });
  }
}
