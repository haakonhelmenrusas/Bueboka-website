import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

const handler = toNextJsHandler(auth);

/**
 * Thin wrapper around Better Auth's sign-out endpoint.
 *
 * Better Auth calls JSON.parse() on the request body unconditionally.
 * Native (Expo) clients typically send sign-out requests with no body, which
 * causes:
 *   SyntaxError: Unexpected end of JSON input
 *
 * We normalise the body to "{}" when it is absent or empty before delegating
 * to the standard Better Auth handler so that the rest of the sign-out flow
 * (session revocation, cookie clearing, etc.) works as normal.
 */
export async function POST(request: Request) {
	const text = await request.text();
	const body = text.trim() || '{}';

	const patched = new Request(request.url, {
		method: 'POST',
		headers: request.headers,
		body,
	});

	return handler.POST(patched);
}

