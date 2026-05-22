/**
 * Centralized translations and label mappings for the application
 */

import type { TranslationKeys } from '@/lib/i18n/types';

// Bow type translations
export const BOW_TYPE_LABELS: Record<string, string> = {
	RECURVE: 'Recurve',
	COMPOUND: 'Compound',
	LONGBOW: 'Langbue',
	BAREBOW: 'Barebow',
	HORSEBOW: 'Rytterbue',
	TRADITIONAL: 'Tradisjonell',
	OTHER: 'Annet',
};

// Arrow material translations
export const ARROW_MATERIAL_LABELS: Record<string, string> = {
	KARBON: 'Karbon',
	ALUMINIUM: 'Aluminium',
	TREVERK: 'Treverk',
};

// Practice category i18n key mapping
const PRACTICE_CATEGORY_KEYS: Record<string, keyof TranslationKeys> = {
	SKIVE_INDOOR: 'practiceCategory.skiveIndoor',
	SKIVE_OUTDOOR: 'practiceCategory.skiveOutdoor',
	JAKT_3D: 'practiceCategory.jakt3D',
	FELT: 'practiceCategory.felt',
};

// Environment i18n key mapping
const ENVIRONMENT_KEYS: Record<string, keyof TranslationKeys> = {
	INDOOR: 'environment.indoor',
	OUTDOOR: 'environment.outdoor',
};

// Select options (for dropdowns/forms)
export const BOW_TYPE_OPTIONS = [
	{ value: 'RECURVE', label: 'Recurve' },
	{ value: 'COMPOUND', label: 'Compound' },
	{ value: 'LONGBOW', label: 'Langbue' },
	{ value: 'BAREBOW', label: 'Barebow' },
	{ value: 'HORSEBOW', label: 'Rytterbue' },
	{ value: 'TRADITIONAL', label: 'Tradisjonell' },
	{ value: 'OTHER', label: 'Annet' },
] as const;

export const ARROW_MATERIAL_OPTIONS = [
	{ value: 'KARBON', label: 'Karbon' },
	{ value: 'ALUMINIUM', label: 'Aluminium' },
	{ value: 'TREVERK', label: 'Treverk' },
] as const;

// Helper functions for safe label retrieval
export function getBowTypeLabel(type: string): string {
	return BOW_TYPE_LABELS[type] || type;
}

export function getArrowMaterialLabel(material: string): string {
	return ARROW_MATERIAL_LABELS[material] || material;
}

export function getPracticeCategoryLabel(category: string, t: TranslationKeys): string {
	const key = PRACTICE_CATEGORY_KEYS[category];
	return key ? t[key] : category;
}

export function getEnvironmentLabel(environment: string, t: TranslationKeys): string {
	const key = ENVIRONMENT_KEYS[environment];
	return key ? t[key] : environment;
}

// Achievement tier translations
export const ACHIEVEMENT_TIER_LABELS: Record<string, string> = {
	BRONZE: 'Bronse',
	SILVER: 'Sølv',
	GOLD: 'Gull',
	PLATINUM: 'Platina',
	DIAMOND: 'Diamant',
};

export function getAchievementTierLabel(tier: string): string {
	return ACHIEVEMENT_TIER_LABELS[tier] || tier;
}

// Public profile
export const ANONYMOUS_ARCHER_LABEL = 'Anonym bueskytter';
