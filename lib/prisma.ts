import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from '@/prisma/prisma/generated/prisma-client/client';
import { PrismaPg } from '@prisma/adapter-pg';

function getDatabaseUrl(): string {
	const raw = process.env.DATABASE_URL;
	if (!raw) {
		throw new Error('DATABASE_URL is not set');
	}

	// Add defensive defaults for serverless runtimes to avoid hanging connections.
	// These params are safe for Postgres URLs (including sslmode=require).
	try {
		const url = new URL(raw);

		// Only apply if not already provided by the env.
		if (!url.searchParams.has('connect_timeout')) url.searchParams.set('connect_timeout', '10');
		if (!url.searchParams.has('pool_timeout')) url.searchParams.set('pool_timeout', '10');
		// Statement timeout (ms): protects requests from running forever.
		if (!url.searchParams.has('statement_timeout')) url.searchParams.set('statement_timeout', '10000');
		// Keep pool small for serverless.
		if (!url.searchParams.has('connection_limit')) url.searchParams.set('connection_limit', '5');

		return url.toString();
	} catch {
		// If DATABASE_URL isn't a valid URL (should be), fall back to raw.
		return raw;
	}
}

const adapter = new PrismaPg({
	connectionString: getDatabaseUrl(),
});

const globalForPrisma = global as unknown as {
	prisma: PrismaClient;
};

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		adapter,
	}).$extends(withAccelerate());

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Export model types from the generated client too, so we avoid depending on `@prisma/client` at build time.
export type {
	UserModel as User,
	BowModel as Bow,
	ArrowsModel as Arrows,
	PracticeModel as Practice,
	EndModel as End,
	RoundTypeModel as RoundType,
} from '@/prisma/prisma/generated/prisma-client/models';
