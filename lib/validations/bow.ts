import { z } from 'zod';

// Bow type enum matching Prisma schema
export const BowTypeEnum = z.enum(['RECURVE', 'COMPOUND', 'LONGBOW', 'BAREBOW', 'HORSEBOW', 'TRADITIONAL', 'OTHER']);

// Schema for creating a bow
export const createBowSchema = z.object({
	name: z.string().min(1, 'Bow name is required').max(100, 'Bow name must be less than 100 characters'),
	type: BowTypeEnum,
	eyeToNock: z.number().nonnegative().optional().nullable(),
	aimMeasure: z.number().nonnegative().optional().nullable(),
	eyeToSight: z.number().nonnegative().optional().nullable(),
	limbs: z.string().max(100, 'Limbs must be less than 100 characters').optional().nullable(),
	riser: z.string().max(100, 'Riser must be less than 100 characters').optional().nullable(),
	handOrientation: z.enum(['RH', 'LH']).optional().nullable(),
	drawWeight: z.number().nonnegative().optional().nullable(),
	bowLength: z.number().nonnegative().optional().nullable(),
	isFavorite: z.boolean().optional().default(false),
	notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional().nullable(),
});

// Schema for updating a bow (same as create)
export const updateBowSchema = createBowSchema;

// Types derived from schemas
export type CreateBowInput = z.infer<typeof createBowSchema>;
export type UpdateBowInput = z.infer<typeof updateBowSchema>;
