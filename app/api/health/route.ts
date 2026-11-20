import { NextResponse } from 'next/server';

/**
 * GET /api/health
 *
 * Lightweight liveness probe used by the scheduled keep-warm function
 * (netlify/functions/keep-warm.ts) to keep Next.js handler instances warm.
 * No auth, no database — must stay cheap, and never cached, so every ping
 * actually reaches the serverless function.
 */
export async function GET() {
	return NextResponse.json({ ok: true, ts: Date.now() }, { headers: { 'Cache-Control': 'no-store' } });
}
