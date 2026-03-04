/**
 * Achievement Checker
 * Evaluates if achievements should be unlocked based on user data
 */

import { Achievement, AchievementProgress, AchievementRequirement } from './types';
import { ACHIEVEMENTS } from './definitions';

// Compatible with both Prisma types and simplified Practice interface
interface PracticeData {
	id: string;
	date: Date | string;
	practiceType?: string | null;
	practiceCategory?: string | null;
	weather?: any;
	bowId?: string | null;
	bow?: {
		type: string;
	} | null;
	ends?: Array<{
		arrows: number;
		scores?: number[];
		roundScore?: number | null;
	}>;
}

interface UserStats {
	totalPractices: number;
	totalCompetitions: number;
	totalArrows: number;
	currentStreak: number;
	practicesByCategory: Record<string, number>;
	hasCompetitionWin?: boolean;
	bowTypesUsed: Set<string>;
	practicesByBowType: Record<string, number>;
	arrowsByBowType: Record<string, number>;
}

/**
 * Calculate user statistics from practices
 */
export function calculateUserStats(practices: PracticeData[]): UserStats {
	const stats: UserStats = {
		totalPractices: practices.length,
		totalCompetitions: practices.filter((p) => p.practiceType === 'KONKURRANSE').length,
		totalArrows: 0,
		currentStreak: 0,
		practicesByCategory: {
			SKIVE_INDOOR: 0,
			SKIVE_OUTDOOR: 0,
			JAKT_3D: 0,
			FELT: 0,
		},
		bowTypesUsed: new Set<string>(),
		practicesByBowType: {},
		arrowsByBowType: {},
	};

	// Calculate total arrows and bow statistics
	practices.forEach((practice) => {
		let practiceArrows = 0;

		if (practice.ends && Array.isArray(practice.ends)) {
			practiceArrows = practice.ends.reduce((sum: number, end: any) => sum + (end.arrows || 0), 0);
			stats.totalArrows += practiceArrows;
		}

		// Count practices by category
		if (practice.practiceCategory && stats.practicesByCategory.hasOwnProperty(practice.practiceCategory)) {
			stats.practicesByCategory[practice.practiceCategory]++;
		}

		// Track bow type usage
		const bowType = practice.bow?.type;
		if (bowType) {
			stats.bowTypesUsed.add(bowType);
			stats.practicesByBowType[bowType] = (stats.practicesByBowType[bowType] || 0) + 1;
			stats.arrowsByBowType[bowType] = (stats.arrowsByBowType[bowType] || 0) + practiceArrows;
		}
	});

	// Calculate current streak
	stats.currentStreak = calculateStreak(practices);

	return stats;
}

/**
 * Calculate consecutive practice days streak
 */
