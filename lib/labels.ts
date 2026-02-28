/**
 * Centralized translations and label mappings for the application
 */

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

// Practice category translations
export const PRACTICE_CATEGORY_LABELS: Record<string, string> = {
	FELT: 'Felt',
	JAKT_3D: 'Jakt/3D',
	SKIVE: 'Skive',
	ANNET: 'Annet',
};

// Practice type translations
export const PRACTICE_TYPE_LABELS: Record<string, string> = {
	TRENING: 'Trening',
	KONKURRANSE: 'Konkurranse',
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

export function getPracticeCategoryLabel(category: string): string {
	return PRACTICE_CATEGORY_LABELS[category] || category;
}

export function getPracticeTypeLabel(type: string): string {
	return PRACTICE_TYPE_LABELS[type] || type;
}
