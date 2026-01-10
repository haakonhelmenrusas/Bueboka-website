import 'dotenv/config';

import { Environment, PrismaClient } from '@/prisma/prisma/generated/prisma-client/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Seed RoundType rows.
 *
 * Contract:
 * - Upserts by (name, environment) so the script is re-runnable.
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
		environment: Environment;
		distanceMeters?: number | null;
		targetSizeCm?: number | null;
	}> = [
		// Indoor (Inne)
		{ name: '18m', environment: 'INDOOR', distanceMeters: 18, targetSizeCm: 40 },
		{ name: '25m', environment: 'INDOOR', distanceMeters: 25, targetSizeCm: 60 },
		{ name: 'Veggbane', environment: 'INDOOR', distanceMeters: null, targetSizeCm: null },

		// Outdoor (Ute)
		{ name: '30m', environment: 'OUTDOOR', distanceMeters: 30, targetSizeCm: 80 },
		{ name: '40m', environment: 'OUTDOOR', distanceMeters: 40, targetSizeCm: 80 },
		{ name: '50m', environment: 'OUTDOOR', distanceMeters: 50, targetSizeCm: 122 },
		{ name: '60m', environment: 'OUTDOOR', distanceMeters: 60, targetSizeCm: 122 },
		{ name: '70m', environment: 'OUTDOOR', distanceMeters: 70, targetSizeCm: 122 },
		{ name: '90m', environment: 'OUTDOOR', distanceMeters: 90, targetSizeCm: 122 },
		{ name: 'Felt', environment: 'OUTDOOR', distanceMeters: null, targetSizeCm: null },
		{ name: '3D', environment: 'OUTDOOR', distanceMeters: null, targetSizeCm: null },
		{ name: 'Skogsløype', environment: 'OUTDOOR', distanceMeters: null, targetSizeCm: null },
	];

	let createdOrUpdated = 0;

	for (const rt of roundTypes) {
		// We keep this idempotent by upserting on a compound where-clause using findFirst (since name isn’t unique).
		const existing = await prisma.roundType.findFirst({
			where: { name: rt.name, environment: rt.environment },
		});

		if (existing) {
			await prisma.roundType.update({
				where: { id: existing.id },
				data: {
					distanceMeters: rt.distanceMeters ?? null,
					targetSizeCm: rt.targetSizeCm ?? null,
				},
			});
			createdOrUpdated++;
		} else {
			await prisma.roundType.create({
				data: {
					name: rt.name,
					environment: rt.environment,
					distanceMeters: rt.distanceMeters ?? null,
					targetSizeCm: rt.targetSizeCm ?? null,
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
