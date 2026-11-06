import { getStore } from '@netlify/blobs';
import sharp from 'sharp';

/**
 * Avatar file storage.
 *
 * Avatars used to be stored as base64 data URIs directly on the user row,
 * which bloated every session response (the app persists the session payload
 * and hit its storage chunk limit). Uploaded avatars are now compressed with
 * sharp and stored as files in a Netlify Blob store; the user row keeps only
 * the public URL. Legacy data-URI values keep working — <img> renders both.
 */

const AVATAR_STORE = 'avatars';
// Avatars are displayed small (48-96px); 512px webp is plenty and stays tiny
const MAX_EDGE = 512;
const WEBP_QUALITY = 0.75;

const DATA_URI_RE = /^data:image\/(png|jpe?g|webp|gif);base64,([A-Za-z0-9+/=\s]+)$/;

export function isAvatarDataUri(image: string | null | undefined): image is string {
	return typeof image === 'string' && image.startsWith('data:image/');
}

/** Public URL for a user's avatar file */
export function avatarUrl(userId: string, version?: string | number): string {
	return `/api/avatar/${encodeURIComponent(userId)}${version !== undefined ? `?v=${version}` : ''}`;
}

/**
 * Decode a data-URI image, compress it, store it as a webp blob and return
 * the public URL to save on the user row.
 */
export async function saveAvatar(userId: string, dataUri: string): Promise<string> {
	const match = DATA_URI_RE.exec(dataUri.trim());
	if (!match) throw new Error('Invalid image data URI');

	const buffer = Buffer.from(match[2], 'base64');
	const compressed = await sharp(buffer)
		.resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
		.webp({ quality: WEBP_QUALITY })
		.toBuffer();

	const store = getStore(AVATAR_STORE);
	await store.set(userId, new Blob([new Uint8Array(compressed)], { type: 'image/webp' }), {
		metadata: { contentType: 'image/webp' },
	});
	return avatarUrl(userId, Date.now());
}

/** Remove a user's avatar file (when the avatar is cleared) */
export async function deleteAvatar(userId: string): Promise<void> {
	const store = getStore(AVATAR_STORE);
	await store.delete(userId).catch(() => {});
}

/** Fetch the stored avatar blob for the public serve route */
export async function getAvatarBlob(userId: string) {
	const store = getStore(AVATAR_STORE);
	const result = await store.getWithMetadata(userId, { type: 'blob' });
	if (!result) return null;
	const contentType = typeof result.metadata?.contentType === 'string' ? result.metadata.contentType : 'image/webp';
	return { blob: result.data, contentType, etag: result.etag };
}
