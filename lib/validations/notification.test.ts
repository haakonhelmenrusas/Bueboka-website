import { pushTokenSchema, updateNotificationSchema } from './notification';

describe('pushTokenSchema', () => {
  it('accepts a classic ExponentPushToken', () => {
    const result = pushTokenSchema.safeParse({ token: 'ExponentPushToken[abcdef123456]' });
    expect(result.success).toBe(true);
  });

  it('accepts a newer ExpoPushToken', () => {
    const result = pushTokenSchema.safeParse({ token: 'ExpoPushToken[abcdef123456]' });
    expect(result.success).toBe(true);
  });

  it('rejects tokens without the Expo wrapper', () => {
    expect(pushTokenSchema.safeParse({ token: 'abcdef123456' }).success).toBe(false);
    expect(pushTokenSchema.safeParse({ token: '' }).success).toBe(false);
    expect(pushTokenSchema.safeParse({}).success).toBe(false);
  });
});

describe('updateNotificationSchema', () => {
  it('requires a boolean read flag', () => {
    expect(updateNotificationSchema.safeParse({ read: true }).success).toBe(true);
    expect(updateNotificationSchema.safeParse({ read: 'yes' }).success).toBe(false);
    expect(updateNotificationSchema.safeParse({}).success).toBe(false);
  });
});
