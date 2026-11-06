import { z } from 'zod';

// Expo push tokens look like ExponentPushToken[...] (or ExpoPushToken[...] on newer SDKs)
export const pushTokenSchema = z.object({
  token: z
    .string()
    .min(10, 'Push-token er for kort')
    .max(200, 'Push-token er for langt')
    .regex(/^(ExponentPushToken|ExpoPushToken)\[.+\]$/, 'Ugyldig format på push-token'),
});

export const updateNotificationSchema = z.object({
  read: z.boolean(),
});

export type PushTokenInput = z.infer<typeof pushTokenSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;
