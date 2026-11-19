import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from '@/prisma/prisma/generated/prisma-client/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
	// DIRECT_DATABASE_URL is the raw postgres:// connection.
	// DATABASE_URL may be the Prisma Accelerate URL which PrismaPg cannot use directly.
	connectionString: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL,
	// Netlify Functions scale to many concurrent instances and the production
	// build embeds this module in several server chunks. The Postgres role has a
	// hard connection limit, so cap each function instance at a single pooled
	// connection (pg default is 10 per pool) and fail fast instead of hanging
	// when the database is saturated.
	max: 1,
	connectionTimeoutMillis: 5000,
});

const globalForPrisma = global as unknown as {
	prisma: PrismaClient;
};

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		adapter,
	}).$extends(withAccelerate());

/*export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		accelerateUrl: process.env.DATABASE_URL as string,
	}).$extends(withAccelerate());*/

// Cache the client on globalThis in ALL environments, including production.
// Without this, every server chunk that embeds this module creates its own
// PrismaClient (and pg pool) inside the same function instance, multiplying
// connections until the Postgres role limit is hit (P2037 "too many connections").
globalForPrisma.prisma = prisma;

// Export model types from the generated client too, so we avoid depending on `@prisma/client` at build time.
export type {
	UserModel as User,
	BowModel as Bow,
	ArrowsModel as Arrows,
	PracticeModel as Practice,
	EndModel as End,
	RoundTypeModel as RoundType,
	SightMarkModel as SightMark,
	SightMarkResultModel as SightMarkResult,
} from '@/prisma/prisma/generated/prisma-client/models';
