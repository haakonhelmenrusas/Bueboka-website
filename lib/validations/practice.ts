import { z } from 'zod';

// Environment and Weather enums matching Prisma schema
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

// Schema for creating a practice
export const createPracticeSchema = z
	.object({
		date: z.string().min(1, 'Dato er påkrevd'),
		arrowsShot: z.number().int().min(0, 'Antall skutte piler kan ikke være negativt'),
		location: z.string().max(200, 'Sted må være mindre enn 200 tegn').optional().nullable(),
		environment: EnvironmentEnum,
		weather: z.array(WeatherConditionEnum).optional().default([]),
		notes: z.string().max(2000, 'Notater må være mindre enn 2000 tegn').optional().nullable(),
		roundTypeId: z.string().optional().nullable(),
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
