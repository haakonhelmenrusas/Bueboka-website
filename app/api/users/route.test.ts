/**
 * @jest-environment node
 *
 * Tests for PATCH /api/users avatar handling: data URIs are stored as files
 * and only the URL is kept on the user row.
 */
import { PATCH } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { saveAvatar, deleteAvatar } from '@/lib/avatarStorage';

jest.mock('@/lib/prisma', () => ({
	prisma: { user: { update: jest.fn() } },
}));

jest.mock('@/lib/session', () => ({
	getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/cache', () => ({
	userProfileCache: { delete: jest.fn() },
}));

jest.mock('@/lib/avatarStorage', () => ({
	isAvatarDataUri: (v: unknown) => typeof v === 'string' && v.startsWith('data:image/'),
	saveAvatar: jest.fn(),
	deleteAvatar: jest.fn(),
}));

const mockGetCurrentUser = getCurrentUser as jest.Mock;
const mockUpdate = prisma.user.update as jest.Mock;
const mockSaveAvatar = saveAvatar as jest.Mock;
const mockDeleteAvatar = deleteAvatar as jest.Mock;

const authedUser = { id: 'u1', email: 'a@b.c', name: 'Kari', image: null };

function patchRequest(body: unknown): NextRequest {
	return new NextRequest('http://localhost/api/users', {
		method: 'PATCH',
		body: JSON.stringify(body),
		headers: { 'content-type': 'application/json' },
	});
}

describe('PATCH /api/users avatar handling', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetCurrentUser.mockResolvedValue(authedUser);
		mockUpdate.mockImplementation(({ data }: any) => Promise.resolve({ id: 'u1', ...data }));
		mockSaveAvatar.mockResolvedValue('/api/avatar/u1?v=123');
	});

	it('stores a data-URI avatar as a file and saves the URL', async () => {
		const res = await PATCH(patchRequest({ image: 'data:image/png;base64,AAAA' }));
		expect(res.status).toBe(200);
		expect(mockSaveAvatar).toHaveBeenCalledWith('u1', 'data:image/png;base64,AAAA');
		expect(mockUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ image: '/api/avatar/u1?v=123' }),
			}),
		);
		expect(mockDeleteAvatar).not.toHaveBeenCalled();
	});

	it('keeps external image URLs as-is without touching file storage', async () => {
		const res = await PATCH(patchRequest({ image: 'https://cdn.example.com/me.jpg' }));
		expect(res.status).toBe(200);
		expect(mockSaveAvatar).not.toHaveBeenCalled();
		expect(mockUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ image: 'https://cdn.example.com/me.jpg' }),
			}),
		);
	});

	it('deletes the avatar file when image is null', async () => {
		const res = await PATCH(patchRequest({ image: null }));
		expect(res.status).toBe(200);
		expect(mockDeleteAvatar).toHaveBeenCalledWith('u1');
		expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ image: null }) }));
	});

	it('migrates a legacy data-URI avatar to file storage on unrelated updates', async () => {
		mockGetCurrentUser.mockResolvedValue({ ...authedUser, image: 'data:image/jpeg;base64,BBBB' });
		const res = await PATCH(patchRequest({ name: 'Nytt navn' }));
		expect(res.status).toBe(200);
		expect(mockSaveAvatar).toHaveBeenCalledWith('u1', 'data:image/jpeg;base64,BBBB');
		expect(mockUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ name: 'Nytt navn', image: '/api/avatar/u1?v=123' }),
			}),
		);
	});

	it('returns 400 when the image data is invalid', async () => {
		mockSaveAvatar.mockRejectedValue(new Error('Invalid image data URI'));
		const res = await PATCH(patchRequest({ image: 'data:image/png;base64,%%%' }));
		expect(res.status).toBe(400);
		expect(mockUpdate).not.toHaveBeenCalled();
	});

	it('requires authentication', async () => {
		mockGetCurrentUser.mockResolvedValue(null);
		const res = await PATCH(patchRequest({ image: null }));
		expect(res.status).toBe(401);
	});
});
