import { z } from 'zod';
import { PracticeCategoryEnum, EnvironmentEnum } from './practice';

// Challenge status enum
const ChallengeStatusEnum = z.enum([
  'PENDING',
  'ACCEPTED',
  'DECLINED',
  'COMPLETED',
  'CANCELLED',
]);

// Custom rules schema for challenges (when not using a predefined round type)
export const ChallengeCustomRulesSchema = z.object({
  distanceMeters: z.number().int().min(0).max(1000, 'Avstand må være mindre enn 1000 meter').optional().nullable(),
  distanceFrom: z.number().int().min(0).max(1000, 'Avstand fra må være mindre enn 1000 meter').optional().nullable(),
  distanceTo: z.number().int().min(0).max(1000, 'Avstand til må være mindre enn 1000 meter').optional().nullable(),
  targetType: z.string().max(50, 'Måltype må være mindre enn 50 tegn').optional().nullable(),
  targetSizeCm: z.number().int().min(0).max(500, 'Skive må være mindre enn 500 cm').optional().nullable(),
  numberArrows: z.number().int().min(1).max(10000, 'Maksimalt 10000 piler').optional().nullable(),
  arrowsWithoutScore: z.number().int().min(0).max(500, 'Maksimalt 500 piler uten scoring').optional().nullable(),
});

// Schema for creating a challenge
export const createChallengeSchema = z.object({
  challengedId: z.string().min(1, 'Mottaker-ID er påkrevd'),
  name: z.string().min(1, 'Navn på utfordringen er påkrevd').max(120, 'Navn må være mindre enn 120 tegn'),
  description: z.string().max(500, 'Beskrivelse må være mindre enn 500 tegn').optional().nullable(),
  roundTypeId: z.string().optional().nullable(),
  customRules: ChallengeCustomRulesSchema.optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});

// Schema for updating a challenge
export const updateChallengeSchema = z.object({
  name: z.string().min(1, 'Navn er påkrevd').max(120, 'Navn må være mindre enn 120 tegn').optional(),
  description: z.string().max(500, 'Beskrivelse må være mindre enn 500 tegn').optional().nullable(),
  roundTypeId: z.string().optional().nullable(),
  customRules: ChallengeCustomRulesSchema.optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  status: ChallengeStatusEnum.optional(),
});

// Schema for submitting challenge results
export const submitChallengeResultSchema = z.object({
  score: z.number().int().min(0, 'Poengsum kan ikke være negativ').max(1000000, 'Poengsum må være mindre enn 1000000'),
  totalArrows: z.number().int().min(0, 'Antall piler kan ikke være negativ').max(10000, 'Maksimalt 10000 piler').optional(),
});

// Schema for query parameters when listing challenges
export const getChallengesQuerySchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(20),
  status: ChallengeStatusEnum.optional(),
  userId: z.string().optional(),
});

// Export types
export type ChallengeCustomRules = z.infer<typeof ChallengeCustomRulesSchema>;
export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type UpdateChallengeInput = z.infer<typeof updateChallengeSchema>;
export type SubmitChallengeResultInput = z.infer<typeof submitChallengeResultSchema>;
export type GetChallengesQuery = z.infer<typeof getChallengesQuerySchema>;
export { ChallengeStatusEnum };
export type ChallengeStatus = z.infer<typeof ChallengeStatusEnum>;
