import { z } from 'zod';

const semver = z.string().regex(/^\d+\.\d+\.\d+$/, 'Must be a valid semver (e.g. 2.0.0)');

export const updateAppVersionSchema = z.object({
	minVersion: semver.optional(),
	currentVersion: semver.optional(),
	updateMessage: z.string().min(1).optional(),
	iosMinVersion: semver.optional(),
	iosStoreUrl: z.string().url().optional(),
	androidMinVersion: semver.optional(),
	androidStoreUrl: z.string().url().optional(),
});
