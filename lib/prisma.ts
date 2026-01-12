import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from '@/prisma/prisma/generated/prisma-client/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
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
