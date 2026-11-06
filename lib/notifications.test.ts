import { createNotification, sendExpoPush } from './notifications';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    notification: { create: jest.fn() },
    user: { findUnique: jest.fn() },
  },
}));

const mockedPrisma = prisma as unknown as {
  notification: { create: jest.Mock };
  user: { findUnique: jest.Mock };
};

const input = {
  userId: 'user-1',
  type: 'CHALLENGE_RECEIVED' as const,
  title: 'Ny utfordring',
  message: 'Haakon har utfordret deg',
  challengeId: 'challenge-1',
};

describe('createNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as jest.Mock;
  });

  it('persists the notification with the challenge reference', async () => {
    mockedPrisma.notification.create.mockResolvedValue({ id: 'n1', ...input });
    mockedPrisma.user.findUnique.mockResolvedValue({ pushToken: null });

    const result = await createNotification(input);

    expect(mockedPrisma.notification.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        type: 'CHALLENGE_RECEIVED',
        title: 'Ny utfordring',
        message: 'Haakon har utfordret deg',
        challengeId: 'challenge-1',
      },
    });
    expect(result).toMatchObject({ id: 'n1' });
  });

  it('sends an Expo push when the user has a registered token', async () => {
    mockedPrisma.notification.create.mockResolvedValue({ id: 'n1', ...input });
    mockedPrisma.user.findUnique.mockResolvedValue({ pushToken: 'ExponentPushToken[abc123]' });

    await createNotification(input);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://exp.host/--/api/v2/push/send',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('ExponentPushToken[abc123]'),
      })
    );
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body).toMatchObject({
      to: 'ExponentPushToken[abc123]',
      title: 'Ny utfordring',
      body: 'Haakon har utfordret deg',
      sound: 'default',
      data: { type: 'CHALLENGE_RECEIVED', challengeId: 'challenge-1' },
    });
  });

  it('skips the push when the user has no token', async () => {
    mockedPrisma.notification.create.mockResolvedValue({ id: 'n1', ...input });
    mockedPrisma.user.findUnique.mockResolvedValue({ pushToken: null });

    await createNotification(input);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('still returns the notification when the push fails', async () => {
    mockedPrisma.notification.create.mockResolvedValue({ id: 'n1', ...input });
    mockedPrisma.user.findUnique.mockResolvedValue({ pushToken: 'ExponentPushToken[abc123]' });
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network down'));

    const result = await createNotification(input);

    expect(result).toMatchObject({ id: 'n1' });
  });

  it('returns null instead of throwing when persistence fails', async () => {
    mockedPrisma.notification.create.mockRejectedValue(new Error('db down'));

    await expect(createNotification(input)).resolves.toBeNull();
  });
});

describe('sendExpoPush', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as jest.Mock;
  });

  it('returns true when Expo accepts the message', async () => {
    await expect(
      sendExpoPush('ExponentPushToken[x]', { title: 't', message: 'm', type: 'CHALLENGE_SENT' })
    ).resolves.toBe(true);
  });

  it('returns false when Expo responds with an error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 400, text: async () => 'bad token' });

    await expect(
      sendExpoPush('ExponentPushToken[bad]', { title: 't', message: 'm', type: 'CHALLENGE_SENT' })
    ).resolves.toBe(false);
  });
});
