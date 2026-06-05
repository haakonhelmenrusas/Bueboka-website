import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const windowMs = 60_000;
const maxRequests = 60;

const hits = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
	return (
		request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
		request.headers.get('x-real-ip') ||
		'unknown'
	);
}

export function middleware(request: NextRequest) {
	const ip = getClientIp(request);
	const now = Date.now();
	const entry = hits.get(ip);

	if (!entry || entry.resetAt <= now) {
		hits.set(ip, { count: 1, resetAt: now + windowMs });
		return NextResponse.next();
	}

	entry.count++;
	if (entry.count > maxRequests) {
		return NextResponse.json(
			{ error: 'Too many requests, please try again later' },
			{ status: 429 }
		);
	}

	return NextResponse.next();
}

export const config = {
	matcher: '/api/:path*',
};
