import { Prisma } from "@prisma/client";

import { isTruthyEnvFlag } from "@/lib/config/env-flags";
import { prisma } from "@/lib/prisma";
import {
  BEYOND_MASTER_BUDGET_CRITICAL_CENTS,
  BEYOND_MASTER_BUDGET_WARN_CENTS,
  BEYOND_MASTER_DEFAULT_RESERVE_CENTS,
  BEYOND_MASTER_MONTHLY_CAP_CENTS,
} from "@/lib/beyond-master/limits";

/**
 * Paid USD ledger. Default OFF so Gemini Flash-Lite stays on Google AI Studio
 * free-tier quotas. Turn on only with an explicit env flag.
 */
export function beyondMasterPaidAiBudgetEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return isTruthyEnvFlag(env.BEYOND_MASTER_AI_PAID_BUDGET_ENABLED);
}

/** Application cap: USD 5.00 / month (not a substitute for provider billing alerts). */
export {
  BEYOND_MASTER_BUDGET_CRITICAL_CENTS,
  BEYOND_MASTER_BUDGET_WARN_CENTS,
  BEYOND_MASTER_MONTHLY_CAP_CENTS,
} from "@/lib/beyond-master/limits";

export type BudgetGateResult =
  | {
      ok: true;
      requestId: string;
      monthKey: string;
      level: "ok" | "warn" | "critical";
      spentPlusReservedCents: number;
    }
  | {
      ok: false;
      code: "hard_stop" | "unavailable";
      message: string;
      spentPlusReservedCents?: number;
    };

/** Advisory-lock key segment (must match reserve and reconcile transactions). */
export function beyondMasterBudgetLockKey(monthKey: string): string {
  return `budget:${monthKey}`;
}

export function currentBudgetMonthKey(
  now = new Date(),
  timeZone = "UTC",
): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
  });
  const parts = fmt.formatToParts(now);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  if (!y || !m) {
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  }
  return `${y}-${m}`;
}

export function reserveCentsForAiCall(
  env: Record<string, string | undefined> = process.env,
): number {
  const raw = env.BEYOND_MASTER_AI_RESERVE_CENTS?.trim();
  const n = raw ? Number(raw) : BEYOND_MASTER_DEFAULT_RESERVE_CENTS;
  if (!Number.isFinite(n) || n < 1) return BEYOND_MASTER_DEFAULT_RESERVE_CENTS;
  return Math.min(Math.floor(n), BEYOND_MASTER_MONTHLY_CAP_CENTS);
}

/**
 * Rough actual cost from token usage (integer USD cents). Provider pricing differs;
 * this ledger is for app-level enforcement only.
 */
export function actualCentsFromTokenUsage(input: {
  promptTokens?: number;
  completionTokens?: number;
}): number {
  const p = Math.max(0, input.promptTokens ?? 0);
  const c = Math.max(0, input.completionTokens ?? 0);
  const total = p + c;
  if (total <= 0) return 0;
  // Conservative blended rate: ~$0.25 / 1M tokens -> 0.025 cents per 1k tokens, min 1 cent
  const cents = Math.ceil((total / 1000) * 0.025);
  return Math.max(1, Math.min(cents, BEYOND_MASTER_MONTHLY_CAP_CENTS));
}

function budgetLevel(
  spentPlusReserved: number,
): "ok" | "warn" | "critical" | "hard_stop" {
  if (spentPlusReserved >= BEYOND_MASTER_MONTHLY_CAP_CENTS) return "hard_stop";
  if (spentPlusReserved >= BEYOND_MASTER_BUDGET_CRITICAL_CENTS) {
    return "critical";
  }
  if (spentPlusReserved >= BEYOND_MASTER_BUDGET_WARN_CENTS) return "warn";
  return "ok";
}

