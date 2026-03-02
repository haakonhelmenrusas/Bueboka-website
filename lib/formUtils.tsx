import {
	Cloud,
	CloudDrizzle,
	CloudFog,
	CloudRain,
	CloudSnow,
	CloudSun,
	Footprints,
	Home,
	Sparkles,
	Sun,
	Target,
	Trees,
	Wind,
	Zap,
} from 'lucide-react';

export const getWeatherSelectOptions = () => [
	{ value: 'SUN', label: 'Sol', icon: <Sun size={16} /> },
	{ value: 'CLOUDED', label: 'Skyet', icon: <Cloud size={16} /> },
	{ value: 'CLEAR', label: 'Klarvær', icon: <Sparkles size={16} /> },
	{ value: 'RAIN', label: 'Regn', icon: <CloudRain size={16} /> },
	{ value: 'WIND', label: 'Vind', icon: <Wind size={16} /> },
	{ value: 'SNOW', label: 'Snø', icon: <CloudSnow size={16} /> },
	{ value: 'FOG', label: 'Tåke', icon: <CloudFog size={16} /> },
	{ value: 'THUNDER', label: 'Torden', icon: <Zap size={16} /> },
	{ value: 'CHANGING_CONDITIONS', label: 'Skiftende forhold', icon: <CloudDrizzle size={16} /> },
	{ value: 'OTHER', label: 'Annet', icon: <CloudSun size={16} /> },
];

// Shared environment options
export const getEnvironmentOptions = () => [
	{ value: 'INDOOR', label: 'Inne', icon: <Home size={16} /> },
	{ value: 'OUTDOOR', label: 'Ute', icon: <Trees size={16} /> },
];

// Shared practice category options
export const getPracticeCategoryOptions = () => [
	{ value: 'SKIVE_INDOOR', label: 'Skive innendørs', icon: <Target size={16} /> },
	{ value: 'SKIVE_OUTDOOR', label: 'Skive utendørs', icon: <Target size={16} /> },
	{ value: 'JAKT_3D', label: 'Jakt/3D', icon: <Footprints size={16} /> },
	{ value: 'FELT', label: 'Felt', icon: <Trees size={16} /> },
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
