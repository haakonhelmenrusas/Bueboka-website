import type { PracticeCategory, WeatherCondition } from '@/lib/prismaEnums';
import { Environment } from '@/lib/prismaEnums';
import { TARGET_TYPE_OPTIONS } from '@/lib/Contants';

export const TOTAL_STEPS = 4;
export const STEP_LABELS = ['Info', 'Runder', 'Resultat', 'Refleksjon'];

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

export interface CompetitionRoundInput {
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

export function getRoundSummary(round: CompetitionRoundInput): string {
	const parts: string[] = [];
	if (round.distanceMeters) parts.push(`${round.distanceMeters}m`);
	if (round.distanceFrom || round.distanceTo) parts.push(`${round.distanceFrom ?? '?'}–${round.distanceTo ?? '?'}m`);
	if (round.targetType) {
		const opt = TARGET_TYPE_OPTIONS.find((o) => o.value === round.targetType);
		parts.push(opt?.label ?? round.targetType);
	}
	return parts.length > 0 ? parts.join(' · ') : 'Ingen detaljer';
}

