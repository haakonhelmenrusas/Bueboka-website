import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function getDbMeta() {
	const raw = process.env.DATABASE_URL;
	if (!raw) return { present: false as const };
	try {
		const u = new URL(raw);
		return {
			present: true as const,
			protocol: u.protocol,
			host: u.host,
			db: u.pathname?.replace('/', '') || null,
			sslmode: u.searchParams.get('sslmode'),
		};
	} catch {
		return { present: true as const, protocol: null, host: null, db: null, sslmode: null };
	}
}

export async function GET() {
	const startedAt = Date.now();
	const dbMeta = getDbMeta();
	try {
		// Use executeRaw for a simple connectivity/ping check.
		await prisma.$executeRaw`SELECT 1`;

		return NextResponse.json({ ok: true, ms: Date.now() - startedAt, db: dbMeta });
	} catch (error) {
		const anyErr = error as any;
		Sentry.captureException(error, {
			tags: { endpoint: 'health/db' },
			extra: { ms: Date.now() - startedAt, db: dbMeta, prismaCode: anyErr?.code },
		});

		return NextResponse.json(
			{
				ok: false,
				ms: Date.now() - startedAt,
				db: dbMeta,
				prismaCode: anyErr?.code,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
