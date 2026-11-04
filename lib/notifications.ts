import { prisma } from '@/lib/prisma';
import type { NotificationType } from '@/prisma/prisma/generated/prisma-client/client';

export interface CreateNotificationInput {
  /** Recipient user id */
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  challengeId?: string;
}

const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';

interface PushPayload {
  title: string;
  message: string;
  type: NotificationType;
  challengeId?: string | null;
}

/**
 * Send a push notification through the Expo Push API.
 * Best-effort: logs and returns false on failure — a push failure must
 * never fail the API request that triggered the notification.
 */
export async function sendExpoPush(pushToken: string, payload: PushPayload): Promise<boolean> {
  try {
    const response = await fetch(EXPO_PUSH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        title: payload.title,
        body: payload.message,
        data: { type: payload.type, challengeId: payload.challengeId ?? null },
        sound: 'default',
      }),
    });

    if (!response.ok) {
      console.error('[notifications] Expo push rejected:', response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('[notifications] Failed to send Expo push:', error);
    return false;
  }
}

/**
 * Persist a notification for a user and push it to their registered Expo
 * device token if they have one. Never throws — callers can await it
 * inline without guarding the surrounding request.
 */
export async function createNotification(input: CreateNotificationInput) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        challengeId: input.challengeId ?? null,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { pushToken: true },
    });

    if (user?.pushToken) {
      await sendExpoPush(user.pushToken, notification);
    }

    return notification;
  } catch (error) {
    console.error('[notifications] Failed to create notification:', error);
    return null;
  }
}
