/**
 * Test script for bow achievements
 * Run with: npx tsx scripts/test-bow-achievements.ts
 */

import { calculateUserStats, checkRequirement } from '@/lib/achievements/checker';
import { ACHIEVEMENTS } from '@/lib/achievements/definitions';

// Mock practice data with different bow types
const mockPractices = [
	{
		id: '1',
		date: new Date('2026-03-01'),
		practiceType: 'TRENING',
		practiceCategory: 'SKIVE_INDOOR',
		bow: { type: 'RECURVE' },
		ends: [{ arrows: 36, scores: [], roundScore: 300 }],
	},
	{
		id: '2',
		date: new Date('2026-03-02'),
		practiceType: 'TRENING',
		practiceCategory: 'SKIVE_OUTDOOR',
		bow: { type: 'COMPOUND' },
		ends: [{ arrows: 30, scores: [], roundScore: 280 }],
	},
	{
		id: '3',
		date: new Date('2026-03-03'),
		practiceType: 'TRENING',
		practiceCategory: 'SKIVE_INDOOR',
		bow: { type: 'RECURVE' },
		ends: [{ arrows: 36, scores: [], roundScore: 310 }],
	},
	{
		id: '4',
		date: new Date('2026-03-04'),
		practiceType: 'TRENING',
		practiceCategory: 'JAKT_3D',
		bow: { type: 'LONGBOW' },
		ends: [{ arrows: 24, scores: [], roundScore: 180 }],
	},
];

console.log('🏹 Testing Bow Achievements System\n');
console.log('='.repeat(60));

// Calculate stats
const stats = calculateUserStats(mockPractices);

console.log('\n📊 User Statistics:');
console.log(`  Total Practices: ${stats.totalPractices}`);
console.log(`  Total Arrows: ${stats.totalArrows}`);
console.log(`  Bow Types Used: ${stats.bowTypesUsed.size} (${Array.from(stats.bowTypesUsed).join(', ')})`);
console.log('\n  Practices by Bow Type:');
Object.entries(stats.practicesByBowType).forEach(([type, count]) => {
	console.log(`    ${type}: ${count} practices`);
});
console.log('\n  Arrows by Bow Type:');
Object.entries(stats.arrowsByBowType).forEach(([type, count]) => {
	console.log(`    ${type}: ${count} arrows`);
});

console.log('\n' + '='.repeat(60));
console.log('\n🎯 Bow Achievement Status:\n');

// Check bow-related achievements
const bowAchievements = ACHIEVEMENTS.filter(
	(a) =>
		a.id.includes('bow') ||
		a.id.includes('recurve') ||
		a.id.includes('compound') ||
		a.id.includes('longbow') ||
		a.id.includes('barebow') ||
		a.id.includes('horsebow') ||
		a.id.includes('traditionalist')
);

bowAchievements.forEach((achievement) => {
	const result = checkRequirement(achievement.requirements, stats, mockPractices);
	const status = result.isMet ? '✅' : '⏳';
	const progress = `${result.current}/${result.required}`;
	const percentage = result.required > 0 ? Math.round((result.current / result.required) * 100) : 0;

	console.log(`${status} ${achievement.name}`);
	console.log(`   ${achievement.description}`);
	console.log(`   Progress: ${progress} (${percentage}%)`);
	console.log(`   Points: ${achievement.points} | Rarity: ${achievement.rarity} | Tier: ${achievement.tier || 'N/A'}`);
	console.log('');
});

console.log('='.repeat(60));
console.log('\n✨ Test Complete!\n');

// Summary
const unlockedCount = bowAchievements.filter((a) => {
	const result = checkRequirement(a.requirements, stats, mockPractices);
	return result.isMet;
}).length;

console.log(`📈 Summary: ${unlockedCount}/${bowAchievements.length} bow achievements unlocked with this test data`);
console.log('');
