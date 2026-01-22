import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { auth } from '@/lib/auth';
import { AimDistanceMark, CalculatedMarks } from '@/types/SightMarks';

async function getCurrentUser() {
	try {
		const reqHeaders = await headers();
		const headerObj: Record<string, string> = {};
		for (const [key, value] of reqHeaders) headerObj[key] = value;
		const session = await auth.api.getSession({ headers: headerObj });
		return session?.user || null;
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'ballistics/calculate', where: 'getCurrentUser' } });
		return null;
	}
}

/**
 * POST /api/ballistics/calculate
 * Proxy endpoint for external ballistics calculation service.
 * Takes AimDistanceMark parameters and returns calculated sight marks.
 */
export async function POST(request: NextRequest) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const body = (await request.json()) as unknown;
		if (!body || typeof body !== 'object') {
			return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
		}

		// Validate required fields for AimDistanceMark
		const payload = body as AimDistanceMark;
		const errors: string[] = [];

		if (!payload.bow_category) errors.push('bow_category is required');
		if (payload.new_given_mark === undefined || payload.new_given_mark === null) errors.push('new_given_mark is required');
		if (payload.new_given_distance === undefined || payload.new_given_distance === null) errors.push('new_given_distance is required');
		if (!Array.isArray(payload.given_marks)) errors.push('given_marks must be an array');
		if (!Array.isArray(payload.given_distances)) errors.push('given_distances must be an array');

		if (errors.length > 0) {
			return NextResponse.json({ error: 'Validation error', details: errors }, { status: 400 });
		}

		// Call external ballistics service
		const ballisticsUrl = process.env.BALLISTICS_SERVICE_URL || 'http://localhost:8000';
		const response = await fetch(`${ballisticsUrl}/calculate/aim-distance-mark`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
			signal: AbortSignal.timeout(30000), // 30 second timeout
		});

		if (!response.ok) {
			const errorText = await response.text();
			Sentry.captureException(new Error(`Ballistics service error: ${response.status}`), {
				tags: { endpoint: 'ballistics/calculate' },
				extra: { statusCode: response.status, responseBody: errorText },
			});
			return NextResponse.json({ error: 'Failed to calculate ballistics', details: errorText }, { status: response.status });
		}

		const result: CalculatedMarks = await response.json();
		return NextResponse.json(result);
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'ballistics/calculate', method: 'POST' },
			extra: { message: 'Ballistics calculation failed' },
		});

		if (error instanceof Error && error.name === 'AbortError') {
			return NextResponse.json({ error: 'Ballistics service timeout' }, { status: 504 });
		}

		return NextResponse.json({ error: 'Failed to calculate ballistics' }, { status: 500 });
	}
}
