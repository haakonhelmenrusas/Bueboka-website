import 'dotenv/config';

import { PrismaClient } from '@/prisma/prisma/generated/prisma-client/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Comprehensive seed file for development/testing
 *
 * Generates:
 * - Round types
 * - Test user with equipment (bows and arrows)
 * - 200+ practices over 6 months
 * - 20 competitions over 6 months
 * - Realistic score progression
 */

// Helper to generate random dates over the last 6 months
function randomDate(startDaysAgo: number, endDaysAgo: number): Date {
	const start = new Date();
	start.setDate(start.getDate() - startDaysAgo);
	const end = new Date();
	end.setDate(end.getDate() - endDaysAgo);
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to generate realistic scores with progression
function generateScore(maxScore: number, skillLevel: number, consistency: number): number {
	// skillLevel: 0.6-0.95 (60%-95% of max)
	// consistency: 0.85-0.95 (how consistent)
	const targetScore = maxScore * skillLevel;
	const variance = maxScore * (1 - consistency) * 0.5;
	const score = targetScore + (Math.random() * variance * 2 - variance);
	return Math.round(Math.max(0, Math.min(maxScore, score)));
}

// Skill progression over 6 months (improves gradually)
function getSkillLevel(daysAgo: number): number {
	// Start at 65%, improve to 80% over 6 months
	const progression = (180 - daysAgo) / 180; // 0 to 1
	return 0.65 + progression * 0.15;
}

async function main() {
	async function main() {
		if (!process.env.DATABASE_URL) {
			throw new Error('DATABASE_URL is not set. Create a .env file with DATABASE_URL before running the seed script.');
		}

		const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
		const prisma = new PrismaClient({ adapter });

		console.log('🌱 Starting comprehensive seed...\n');

		// ==================== ROUND TYPES ====================
		console.log('📋 Seeding round types...');

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

		let roundTypesCreated = 0;
		for (const rt of roundTypes) {
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
				roundTypesCreated++;
			}
		}
		console.log(`✅ Round types: ${roundTypesCreated} created, ${roundTypes.length - roundTypesCreated} updated\n`);

		// ==================== TEST USER ====================
		console.log('👤 Creating test user...');

		// Check if test user exists
		let user = await prisma.user.findUnique({
			where: { email: 'test@bueboka.no' },
		});

		if (!user) {
			user = await prisma.user.create({
				data: {
					email: 'test@bueboka.no',
					emailVerified: true,
					name: 'Test Skytter',
					club: 'Oslo Bueskyttere',
				},
			});
			console.log(`✅ Created test user: ${user.email}\n`);
		} else {
			console.log(`✅ Test user already exists: ${user.email}\n`);
		}

		// ==================== EQUIPMENT ====================
		console.log('🏹 Creating equipment...');

		// Create bows
		const recurveBow = await prisma.bow.upsert({
			where: { id: 'test-recurve-bow' },
			update: {},
			create: {
				id: 'test-recurve-bow',
				userId: user.id,
				name: 'Hoyt Formula X',
				type: 'RECURVE',
				eyeToNock: 145.75,
				aimMeasure: 67.5,
				eyeToSight: 92.25,
				isFavorite: true,
				notes: 'Main competition bow',
			},
		});

		const compoundBow = await prisma.bow.upsert({
			where: { id: 'test-compound-bow' },
			update: {},
			create: {
				id: 'test-compound-bow',
				userId: user.id,
				name: 'Mathews V3',
				type: 'COMPOUND',
				eyeToNock: 150.0,
				aimMeasure: 70.0,
				eyeToSight: 95.5,
				isFavorite: false,
				notes: 'Backup bow',
			},
		});

		const longbow = await prisma.bow.upsert({
			where: { id: 'test-longbow' },
			update: {},
			create: {
				id: 'test-longbow',
				userId: user.id,
				name: 'Traditional Longbow',
				type: 'LONGBOW',
				isFavorite: false,
				notes: 'For 3D and field archery',
			},
		});

		// Create arrows
		const carbonArrows = await prisma.arrows.upsert({
			where: { id: 'test-carbon-arrows' },
			update: {},
			create: {
				id: 'test-carbon-arrows',
				userId: user.id,
				name: 'Easton X10',
				material: 'KARBON',
				arrowsCount: 12,
				diameter: 5.5,
				weight: 450.0,
				length: 71.5,
				spine: '500',
				isFavorite: true,
				notes: 'Competition arrows',
			},
		});

		const aluminumArrows = await prisma.arrows.upsert({
			where: { id: 'test-aluminum-arrows' },
			update: {},
			create: {
				id: 'test-aluminum-arrows',
				userId: user.id,
				name: 'Carbon Express',
				material: 'ALUMINIUM',
				arrowsCount: 12,
				diameter: 6.0,
				weight: 420.0,
				length: 70.0,
				spine: '520',
				isFavorite: false,
				notes: 'Training arrows',
			},
		});

		console.log(`✅ Created ${3} bows and ${2} arrow sets\n`);

		// ==================== PRACTICES ====================
		console.log('🎯 Generating practices over 6 months...');

		const practiceConfigs = [
			// Indoor practices (most common, especially in winter months)
			{ category: 'SKIVE_INDOOR', env: 'INDOOR', distance: 18, targetSize: 40, arrows: 30, frequency: 0.4 },
			{ category: 'SKIVE_INDOOR', env: 'INDOOR', distance: 18, targetSize: 60, arrows: 30, frequency: 0.2 },
			{ category: 'SKIVE_INDOOR', env: 'INDOOR', distance: 25, targetSize: 60, arrows: 30, frequency: 0.15 },

			// Outdoor practices (more in summer)
			{ category: 'SKIVE_OUTDOOR', env: 'OUTDOOR', distance: 30, targetSize: 80, arrows: 36, frequency: 0.08 },
			{ category: 'SKIVE_OUTDOOR', env: 'OUTDOOR', distance: 50, targetSize: 122, arrows: 36, frequency: 0.06 },
			{ category: 'SKIVE_OUTDOOR', env: 'OUTDOOR', distance: 70, targetSize: 122, arrows: 36, frequency: 0.04 },

			// 3D and field (occasional)
			{ category: 'JAKT_3D', env: 'OUTDOOR', distance: null, targetSize: null, arrows: 24, frequency: 0.04 },
			{ category: 'FELT', env: 'OUTDOOR', distance: null, targetSize: null, arrows: 24, frequency: 0.03 },
		];

		const totalPractices = 220;
		let practicesCreated = 0;

		for (let i = 0; i < totalPractices; i++) {
			// Distribute practices over 6 months (180 days)
			const daysAgo = Math.floor(Math.random() * 180);
			const date = randomDate(daysAgo, daysAgo);

			// Select practice type based on frequency
			const rand = Math.random();
			let cumulative = 0;
			let config = practiceConfigs[0];

			for (const pc of practiceConfigs) {
				cumulative += pc.frequency;
				if (rand <= cumulative) {
					config = pc;
					break;
				}
			}

			// Get skill level for this date (progressive improvement)
			const skillLevel = getSkillLevel(daysAgo);
			const consistency = 0.88 + Math.random() * 0.07; // 88-95% consistency

			// Determine equipment (favor favorites)
			const bowId = Math.random() < 0.8 ? recurveBow.id : Math.random() < 0.7 ? compoundBow.id : longbow.id;
			const arrowsId = Math.random() < 0.85 ? carbonArrows.id : aluminumArrows.id;

			// Generate ends/rounds
			const numEnds = config.category === 'JAKT_3D' || config.category === 'FELT' ? 2 : 2;
			const ends = [];
			let totalScore = 0;

			for (let e = 0; e < numEnds; e++) {
				const arrows = config.arrows;
				const maxScorePerArrow = 10;
				const maxScore = arrows * maxScorePerArrow;

				const roundScore = generateScore(maxScore, skillLevel, consistency);
				totalScore += roundScore;

				const endData: any = {
					arrows: arrows,
					roundScore: roundScore,
					scores: [], // For simplicity, not generating individual arrow scores
				};

				if (config.distance) {
					endData.distanceMeters = config.distance;
				} else {
					// Range practice (3D/Felt)
					endData.distanceFrom = 10 + Math.floor(Math.random() * 20);
					endData.distanceTo = endData.distanceFrom + 20 + Math.floor(Math.random() * 20);
				}

				if (config.targetSize) {
					endData.targetSizeCm = config.targetSize;
				}

				// Sometimes practice without scoring
				if (Math.random() < 0.15) {
					endData.arrowsWithoutScore = Math.floor(Math.random() * 12) + 6;
				}

				ends.push(endData);
			}

			// Weather for outdoor
			const weather = config.env === 'OUTDOOR' ? [['SUN', 'CLOUDED', 'CLEAR', 'WIND'][Math.floor(Math.random() * 4)]] : [];

			// Location
			const locations = ['Oslo Bueskyttere', 'Frogner Buesport', 'Lokale hallen', 'Utendørs bane', 'Treningssenteret', null];
			const location = locations[Math.floor(Math.random() * locations.length)];

			// Rating (1-5)
			const rating = Math.random() < 0.3 ? null : Math.floor(Math.random() * 3) + 3; // 3-5 or null

			await prisma.practice.create({
				data: {
					userId: user.id,
					date: date,
					totalScore: totalScore,
					rating: rating,
					location: location,
					environment: config.env as any,
					weather: weather as any,
					practiceCategory: config.category as any,
					bowId: bowId,
					arrowsId: arrowsId,
					notes: Math.random() < 0.2 ? 'Good session' : null,
					ends: {
						create: ends,
					},
				},
			});

			practicesCreated++;
		}

		console.log(`✅ Created ${practicesCreated} practices\n`);

		// ==================== COMPETITIONS ====================
		console.log('🏆 Generating 20 competitions...');

		const competitionNames = [
			'Oslo Open',
			'Indoor NM',
			'Regionsmesterskap',
			'Klubbmesterskap',
			'Vinter Cup',
			'Sommer Turnering',
			'Norgescup',
			'Kvalifisering',
			'Feltskyting',
			'3D Mesterskap',
		];

		const competitionsCreated = 0;

		for (let i = 0; i < 20; i++) {
			const daysAgo = 10 + Math.floor(Math.random() * 170); // Spread over ~6 months
			const date = randomDate(daysAgo, daysAgo);

			const isIndoor = Math.random() < 0.6;
			const category = isIndoor ? 'SKIVE_INDOOR' : 'SKIVE_OUTDOOR';
			const env = isIndoor ? 'INDOOR' : 'OUTDOOR';

			const skillLevel = getSkillLevel(daysAgo);
			const consistency = 0.82 + Math.random() * 0.08; // Slightly less consistent in competition

			// Competition details
			const name = competitionNames[i % competitionNames.length] + (i >= 10 ? ' Runde 2' : '');
			const numParticipants = 15 + Math.floor(Math.random() * 50);
			const placement = 1 + Math.floor(Math.random() * numParticipants);
			const personalBest = Math.random() < 0.15;

			// Generate rounds
			const numRounds = isIndoor ? 2 : 2;
			const arrowsPerRound = isIndoor ? 30 : 36;
			const distance = isIndoor ? 18 : [30, 50, 70][Math.floor(Math.random() * 3)];
			const targetSize = isIndoor ? 40 : distance === 30 ? 80 : 122;

			const rounds = [];
			let totalScore = 0;

			for (let r = 0; r < numRounds; r++) {
				const maxScore = arrowsPerRound * 10;
				const roundScore = generateScore(maxScore, skillLevel, consistency);
				totalScore += roundScore;

				rounds.push({
					roundNumber: r + 1,
					arrows: arrowsPerRound,
					arrowsWithoutScore: 0,
					roundScore: roundScore,
					distanceMeters: distance,
					targetSizeCm: targetSize,
					scores: [],
				});
			}

			const weather = env === 'OUTDOOR' ? [['SUN', 'CLOUDED', 'WIND'][Math.floor(Math.random() * 3)]] : [];

			await prisma.competition.create({
				data: {
					userId: user.id,
					date: date,
					name: name,
					location: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'][Math.floor(Math.random() * 4)],
					organizerName: ['NBBF', 'Oslo Bueskyttere', 'Regional Club'][Math.floor(Math.random() * 3)],
					totalScore: totalScore,
					placement: placement,
					numberOfParticipants: numParticipants,
					personalBest: personalBest,
					environment: env as any,
					weather: weather as any,
					practiceCategory: category as any,
					bowId: recurveBow.id,
					arrowsId: carbonArrows.id,
					notes: personalBest ? 'Ny personlig rekord!' : null,
					rounds: {
						create: rounds,
					},
				},
			});
		}

		console.log(`✅ Created 20 competitions\n`);

		// ==================== SUMMARY ====================
		const totalPracticesCount = await prisma.practice.count({ where: { userId: user.id } });
		const totalCompetitionsCount = await prisma.competition.count({ where: { userId: user.id } });
		const totalEndsCount = await prisma.end.count();
		const totalRoundsCount = await prisma.competitionRound.count();

		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log('✅ SEED COMPLETE!');
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log(`👤 User: ${user.email}`);
		console.log(`🏹 Bows: 3`);
		console.log(`🎯 Arrow sets: 2`);
		console.log(`📋 Round types: ${roundTypes.length}`);
		console.log(`🎯 Practices: ${totalPracticesCount} (with ${totalEndsCount} ends)`);
		console.log(`🏆 Competitions: ${totalCompetitionsCount} (with ${totalRoundsCount} rounds)`);
		console.log(`📅 Date range: Last 6 months`);
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
		console.log('🔐 Login credentials:');
		console.log('   Email: test@bueboka.no');
		console.log('   (Set up authentication separately)\n');

		await prisma.$disconnect();
	}

	main().catch((err) => {
		console.error('❌ Seed failed:', err);
		process.exitCode = 1;
	});
}
