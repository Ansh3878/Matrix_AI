import { PrismaClient } from "./generated/prisma";

// Singleton pattern prevents connection pool exhaustion in Next.js dev
// (hot reloading would create a new PrismaClient on every file change otherwise)
const globalForPrisma = globalThis;

function makePrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn"] // "error" removed — connection-closed events are non-fatal noise
        : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}