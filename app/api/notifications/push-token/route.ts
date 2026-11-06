import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { pushTokenSchema } from '@/lib/validations/notification';
import { formatZodErrors } from '@/lib/validations/helpers';

/**
 * POST /api/notifications/push-token
 * Register the device's Expo push token for the current user.
 * Body: { "token": "ExponentPushToken[...]" }
 *
 * Called by the mobile app after login and whenever the token rotates.
 * Used to deliver push notifications (e.g. challenge invites).
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = pushTokenSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', fieldErrors: formatZodErrors(validation.error) },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { pushToken: validation.data.token },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving push token:', error);
    return NextResponse.json({ error: 'Failed to save push token' }, { status: 500 });
  }
}

/**
 * DELETE /api/notifications/push-token
 * Remove the registered push token (e.g. on logout).
 */
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { pushToken: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing push token:', error);
    return NextResponse.json({ error: 'Failed to remove push token' }, { status: 500 });
  }
}
