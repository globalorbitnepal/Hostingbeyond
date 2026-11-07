import { prisma } from "@/lib/prisma";
import {
  BEYOND_MASTER_BUDGET_CRITICAL_CENTS,
  BEYOND_MASTER_BUDGET_WARN_CENTS,
  BEYOND_MASTER_MONTHLY_CAP_CENTS,
  currentBudgetMonthKey,
} from "@/lib/beyond-master/ai-budget";
import { staleReservationThresholdMs } from "@/lib/beyond-master/ai-budget-recovery";
import { crossOriginBrowserMutationBlocked } from "@/lib/http/same-origin-mutation";
import {
  forbiddenJson,
  requireOrbitFullAdmin,
  unauthorizedJson,
} from "@/lib/orbit/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Application-level monthly AI cap (USD 5). This does not replace billing alerts
 * on the provider (Google Cloud, etc.); charges can still accrue from misconfiguration.
 */
export async function GET() {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();
  const monthKey = currentBudgetMonthKey();
  const now = new Date();
  const staleMs = staleReservationThresholdMs(process.env);
  const staleCutoff = new Date(now.getTime() - staleMs);
  const [month, perCustomer, staleReservationCount] = await Promise.all([
    prisma.beyondMasterAiBudgetMonth.findUnique({
      where: { monthKey },
    }),
    prisma.beyondMasterAiCustomerMonthSpend.findMany({
      where: { monthKey },
      orderBy: { spentCents: "desc" },
      take: 30,
      select: {
        customerUserId: true,
        spentCents: true,
        customer: { select: { email: true, name: true } },
      },
    }),
    prisma.beyondMasterAiBudgetReservation.count({
      where: {
        reconciledAt: null,
        createdAt: { lt: staleCutoff },
      },
    }),
  ]);
  const spent = month?.spentCents ?? 0;
  const reserved = month?.reservedCents ?? 0;
  const committed = spent + reserved;
  return Response.json({
    monthKey,
    capCents: BEYOND_MASTER_MONTHLY_CAP_CENTS,
    warnCents: BEYOND_MASTER_BUDGET_WARN_CENTS,
    criticalCents: BEYOND_MASTER_BUDGET_CRITICAL_CENTS,
    spentCents: spent,
    reservedCents: reserved,
    committedCents: committed,
    remainingCents: Math.max(0, BEYOND_MASTER_MONTHLY_CAP_CENTS - committed),
    staleReservationThresholdMs: staleMs,
    unreconciledStaleReservationCount: staleReservationCount,
    recoveryNote:
      "Stale reservation recovery mutates the ledger. It runs only from an explicit full-admin POST here or from the npm script — not from background jobs unless BEYOND_MASTER_AI_BUDGET_RECOVERY_ENABLED=1 is set for that worker.",
    disclaimer:
      "Committed amounts include reserved capacity before reconciliation. Set provider-side budgets and alerts separately. Stale counts only reservations older than staleReservationThresholdMs so in-flight requests are excluded.",
    topCustomers: perCustomer.map((row) => ({
      customerUserId: row.customerUserId,
      email: row.customer?.email ?? null,
      name: row.customer?.name ?? null,
      spentCents: row.spentCents,
    })),
  });
}

export async function POST(request: Request) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();
  if (crossOriginBrowserMutationBlocked(request)) {
    return forbiddenJson("Cross-origin request blocked.");
  }
  const { recoverStaleAiBudgetReservations } =
    await import("@/lib/beyond-master/ai-budget-recovery");
  /** Explicit administrative recovery — bypasses env kill-switch for background callers. */
  const result = await recoverStaleAiBudgetReservations({
    bypassRecoveryEnabledGuard: true,
  });
  return Response.json({
    ok: true,
    ...result,
  });
}
