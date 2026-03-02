/**
 * Achievement Definitions
 * All available achievements in the system
 */

import { Achievement } from './types';

export const ACHIEVEMENTS: Achievement[] = [
	// ===== MILESTONE ACHIEVEMENTS =====
	{
		id: 'first-practice',
		name: 'Første Skudd',
		description: 'Registrer din første treningsøkt',
		category: 'MILESTONE',
		rarity: 'COMMON',
		icon: 'Target',
		points: 10,
		requirements: {
			type: 'PRACTICE_COUNT',
			value: 1,
			comparator: 'GREATER_OR_EQUAL',
		},
	},
	{
		id: 'practices-10',
		name: 'På God Vei',
		description: 'Registrer 10 treningsøkter',
		category: 'MILESTONE',
		rarity: 'COMMON',
		tier: 'BRONZE',
		icon: 'Award',
		points: 25,
		requirements: {
			type: 'PRACTICE_COUNT',
			value: 10,
			comparator: 'GREATER_OR_EQUAL',
		},
	},
	{
		id: 'practices-50',
		name: 'Dedikert Skytter',
		description: 'Registrer 50 treningsøkter',
		category: 'MILESTONE',
		rarity: 'UNCOMMON',
		tier: 'SILVER',
		icon: 'Award',
		points: 75,
		requirements: {
			type: 'PRACTICE_COUNT',
			value: 50,
			comparator: 'GREATER_OR_EQUAL',
		},
	},
	{
		id: 'practices-100',
		name: 'Århundrets Skytter',
		description: 'Registrer 100 treningsøkter',
		category: 'MILESTONE',
		rarity: 'RARE',
		tier: 'GOLD',
		icon: 'Trophy',
		points: 150,
		requirements: {
			type: 'PRACTICE_COUNT',
			value: 100,
			comparator: 'GREATER_OR_EQUAL',
		},
	},
	{
		id: 'practices-500',
		name: 'Mester',
		description: 'Registrer 500 treningsøkter',
		category: 'MILESTONE',
		rarity: 'EPIC',
		tier: 'PLATINUM',
		icon: 'Crown',
		points: 500,
		requirements: {
			type: 'PRACTICE_COUNT',
			value: 500,
			comparator: 'GREATER_OR_EQUAL',
		},
	},

	// ===== STREAK ACHIEVEMENTS =====
	{
		id: 'streak-3',
		name: 'I Gang',
		description: 'Tren 3 dager på rad',
		category: 'STREAK',
		rarity: 'COMMON',
		tier: 'BRONZE',
		icon: 'Flame',
		points: 15,
		requirements: {
			type: 'STREAK_DAYS',
			value: 3,
			comparator: 'GREATER_OR_EQUAL',
		},
	},
	{
		id: 'streak-7',
		name: 'Uke-Kriger',
		description: 'Tren 5 dager i løpet av en uke',
		category: 'STREAK',
		rarity: 'UNCOMMON',
		tier: 'SILVER',
		icon: 'Flame',
		points: 35,
		requirements: {
			type: 'PRACTICE_COUNT',
			value: 5,
			comparator: 'GREATER_OR_EQUAL',
		},
	},
	{
		id: 'streak-30',
		name: 'Månedens Mester',
		description: 'Tren 15 dager i løpet av en måned',
		category: 'STREAK',
		rarity: 'RARE',
		tier: 'GOLD',
		icon: 'Zap',
		points: 150,
		requirements: {
			type: 'PRACTICE_COUNT',
			value: 15,
			comparator: 'GREATER_OR_EQUAL',
		},
	},
	{
		id: 'streak-100',
		name: 'Ustoppelig',
		description: 'Tren 50 dager i løpet av en sesong (3 måneder)',
		category: 'STREAK',
		rarity: 'LEGENDARY',
		tier: 'DIAMOND',
		icon: 'Star',
		points: 500,
		requirements: {
			type: 'PRACTICE_COUNT',
			value: 50,
			comparator: 'GREATER_OR_EQUAL',
		},
	},

	// ===== ARROW COUNT ACHIEVEMENTS =====
	{
		id: 'arrows-1000',
		name: 'Tusen Skudd',
		description: 'Skyt 1000 piler totalt',
		category: 'DEDICATION',
		rarity: 'COMMON',
		tier: 'BRONZE',
		icon: 'ArrowRight',
		points: 30,
		requirements: {
			type: 'ARROW_COUNT',
			value: 1000,
			comparator: 'GREATER_OR_EQUAL',
		},
	},
	{
		id: 'arrows-5000',
		name: 'Pil-Veteran',
		description: 'Skyt 5000 piler totalt',
		category: 'DEDICATION',
		rarity: 'UNCOMMON',
		tier: 'SILVER',
		icon: 'ArrowRight',
		points: 100,
		requirements: {
			type: 'ARROW_COUNT',
			value: 5000,
			comparator: 'GREATER_OR_EQUAL',
		},
	},
	{
		id: 'arrows-10000',
		name: 'Ti Tusen Piler',
		description: 'Skyt 10,000 piler totalt',
		category: 'DEDICATION',
		rarity: 'RARE',
		tier: 'GOLD',
		icon: 'Crosshair',
		points: 250,
		requirements: {
			type: 'ARROW_COUNT',
			value: 10000,
			comparator: 'GREATER_OR_EQUAL',
		},
	},
	{
		id: 'arrows-50000',
		name: 'Pil-Legende',
		description: 'Skyt 50,000 piler totalt',
		category: 'DEDICATION',
		rarity: 'LEGENDARY',
		tier: 'DIAMOND',
		icon: 'Target',
		points: 1000,
		requirements: {
			type: 'ARROW_COUNT',
			value: 50000,
			comparator: 'GREATER_OR_EQUAL',
		},
	},

	// ===== PERFORMANCE ACHIEVEMENTS =====
	{
		id: 'perfect-end',
		name: 'Perfekt!',
		description: 'Skyt en perfekt runde (alle 10-ere)',
		category: 'PERFORMANCE',
		rarity: 'RARE',
		tier: 'GOLD',
		icon: 'Award',
		points: 100,
		requirements: {
			type: 'PERFECT_END',
			value: true,
		},
	},
	{
		id: 'high-average-8',
		name: 'Høyt Nivå',
		description: 'Oppnå et snitt på 8.0 per pil i en økt',
		category: 'PERFORMANCE',
		rarity: 'UNCOMMON',
		tier: 'SILVER',
		icon: 'TrendingUp',
		points: 50,
		requirements: {
			type: 'SCORE_AVERAGE',
			value: 8.0,
			comparator: 'GREATER_OR_EQUAL',
		},
	},
	{
		id: 'high-average-9',
		name: 'Eksepsjonell',
		description: 'Oppnå et snitt på 9.0 per pil i en økt',
		category: 'PERFORMANCE',
		rarity: 'EPIC',
		tier: 'PLATINUM',
		icon: 'Sparkles',
		points: 200,
		requirements: {
			type: 'SCORE_AVERAGE',
			value: 9.0,
			comparator: 'GREATER_OR_EQUAL',
		},
	},
	{
		id: 'big-session',
		name: 'Maraton-Økt',
		description: 'Skyt 200+ piler i én treningsøkt',
		category: 'DEDICATION',
		rarity: 'UNCOMMON',
		tier: 'SILVER',
		icon: 'Activity',
		points: 40,
		requirements: {
			type: 'ARROWS_IN_SESSION',
			value: 200,
			comparator: 'GREATER_OR_EQUAL',
		},
	},

	// ===== COMPETITION ACHIEVEMENTS =====
	{
		id: 'first-competition',
		name: 'Konkurransedebut',
		description: 'Delta i din første konkurranse',
		category: 'COMPETITION',
		rarity: 'COMMON',
		tier: 'BRONZE',
		icon: 'Trophy',
		points: 25,
		requirements: {
			type: 'COMPETITION_COUNT',
			value: 1,
			comparator: 'GREATER_OR_EQUAL',
		},
	},
	{
		id: 'competitions-10',
		name: 'Konkurranseskytter',
		description: 'Delta i 10 konkurranser',
		category: 'COMPETITION',
		rarity: 'UNCOMMON',
		tier: 'SILVER',
		icon: 'Medal',
		points: 75,
		requirements: {
			type: 'COMPETITION_COUNT',
			value: 10,
			comparator: 'GREATER_OR_EQUAL',
		},
	},
	{
		id: 'competition-winner',
		name: 'Seierherre',
		description: 'Vinn en konkurranse',
		category: 'COMPETITION',
		rarity: 'EPIC',
		tier: 'GOLD',
		icon: 'Crown',
		points: 250,
		requirements: {
			type: 'COMPETITION_WIN',
			value: true,
		},
	},

	// ===== EXPLORATION ACHIEVEMENTS =====
	{
		id: 'all-categories',
		name: 'Allsidig Skytter',
		description: 'Tren i alle fire kategorier',
		category: 'EXPLORATION',
		rarity: 'UNCOMMON',
		tier: 'SILVER',
		icon: 'Compass',
		points: 60,
		requirements: {
			type: 'ALL_CATEGORIES',
			value: 4,
			comparator: 'EQUALS',
		},
	},
	{
		id: 'indoor-specialist',
		name: 'Innendørs-Spesialist',
		description: 'Registrer 50 innendørs treningsøkter',
		category: 'EXPLORATION',
		rarity: 'UNCOMMON',
		tier: 'SILVER',
		icon: 'Home',
		points: 50,
		requirements: {
			type: 'CATEGORY_PRACTICE',
			value: 50,
			comparator: 'GREATER_OR_EQUAL',
			metadata: { category: 'SKIVE_INDOOR' },
		},
	},
	{
		id: 'outdoor-enthusiast',
		name: 'Friluftsskytter',
		description: 'Registrer 50 utendørs treningsøkter',
		category: 'EXPLORATION',
		rarity: 'UNCOMMON',
		tier: 'SILVER',
		icon: 'Trees',
		points: 50,
		requirements: {
			type: 'CATEGORY_PRACTICE',
			value: 50,
			comparator: 'GREATER_OR_EQUAL',
			metadata: { category: 'SKIVE_OUTDOOR' },
		},
	},
	{
		id: '3d-hunter',
		name: '3D Jeger',
		description: 'Registrer 50 3D/jakt treningsøkter',
		category: 'EXPLORATION',
		rarity: 'UNCOMMON',
		tier: 'SILVER',
		icon: 'Footprints',
		points: 50,
		requirements: {
			type: 'CATEGORY_PRACTICE',
			value: 50,
			comparator: 'GREATER_OR_EQUAL',
			metadata: { category: 'JAKT_3D' },
		},
	},
	{
		id: 'field-archer',
		name: 'Feltmester',
		description: 'Registrer 50 felt treningsøkter',
		category: 'EXPLORATION',
		rarity: 'UNCOMMON',
		tier: 'SILVER',
		icon: 'Mountain',
		points: 50,
		requirements: {
			type: 'CATEGORY_PRACTICE',
			value: 50,
			comparator: 'GREATER_OR_EQUAL',
			metadata: { category: 'FELT' },
		},
	},

	// ===== SPECIAL/FUN ACHIEVEMENTS =====
	{
		id: 'weather-warrior',
		name: 'Været Stopper Meg Ikke',
		description: 'Tren i regn eller vind',
		category: 'SPECIAL',
		rarity: 'UNCOMMON',
		icon: 'CloudRain',
		points: 30,
		requirements: {
			type: 'WEATHER_CONDITION',
			value: true,
			metadata: { conditions: ['RAIN', 'WIND'] },
		},
	},
	{
		id: 'early-bird',
		name: 'Morgenfugl',
		description: 'Tren før kl. 07:00',
		category: 'SPECIAL',
		rarity: 'RARE',
		icon: 'Sunrise',
		points: 40,
		requirements: {
			type: 'EARLY_BIRD',
			value: 7,
			comparator: 'LESS_THAN',
		},
	},
	{
		id: 'night-owl',
		name: 'Natteugle',
		description: 'Tren etter kl. 22:00',
		category: 'SPECIAL',
		rarity: 'RARE',
		icon: 'Moon',
		points: 40,
		requirements: {
			type: 'NIGHT_OWL',
			value: 22,
			comparator: 'GREATER_OR_EQUAL',
		},
	},
];

// Helper to get achievement by ID
export function getAchievementById(id: string): Achievement | undefined {
	return ACHIEVEMENTS.find((a) => a.id === id);
}

// Helper to get achievements by category
export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
	return ACHIEVEMENTS.filter((a) => a.category === category);
}

// Helper to get achievements by rarity
export function getAchievementsByRarity(rarity: Achievement['rarity']): Achievement[] {
	return ACHIEVEMENTS.filter((a) => a.rarity === rarity);
}
