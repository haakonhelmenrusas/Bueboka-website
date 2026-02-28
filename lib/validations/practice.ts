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
	distanceMeters: z.number().int().min(0).max(1000, 'Avstand må være mindre enn 1000 meter').optional(),
	targetType: z
		.string()
		.refine((val) => {
			if (!val) return true; // Optional field
			// Valid target types
			const validTypes = ['40cm', '60cm', '80cm', '122cm', '3-spot', 'vertical-3-spot'];
			return validTypes.includes(val);
		}, 'Ugyldig blinktype')
		.optional(),
	numberArrows: z.number().int().min(1, 'Minst 1 pil er påkrevd').max(10000, 'Maksimalt 10000 piler per runde'),
	roundScore: z.number().int().min(0).max(1000000, 'Score må være mindre enn 1000000').optional(),
});

// Schema for creating a practice
export const createPracticeSchema = z
	.object({
		date: z.string().min(1, 'Dato er påkrevd'),
		location: z.string().max(64, 'Sted må være mindre enn 64 tegn').optional().nullable(),
		environment: EnvironmentEnum,
		weather: z.array(WeatherConditionEnum).optional().default([]),
		practiceType: PracticeTypeEnum.optional().default('TRENING'),
		practiceCategory: PracticeCategoryEnum.optional().default('SKIVE'),
		notes: z.string().max(500, 'Notater må være mindre enn 500 tegn').optional().nullable(),
		rating: z.number().int().min(1).max(10).optional().nullable(),
		rounds: z.array(RoundInputSchema).min(1, 'Minst én runde er påkrevd').max(8, 'Maksimalt 8 runder er tillatt'),
		arrowsWithoutScore: z.number().int().min(0).max(500, 'Maksimalt 500 piler uten scoring').optional().nullable(),
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
