import type { PracticeCategory, WeatherCondition } from '@/lib/prismaEnums';
import { Environment } from '@/lib/prismaEnums';
import { TARGET_TYPE_OPTIONS } from '@/lib/Contants';
import type { TranslationKeys } from '@/lib/i18n/types';

export const TOTAL_STEPS = 4;

export const getStepLabels = (t: TranslationKeys): string[] => [
	t['competitionStep.info'],
	t['competitionStep.rounds'],
	t['competitionStep.result'],
	t['competitionStep.reflection'],
];

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

export interface CompetitionRoundInput {
	roundNumber?: number;
	distanceMeters?: number;
	distanceFrom?: number;
	distanceTo?: number;
	targetType: string;
	numberArrows?: number;
	arrowsWithoutScore?: number;
	roundScore: number;
}

export interface CompetitionFormInput {
	date: string;
	name: string;
	location?: string;
	organizerName?: string;
	environment: Environment;
	weather: WeatherCondition[];
	practiceCategory: PracticeCategory;
	notes?: string;
	placement?: number;
	numberOfParticipants?: number;
	personalBest?: boolean;
	rounds: CompetitionRoundInput[];
	bowId?: string;
	arrowsId?: string;
}

export function isRangeCategory(cat: PracticeCategory): boolean {
	return cat === 'JAKT_3D' || cat === 'FELT';
}

export function emptyRound(cat: PracticeCategory): CompetitionRoundInput {
	return isRangeCategory(cat)
		? { distanceFrom: undefined, distanceTo: undefined, targetType: '', numberArrows: undefined, arrowsWithoutScore: undefined, roundScore: 0 }
		: { distanceMeters: undefined, targetType: '', numberArrows: undefined, arrowsWithoutScore: undefined, roundScore: 0 };
}

export function getRoundSummary(round: CompetitionRoundInput, t: TranslationKeys): string {
	const parts: string[] = [];
	if (round.distanceMeters) parts.push(`${round.distanceMeters}m`);
	if (round.distanceFrom || round.distanceTo) parts.push(`${round.distanceFrom ?? '?'}–${round.distanceTo ?? '?'}m`);
	if (round.targetType) {
		const opt = TARGET_TYPE_OPTIONS.find((o) => o.value === round.targetType);
		parts.push(opt?.label ?? round.targetType);
	}
	return parts.length > 0 ? parts.join(' · ') : t['round.noDetails'];
}