export async function reservePaidAiBudget(input: {
  requestId: string;
  customerUserId: string | null;
  reserveCents: number;
  monthKey?: string;
}): Promise<BudgetGateResult> {
  const monthKey = input.monthKey ?? currentBudgetMonthKey();
  const reserve = Math.min(
    Math.max(1, input.reserveCents),
    BEYOND_MASTER_MONTHLY_CAP_CENTS,
  );
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const lockKey = beyondMasterBudgetLockKey(monthKey);
        await tx.$executeRaw`
          SELECT pg_advisory_xact_lock(hashtext(${lockKey}::text))
        `;
        const row = await tx.beyondMasterAiBudgetMonth.upsert({
          where: { monthKey },
          create: {
            monthKey,
            spentCents: 0,
            reservedCents: 0,
          },
          update: {},
        });
        const committed = row.spentCents + row.reservedCents;
        const afterReserve = committed + reserve;
        const level = budgetLevel(afterReserve);
        if (level === "hard_stop") {
          return {
            ok: false as const,
            code: "hard_stop" as const,
            message:
              "The monthly AI usage cap for this product has been reached. Try again next month or contact support.",
            spentPlusReservedCents: committed,
          };
        }
        await tx.beyondMasterAiBudgetMonth.update({
          where: { monthKey },
          data: { reservedCents: { increment: reserve } },
        });
        await tx.beyondMasterAiBudgetReservation.create({
          data: {
            requestId: input.requestId,
            monthKey,
            customerUserId: input.customerUserId,
            reservedCents: reserve,
          },
        });
        return {
          ok: true as const,
          requestId: input.requestId,
          monthKey,
          level:
            level === "critical"
              ? ("critical" as const)
              : level === "warn"
                ? ("warn" as const)
                : ("ok" as const),
          spentPlusReservedCents: afterReserve,
        };
      },
      {
        maxWait: 5000,
        timeout: 15_000,
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );
    return result;
  } catch {
    return {
      ok: false,
      code: "unavailable",
      message: "Budget check failed. Please try again shortly.",
    };
  }
}

export async function reconcilePaidAiBudget(input: {
  requestId: string;
  actualCents: number;
}): Promise<void> {
  const actual = Math.max(0, Math.floor(input.actualCents));
  try {
    await prisma.$transaction(
      async (tx) => {
        // Read once only to discover the month key for the advisory lock.
        const probe = await tx.beyondMasterAiBudgetReservation.findUnique({
          where: { requestId: input.requestId },
          select: { monthKey: true },
        });
        if (!probe) return;
        // Serialize BEFORE re-reading state. Reading `reconciledAt` before the
        // lock let every concurrent caller observe `null` and each add `actual`,
        // tripling spend when Stripe/webhook paths reconciled in parallel.
        const lockKey = beyondMasterBudgetLockKey(probe.monthKey);
        await tx.$executeRaw`
          SELECT pg_advisory_xact_lock(hashtext(${lockKey}::text))
        `;
        const reservation = await tx.beyondMasterAiBudgetReservation.findUnique(
          { where: { requestId: input.requestId } },
        );
        if (!reservation || reservation.reconciledAt) return;
        const { monthKey } = reservation;
        const month = await tx.beyondMasterAiBudgetMonth.findUnique({
          where: { monthKey },
        });
        if (!month) return;
        const newReserved = Math.max(
          0,
          month.reservedCents - reservation.reservedCents,
        );
        const spendIncrement = actual > 0 ? actual : 0;
        await tx.beyondMasterAiBudgetMonth.update({
          where: { monthKey },
          data: {
            reservedCents: newReserved,
            ...(spendIncrement > 0
              ? { spentCents: { increment: spendIncrement } }
              : {}),
          },
        });
        if (reservation.customerUserId && spendIncrement > 0) {
          await tx.beyondMasterAiCustomerMonthSpend.upsert({
            where: {
              monthKey_customerUserId: {
                monthKey,
                customerUserId: reservation.customerUserId,
              },
            },
            create: {
              monthKey,
              customerUserId: reservation.customerUserId,
              spentCents: spendIncrement,
            },
            update: { spentCents: { increment: spendIncrement } },
          });
        }
        await tx.beyondMasterAiBudgetReservation.update({
          where: { requestId: input.requestId },
          data: {
            actualCents: actual,
            reconciledAt: new Date(),
          },
        });
      },
      {
        maxWait: 5000,
        timeout: 15_000,
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );
  } catch (error) {
    const code =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.code
        : "unknown";
    console.error(
      JSON.stringify({
        source: "beyond-master-ai-budget",
        level: "error",
        phase: "reconcile",
        requestId: input.requestId,
        prismaCode: code,
      }),
    );
  }
}
