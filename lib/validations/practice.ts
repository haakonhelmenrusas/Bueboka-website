import { z } from 'zod';

// Environment, Weather, and PracticeType enums matching Prisma schema
export const EnvironmentEnum = z.enum(['INDOOR', 'OUTDOOR']);
export const WeatherConditionEnum = z.enum([
	'SUN',
	'CLOUDED',
	'CLEAR',
	'RAIN',
	'WIND',
	'SNOW',
	'FOG',
	'THUNDER',
	'CHANGING_CONDITIONS',
	'OTHER',
]);
export const PracticeTypeEnum = z.enum(['TRENING', 'KONKURRANSE']);
export const PracticeCategoryEnum = z.enum(['FELT', 'JAKT_3D', 'SKIVE', 'ANNET']);

// Round input schema
export const RoundInputSchema = z.object({
	distanceMeters: z.number().int().min(0).optional(),
	targetType: z.string().optional(),
	numberArrows: z.number().int().min(0).optional(),
	roundScore: z.number().int().min(0).optional(),
});

// Schema for creating a practice
export const createPracticeSchema = z
	.object({
		date: z.string().min(1, 'Dato er påkrevd'),
		location: z.string().max(200, 'Sted må være mindre enn 200 tegn').optional().nullable(),
		environment: EnvironmentEnum,
		weather: z.array(WeatherConditionEnum).optional().default([]),
		practiceType: PracticeTypeEnum.optional().default('TRENING'),
		practiceCategory: PracticeCategoryEnum.optional().default('SKIVE'),
		notes: z.string().max(2000, 'Notater må være mindre enn 2000 tegn').optional().nullable(),
		rating: z.number().int().min(1).max(10).optional().nullable(),
		rounds: z.array(RoundInputSchema).min(1, 'Minst én runde er påkrevd'),
		arrowsWithoutScore: z.number().int().min(0).optional().nullable(),
		bowId: z.string().optional().nullable(),
		arrowsId: z.string().optional().nullable(),
	})
	.refine(
		(data) => {
			// Validate date format
			const date = new Date(data.date);
			return !isNaN(date.getTime());
		},
		{
			message: 'Ugyldig datoformat',
			path: ['date'],
		}
	)
	.refine(
		(data) => {
			// Weather should only be set when environment is "OUTDOOR"
			return !(data.environment === 'INDOOR' && data.weather && data.weather.length > 0);
		},
		{
			message: 'Vær kan kun settes når miljø er "Ute"',
			path: ['weather'],
		}
	);

// Schema for updating a practice (same as create)
export const updatePracticeSchema = createPracticeSchema;

// Types derived from schemas
export type CreatePracticeInput = z.infer<typeof createPracticeSchema>;
export type UpdatePracticeInput = z.infer<typeof updatePracticeSchema>;
export type RoundInput = z.infer<typeof RoundInputSchema>;
