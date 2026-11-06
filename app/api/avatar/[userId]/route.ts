import { NextRequest, NextResponse } from 'next/server';
import { getAvatarBlob } from '@/lib/avatarStorage';

/**
 * Public avatar file serve route. User avatars are referenced by URL
 * (/api/avatar/:userId) and shown on public profiles, so no auth required.
 * Responses carry an ETag and short cache since the file is replaced on
 * re-upload (the DB stores a cache-busting ?v= query as well).
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
	try {
		const { userId } = await params;
		const avatar = await getAvatarBlob(decodeURIComponent(userId));
		if (!avatar) {
			return NextResponse.json({ error: 'Avatar not found' }, { status: 404 });
		}

		const headers = new Headers({
			'Content-Type': avatar.contentType,
			'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
		});
		if (avatar.etag) headers.set('ETag', avatar.etag);
		if (avatar.etag && request.headers.get('if-none-match') === avatar.etag) {
			return new Response(null, { status: 304, headers });
		}
		return new Response(avatar.blob as BodyInit, { status: 200, headers });
	} catch (error) {
		console.error('[avatar] Failed to serve avatar:', error);
		return NextResponse.json({ error: 'Failed to fetch avatar' }, { status: 500 });
	}
}
