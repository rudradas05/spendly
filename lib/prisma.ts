// lib/db.ts
import { PrismaClient } from "@prisma/client";

// Declare a global type to store Prisma client during dev hot reloads
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create (or reuse) the Prisma client
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Avoid creating new clients in dev mode
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
