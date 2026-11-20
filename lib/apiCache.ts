/**
 * Response headers for authenticated GET endpoints that may be cached at
 * Netlify's edge for a short time (see feat/api-edge-cache).
 *
 * Security model: edge cache entries must be keyed per user. The mobile app
 * authenticates with `Authorization: Bearer <session-token>` and sends no
 * cookies, so the Authorization header value is factored into the cache key
 * via `Vary`; web sessions are keyed on the session cookie via `Netlify-Vary`.
 * Netlify factors both into the cache key, so a request can only ever reuse a
 * cache entry created with the same token/cookie — i.e. the same user.
 *
 * `Cache-Control: no-store` keeps browsers and the app from storing the
 * response; only Netlify's shared edge cache stores it, via
 * `Netlify-CDN-Cache-Control`, and only for GET requests.
 *
 * Apply these headers to successful (2xx) responses only — errors and 401s
 * must never be edge-cached.
 */
export function edgeCacheHeaders(sMaxAgeSeconds = 15, staleWhileRevalidateSeconds = 45): Record<string, string> {
	return {
		'Cache-Control': 'no-store',
		'Netlify-CDN-Cache-Control': `public, s-maxage=${sMaxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
		Vary: 'Authorization',
		'Netlify-Vary': 'cookie=better-auth.session_token, cookie=__Secure-better-auth.session_token',
	};
}
