import {withAccelerate} from '@prisma/extension-accelerate'
import {PrismaClient} from '@prisma/client/edge';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['error', 'warn'],
    }).$extends(withAccelerate());

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export type { User, Bow, Arrows, Practice, End, RoundType } from '@prisma/client';