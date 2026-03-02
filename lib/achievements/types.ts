/**
 * Achievement System Types
 * Inspired by: Strava, Duolingo, Nike Run Club, GitHub
 */

export type AchievementCategory =
	| 'MILESTONE' // One-time achievements (first practice, 100 practices)
	| 'STREAK' // Consistency achievements (7-day streak, 30-day streak)
	| 'PERFORMANCE' // Score/skill achievements (perfect end, high average)
	| 'COMPETITION' // Competition-specific achievements (first competition, podium)
	| 'DEDICATION' // Long-term commitment (arrows shot, time invested)
	| 'EXPLORATION' // Trying new things (all categories, different equipment)
	| 'SPECIAL'; // Rare/seasonal achievements

export type AchievementRarity =
	| 'COMMON' // 50%+ users achieve
	| 'UNCOMMON' // 25-50% users achieve
	| 'RARE' // 10-25% users achieve
	| 'EPIC' // 5-10% users achieve
	| 'LEGENDARY'; // <5% users achieve

export type AchievementTier =
	| 'BRONZE' // Entry level
	| 'SILVER' // Intermediate
	| 'GOLD' // Advanced
	| 'PLATINUM' // Expert
	| 'DIAMOND'; // Master

export interface Achievement {
	id: string;
	name: string;
	description: string;
	category: AchievementCategory;
	rarity: AchievementRarity;
	tier?: AchievementTier;
	icon: string; // Lucide icon name or emoji
	points: number; // For potential gamification
	requirements: AchievementRequirement;
	unlockedAt?: Date;
	progress?: number; // 0-100 percentage
}

export interface AchievementRequirement {
	type:
		| 'PRACTICE_COUNT' // Total practices logged
		| 'ARROW_COUNT' // Total arrows shot
		| 'STREAK_DAYS' // Consecutive days practiced
		| 'SCORE_AVERAGE' // Average score per arrow
		| 'PERFECT_END' // All 10s in an end
		| 'COMPETITION_COUNT' // Competitions participated
		| 'COMPETITION_WIN' // Win a competition
		| 'CATEGORY_PRACTICE' // Practice in specific category
		| 'ALL_CATEGORIES' // Practice in all categories
		| 'EQUIPMENT_COUNT' // Use different equipment
		| 'HIGH_SCORE' // Achieve specific score
		| 'ARROWS_IN_SESSION' // Arrows in single session
		| 'WEATHER_CONDITION' // Practice in specific weather
		| 'EARLY_BIRD' // Practice before certain time
		| 'NIGHT_OWL'; // Practice after certain time

	value: number | string | boolean;
	comparator?: 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'GREATER_OR_EQUAL';
	metadata?: Record<string, any>; // Additional context
}

export interface UserAchievement {
	userId: string;
	achievementId: string;
	unlockedAt: Date;
	progress: number; // Current progress towards achievement
	notified: boolean; // Whether user has been notified
}

export interface AchievementProgress {
	achievement: Achievement;
	current: number;
	required: number;
	percentage: number;
	isUnlocked: boolean;
}
