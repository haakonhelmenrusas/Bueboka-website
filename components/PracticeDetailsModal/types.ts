import type { PracticeCategory, WeatherCondition } from '@/lib/prismaEnums';
import { Environment } from '@/lib/prismaEnums';

type PracticeType = 'TRENING' | 'KONKURRANSE';

export type PracticeEnd = {
	id: string;
	arrows: number;
	arrowsPerEnd?: number | null;
	distanceMeters?: number | null;
	targetSizeCm?: number | null;
	scores: number[];
	roundScore?: number | null;
};

export interface PracticeDetails {
	id: string;
	date: string;
	arrowsShot?: number;
	arrowsWithoutScore?: number | null;
	location?: string | null;
	environment: Environment;
	weather: WeatherCondition[];
	notes?: string | null;
	practiceType?: PracticeType | null;
	practiceCategory?: PracticeCategory | null;
	totalScore?: number;
	placement?: number | null;
	numberOfParticipants?: number | null;
	bow?: { name: string; type: string };
	arrows?: { name: string; material: string };
	ends?: PracticeEnd[];
}

export interface PracticeDetailsModalProps {
	open: boolean;
	practice?: PracticeDetails;
	onClose: () => void;
	onEdit?: () => void;
	onDeleted?: (id: string) => void;
}
