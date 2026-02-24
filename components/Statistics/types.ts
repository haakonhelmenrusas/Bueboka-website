export type DateRange = 'all' | '7days' | '30days' | '90days';

export interface SeriesData {
	date: string;
	arrows: number;
	score: number;
}

export interface Series {
	name: string;
	data: SeriesData[];
}
