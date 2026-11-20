import { PrismaClient } from '@/prisma/prisma/generated/prisma-client/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
	prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
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
	return new PrismaClient({ adapter });
}

/**
 * Lazily-created singleton client.
 *
 * The client (and its pg pool) is created on first property access instead of
 * at module load, so cold function instances serving non-DB requests (health
 * checks, 401s, edge-cache misses) skip Prisma/WASM initialisation entirely.
 * The client is cached on globalThis in ALL environments, so every server
 * chunk that embeds this module shares one client — and one pool — per
 * function instance. Without that, each chunk would open its own pool and
 * multiply connections until the Postgres role limit is hit (P2037
 * "too many connections").
 */
export const prisma = new Proxy({} as PrismaClient, {
	get(_target, prop) {
		const client = (globalForPrisma.prisma ??= createPrismaClient());
		const value = Reflect.get(client, prop);
		return typeof value === 'function' ? value.bind(client) : value;
	},
});

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
