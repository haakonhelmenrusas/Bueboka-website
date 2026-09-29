import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

/**
 * PATCH /api/challenges/:id/cancel
 * Cancel a challenge (only challenger can cancel, before accepted)
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

    // Verify user is the challenger (only they can cancel)
    if (existingChallenge.challengerId !== user.id) {
      return NextResponse.json({ error: 'Only the challenger can cancel this challenge' }, { status: 403 });
    }

    // Prevent cancelling if already accepted or completed
    if (existingChallenge.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot cancel a challenge that has already been responded to' },
        { status: 400 }
      );
    }

    const challenge = await prisma.challenge.update({
      where: { id },
      data: { status: 'CANCELLED' },
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

    // Note: In a production app, you would send a notification here
    // to the challenged user that the challenge was cancelled

    return NextResponse.json({ challenge });
  } catch (error) {
    console.error('Error cancelling challenge:', error);
    return NextResponse.json({ error: 'Failed to cancel challenge' }, { status: 500 });
  }
}
