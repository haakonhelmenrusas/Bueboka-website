import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

/**
 * PATCH /api/challenges/:id/accept
 * Accept a challenge (only challenged user can accept)
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

    // Verify user is the challenged user (only they can accept)
    if (existingChallenge.challengedId !== user.id) {
      return NextResponse.json({ error: 'Only the challenged user can accept this challenge' }, { status: 403 });
    }

    // Prevent accepting if not pending
    if (existingChallenge.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'This challenge can no longer be accepted' },
        { status: 400 }
      );
    }

    const challenge = await prisma.challenge.update({
      where: { id },
      data: { status: 'ACCEPTED' },
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

    // Note: In a production app, you would send notifications here
    // to both users that the challenge has been accepted

    return NextResponse.json({ challenge });
  } catch (error) {
    console.error('Error accepting challenge:', error);
    return NextResponse.json({ error: 'Failed to accept challenge' }, { status: 500 });
  }
}
