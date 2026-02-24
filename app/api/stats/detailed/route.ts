import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getCurrentUser() {
	try {
		const reqHeaders = await headers();
		const headerObj: Record<string, string> = {};
		for (const [key, value] of reqHeaders) headerObj[key] = value;
		const session = await auth.api.getSession({ headers: headerObj });
		return session?.user || null;
	} catch (error) {
		Sentry.captureException(error, { tags: { endpoint: 'stats/detailed', where: 'getCurrentUser' } });
		return null;
	}
}

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		// Fetch all practices with their ends
		const practices = await prisma.practice.findMany({
			where: { userId: user.id },
			orderBy: { date: 'asc' },
			include: {
				ends: {
					select: {
						arrows: true,
						distanceMeters: true,
						targetSizeCm: true,
						roundScore: true,
					},
				},
			},
		});

		// Group data by distance + target combination
		const groupedData: Record<
			string,
			Array<{
				date: string;
				arrows: number;
				score: number;
			}>
		> = {};

		practices.forEach((practice) => {
			practice.ends.forEach((end) => {
				const distance = end.distanceMeters || 0;
				const target = end.targetSizeCm || 0;
				const key = `${distance}m - ${target}cm`;

				if (!groupedData[key]) {
					groupedData[key] = [];
				}

				groupedData[key].push({
					date: practice.date.toISOString().split('T')[0],
					arrows: end.arrows,
					score: end.roundScore || 0,
				});
			});
		});

		// Convert to array format for easier consumption
		const series = Object.entries(groupedData).map(([key, data]) => ({
			name: key,
			data: data,
		}));

		return NextResponse.json({ series });
	} catch (error) {
		Sentry.captureException(error, {
			tags: { endpoint: 'stats/detailed', method: 'GET' },
			extra: { message: 'Error fetching detailed stats' },
		});
		return NextResponse.json({ error: 'Failed to fetch detailed stats' }, { status: 500 });
	}
}
