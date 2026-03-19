import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { MarksResult, SightMarkCalc } from '@/types/SightMarks';
import { getCurrentUser } from '@/lib/session';

/**
 * POST /api/sight-marks/calculate
 * Proxy endpoint for external sight mark calculation service.
 * Takes SightMarkCalc parameters and returns sight mark results by angle.
 */
export async function POST(request: NextRequest) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const body = (await request.json()) as unknown;
		if (!body || typeof body !== 'object') {
			return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
		}

		// Validate required fields for SightMarkCalc
		const payload = body as SightMarkCalc;
		const errors: string[] = [];

		if (!Array.isArray(payload.ballistics_pars) || payload.ballistics_pars.length === 0) {
			errors.push('ballistics_pars must be a non-empty array');
		}
		if (!Array.isArray(payload.distances_def) || payload.distances_def.length !== 3) {
			errors.push('distances_def must be an array of 3 numbers [distanceFrom, distanceTo, interval]');
		}
		if (!Array.isArray(payload.angles) || payload.angles.length === 0) {
			errors.push('angles must be a non-empty array');
		}

		if (errors.length > 0) {
			return NextResponse.json({ error: 'Validation error', details: errors }, { status: 400 });
		}

		// Call external sight mark calculation service
		const ballisticsUrl = process.env.SIGHTMARKS_CALCULATION_SERVICE_URL || 'http://localhost:8000';

		const response = await fetch(`${ballisticsUrl}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
			signal: AbortSignal.timeout(30000), // 30 second timeout
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('[SightMarks Calculate] External service error:', errorText);
			Sentry.captureException(new Error(`Sight marks service error: ${response.status}`), {
				tags: { endpoint: 'sight-marks/calculate' },
				extra: { statusCode: response.status, responseBody: errorText },
			});
			return NextResponse.json({ error: 'Failed to calculate sight marks', details: errorText }, { status: response.status });
		}

		const result: MarksResult = await response.json();
		return NextResponse.json(result);
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'sight-marks/calculate', method: 'POST' },
			extra: { message: 'Sight marks calculation failed' },
		});

		if (error instanceof Error && error.name === 'AbortError') {
			return NextResponse.json({ error: 'Calculation service timeout' }, { status: 504 });
		}

		return NextResponse.json({ error: 'Failed to calculate sight marks' }, { status: 500 });
	}
}
