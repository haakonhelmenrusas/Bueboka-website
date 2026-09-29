import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { submitChallengeResultSchema } from '@/lib/validations/challenge';
import { formatZodErrors } from '@/lib/validations/helpers';

/**
 * POST /api/challenges/:id/submit
 * Submit results for a challenge
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = submitChallengeResultSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          fieldErrors: formatZodErrors(validation.error),
        },
        { status: 400 }
      );
    }

    const { score, totalArrows } = validation.data;

    // Get existing challenge
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        challenger: { select: { id: true } },
        challenged: { select: { id: true } },
      },
    });

    if (!existingChallenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Verify user is part of this challenge
    if (existingChallenge.challengerId !== user.id && existingChallenge.challengedId !== user.id) {
      return NextResponse.json({ error: 'You are not part of this challenge' }, { status: 403 });
    }

    // Verify challenge is accepted
    if (existingChallenge.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Challenge must be accepted before submitting results' },
        { status: 400 }
      );
    }

    // Check if user has already submitted
    const isChallenger = existingChallenge.challengerId === user.id;
    if (isChallenger && existingChallenge.challengerSubmittedAt) {
      return NextResponse.json(
        { error: 'You have already submitted results for this challenge' },
        { status: 400 }
      );
    }

    if (!isChallenger && existingChallenge.challengedSubmittedAt) {
      return NextResponse.json(
        { error: 'You have already submitted results for this challenge' },
        { status: 400 }
      );
    }

    // Update the challenge with the user's score
    const updateField = isChallenger ? 'challengerScore' : 'challengedScore';
    const totalArrowsField = isChallenger ? 'challengerTotalArrows' : 'challengedTotalArrows';
    const submittedAtField = isChallenger ? 'challengerSubmittedAt' : 'challengedSubmittedAt';

    const updateData: any = {
      [updateField]: score,
      [submittedAtField]: new Date(),
    };

    if (totalArrows !== undefined) {
      updateData[totalArrowsField] = totalArrows;
    }

    // Check if both users have submitted
    const updatedChallenge = await prisma.challenge.update({
      where: { id },
      data: updateData,
      include: {
        challenger: { select: { id: true, name: true } },
        challenged: { select: { id: true, name: true } },
      },
    });

    // If both users have submitted, determine the winner and mark as completed
    if (updatedChallenge.challengerSubmittedAt && updatedChallenge.challengedSubmittedAt) {
      // Determine winner
      let winnerId: string | null = null;
      
      if (updatedChallenge.challengerScore && updatedChallenge.challengedScore) {
        if (updatedChallenge.challengerScore > updatedChallenge.challengedScore) {
          winnerId = updatedChallenge.challengerId;
        } else if (updatedChallenge.challengerScore < updatedChallenge.challengedScore) {
          winnerId = updatedChallenge.challengedId;
        }
        // If equal scores, it's a tie - no winner
      }

      // Update challenge status and winner
      const completedChallenge = await prisma.challenge.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          winnerId,
        },
        include: {
          challenger: { select: { id: true, name: true } },
          challenged: { select: { id: true, name: true } },
          winner: { select: { id: true, name: true } },
        },
      });

      // Note: In a production app, you would send notifications here
      // to both users with the final results

      return NextResponse.json({ challenge: completedChallenge });
    }

    return NextResponse.json({ challenge: updatedChallenge });
  } catch (error) {
    console.error('Error submitting challenge result:', error);
    return NextResponse.json({ error: 'Failed to submit challenge result' }, { status: 500 });
  }
}
