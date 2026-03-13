import { z } from 'zod';
import { TARGET_TYPE_OPTIONS } from '@/lib/Contants';

// Environment, Weather, and PracticeCategory enums matching Prisma schema
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
export const PracticeCategoryEnum = z.enum(['SKIVE_INDOOR', 'SKIVE_OUTDOOR', 'JAKT_3D', 'FELT']);

// Round input schema
export const RoundInputSchema = z.object({
	distanceMeters: z.number().int().min(0).max(1000, 'Avstand må være mindre enn 1000 meter').optional(),
	distanceFrom: z.number().int().min(0).max(1000, 'Fra-avstand må være mindre enn 1000 meter').optional(),
	distanceTo: z.number().int().min(0).max(1000, 'Til-avstand må være mindre enn 1000 meter').optional(),
	targetType: z
		.string()
		.refine((val) => {
			if (!val) return true; // Optional field
			const validTypes = TARGET_TYPE_OPTIONS.map((o) => o.value);
			return validTypes.includes(val);
		}, 'Ugyldig blinktype')
		.optional(),
	numberArrows: z.number().int().min(0).max(10000, 'Maksimalt 10000 piler per runde').optional(),
	arrowsWithoutScore: z.number().int().min(0).max(500, 'Maksimalt 500 piler uten scoring').optional(),
	roundScore: z.number().int().min(0).max(1000000, 'Score må være mindre enn 1000000').optional(),
});

// Schema for creating a practice (training session only)
export const createPracticeSchema = z
	.object({
		date: z.string().min(1, 'Dato er påkrevd'),
		location: z.string().max(64, 'Sted må være mindre enn 64 tegn').optional().nullable(),
		environment: EnvironmentEnum,
		weather: z.array(WeatherConditionEnum).optional().default([]),
		practiceCategory: PracticeCategoryEnum.optional().default('SKIVE_INDOOR'),
		notes: z.string().max(500, 'Notater må være mindre enn 500 tegn').optional().nullable(),
		rating: z.number().int().min(1).max(10).optional().nullable(),
		rounds: z.array(RoundInputSchema).min(1, 'Minst én runde er påkrevd').max(20, 'Maksimalt 20 runder er tillatt'),
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
