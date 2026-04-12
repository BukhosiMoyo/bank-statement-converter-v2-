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

const DATABASE_ERROR_MESSAGE_FRAGMENTS = [
  "DATABASE_URL is not configured.",
  "connect ECONNREFUSED",
  "connect ECONNRESET",
  "getaddrinfo ENOTFOUND",
  "connect ETIMEDOUT",
  "EHOSTUNREACH",
  "EAI_AGAIN",
  "Connection terminated unexpectedly",
  "server closed the connection unexpectedly",
];

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

function matchesConnectivityText(value: string) {
  return (
    DATABASE_ERROR_CODES.has(value) ||
    DATABASE_ERROR_MESSAGE_FRAGMENTS.some((fragment) => value.includes(fragment))
  );
}

export function isDatabaseConnectivityError(error: unknown): boolean {
  if (error instanceof AggregateError) {
    return error.errors.some((entry) => isDatabaseConnectivityError(entry));
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  const errorRecord = error as Record<string, unknown>;

  if (Array.isArray(errorRecord.errors)) {
    return errorRecord.errors.some((entry) => isDatabaseConnectivityError(entry));
  }

  if (errorRecord.cause) {
    return isDatabaseConnectivityError(errorRecord.cause);
  }

  return ["code", "errno", "message"].some((field) => {
    const value = errorRecord[field];

    if (typeof value !== "string") {
      return false;
    }

    return matchesConnectivityText(value);
  });
}
