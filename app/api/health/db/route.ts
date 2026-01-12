import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
	const startedAt = Date.now();
	try {
		// A trivial query to check database connectivity.
		// Using prisma raw query keeps it lightweight and avoids model deps.
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const result = await prisma.$queryRaw`SELECT 1 as ok`;

		return NextResponse.json({ ok: true, ms: Date.now() - startedAt });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'health/db' },
			extra: { ms: Date.now() - startedAt },
		});
		return NextResponse.json(
			{
				ok: false,
				ms: Date.now() - startedAt,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
