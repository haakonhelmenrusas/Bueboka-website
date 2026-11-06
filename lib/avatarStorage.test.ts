import { saveAvatar, deleteAvatar, getAvatarBlob, isAvatarDataUri, avatarUrl } from './avatarStorage';

const mockSet = jest.fn();
const mockDelete = jest.fn();
const mockGetWithMetadata = jest.fn();

jest.mock('@netlify/blobs', () => ({
	getStore: jest.fn(() => ({
		set: mockSet,
		delete: mockDelete,
		getWithMetadata: mockGetWithMetadata,
	})),
}));

jest.mock('sharp', () => {
	const pipeline = {
		resize: jest.fn().mockReturnThis(),
		webp: jest.fn().mockReturnThis(),
		toBuffer: jest.fn().mockResolvedValue(Buffer.from('compressed-webp')),
	};
	return { __esModule: true, default: jest.fn(() => pipeline) };
});

describe('avatarStorage', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('detects data URIs vs URLs', () => {
		expect(isAvatarDataUri('data:image/png;base64,AAAA')).toBe(true);
		expect(isAvatarDataUri('https://example.com/a.jpg')).toBe(false);
		expect(isAvatarDataUri(null)).toBe(false);
	});

	it('builds cache-busted avatar URLs', () => {
		expect(avatarUrl('u1')).toBe('/api/avatar/u1');
		expect(avatarUrl('u1', 123)).toBe('/api/avatar/u1?v=123');
	});

	it('compresses and stores the avatar, returning the public URL', async () => {
		mockSet.mockResolvedValue({ modified: true });
		const url = await saveAvatar('u1', 'data:image/jpeg;base64,' + Buffer.from('raw').toString('base64'));

		expect(mockSet).toHaveBeenCalledWith('u1', expect.any(Blob), { metadata: { contentType: 'image/webp' } });
		expect(url).toMatch(/^\/api\/avatar\/u1\?v=\d+$/);
	});

	it('rejects invalid data URIs', async () => {
		await expect(saveAvatar('u1', 'data:image/jpeg;base64,!!!not-base64!!!')).rejects.toThrow('Invalid image data URI');
		await expect(saveAvatar('u1', 'https://example.com/a.jpg')).rejects.toThrow('Invalid image data URI');
	});

	it('deletes the avatar blob and swallows errors', async () => {
		mockDelete.mockResolvedValue(undefined);
		await deleteAvatar('u1');
		expect(mockDelete).toHaveBeenCalledWith('u1');

		mockDelete.mockRejectedValueOnce(new Error('gone'));
		await expect(deleteAvatar('u1')).resolves.toBeUndefined();
	});

	it('returns the blob with metadata for the serve route', async () => {
		const blob = new Blob(['x'], { type: 'image/webp' });
		mockGetWithMetadata.mockResolvedValue({ data: blob, etag: '"abc"', metadata: { contentType: 'image/webp' } });
		const result = await getAvatarBlob('u1');
		expect(result).toEqual({ blob, contentType: 'image/webp', etag: '"abc"' });

		mockGetWithMetadata.mockResolvedValue(null);
		await expect(getAvatarBlob('u1')).resolves.toBeNull();
	});
});
