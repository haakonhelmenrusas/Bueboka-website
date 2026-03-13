export type DateRange = 'all' | '7days' | '30days' | '90days';

export type PracticeCategory = 'SKIVE_INDOOR' | 'SKIVE_OUTDOOR' | 'JAKT_3D' | 'FELT' | 'all';

export interface SeriesData {
	date: string;
	arrows: number;
	scoredArrows: number; // Arrows that have a score (excludes arrowsWithoutScore)
	score: number;
	practiceType: string;
	practiceCategory: string;
	sessionId?: string; // ID to track individual sessions on same date
}

export interface Series {
	name: string;
	data: SeriesData[];
}
