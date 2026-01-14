import type { Environment, WeatherCondition } from '@/lib/prismaEnums';

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

export interface Practice {
	id: string;
	date: string;
	arrowsShot: number;
	location?: string | null;
	environment: Environment;
	weather: WeatherCondition[];
	notes?: string | null;
	roundTypeId?: string | null;
	bowId?: string | null;
	arrowsId?: string | null;
	roundType?: {
		name: string;
		distanceMeters?: number | null;
		targetSizeCm?: number | null;
	};
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
		targetSizeCm?: number | null;
	}>;
}

export type Stats = {
	last7Days: number;
	last30Days: number;
	overall: number;
};

export type StatsResponse = { stats: Stats };