function calculateStreak(practices: PracticeData[]): number {
	if (practices.length === 0) return 0;

	// Sort by date descending
	const sortedPractices = [...practices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	// Get unique dates
	const uniqueDates = new Set(sortedPractices.map((p) => new Date(p.date).toISOString().split('T')[0]));
	const dates = Array.from(uniqueDates).sort((a, b) => b.localeCompare(a));

	if (dates.length === 0) return 0;

	// Check if most recent practice is today or yesterday
	const today = new Date().toISOString().split('T')[0];
	const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

	if (dates[0] !== today && dates[0] !== yesterday) {
		return 0; // Streak is broken
	}

	// Count consecutive days
	let streak = 1;
	for (let i = 1; i < dates.length; i++) {
		const currentDate = new Date(dates[i]);
		const prevDate = new Date(dates[i - 1]);
		const diffDays = Math.round((prevDate.getTime() - currentDate.getTime()) / 86400000);

		if (diffDays === 1) {
			streak++;
		} else {
			break;
		}
	}

	return streak;
}

/**
 * Check if a specific achievement requirement is met
 */
export function checkRequirement(
	requirement: AchievementRequirement,
	stats: UserStats,
	practices: PracticeData[]
): { isMet: boolean; current: number; required: number } {
	const { type, value, comparator = 'GREATER_OR_EQUAL', metadata } = requirement;
	let current = 0;
	let required = typeof value === 'number' ? value : 0;
	let isMet = false;

	switch (type) {
		case 'PRACTICE_COUNT':
			current = stats.totalPractices;
			required = value as number;
			isMet = compareValues(current, required, comparator);
			break;

		case 'ARROW_COUNT':
			current = stats.totalArrows;
			required = value as number;
			isMet = compareValues(current, required, comparator);
			break;

		case 'STREAK_DAYS':
			current = stats.currentStreak;
			required = value as number;
			isMet = compareValues(current, required, comparator);
			break;

		case 'COMPETITION_COUNT':
			current = stats.totalCompetitions;
			required = value as number;
			isMet = compareValues(current, required, comparator);
			break;

		case 'PERFECT_END':
			// Check if any practice has a perfect end (all 10s)
			isMet = practices.some((practice) =>
				practice.ends?.some(
					(end: any) =>
						end.scores && Array.isArray(end.scores) && end.scores.length > 0 && end.scores.every((score: number) => score === 10)
				)
			);
			current = isMet ? 1 : 0;
			required = 1;
			break;

		case 'SCORE_AVERAGE':
			// Check if any practice has average >= value
			const targetAvg = value as number;
			isMet = practices.some((practice) => {
				if (!practice.ends || practice.ends.length === 0) return false;
				let totalScore = 0;
				let totalArrows = 0;
				practice.ends.forEach((end: any) => {
					totalScore += end.roundScore || 0;
					totalArrows += end.arrows || 0;
				});
				const avg = totalArrows > 0 ? totalScore / totalArrows : 0;
				return avg >= targetAvg;
			});
			current = isMet ? 1 : 0;
			required = 1;
			break;

		case 'ARROWS_IN_SESSION':
			// Check if any single practice has >= value arrows
			const maxArrowsInSession = Math.max(
				...practices.map((p) => p.ends?.reduce((sum: number, end: any) => sum + (end.arrows || 0), 0) || 0),
				0
			);
			current = maxArrowsInSession;
			required = value as number;
			isMet = compareValues(current, required, comparator);
			break;

		case 'CATEGORY_PRACTICE':
			const category = metadata?.category;
			if (category && stats.practicesByCategory[category] !== undefined) {
				current = stats.practicesByCategory[category];
				required = value as number;
				isMet = compareValues(current, required, comparator);
			}
			break;

		case 'ALL_CATEGORIES':
			const categoriesUsed = Object.values(stats.practicesByCategory).filter((count) => count > 0).length;
			current = categoriesUsed;
			required = value as number;
			isMet = compareValues(current, required, comparator);
			break;

		case 'COMPETITION_WIN':
			// This would need additional data (placement/ranking)
			// For now, we'll set this as unimplemented
			isMet = stats.hasCompetitionWin || false;
			current = isMet ? 1 : 0;
			required = 1;
			break;

		case 'WEATHER_CONDITION':
			// Check if practiced in specific weather conditions
			const targetConditions = metadata?.conditions || [];
			isMet = practices.some((p) => p.weather && Array.isArray(p.weather) && p.weather.some((w) => targetConditions.includes(w)));
			current = isMet ? 1 : 0;
			required = 1;
			break;

		case 'EARLY_BIRD':
		case 'NIGHT_OWL':
			// These require time data which we don't currently track
			// Could be added in future with practice timestamps
			isMet = false;
			current = 0;
			required = 1;
			break;

		case 'BOW_TYPE_COUNT':
			// Count unique bow types used
			current = stats.bowTypesUsed.size;
			required = value as number;
			isMet = compareValues(current, required, comparator);
			break;

		case 'BOW_TYPE_PRACTICES':
			// Count practices with specific bow type
			const practicesBowType = metadata?.bowType;
			if (practicesBowType) {
				current = stats.practicesByBowType[practicesBowType] || 0;
				required = value as number;
				isMet = compareValues(current, required, comparator);
			}
			break;

		case 'BOW_TYPE_ARROWS':
			// Count arrows shot with specific bow type
			const arrowsBowType = metadata?.bowType;
			if (arrowsBowType) {
				current = stats.arrowsByBowType[arrowsBowType] || 0;
				required = value as number;
				isMet = compareValues(current, required, comparator);
			}
			break;

		default:
			break;
	}

	return { isMet, current, required };
}

/**
 * Compare two values based on comparator
 */
function compareValues(current: number, required: number, comparator: string): boolean {
	switch (comparator) {
		case 'EQUALS':
			return current === required;
		case 'GREATER_THAN':
			return current > required;
		case 'LESS_THAN':
			return current < required;
		case 'GREATER_OR_EQUAL':
		default:
			return current >= required;
	}
}

/**
 * Check all achievements and return progress for each
 * @param practices - User's practice data
 * @param unlockedAchievementIds - IDs of achievements already in database
 * @param autoUnlock - If true, marks achievements as unlocked if requirements are met (for check endpoint). If false, only uses database records (for display)
 */
export function checkAllAchievements(
	practices: PracticeData[],
	unlockedAchievementIds: string[] = [],
	autoUnlock: boolean = false
): AchievementProgress[] {
	const stats = calculateUserStats(practices);

	return ACHIEVEMENTS.map((achievement) => {
		const isUnlocked = unlockedAchievementIds.includes(achievement.id);
		const { isMet, current, required } = checkRequirement(achievement.requirements, stats, practices);

		const percentage = required > 0 ? Math.min(100, Math.round((current / required) * 100)) : 0;

		return {
			achievement,
			current,
			required,
			percentage,
			isUnlocked: autoUnlock ? isUnlocked || isMet : isUnlocked,
		};
	});
}

/**
 * Get newly unlocked achievements (not previously unlocked)
 */
export function getNewlyUnlockedAchievements(practices: PracticeData[], previouslyUnlockedIds: string[]): Achievement[] {
	const progress = checkAllAchievements(practices, previouslyUnlockedIds, true); // autoUnlock=true to find achievements that meet requirements

	return progress.filter((p) => p.percentage >= 100 && !previouslyUnlockedIds.includes(p.achievement.id)).map((p) => p.achievement);
}

/**
 * Get achievements close to being unlocked (80%+)
 */
export function getAlmostUnlockedAchievements(practices: PracticeData[], unlockedIds: string[]): AchievementProgress[] {
	const progress = checkAllAchievements(practices, unlockedIds, true); // autoUnlock=true to calculate based on requirements

	return progress.filter((p) => !p.isUnlocked && p.percentage >= 80 && p.percentage < 100);
}
