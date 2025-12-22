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

export type { User, Bow, Arrows, Practice, End, RoundType } from '@prisma/client';
