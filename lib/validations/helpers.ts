import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Formats Zod validation errors into a field-error map
 * @param error - ZodError instance
 * @returns Object mapping field names to error messages
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
	const fieldErrors: Record<string, string> = {};
	error.issues.forEach((issue) => {
		const field = issue.path.join('.');
		if (!fieldErrors[field]) {
			fieldErrors[field] = issue.message;
		}
	});
	return fieldErrors;
}

/**
 * Validates data against a Zod schema and returns formatted error response if validation fails
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success flag and either parsed data or error response
 */
export function validateRequest<T>(
	schema: z.ZodSchema<T>,
	data: unknown
): { success: true; data: T } | { success: false; error: NextResponse } {
	try {
		const parsed = schema.parse(data);
		return { success: true, data: parsed };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const formattedErrors = error.issues.map((err) => ({
				field: err.path.join('.'),
				message: err.message,
			}));

			return {
				success: false,
				error: NextResponse.json(
					{
						error: 'Validation error',
						details: formattedErrors,
					},
					{ status: 400 }
				),
			};
		}

		return {
			success: false,
			error: NextResponse.json({ error: 'Invalid request data' }, { status: 400 }),
		};
	}
}
