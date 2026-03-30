import { PrismaClient, Prisma } from "@prisma/client";
import { getOptionalEnv } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildLogLevels(): Prisma.LogLevel[] {
  const level = getOptionalEnv("PRISMA_LOG_LEVEL") ?? "warn";
  const levels: Prisma.LogLevel[] = [];

  // Cascade: each level includes everything above it
  switch (level) {
    case "query":
      levels.push("query");
    // falls through
    case "info":
      levels.push("info");
    // falls through
    case "warn":
      levels.push("warn");
    // falls through
    case "error":
      levels.push("error");
      break;
    default:
      levels.push("warn", "error");
  }

  return levels;
}

function createPrismaClient(): PrismaClient {
  const logLevels = buildLogLevels();
  const datasourceUrl =
    getOptionalEnv("DATABASE_URL_POOLED") ?? getOptionalEnv("DATABASE_URL") ?? undefined;

  if (!datasourceUrl) {
    throw new Error(
      "Missing DATABASE_URL environment variable. The app cannot start without a database connection."
    );
  }

  return new PrismaClient({
    log: logLevels,
    datasourceUrl,
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Cache on globalThis in all environments.
// In production this is a no-op (the module only loads once).
// In development it prevents HMR from creating duplicate connections.
globalForPrisma.prisma = prisma;

export default prisma;
