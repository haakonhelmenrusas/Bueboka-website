/**
 * Validation utilities for API request parsing
 */

/**
 * Parse and validate a number array from unknown input.
 * Used for required fields - returns empty array if invalid.
 *
 * @param val - The unknown value to parse
 * @param key - The field name (used for error messages)
 * @param fieldErrors - Object to collect validation errors
 * @returns Validated number array, or empty array if invalid
 */
export function parseNumberArray(val: unknown, key: string, fieldErrors: Record<string, string>): number[] {
	if (!Array.isArray(val)) {
		fieldErrors[key] = `${key} must be an array`;
		return [] as number[];
	}
	const nums = val.filter((item) => typeof item === 'number' && !Number.isNaN(item)) as number[];
	if (nums.length !== val.length) {
		fieldErrors[key] = `${key} contains invalid numbers`;
	}
	return nums;
}

/**
 * Parse and validate an optional number array from unknown input.
 * Used for optional fields in PATCH/PUT operations - returns undefined if not provided.
 *
 * @param val - The unknown value to parse
 * @param key - The field name (used for error messages)
 * @param fieldErrors - Object to collect validation errors
 * @returns Validated number array, undefined if not provided, or undefined if invalid
 */
export function parseOptionalNumberArray(val: unknown, key: string, fieldErrors: Record<string, string>): number[] | undefined {
	if (val === undefined) return undefined;
	if (!Array.isArray(val)) {
		fieldErrors[key] = `${key} must be an array`;
		return undefined;
	}
	const nums = val.filter((item) => typeof item === 'number' && !Number.isNaN(item)) as number[];
	if (nums.length !== val.length) {
		fieldErrors[key] = `${key} contains invalid numbers`;
	}
	return nums;
}
