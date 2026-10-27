import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { updateChallengeSchema } from '@/lib/validations/challenge';
import { formatZodErrors } from '@/lib/validations/helpers';

/**
 * GET /api/challenges/:id
 * Get a specific challenge by ID
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        challenger: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        challenged: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        winner: {
          select: {
            id: true,
            name: true,
          },
        },
        roundType: {
          select: {
            id: true,
            name: true,
            distanceMeters: true,
            targetType: true,
            numberArrows: true,
          },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Verify user has access to this challenge
    if (challenge.challengerId !== user.id && challenge.challengedId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ challenge });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    return NextResponse.json({ error: 'Failed to fetch challenge' }, { status: 500 });
  }
}

/**
 * PATCH /api/challenges/:id
 * Update a challenge (only challenger can update)
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateChallengeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          fieldErrors: formatZodErrors(validation.error),
        },
        { status: 400 }
      );
    }

    // Get existing challenge
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id },
    });

    if (!existingChallenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Verify user is the challenger (only challenger can update)
    if (existingChallenge.challengerId !== user.id) {
      return NextResponse.json({ error: 'Only the challenger can update this challenge' }, { status: 403 });
    }

    // Prevent updating if already accepted or completed
    if (existingChallenge.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot update a challenge that has already been responded to' },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // Create payload and remove undefined values
    const payload: any = { ...updateData };
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    const challenge = await prisma.challenge.update({
      where: { id },
      data: payload,
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
        roundType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ challenge });
  } catch (error) {
    console.error('Error updating challenge:', error);
    return NextResponse.json({ error: 'Failed to update challenge' }, { status: 500 });
  }
}

/**
 * DELETE /api/challenges/:id
 * Delete a challenge (only challenger can delete, before accepted)
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    // Verify user is the challenger (only challenger can delete)
    if (existingChallenge.challengerId !== user.id) {
      return NextResponse.json({ error: 'Only the challenger can delete this challenge' }, { status: 403 });
    }

    // Prevent deleting if already accepted or completed
    if (existingChallenge.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot delete a challenge that has already been responded to' },
        { status: 400 }
      );
    }

    await prisma.challenge.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    return NextResponse.json({ error: 'Failed to delete challenge' }, { status: 500 });
  }
}
