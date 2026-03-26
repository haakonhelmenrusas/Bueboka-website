import type { PracticeCategory, WeatherCondition } from '@/lib/prismaEnums';
import { Environment } from '@/lib/prismaEnums';
import { TARGET_TYPE_OPTIONS } from '@/lib/Contants';

// ─── Step definitions ─────────────────────────────────────────────────────────
export const TOTAL_STEPS = 4;
export const STEP_LABELS = ['Info', 'Runder', 'Poeng', 'Refleksjon'];

// ─── Weather chip options ─────────────────────────────────────────────────────
export const WEATHER_OPTIONS: { value: WeatherCondition; label: string }[] = [
	{ value: 'SUN', label: '☀️ Sol' },
	{ value: 'CLOUDED', label: '⛅ Skyet' },
	{ value: 'CLEAR', label: '🌤 Klart' },
	{ value: 'RAIN', label: '🌧 Regn' },
	{ value: 'WIND', label: '💨 Vind' },
	{ value: 'SNOW', label: '❄️ Snø' },
	{ value: 'FOG', label: '🌫 Tåke' },
	{ value: 'THUNDER', label: '⛈ Torden' },
	{ value: 'CHANGING_CONDITIONS', label: '🔄 Skiftende' },
	{ value: 'OTHER', label: '🌡 Annet' },
];

// ─── Arrow score button options ───────────────────────────────────────────────
export const ARROW_SCORE_OPTIONS = [
	{ label: 'X', value: 10 },
	{ label: '10', value: 10 },
	{ label: '9', value: 9 },
	{ label: '8', value: 8 },
	{ label: '7', value: 7 },
	{ label: '6', value: 6 },
	{ label: '5', value: 5 },
	{ label: '4', value: 4 },
	{ label: '3', value: 3 },
	{ label: '2', value: 2 },
	{ label: '1', value: 1 },
	{ label: 'M', value: 0 },
];

// ─── Types ────────────────────────────────────────────────────────────────────
export interface RoundInput {
	distanceMeters?: number;
	distanceFrom?: number;
	distanceTo?: number;
	targetType: string;
	numberArrows?: number;
	arrowsWithoutScore?: number;
	roundScore: number;
	scores?: number[];
}

export interface PracticeFormInput {
	date: string; // ISO
	location?: string;
	environment: Environment;
	weather: WeatherCondition[];
	practiceCategory: PracticeCategory;
	notes?: string;
	rating?: number;
	rounds: RoundInput[];
	bowId?: string;
	arrowsId?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function isRangeCategory(cat: PracticeCategory): boolean {
	return cat === 'JAKT_3D' || cat === 'FELT';
}

export function emptyRound(cat: PracticeCategory): RoundInput {
	return isRangeCategory(cat)
		? {
				distanceFrom: undefined,
				distanceTo: undefined,
				targetType: '',
				numberArrows: undefined,
				arrowsWithoutScore: undefined,
				roundScore: 0,
				scores: [],
			}
		: { distanceMeters: undefined, targetType: '', numberArrows: undefined, arrowsWithoutScore: undefined, roundScore: 0, scores: [] };
}

export function getRoundSummary(round: RoundInput): string {
	const parts: string[] = [];
	if (round.distanceMeters) parts.push(`${round.distanceMeters}m`);
	if (round.distanceFrom || round.distanceTo) parts.push(`${round.distanceFrom ?? '?'}–${round.distanceTo ?? '?'}m`);
	if (round.targetType) {
		const opt = TARGET_TYPE_OPTIONS.find((o) => o.value === round.targetType);
		parts.push(opt?.label ?? round.targetType);
	}
	return parts.length > 0 ? parts.join(' · ') : 'Ingen detaljer';
}
