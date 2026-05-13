import { PrismaClient } from "@prisma/client";
import { env } from "./env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDevelopment ? ["query", "error"] : ["error"],
    datasourceUrl: env.DATABASE_URL,
  });

if (!env.isProduction) globalForPrisma.prisma = prisma;
