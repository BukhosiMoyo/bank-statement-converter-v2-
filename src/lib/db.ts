import { Pool } from "pg";

declare global {
  var __bankStatementConverterPool: Pool | undefined;
}

const DATABASE_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOTFOUND",
  "ETIMEDOUT",
  "EHOSTUNREACH",
  "EAI_AGAIN",
]);

function getDatabaseUrl() {
  return process.env.DATABASE_URL?.trim() || null;
}

export function hasDatabaseUrl() {
  return getDatabaseUrl() !== null;
}

function shouldUseSsl(connectionString: string) {
  if (process.env.PGSSL === "disable") {
    return false;
  }

  return !/localhost|127\.0\.0\.1/.test(connectionString);
}

export function getDatabasePool() {
  const connectionString = getDatabaseUrl();

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!global.__bankStatementConverterPool) {
    global.__bankStatementConverterPool = new Pool({
      connectionString,
      ssl: shouldUseSsl(connectionString)
        ? { rejectUnauthorized: false }
        : false,
    });
  }

  return global.__bankStatementConverterPool;
}

export function isDatabaseConnectivityError(error: unknown): boolean {
  if (error instanceof Error && error.message === "DATABASE_URL is not configured.") {
    return true;
  }

  if (error instanceof AggregateError) {
    return error.errors.some((entry) => isDatabaseConnectivityError(entry));
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  if ("code" in error && typeof error.code === "string") {
    return DATABASE_ERROR_CODES.has(error.code);
  }

  if ("message" in error && typeof error.message === "string") {
    return DATABASE_ERROR_CODES.has(error.message);
  }

  return false;
}
