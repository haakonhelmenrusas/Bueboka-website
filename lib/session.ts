import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { sessionCache } from '@/lib/cache';
import type { User as BetterAuthUser } from 'better-auth';

// AuthUser is the Better Auth base user type (id, name, email, emailVerified, image, …).
// We use the library's own exported type rather than deriving from getSession's return
// because TypeScript fails to propagate the generic fully through the latter.
type AuthUser = BetterAuthUser;

/**
 * Extract a stable cache key from the request's session credentials.
 * Prefers the Authorization Bearer token (native app), then falls back to
 * the Better Auth session-token cookie (web).
 */
function extractSessionToken(request: Request): string | null {
	const authHeader = request.headers.get('authorization');
	if (authHeader?.startsWith('Bearer ')) {
		return authHeader.slice(7);
	}
	const cookie = request.headers.get('cookie');
	if (cookie) {
		// Matches both plain and __Secure- prefixed cookie names
		const match = cookie.match(/(?:__Secure-)?better-auth\.session_token=([^;]+)/);
		if (match?.[1]) return match[1];
	}
	return null;
}

/**
 * Resolves the current authenticated user.
 *
 * Pass the incoming `Request` object from an API route handler so the session
 * is read directly from that request's headers. This allows both cookie-based
 * web sessions and Bearer-token-based React Native sessions to be validated
 * with the same code path.
 *
 * Results are cached in memory for 30 seconds keyed on the session token.
 * This prevents repeated DB round-trips when a page fans out multiple API
 * calls on mount (common pattern). The short TTL ensures revoked sessions
 * are detected quickly.
 *
 * When no `request` is provided (legacy call sites or non-route contexts) the
 * function falls back to `next/headers()` which reads the headers from the
 * current Next.js request context.
 */
export async function getCurrentUser(request?: Request): Promise<AuthUser | null> {
	try {
		let headerObj: Record<string, string>;
		let cacheKey: string | null = null;

		if (request) {
			headerObj = {};
			request.headers.forEach((value, key) => {
				headerObj[key] = value;
			});

			const token = extractSessionToken(request);
			if (token) {
				cacheKey = `session:${token}`;
				const cached = sessionCache.get<AuthUser>(cacheKey);
				if (cached) return cached;
			}
		} else {
			const reqHeaders = await headers();
			headerObj = {};
			for (const [key, value] of reqHeaders) headerObj[key] = value;
		}

		const session = await auth.api.getSession({ headers: headerObj });
		const user = session?.user ?? null;

		if (cacheKey && user) {
			sessionCache.set<AuthUser>(cacheKey, user, 30000);
		}

		return user;
	} catch (error) {
		console.error('[getCurrentUser]', error);
		return null;
	}
}
