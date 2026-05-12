import type { PracticeCategory, WeatherCondition } from '@/lib/prismaEnums';
import { Environment } from '@/lib/prismaEnums';
import { getTargetLabel } from '@/lib/Contants';
import type { TranslationKeys } from '@/lib/i18n/types';

// ─── Step definitions ─────────────────────────────────────────────────────────
export const TOTAL_STEPS = 4;

export const getStepLabels = (t: TranslationKeys): string[] => [
	t['practiceStep.info'],
	t['practiceStep.rounds'],
	t['practiceStep.scoring'],
	t['practiceStep.reflection'],
];

// ─── Weather chip options ─────────────────────────────────────────────────────
export const getWeatherOptions = (t: TranslationKeys): { value: WeatherCondition; label: string }[] => [
	{ value: 'SUN', label: t['weather.sun'] },
	{ value: 'CLOUDED', label: t['weather.clouded'] },
	{ value: 'CLEAR', label: t['weather.clear'] },
	{ value: 'RAIN', label: t['weather.rain'] },
	{ value: 'WIND', label: t['weather.wind'] },
	{ value: 'SNOW', label: t['weather.snow'] },
	{ value: 'FOG', label: t['weather.fog'] },
	{ value: 'THUNDER', label: t['weather.thunder'] },
	{ value: 'CHANGING_CONDITIONS', label: t['weather.changing'] },
	{ value: 'OTHER', label: t['weather.other'] },
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
	arrowsPerEnd?: number;
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

export function getRoundSummary(round: RoundInput, t: TranslationKeys): string {
	const parts: string[] = [];
	if (round.distanceMeters) parts.push(`${round.distanceMeters}m`);
	if (round.distanceFrom || round.distanceTo) parts.push(`${round.distanceFrom ?? '?'}–${round.distanceTo ?? '?'}m`);
	if (round.targetType) {
		parts.push(getTargetLabel(round.targetType, t));
	}
	return parts.length > 0 ? parts.join(' · ') : t['round.noDetails'];
}
