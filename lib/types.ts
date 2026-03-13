import type { Environment, PracticeCategory, WeatherCondition } from '@/lib/prismaEnums';

export type PracticeType = 'TRENING' | 'KONKURRANSE';

export interface User {
	id: string;
	email: string;
	name: string | null;
	club: string | null;
	image: string | null;
	bows: Bow[];
	arrows: Arrow[];
	practices: Practice[];
}

export interface Bow {
	id: string;
	name: string;
	type: string;
	eyeToNock: number | null;
	aimMeasure: number | null;
	eyeToSight: number | null;
	isFavorite: boolean;
	notes: string | null;
}

export interface Arrow {
	id: string;
	name: string;
	material: string;
	arrowsCount?: number | null;
	diameter?: number | null;
	length?: number | null;
	weight?: number | null;
	isFavorite: boolean;
}

export interface TargetType {
	sizeCm: number;
	type: string;
	scoringZones?: number;
}

export interface RoundType {
	id: string;
	name: string;
	environment: Environment;
	distanceMeters?: number | null;
	targetType?: TargetType | null;
	numberArrows?: number | null;
	arrowsWithoutScore?: number | null;
	roundScore?: number | null;
}

export interface Practice {
	id: string;
	date: string;
	arrowsShot: number;
	location?: string | null;
	environment: Environment;
	weather: WeatherCondition[];
	practiceType: PracticeType;
	practiceCategory: PracticeCategory;
	notes?: string | null;
	rating?: number | null;
	roundTypeId?: string | null;
	bowId?: string | null;
	arrowsId?: string | null;
	roundType?: Pick<RoundType, 'name' | 'distanceMeters' | 'targetType' | 'numberArrows' | 'arrowsWithoutScore' | 'roundScore'>;
	bow?: {
		name: string;
		type: string;
	};
	arrows?: {
		name: string;
		material: string;
	};
	ends?: Array<{
		id: string;
		arrows: number;
		scores: number[];
		arrowsPerEnd?: number | null;
		distanceMeters?: number | null;
		distanceFrom?: number | null;
		distanceTo?: number | null;
		targetSizeCm?: number | null;
		arrowsWithoutScore?: number | null;
		roundScore?: number | null;
	}>;
}

export type PeriodStats = {
	totalArrows: number;
	scoredArrows: number;
	unscoredArrows: number;
	avgScorePerArrow: number | null;
};

export type Stats = {
	last7Days: PeriodStats;
	last30Days: PeriodStats;
	overall: PeriodStats;
};

export type StatsResponse = { stats: Stats };
