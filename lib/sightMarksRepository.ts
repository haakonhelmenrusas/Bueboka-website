import {
	AimDistanceMark,
	BowSpecification,
	CalculatedMarks,
	MarksResult,
	SightMark,
	SightMarkCalc,
	SightMarkResult,
} from '@/types/SightMarks';

const jsonHeaders = { 'Content-Type': 'application/json' };

async function handleResponse<T>(res: Response): Promise<T> {
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || 'Request failed');
	}
	return res.json() as Promise<T>;
}

export const sightMarksRepository = {
	async getAllSightMarks(): Promise<SightMark[]> {
		return handleResponse<SightMark[]>(await fetch('/api/sight-marks'));
	},

	async getSightMark(id: string): Promise<SightMark> {
		return handleResponse<SightMark>(await fetch(`/api/sight-marks/${id}`));
	},

	async createSightMark(data: Partial<SightMark>): Promise<SightMark> {
		return handleResponse<SightMark>(
			await fetch('/api/sight-marks', {
				method: 'POST',
				headers: jsonHeaders,
				body: JSON.stringify(data),
			})
		);
	},

	async updateSightMark(id: string, data: Partial<SightMark>): Promise<SightMark> {
		return handleResponse<SightMark>(
			await fetch(`/api/sight-marks/${id}`, {
				method: 'PUT',
				headers: jsonHeaders,
				body: JSON.stringify(data),
			})
		);
	},

	async deleteSightMark(id: string): Promise<void> {
		await handleResponse<void>(await fetch(`/api/sight-marks/${id}`, { method: 'DELETE' }));
	},

	async getSightMarkResults(sightMarkId: string): Promise<SightMarkResult[]> {
		return handleResponse<SightMarkResult[]>(await fetch(`/api/sight-marks/${sightMarkId}/results`));
	},

	async getSightMarkResult(id: string): Promise<SightMarkResult> {
		return handleResponse<SightMarkResult>(await fetch(`/api/sight-marks/results/${id}`));
	},

	async createSightMarkResult(sightMarkId: string, data: Partial<SightMarkResult>): Promise<SightMarkResult> {
		return handleResponse<SightMarkResult>(
			await fetch(`/api/sight-marks/${sightMarkId}/results`, {
				method: 'POST',
				headers: jsonHeaders,
				body: JSON.stringify(data),
			})
		);
	},

	async updateSightMarkResult(id: string, data: Partial<SightMarkResult>): Promise<SightMarkResult> {
		return handleResponse<SightMarkResult>(
			await fetch(`/api/sight-marks/results/${id}`, {
				method: 'PUT',
				headers: jsonHeaders,
				body: JSON.stringify(data),
			})
		);
	},

	async deleteSightMarkResult(id: string): Promise<void> {
		await handleResponse<void>(await fetch(`/api/sight-marks/results/${id}`, { method: 'DELETE' }));
	},

	async getBowSpecifications(): Promise<BowSpecification[]> {
		return handleResponse<BowSpecification[]>(await fetch('/api/bow-specifications'));
	},

	async getBowSpecification(id: string): Promise<BowSpecification> {
		return handleResponse<BowSpecification>(await fetch(`/api/bow-specifications/${id}`));
	},

	async getBowSpecificationByBowId(bowId: string): Promise<BowSpecification> {
		return handleResponse<BowSpecification>(await fetch(`/api/bow-specifications/by-bow/${bowId}`));
	},

	async createBowSpecification(data: Partial<BowSpecification>): Promise<BowSpecification> {
		return handleResponse<BowSpecification>(
			await fetch('/api/bow-specifications', {
				method: 'POST',
				headers: jsonHeaders,
				body: JSON.stringify(data),
			})
		);
	},

	async updateBowSpecification(id: string, data: Partial<BowSpecification>): Promise<BowSpecification> {
		return handleResponse<BowSpecification>(
			await fetch(`/api/bow-specifications/${id}`, {
				method: 'PUT',
				headers: jsonHeaders,
				body: JSON.stringify(data),
			})
		);
	},

	async deleteBowSpecification(id: string): Promise<void> {
		await handleResponse<void>(await fetch(`/api/bow-specifications/${id}`, { method: 'DELETE' }));
	},

	async calculateBallistics(payload: AimDistanceMark): Promise<CalculatedMarks> {
		return handleResponse<CalculatedMarks>(
			await fetch('/api/ballistics/calculate', {
				method: 'POST',
				headers: jsonHeaders,
				body: JSON.stringify(payload),
			})
		);
	},

	async calculateSightMarks(payload: SightMarkCalc): Promise<MarksResult> {
		return handleResponse<MarksResult>(
			await fetch('/api/sight-marks/calculate', {
				method: 'POST',
				headers: jsonHeaders,
				body: JSON.stringify(payload),
			})
		);
	},
};
