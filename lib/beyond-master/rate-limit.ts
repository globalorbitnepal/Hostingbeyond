import { Prisma } from "@prisma/client";

import {
  clientKeyFromRequest,
  consumeRateLimit,
} from "@/lib/http/fixed-window-rate-limit";
import { consumePrismaRateLimit } from "@/lib/beyond-master/postgres-rate-limit";
import {
  BEYOND_MASTER_GUEST_RATE_LIMIT,
  BEYOND_MASTER_GUEST_RATE_WINDOW_MS,
  BEYOND_MASTER_TOOLS_RATE_LIMIT,
  BEYOND_MASTER_TOOLS_RATE_WINDOW_MS,
} from "@/lib/beyond-master/limits";
import { readBeyondMasterRuntimeConfig } from "@/lib/beyond-master/settings";

const GUEST_CHAT_RATE_LIMIT = BEYOND_MASTER_GUEST_RATE_LIMIT;
const GUEST_CHAT_RATE_WINDOW_MS = BEYOND_MASTER_GUEST_RATE_WINDOW_MS;
const TOOLS_RATE_LIMIT = BEYOND_MASTER_TOOLS_RATE_LIMIT;
const TOOLS_RATE_WINDOW_MS = BEYOND_MASTER_TOOLS_RATE_WINDOW_MS;

export function shouldUsePostgresRateLimitStore(
  env: Record<string, string | undefined>,
): boolean {
  const explicit = env.BEYOND_MASTER_RATE_LIMIT_STORE?.trim().toLowerCase();
  if (explicit === "memory") return false;
  if (explicit === "postgres") return true;
  return process.env.NODE_ENV === "production";
}

export function isRateLimitMemoryFallbackError(error: unknown): boolean {
  if (process.env.NODE_ENV !== "test") return false;
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const code = error.code;
    return (
      code === "P2021" ||
      code === "P1001" ||
      code === "P1017" ||
      code === "P1000"
    );
  }
  return false;
}

/**
 * Shared (PostgreSQL) fixed-window limiter for Beyond Master chat.
 * In `NODE_ENV=test`, falls back to the legacy in-memory limiter when the shared
 * table is missing (P2021) or the database is not reachable (typical unit runs).
 */
export async function allowBeyondMasterChat(
  request: Request,
  env: Record<string, string | undefined> = process.env,
  customerUserId?: string | null,
): Promise<boolean> {
  const config = readBeyondMasterRuntimeConfig(env);
  const client = clientKeyFromRequest(request);
  const bucket = customerUserId
    ? `beyond-master:auth:${customerUserId}`
    : `beyond-master:guest:${client}`;
  const limit = customerUserId ? config.rateLimit : GUEST_CHAT_RATE_LIMIT;
  const windowMs = customerUserId
    ? config.rateWindowMs
    : GUEST_CHAT_RATE_WINDOW_MS;
  if (!shouldUsePostgresRateLimitStore(env)) {
    return consumeRateLimit(bucket, limit, windowMs);
  }
  try {
    return await consumePrismaRateLimit({
      bucketKey: bucket,
      maxRequests: limit,
      windowMs,
    });
  } catch (error) {
    if (isRateLimitMemoryFallbackError(error)) {
      return consumeRateLimit(bucket, limit, windowMs);
    }
    return false;
  }
}

export async function allowBeyondMasterTools(
  customerUserId: string,
  env: Record<string, string | undefined> = process.env,
): Promise<boolean> {
  const bucket = `beyond-master-tools:${customerUserId}`;
  if (!shouldUsePostgresRateLimitStore(env)) {
    return consumeRateLimit(bucket, TOOLS_RATE_LIMIT, TOOLS_RATE_WINDOW_MS);
  }
  try {
    return await consumePrismaRateLimit({
      bucketKey: bucket,
      maxRequests: TOOLS_RATE_LIMIT,
      windowMs: TOOLS_RATE_WINDOW_MS,
    });
  } catch (error) {
    if (isRateLimitMemoryFallbackError(error)) {
      return consumeRateLimit(bucket, TOOLS_RATE_LIMIT, TOOLS_RATE_WINDOW_MS);
    }
    return false;
  }
}
