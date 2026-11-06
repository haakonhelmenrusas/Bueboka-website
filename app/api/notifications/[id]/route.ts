import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { updateNotificationSchema } from '@/lib/validations/notification';
import { formatZodErrors } from '@/lib/validations/helpers';

/**
 * Fetch a notification only if it belongs to the given user.
 * Returns null otherwise — callers respond 404 (not 403) so the existence
 * of other users' notifications is not revealed.
 */
async function getOwnedNotification(id: string, userId: string) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) {
    return null;
  }
  return notification;
}

/**
 * PATCH /api/notifications/:id
 * Mark a single notification as read/unread. Body: { "read": boolean }
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const validation = updateNotificationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', fieldErrors: formatZodErrors(validation.error) },
        { status: 400 }
      );
    }

    const existing = await getOwnedNotification(id, user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: validation.data.read },
    });

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

/**
 * DELETE /api/notifications/:id
 * Delete one of the current user's notifications.
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await getOwnedNotification(id, user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    await prisma.notification.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
