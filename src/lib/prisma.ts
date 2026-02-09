import { PrismaClient } from "@prisma/client";

// [Template] — Singleton Prisma client with HMR protection. Prevents connection exhaustion in development.

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
