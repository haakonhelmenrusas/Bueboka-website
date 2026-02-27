import 'dotenv/config';

import { PrismaClient } from '@/prisma/prisma/generated/prisma-client/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Seed RoundType rows.
 *
 * Contract:
 * - Upserts by name so the script is re-runnable.
 * - Keeps existing rows, only fills in missing/changed metadata.
 */
async function main() {
	if (!process.env.DATABASE_URL) {
		throw new Error('DATABASE_URL is not set. Create a .env file with DATABASE_URL before running the seed script.');
	}

	const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
	const prisma = new PrismaClient({ adapter });

	const roundTypes: Array<{
		name: string;
		distanceMeters?: number | null;
		targetType?: { sizeCm: number; type: string; scoringZones?: number } | null;
		numberArrows?: number | null;
		arrowsWithoutScore?: number | null;
	}> = [
		// Indoor (Inne)
		{
			name: '18m',
			distanceMeters: 18,
			targetType: { sizeCm: 40, type: '40cm', scoringZones: 10 },
			numberArrows: 60,
			arrowsWithoutScore: 0,
		},
		{
			name: '25m',
			distanceMeters: 25,
			targetType: { sizeCm: 60, type: '60cm', scoringZones: 10 },
			numberArrows: 60,
			arrowsWithoutScore: 0,
		},
		{ name: 'Veggbane', distanceMeters: null, targetType: null },

		// Outdoor (Ute)
		{
			name: '30m',
			distanceMeters: 30,
			targetType: { sizeCm: 80, type: '80cm', scoringZones: 10 },
			numberArrows: 72,
			arrowsWithoutScore: 0,
		},
		{
			name: '40m',
			distanceMeters: 40,
			targetType: { sizeCm: 80, type: '80cm', scoringZones: 10 },
			numberArrows: 72,
			arrowsWithoutScore: 0,
		},
		{
			name: '50m',
			distanceMeters: 50,
			targetType: { sizeCm: 122, type: '122cm', scoringZones: 10 },
			numberArrows: 72,
			arrowsWithoutScore: 0,
		},
		{
			name: '60m',
			distanceMeters: 60,
			targetType: { sizeCm: 122, type: '122cm', scoringZones: 10 },
			numberArrows: 72,
			arrowsWithoutScore: 0,
		},
		{
			name: '70m',
			distanceMeters: 70,
			targetType: { sizeCm: 122, type: '122cm', scoringZones: 10 },
			numberArrows: 72,
			arrowsWithoutScore: 0,
		},
		{
			name: '90m',
			distanceMeters: 90,
			targetType: { sizeCm: 122, type: '122cm', scoringZones: 10 },
			numberArrows: 72,
			arrowsWithoutScore: 0,
		},
		{ name: 'Felt', distanceMeters: null, targetType: null },
		{ name: '3D', distanceMeters: null, targetType: null },
		{ name: 'Skogsløype', distanceMeters: null, targetType: null },
	];

	let createdOrUpdated = 0;

	for (const rt of roundTypes) {
		// We keep this idempotent by upserting on name
		const existing = await prisma.roundType.findFirst({
			where: { name: rt.name },
		});

		if (existing) {
			await prisma.roundType.update({
				where: { id: existing.id },
				data: {
					distanceMeters: rt.distanceMeters ?? null,
					targetType: rt.targetType ?? undefined,
					numberArrows: rt.numberArrows ?? null,
					arrowsWithoutScore: rt.arrowsWithoutScore ?? null,
				},
			});
			createdOrUpdated++;
		} else {
			await prisma.roundType.create({
				data: {
					name: rt.name,
					distanceMeters: rt.distanceMeters ?? null,
					targetType: rt.targetType ?? undefined,
					numberArrows: rt.numberArrows ?? null,
					arrowsWithoutScore: rt.arrowsWithoutScore ?? null,
				},
			});
			createdOrUpdated++;
		}
	}

	const total = await prisma.roundType.count();
	console.log(`✅ Seeded RoundType: ${createdOrUpdated} upserted. Total RoundType rows now: ${total}.`);

	await prisma.$disconnect();
}

main().catch((err) => {
	console.error('❌ Seed failed:', err);
	process.exitCode = 1;
});
