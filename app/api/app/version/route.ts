import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';

const CACHE_KEY = 'app:version';

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

		const payload = {
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

		cache.set(CACHE_KEY, payload);

		return NextResponse.json(payload, {
			headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
		});
	} catch (error) {
		console.error('[GET /api/app/version]', error);
		return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
	}
}

