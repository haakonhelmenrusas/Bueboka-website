import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { createNotification } from '@/lib/notifications';

/**
 * PATCH /api/challenges/:id/decline
 * Decline a challenge (only challenged user can decline)
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get existing challenge
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id },
    });

    if (!existingChallenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Verify user is the challenged user (only they can decline)
    if (existingChallenge.challengedId !== user.id) {
      return NextResponse.json({ error: 'Only the challenged user can decline this challenge' }, { status: 403 });
    }

    // Prevent declining if not pending
    if (existingChallenge.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'This challenge can no longer be declined' },
        { status: 400 }
      );
    }

    const challenge = await prisma.challenge.update({
      where: { id },
      data: { status: 'DECLINED' },
      include: {
        challenger: {
          select: {
            id: true,
            name: true,
          },
        },
        challenged: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Notify the challenger that their challenge was declined
    await createNotification({
      userId: challenge.challengerId,
      type: 'CHALLENGE_DECLINED',
      title: 'Utfordring avslått',
      message: `${challenge.challenged.name || 'Motstanderen din'} avslo utfordringen «${challenge.name}»`,
      challengeId: challenge.id,
    });

    return NextResponse.json({ challenge });
  } catch (error) {
    console.error('Error declining challenge:', error);
    return NextResponse.json({ error: 'Failed to decline challenge' }, { status: 500 });
  }
}
