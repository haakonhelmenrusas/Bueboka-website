import 'dotenv/config';

import {
	BowType,
	Environment,
	Material,
	PracticeCategory,
	PracticeType,
	PrismaClient,
	WeatherCondition,
} from '@/prisma/prisma/generated/prisma-client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from 'better-auth/crypto';

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
	const roundTypesSpec: Array<{
		name: string;
		distanceMeters?: number | null;
		targetType?: { sizeCm: number; type: string; scoringZones?: number } | null;
		numberArrows?: number | null;
		arrowsWithoutScore?: number | null;
	}> = [
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
		{ name: 'Veggbane' },
		{
			name: '30m',
			distanceMeters: 30,
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
			name: '70m',
			distanceMeters: 70,
			targetType: { sizeCm: 122, type: '122cm', scoringZones: 10 },
			numberArrows: 72,
			arrowsWithoutScore: 0,
		},
		{ name: 'Felt' },
		{ name: '3D' },
	];

	for (const rt of roundTypesSpec) {
		const existing = await prisma.roundType.findFirst({ where: { name: rt.name } });
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
		}
	}

	// 2) Create a local user using better-auth's internal password hashing
	const email = 'local@test.no';
	const password = 'Test1234!';

	// Check if user already exists
	let user = await prisma.user.findUnique({ where: { email } });

	if (!user) {
		// Create new user
		user = await prisma.user.create({
			data: {
				email,
				emailVerified: true,
				name: 'Local Test User',
				club: 'Arctic Bueklubb',
				image: null,
			},
		});
	} else {
		// Update existing user
		user = await prisma.user.update({
			where: { email },
			data: {
				name: 'Local Test User',
				club: 'Arctic Bueklubb',
				emailVerified: true,
			},
		});
	}

	// Create or update password account using better-auth's format
	const existingAccount = await prisma.account.findFirst({
		where: {
			userId: user.id,
			providerId: 'credential',
		},
	});

	// Hash password using better-auth's hashPassword function
	const hashedPassword = await hashPassword(password);

	if (existingAccount) {
		await prisma.account.update({
			where: { id: existingAccount.id },
			data: {
				password: hashedPassword,
			},
		});
	} else {
		await prisma.account.create({
			data: {
				userId: user.id,
				accountId: user.id,
				providerId: 'credential',
				password: hashedPassword,
			},
		});
	}

	console.log(`✅ Test user created: ${email} / ${password}`);

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

	// 5) Seed 50 practices (last 90 days) + ends with diverse data
	const roundTypes = await prisma.roundType.findMany({});
	const makeWeather = (env: Environment): WeatherCondition[] => {
		if (env === Environment.INDOOR) return [];
		const choices = [WeatherCondition.SUN, WeatherCondition.CLOUDED, WeatherCondition.CLEAR, WeatherCondition.WIND, WeatherCondition.RAIN];
		return [pick(choices)];
	};

	// Locations by practice category
	const locations = {
		SKIVE_INDOOR: ['Innebanen', 'Hallen Nord', 'Idrettshallen'],
		SKIVE_OUTDOOR: ['Utebanen', 'Skytebanen Sør', 'Feltbanen'],
		JAKT_3D: ['3D-banen', 'Skogsløypa', 'Jaktbanen'],
		FELT: ['Feltbanen', 'Terrengløypa', 'Variabel bane'],
	};

	// Generate 50 practices spread over 90 days
	let practiceCount = 0;
	for (let dayOffset = 0; dayOffset < 90 && practiceCount < 50; dayOffset += Math.floor(Math.random() * 2) + 1) {
		const date = isoDaysAgo(dayOffset);

		// Determine practice category (varied distribution)
		let practiceCategory: PracticeCategory;
		const categoryRoll = Math.random();
		if (categoryRoll < 0.4) practiceCategory = PracticeCategory.SKIVE_INDOOR;
		else if (categoryRoll < 0.7) practiceCategory = PracticeCategory.SKIVE_OUTDOOR;
		else if (categoryRoll < 0.85) practiceCategory = PracticeCategory.JAKT_3D;
		else practiceCategory = PracticeCategory.FELT;

		// Environment based on category
		const env = practiceCategory === PracticeCategory.SKIVE_INDOOR ? Environment.INDOOR : Environment.OUTDOOR;

		// Practice type (80% training, 20% competition)
		const practiceType: PracticeType = Math.random() < 0.2 ? PracticeType.KONKURRANSE : PracticeType.TRENING;

		// Select appropriate location
		const locationList =
			locations[
				practiceCategory === PracticeCategory.SKIVE_INDOOR
					? 'SKIVE_INDOOR'
					: practiceCategory === PracticeCategory.SKIVE_OUTDOOR
						? 'SKIVE_OUTDOOR'
						: practiceCategory === PracticeCategory.JAKT_3D
							? 'JAKT_3D'
							: 'FELT'
			];
		const location = pick(locationList);

		// Select round type based on category
		let roundType;
		if (practiceCategory === PracticeCategory.SKIVE_INDOOR) {
			const indoorTypes = roundTypes.filter((rt) => rt.name === '18m' || rt.name === '25m');
			roundType = indoorTypes.length ? pick(indoorTypes) : null;
		} else if (practiceCategory === PracticeCategory.SKIVE_OUTDOOR) {
			const outdoorTypes = roundTypes.filter((rt) => ['30m', '50m', '70m'].includes(rt.name));
			roundType = outdoorTypes.length ? pick(outdoorTypes) : null;
		} else if (practiceCategory === PracticeCategory.JAKT_3D) {
			roundType = roundTypes.find((rt) => rt.name === '3D') || null;
		} else {
			roundType = roundTypes.find((rt) => rt.name === 'Felt') || null;
		}

		// Number of ends and arrows per end based on category
		let arrowsPerEnd: number;
		let endsCount: number;
		if (practiceCategory === PracticeCategory.SKIVE_INDOOR || practiceCategory === PracticeCategory.SKIVE_OUTDOOR) {
			arrowsPerEnd = 6;
			endsCount = randInt(6, 12);
		} else if (practiceCategory === PracticeCategory.JAKT_3D) {
			arrowsPerEnd = 3;
			endsCount = randInt(10, 24);
		} else {
			// FELT
			arrowsPerEnd = 3;
			endsCount = randInt(8, 20);
		}

		// Competition practices tend to have more ends
		if (practiceType === PracticeType.KONKURRANSE) {
			endsCount = Math.min(endsCount + 4, 24);
		}

		// Score quality improves over time (simulating progression)
		const progressionFactor = 1 - dayOffset / 90;
		const baseScoreMin = practiceType === PracticeType.KONKURRANSE ? 7 : 6;
		const baseScoreMax = practiceType === PracticeType.KONKURRANSE ? 10 : 9;

		const existing = await prisma.practice.findFirst({ where: { userId: user.id, date } });
		const practice = existing
			? await prisma.practice.update({
					where: { id: existing.id },
					data: {
						location,
						environment: env,
						weather: makeWeather(env),
						practiceType,
						practiceCategory,
						notes:
							practiceType === PracticeType.KONKURRANSE
								? `${practiceCategory} competition - ${location}`
								: `${practiceCategory} training - ${location}`,
						totalScore: 0,
						roundTypeId: roundType?.id,
						bowId: Math.random() < 0.8 ? bow1.id : 'local-bow-2',
						arrowsId: Math.random() < 0.9 ? arrows1.id : 'local-arrows-2',
					},
				})
			: await prisma.practice.create({
					data: {
						userId: user.id,
						date,
						location,
						environment: env,
						weather: makeWeather(env),
						practiceType,
						practiceCategory,
						notes:
							practiceType === PracticeType.KONKURRANSE
								? `${practiceCategory} competition - ${location}`
								: `${practiceCategory} training - ${location}`,
						totalScore: 0,
						roundTypeId: roundType?.id,
						bowId: Math.random() < 0.8 ? bow1.id : 'local-bow-2',
						arrowsId: Math.random() < 0.9 ? arrows1.id : 'local-arrows-2',
					},
				});

		// Delete existing ends and recreate (keeps things deterministic)
		await prisma.end.deleteMany({ where: { practiceId: practice.id } });

		// Extract target size from the targetType JSON structure
		const targetSizeCm = roundType?.targetType ? (roundType.targetType as any).sizeCm : null;

		const endsData = Array.from({ length: endsCount }).map(() => {
			// Generate scores with progression and variation
			const scores = Array.from({ length: arrowsPerEnd }).map(() => {
				const adjustedMin = Math.floor(baseScoreMin + progressionFactor * 2);
				const adjustedMax = Math.min(10, baseScoreMax + Math.floor(progressionFactor));
				return randInt(Math.max(adjustedMin, 1), adjustedMax);
			});

			// Calculate roundScore as the sum of all arrow scores
			const roundScore = scores.reduce((sum, score) => sum + score, 0);

			return {
				practiceId: practice.id,
				arrows: arrowsPerEnd,
				scores,
				roundScore,
				arrowsPerEnd,
				distanceMeters: roundType?.distanceMeters ?? null,
				targetSizeCm,
			};
		});
		await prisma.end.createMany({ data: endsData });

		practiceCount++;
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
