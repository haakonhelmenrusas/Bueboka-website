import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from '@/prisma/prisma/generated/prisma-client/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
	// DIRECT_DATABASE_URL is the raw postgres:// connection.
	// DATABASE_URL may be the Prisma Accelerate URL which PrismaPg cannot use directly.
	connectionString: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL,
});

const globalForPrisma = global as unknown as {
	prisma: PrismaClient;
};

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		adapter
	}).$extends(withAccelerate());

/*export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		accelerateUrl: process.env.DATABASE_URL as string,
	}).$extends(withAccelerate());*/

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Export model types from the generated client too, so we avoid depending on `@prisma/client` at build time.
export type {
	UserModel as User,
	BowModel as Bow,
	ArrowsModel as Arrows,
	PracticeModel as Practice,
	EndModel as End,
	RoundTypeModel as RoundType,
	BowSpecificationModel as BowSpecification,
	SightMarkModel as SightMark,
	SightMarkResultModel as SightMarkResult,
} from '@/prisma/prisma/generated/prisma-client/models';
