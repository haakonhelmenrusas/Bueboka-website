import 'dotenv/config';

import { BowType, Environment, Material, PrismaClient, WeatherCondition } from '@/prisma/prisma/generated/prisma-client/client';
import { PrismaPg } from '@prisma/adapter-pg';

function assertEnv() {
	if (!process.env.DATABASE_URL) {
		throw new Error('DATABASE_URL is not set. Create a .env file with DATABASE_URL before running the seed script.');
	}
}

function randInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]) {
	return arr[randInt(0, arr.length - 1)];
}

function isoDaysAgo(days: number) {
	const d = new Date();
	d.setDate(d.getDate() - days);
	return d;
}

async function main() {
	assertEnv();

	const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
	const prisma = new PrismaClient({ adapter });

	// 1) Ensure RoundTypes exist (import-less to avoid TS path issues in seed runners)
	const roundTypesSpec: Array<{ name: string; environment: Environment; distanceMeters?: number | null; targetSizeCm?: number | null }> = [
		{ name: '18m', environment: 'INDOOR', distanceMeters: 18, targetSizeCm: 40 },
		{ name: '25m', environment: 'INDOOR', distanceMeters: 25, targetSizeCm: 60 },
		{ name: 'Veggbane', environment: 'INDOOR' },
		{ name: '30m', environment: 'OUTDOOR', distanceMeters: 30, targetSizeCm: 80 },
		{ name: '50m', environment: 'OUTDOOR', distanceMeters: 50, targetSizeCm: 122 },
		{ name: '70m', environment: 'OUTDOOR', distanceMeters: 70, targetSizeCm: 122 },
		{ name: 'Felt', environment: 'OUTDOOR' },
		{ name: '3D', environment: 'OUTDOOR' },
	];

	for (const rt of roundTypesSpec) {
		const existing = await prisma.roundType.findFirst({ where: { name: rt.name, environment: rt.environment } });
		if (existing) {
			await prisma.roundType.update({
				where: { id: existing.id },
				data: { distanceMeters: rt.distanceMeters ?? null, targetSizeCm: rt.targetSizeCm ?? null },
			});
		} else {
			await prisma.roundType.create({
				data: {
					name: rt.name,
					environment: rt.environment,
					distanceMeters: rt.distanceMeters ?? null,
					targetSizeCm: rt.targetSizeCm ?? null,
				},
			});
		}
	}

	// 2) Create a local user + session-less (auth is handled by better-auth at runtime)
	const email = 'local@test.no';
	const user = await prisma.user.upsert({
		where: { email },
		create: {
			email,
			emailVerified: true,
			name: 'Local Test User',
			club: 'Arctic Bueklubb',
			image: null,
		},
		update: {
			name: 'Local Test User',
			club: 'Arctic Bueklubb',
		},
	});

	// 3) Seed bows (ensure exactly one favorite)
	const bow1 = await prisma.bow.upsert({
		where: { id: 'local-bow-1' },
		create: {
			id: 'local-bow-1',
			userId: user.id,
			name: 'Hoyt Recurve',
			type: BowType.RECURVE,
			isFavorite: true,
			notes: 'Favorittbuen',
		},
		update: {
			userId: user.id,
			name: 'Hoyt Recurve',
			type: BowType.RECURVE,
			isFavorite: true,
		},
	});
	await prisma.bow.upsert({
		where: { id: 'local-bow-2' },
		create: {
			id: 'local-bow-2',
			userId: user.id,
			name: 'Myk trad',
			type: BowType.TRADITIONAL,
			isFavorite: false,
		},
		update: { userId: user.id, name: 'Myk trad', type: BowType.TRADITIONAL, isFavorite: false },
	});
	// enforce only one favorite
	await prisma.bow.updateMany({ where: { userId: user.id, id: { not: bow1.id } }, data: { isFavorite: false } });

	// 4) Seed arrow sets (ensure exactly one favorite)
	const arrows1 = await prisma.arrows.upsert({
		where: { id: 'local-arrows-1' },
		create: {
			id: 'local-arrows-1',
			userId: user.id,
			name: 'Easton Carbon One',
			material: Material.KARBON,
			isFavorite: true,
			spine: '700',
		},
		update: { userId: user.id, name: 'Easton Carbon One', material: Material.KARBON, isFavorite: true, spine: '700' },
	});
	await prisma.arrows.upsert({
		where: { id: 'local-arrows-2' },
		create: {
			id: 'local-arrows-2',
			userId: user.id,
			name: 'Alu treningspiler',
			material: Material.ALUMINIUM,
			isFavorite: false,
		},
		update: { userId: user.id, name: 'Alu treningspiler', material: Material.ALUMINIUM, isFavorite: false },
	});
	await prisma.arrows.updateMany({ where: { userId: user.id, id: { not: arrows1.id } }, data: { isFavorite: false } });

	// 5) Seed practices (last 20 days) + ends
	const roundTypes = await prisma.roundType.findMany({});
	const makeWeather = (env: Environment): WeatherCondition[] => {
		if (env === Environment.INDOOR) return [];
		const choices = [WeatherCondition.SUN, WeatherCondition.CLOUDED, WeatherCondition.CLEAR, WeatherCondition.WIND, WeatherCondition.RAIN];
		return [pick(choices)];
	};

	for (let i = 0; i < 14; i++) {
		const env = i % 3 === 0 ? Environment.INDOOR : Environment.OUTDOOR;
		const date = isoDaysAgo(i);
		const envRoundTypes = roundTypes.filter((r) => r.environment === env);
		const roundType = envRoundTypes.length ? pick(envRoundTypes) : null;
		const arrowsPerEnd = 6;
		const endsCount = env === Environment.INDOOR ? 10 : 6;

		const existing = await prisma.practice.findFirst({ where: { userId: user.id, date } });
		const practice = existing
			? await prisma.practice.update({
					where: { id: existing.id },
					data: {
						location: env === Environment.INDOOR ? 'Innebanen' : 'Utebanen',
						environment: env,
						weather: makeWeather(env),
						notes: 'Seeded practice',
						totalScore: 0,
						roundTypeId: roundType?.id,
						bowId: bow1.id,
						arrowsId: arrows1.id,
					},
				})
			: await prisma.practice.create({
					data: {
						userId: user.id,
						date,
						location: env === Environment.INDOOR ? 'Innebanen' : 'Utebanen',
						environment: env,
						weather: makeWeather(env),
						notes: 'Seeded practice',
						totalScore: 0,
						roundTypeId: roundType?.id,
						bowId: bow1.id,
						arrowsId: arrows1.id,
					},
				});

		// delete existing ends and recreate (keeps things deterministic)
		await prisma.end.deleteMany({ where: { practiceId: practice.id } });
		const endsData = Array.from({ length: endsCount }).map(() => {
			const scores = Array.from({ length: arrowsPerEnd }).map(() => randInt(6, 10));
			return {
				practiceId: practice.id,
				arrows: arrowsPerEnd,
				scores,
				arrowsPerEnd,
				distanceMeters: roundType?.distanceMeters ?? null,
				targetSizeCm: roundType?.targetSizeCm ?? null,
			};
		});
		await prisma.end.createMany({ data: endsData });
	}

	const counts = await Promise.all([
		prisma.user.count(),
		prisma.bow.count(),
		prisma.arrows.count(),
		prisma.roundType.count(),
		prisma.practice.count(),
		prisma.end.count(),
	]);
	console.log(
		`✅ Local seed done. Users=${counts[0]} Bows=${counts[1]} Arrows=${counts[2]} RoundTypes=${counts[3]} Practices=${counts[4]} Ends=${counts[5]}`
	);

	await prisma.$disconnect();
}

main().catch((err) => {
	console.error('❌ Local seed failed:', err);
	process.exitCode = 1;
});
