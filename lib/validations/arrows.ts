import { z } from 'zod';

// Arrow material enum matching Prisma schema
export const ArrowMaterialEnum = z.enum(['KARBON', 'ALUMINIUM', 'TREVERK']);

// Schema for creating arrows
export const createArrowsSchema = z.object({
	name: z.string().min(1, 'Arrow set name is required').max(100, 'Arrow set name must be less than 100 characters'),
	material: ArrowMaterialEnum,
	length: z.number().positive('Length must be positive').optional().nullable(),
	weight: z.number().positive('Weight must be positive').optional().nullable(),
	arrowsCount: z.number().int().positive('Arrow count must be a positive integer').optional().nullable(),
	diameter: z.number().positive('Diameter must be positive').optional().nullable(),
	spine: z.string().max(50, 'Spine must be less than 50 characters').optional().nullable(),
	pointType: z.string().max(50, 'Point type must be less than 50 characters').optional().nullable(),
	pointWeight: z.number().positive('Point weight must be positive').optional().nullable(),
	vanes: z.string().max(100, 'Vanes must be less than 100 characters').optional().nullable(),
	nock: z.string().max(50, 'Nock must be less than 50 characters').optional().nullable(),
	notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional().nullable(),
	isFavorite: z.boolean().optional().default(false),
});

// Schema for updating arrows (same as create)
export const updateArrowsSchema = createArrowsSchema;

// Types derived from schemas
export type CreateArrowsInput = z.infer<typeof createArrowsSchema>;
export type UpdateArrowsInput = z.infer<typeof updateArrowsSchema>;
