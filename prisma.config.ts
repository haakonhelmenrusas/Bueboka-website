import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations',
	},
	datasource: {
		// Use the direct postgres:// URL for all CLI operations (migrate, studio, etc.)
		// At runtime the app uses DATABASE_URL which may be the Accelerate proxy URL.
		url: env('DIRECT_DATABASE_URL') ?? env('DATABASE_URL'),
	},
});
