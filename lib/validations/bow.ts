import { z } from 'zod';

// Bow type enum matching Prisma schema
export const BowTypeEnum = z.enum(['RECURVE', 'COMPOUND', 'LONGBOW', 'BAREBOW', 'HORSEBOW', 'TRADITIONAL', 'OTHER']);

// Schema for creating a bow
export const createBowSchema = z.object({
	name: z.string().min(1, 'Bow name is required').max(100, 'Bow name must be less than 100 characters'),
	type: BowTypeEnum,
	eyeToNock: z.number().nonnegative().multipleOf(0.01).optional().nullable(),
	aimMeasure: z.number().nonnegative().multipleOf(0.01).optional().nullable(),
	eyeToSight: z.number().nonnegative().multipleOf(0.01).optional().nullable(),
	isFavorite: z.boolean().optional().default(false),
	notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional().nullable(),
});

// Schema for updating a bow (same as create)
export const updateBowSchema = createBowSchema;

// Types derived from schemas
export type CreateBowInput = z.infer<typeof createBowSchema>;
export type UpdateBowInput = z.infer<typeof updateBowSchema>;
