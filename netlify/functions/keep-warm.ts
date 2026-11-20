/**
 * Scheduled keep-warm ping for the Next.js server handler on Netlify.
 *
 * Idle function instances are spun down, so the first request after an idle
 * period pays a ~6s cold start — and the mobile app fans out ~8 parallel API
 * calls on launch, so several instances can cold-start at once. This function
 * runs every 2 minutes on the published (production) deploy and fires a few
 * parallel requests at /api/health (cheap, never cached), keeping handler
 * instances warm so real user traffic lands on them.
 *
 * Scheduled functions only run on published deploys and have no public URL.
 */

const TARGET = process.env.URL ?? 'https://bueboka.no';
const PARALLEL_PINGS = 3;

export default async function keepWarm(): Promise<Response> {
	const results = await Promise.allSettled(
		Array.from({ length: PARALLEL_PINGS }, () =>
			fetch(`${TARGET}/api/health`, { headers: { 'user-agent': 'bueboka-keep-warm' } })
		)
	);
	const ok = results.filter((r) => r.status === 'fulfilled' && (r as PromiseFulfilledResult<Response>).value.ok).length;
	return new Response(JSON.stringify({ ok, pings: results.length }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
}

// Netlify scheduled-function config: TypeScript functions declare the cron in code.
export const config = {
	schedule: '*/2 * * * *',
};
