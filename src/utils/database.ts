import { ENV } from '../config/env';
import { PrismaClient } from '../generated/prisma';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient();

if (ENV.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;