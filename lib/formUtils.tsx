import { LuHouse, LuTarget, LuTrees } from 'react-icons/lu';
import type { TranslationKeys } from '@/lib/i18n/types';

// Shared environment options
export const getEnvironmentOptions = (t: TranslationKeys) => [
	{ value: 'INDOOR', label: t['environment.indoor'], icon: <LuHouse size={16} /> },
	{ value: 'OUTDOOR', label: t['environment.outdoor'], icon: <LuTrees size={16} /> },
];

// Shared practice category options
export const getPracticeCategoryOptions = (t: TranslationKeys) => [
	{ value: 'SKIVE_INDOOR', label: t['practiceCategory.skiveIndoor'], icon: <LuTarget size={16} /> },
	{ value: 'SKIVE_OUTDOOR', label: t['practiceCategory.skiveOutdoor'], icon: <LuTarget size={16} /> },
	{ value: 'JAKT_3D', label: t['practiceCategory.jakt3D'], icon: <LuTrees size={16} /> },
	{ value: 'FELT', label: t['practiceCategory.felt'], icon: <LuTrees size={16} /> },
];

// Shared types
export interface EquipmentOption {
	id: string;
	name: string;
	type: string;
	isFavorite?: boolean;
}

export interface ArrowsOption {
	id: string;
	name: string;
	material: string;
	isFavorite?: boolean;
}

// Helper to get equipment select options
export const getBowOptions = (bows: EquipmentOption[], t: TranslationKeys) => [
	{ value: '', label: t['form.noneSelected'] },
	...bows.map((b) => ({ value: b.id, label: `${b.name} (${b.type})` })),
];

export const getArrowsOptions = (arrows: ArrowsOption[], t: TranslationKeys) => [
	{ value: '', label: t['form.noneSelected'] },
	...arrows.map((a) => ({ value: a.id, label: `${a.name} (${a.material})` })),
];
