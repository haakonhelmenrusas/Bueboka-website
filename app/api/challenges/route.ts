import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import {
  createChallengeSchema,
  updateChallengeSchema,
  getChallengesQuerySchema,
  submitChallengeResultSchema,
} from '@/lib/validations/challenge';
import { formatZodErrors } from '@/lib/validations/helpers';

/**
 * GET /api/challenges
 * Fetch all challenges for the current user with optional filtering and pagination
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = {
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      userId: searchParams.get('userId') ?? undefined,
    };

    const validation = getChallengesQuerySchema.safeParse(query);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          fieldErrors: formatZodErrors(validation.error),
        },
        { status: 400 }
      );
    }

    const { page, pageSize, status, userId } = validation.data;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {
      OR: [
        { challengerId: user.id },
        { challengedId: user.id },
      ],
    };

    // If userId is provided and matches current user, use it
    // Otherwise, filter by current user
    if (userId && userId !== user.id) {
      // Admins can view other users' challenges
      where.OR = [
        { challengerId: userId },
        { challengedId: userId },
      ];
    }

    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    // Fetch challenges with pagination
    const challenges = await prisma.challenge.findMany({
      where,
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    });

    // Get total count for pagination
    const total = await prisma.challenge.count({ where });

    // Transform to list items format
    const challengeListItems = challenges.map((challenge) => ({
      id: challenge.id,
      challengerId: challenge.challengerId,
      challengedId: challenge.challengedId,
      name: challenge.name,
      status: challenge.status,
      challengerName: challenge.challenger?.name || null,
      challengedName: challenge.challenged?.name || null,
      challengerScore: challenge.challengerScore,
      challengedScore: challenge.challengedScore,
      winnerId: challenge.winnerId,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    }));

    return NextResponse.json({
      challenges: challengeListItems,
      page,
      pageSize,
      total,
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}

/**
 * POST /api/challenges
 * Create a new challenge
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validation = createChallengeSchema.safeParse(body);
    if (!validation.success) {
      console.error('Validation failed:', validation.error);
      return NextResponse.json(
        {
          error: 'Validation error',
          fieldErrors: formatZodErrors(validation.error),
        },
        { status: 400 }
      );
    }

    const { challengedId, name, description, roundTypeId, customRules, startDate, endDate } = validation.data;

    // Verify challenged user exists
    const challengedUser = await prisma.user.findUnique({
      where: { id: challengedId },
    });

    if (!challengedUser) {
      return NextResponse.json(
        { error: 'Challenged user not found', field: 'challengedId' },
        { status: 400 }
      );
    }

    // Create the challenge
    const challenge = await prisma.challenge.create({
      data: {
        challengerId: user.id,
        challengedId,
        name: name.trim(),
        description: description?.trim() || null,
        roundTypeId: roundTypeId || null,
        customRules: customRules || undefined,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: 'PENDING',
      },
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

    // Note: In a production app, you would send a notification here
    // to the challenged user (email, push notification, etc.)

    return NextResponse.json({ challenge }, { status: 201 });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
  }
}
