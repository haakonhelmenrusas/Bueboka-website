import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { updateAppVersionSchema } from '@/lib/validations/app-version';
import { validateRequest } from '@/lib/validations/helpers';

const CACHE_KEY = 'app:version';

function buildPayload(version: {
	minVersion: string;
	currentVersion: string;
	updateMessage: string;
	iosMinVersion: string;
	iosStoreUrl: string;
	androidMinVersion: string;
	androidStoreUrl: string;
}) {
	return {
		minVersion: version.minVersion,
		currentVersion: version.currentVersion,
		updateMessage: version.updateMessage,
		ios: {
			minVersion: version.iosMinVersion,
			storeUrl: version.iosStoreUrl,
		},
		android: {
			minVersion: version.androidMinVersion,
			storeUrl: version.androidStoreUrl,
		},
	};
}

export async function GET() {
	try {
		const cached = cache.get<object>(CACHE_KEY);
		if (cached) {
			return NextResponse.json(cached, {
				headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
			});
		}

		const version = await prisma.appVersion.findFirst();

		if (!version) {
			return NextResponse.json({ error: 'No version configuration found.' }, { status: 404 });
		}

		const payload = buildPayload(version);
		cache.set(CACHE_KEY, payload);

		return NextResponse.json(payload, {
			headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
		});
	} catch (error) {
		console.error('[GET /api/app/version]', error);
		return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
	}
}

function isAuthorized(request: NextRequest): boolean {
	const apiKey = process.env.APP_ADMIN_API_KEY;
	if (!apiKey) return false;
	const header = request.headers.get('authorization');
	return header === `Bearer ${apiKey}`;
}

export async function PUT(request: NextRequest) {
	try {
		if (!isAuthorized(request)) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const validation = validateRequest(updateAppVersionSchema, body);
		if (!validation.success) {
			return validation.error;
		}

		const existing = await prisma.appVersion.findFirst();

		let version;
		if (existing) {
			version = await prisma.appVersion.update({
				where: { id: existing.id },
				data: validation.data,
			});
		} else {
			const defaults = {
				minVersion: '2.0.0',
				currentVersion: '2.0.0',
				updateMessage: 'En ny versjon er tilgjengelig',
				iosMinVersion: '2.0.0',
				iosStoreUrl: 'https://apps.apple.com/no/app/bueboka/id6448108838',
				androidMinVersion: '2.0.0',
				androidStoreUrl: 'https://play.google.com/store/apps/details?id=com.aaronshade.bueboka',
			};
			version = await prisma.appVersion.create({
				data: { ...defaults, ...validation.data },
			});
		}

		cache.delete(CACHE_KEY);
		const payload = buildPayload(version);

		return NextResponse.json(payload);
	} catch (error) {
		console.error('[PUT /api/app/version]', error);
		return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
	}
}

