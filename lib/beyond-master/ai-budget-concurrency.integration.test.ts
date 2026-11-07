import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { describe, it } from "node:test";

import {
  BEYOND_MASTER_MONTHLY_CAP_CENTS,
  beyondMasterBudgetLockKey,
  currentBudgetMonthKey,
  reconcilePaidAiBudget,
  reservePaidAiBudget,
} from "@/lib/beyond-master/ai-budget";
import { prisma } from "@/lib/prisma";
import {
  assertIntegrationDatabaseTarget,
  shouldRunDatabaseIntegrationTests,
} from "@/lib/test/integration-gate";

describe(
  "Beyond Master AI budget (integration concurrency)",
  { skip: !shouldRunDatabaseIntegrationTests(), concurrency: 1 },
  () => {
    it("does not overspend reserved cents under concurrent reservations (internal cap only)", async () => {
      assertIntegrationDatabaseTarget();
      const monthKey = `T${randomUUID().replaceAll("-", "").slice(0, 11)}`;
      const reserveUnit = 50;

      const results = await Promise.all(
        Array.from({ length: 12 }, (_, i) =>
          reservePaidAiBudget({
            requestId: `req-${monthKey}-${i}`,
            customerUserId: null,
            reserveCents: reserveUnit,
            monthKey,
          }),
        ),
      );
      const okCount = results.filter((r) => r.ok).length;
      const hardStops = results.filter((r) => !r.ok && r.code === "hard_stop");
      // The guard blocks as soon as committed + reserve would REACH the cap
      // (`budgetLevel` uses >=), so 50-cent units stop at 450/500 rather than
      // filling the last 50 cents. Invariant under test: never exceed the cap.
      assert.equal(okCount, 9);
      assert.equal(hardStops.length, 3);
      assert.equal(okCount + hardStops.length, results.length);

      const month = await prisma.beyondMasterAiBudgetMonth.findUnique({
        where: { monthKey },
      });
      assert.ok(month);
      assert.equal(month!.reservedCents, reserveUnit * okCount);
      assert.equal(month!.spentCents, 0);
      assert.ok(
        month!.spentCents + month!.reservedCents <=
          BEYOND_MASTER_MONTHLY_CAP_CENTS,
      );

      const reconcileRuns = await Promise.all([
        reconcilePaidAiBudget({
          requestId: `req-${monthKey}-0`,
          actualCents: 40,
        }),
        reconcilePaidAiBudget({
          requestId: `req-${monthKey}-0`,
          actualCents: 40,
        }),
      ]);
      assert.equal(reconcileRuns.length, 2);

      const after = await prisma.beyondMasterAiBudgetMonth.findUnique({
        where: { monthKey },
      });
      assert.ok(after);
      assert.equal(after!.spentCents, 40);
      assert.equal(after!.reservedCents, reserveUnit * (okCount - 1));

      await prisma.beyondMasterAiBudgetReservation.deleteMany({
        where: { monthKey },
      });
      await prisma.beyondMasterAiBudgetMonth.deleteMany({
        where: { monthKey },
      });
    });

    it("reserve then concurrent reconcile does not double-count spend", async () => {
      assertIntegrationDatabaseTarget();
      const monthKey = `R${randomUUID().replaceAll("-", "").slice(0, 11)}`;
      const requestId = `req-rec-${monthKey}`;
      const gate = await reservePaidAiBudget({
        requestId,
        customerUserId: null,
        reserveCents: 30,
        monthKey,
      });
      assert.equal(gate.ok, true);

      await Promise.all([
        reconcilePaidAiBudget({ requestId, actualCents: 25 }),
        reconcilePaidAiBudget({ requestId, actualCents: 25 }),
        reconcilePaidAiBudget({ requestId, actualCents: 25 }),
      ]);

      const month = await prisma.beyondMasterAiBudgetMonth.findUnique({
        where: { monthKey },
      });
      assert.ok(month);
      assert.equal(month!.spentCents, 25);

      await prisma.beyondMasterAiBudgetReservation.deleteMany({
        where: { monthKey },
      });
      await prisma.beyondMasterAiBudgetMonth.deleteMany({
        where: { monthKey },
      });
    });

    it("advisory lock key is shared between reserve and reconcile for a month", () => {
      const mk = currentBudgetMonthKey(new Date(Date.UTC(2026, 0, 15)), "UTC");
      assert.equal(beyondMasterBudgetLockKey(mk), `budget:${mk}`);
    });
  },
);
