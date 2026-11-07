import { Prisma } from "@prisma/client";

import type { PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const MAX_KEY_LEN = 200;

function alignWindowStart(nowMs: number, windowMs: number): Date {
  const start = Math.floor(nowMs / windowMs) * windowMs;
  return new Date(start);
}

/**
 * Fixed-window rate limit stored in PostgreSQL with a transaction-scoped advisory lock.
 * Safe across multiple PM2 workers (unlike in-memory {@link consumeRateLimit}).
 */
export async function consumePrismaRateLimit(
  input: {
    bucketKey: string;
    maxRequests: number;
    windowMs: number;
  },
  db: Pick<PrismaClient, "$transaction"> = prisma,
): Promise<boolean> {
  const key = input.bucketKey.trim().slice(0, MAX_KEY_LEN);
  if (!key) return false;
  const windowMs = Math.max(1000, input.windowMs);
  const max = Math.max(1, input.maxRequests);

  try {
    return await db.$transaction(
      async (tx) => {
        await tx.$executeRaw`
          SELECT pg_advisory_xact_lock(hashtext(${key}::text))
        `;
        const now = Date.now();
        const windowStart = alignWindowStart(now, windowMs);
        const row = await tx.beyondMasterRateLimitBucket.findUnique({
          where: { bucketKey: key },
        });
        if (!row || row.windowStart.getTime() < windowStart.getTime()) {
          await tx.beyondMasterRateLimitBucket.upsert({
            where: { bucketKey: key },
            create: {
              bucketKey: key,
              windowStart,
              count: 1,
            },
            update: {
              windowStart,
              count: 1,
            },
          });
          return true;
        }
        if (row.count >= max) return false;
        await tx.beyondMasterRateLimitBucket.update({
          where: { bucketKey: key },
          data: { count: { increment: 1 } },
        });
        return true;
      },
      {
        maxWait: 5000,
        timeout: 15_000,
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      throw error;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const code = error.code;
      if (code === "P2021") throw error;
      if (code === "P1001" || code === "P1017" || code === "P1000") {
        throw error;
      }
    }
    return false;
  }
}
