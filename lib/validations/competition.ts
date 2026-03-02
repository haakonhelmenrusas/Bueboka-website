import { z } from 'zod';
import { EnvironmentEnum, PracticeCategoryEnum, WeatherConditionEnum } from './practice';

// Competition round input schema
export const CompetitionRoundInputSchema = z.object({
	roundNumber: z.number().int().min(1),
	distanceMeters: z.number().int().min(0).max(1000, 'Avstand må være mindre enn 1000 meter').optional(),
	targetSizeCm: z.number().int().min(0).max(500, 'Skive må være mindre enn 500 cm').optional(),
	numberArrows: z.number().int().min(0).max(10000, 'Maksimalt 10000 piler per runde').optional(),
	arrowsWithoutScore: z.number().int().min(0).max(500, 'Maksimalt 500 piler uten scoring').optional(),
	roundScore: z.number().int().min(0).max(1000000, 'Score må være mindre enn 1000000').optional(),
	scores: z.array(z.number().int().min(0).max(10)).optional(),
});

// Schema for creating a competition
export const createCompetitionSchema = z.object({
	date: z.string().min(1, 'Dato er påkrevd'),
	name: z.string().min(1, 'Navn på konkurransen er påkrevd').max(100, 'Navn må være mindre enn 100 tegn'),
	location: z.string().max(64, 'Sted må være mindre enn 64 tegn').optional().nullable(),
	organizerName: z.string().max(100, 'Arrangør må være mindre enn 100 tegn').optional().nullable(),
	environment: EnvironmentEnum,
	weather: z.array(WeatherConditionEnum).optional().default([]),
	practiceCategory: PracticeCategoryEnum.optional().default('SKIVE_INDOOR'),
	notes: z.string().max(500, 'Notater må være mindre enn 500 tegn').optional().nullable(),
	placement: z.number().int().min(1).optional().nullable(),
	numberOfParticipants: z.number().int().min(1).optional().nullable(),
	personalBest: z.boolean().optional().default(false),
	rounds: z.array(CompetitionRoundInputSchema).min(1, 'Minst én runde er påkrevd').max(20, 'Maksimalt 20 runder er tillatt'),
	bowId: z.string().optional().nullable(),
	arrowsId: z.string().optional().nullable(),
});

export type CompetitionRoundInput = z.infer<typeof CompetitionRoundInputSchema>;
export type CreateCompetitionInput = z.infer<typeof createCompetitionSchema>;
