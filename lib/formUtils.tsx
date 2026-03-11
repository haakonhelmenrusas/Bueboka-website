import { LuCloud, LuHouse, LuSparkles, LuSun, LuTarget, LuTrees, LuZap } from 'react-icons/lu';

export const getWeatherSelectOptions = () => [
	{ value: 'SUN', label: 'Sol', icon: <LuSun size={16} /> },
	{ value: 'CLOUDED', label: 'Skyet', icon: <LuCloud size={16} /> },
	{ value: 'CLEAR', label: 'Klarvær', icon: <LuSparkles size={16} /> },
	{ value: 'RAIN', label: 'Regn', icon: <LuCloud size={16} /> },
	{ value: 'WIND', label: 'Vind', icon: <LuCloud size={16} /> },
	{ value: 'SNOW', label: 'Snø', icon: <LuCloud size={16} /> },
	{ value: 'FOG', label: 'Tåke', icon: <LuCloud size={16} /> },
	{ value: 'THUNDER', label: 'Torden', icon: <LuZap size={16} /> },
	{ value: 'CHANGING_CONDITIONS', label: 'Skiftende forhold', icon: <LuCloud size={16} /> },
	{ value: 'OTHER', label: 'Annet', icon: <LuCloud size={16} /> },
];

// Shared environment options
export const getEnvironmentOptions = () => [
	{ value: 'INDOOR', label: 'Inne', icon: <LuHouse size={16} /> },
	{ value: 'OUTDOOR', label: 'Ute', icon: <LuTrees size={16} /> },
];

// Shared practice category options
export const getPracticeCategoryOptions = () => [
	{ value: 'SKIVE_INDOOR', label: 'Skive innendørs', icon: <LuTarget size={16} /> },
	{ value: 'SKIVE_OUTDOOR', label: 'Skive utendørs', icon: <LuTarget size={16} /> },
	{ value: 'JAKT_3D', label: 'Jakt/3D', icon: <LuTrees size={16} /> },
	{ value: 'FELT', label: 'Felt', icon: <LuTrees size={16} /> },
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
export const getBowOptions = (bows: EquipmentOption[]) => [
	{ value: '', label: 'Ingen valgt' },
	...bows.map((b) => ({ value: b.id, label: `${b.name} (${b.type})` })),
];

export const getArrowsOptions = (arrows: ArrowsOption[]) => [
	{ value: '', label: 'Ingen valgt' },
	...arrows.map((a) => ({ value: a.id, label: `${a.name} (${a.material})` })),
];
