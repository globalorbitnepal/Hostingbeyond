import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  actualCentsFromTokenUsage,
  beyondMasterBudgetLockKey,
  beyondMasterPaidAiBudgetEnabled,
  currentBudgetMonthKey,
} from "@/lib/beyond-master/ai-budget";

/** App ledger / advisory locks — not a guarantee of any specific provider invoice amount. */
describe("beyond master ai budget", () => {
  it("computes month key in UTC", () => {
    const d = new Date(Date.UTC(2026, 10, 15, 12, 0, 0));
    assert.equal(currentBudgetMonthKey(d, "UTC"), "2026-11");
  });

  it("maps token usage to a bounded cent estimate", () => {
    assert.equal(actualCentsFromTokenUsage({}), 0);
    const cents = actualCentsFromTokenUsage({
      promptTokens: 4000,
      completionTokens: 2000,
    });
    assert.equal(cents >= 1, true);
  });

  it("uses a single budget advisory key shape for reserve and reconcile", () => {
    assert.equal(beyondMasterBudgetLockKey("2026-11"), "budget:2026-11");
  });

  it("keeps the paid USD ledger off unless explicitly enabled", () => {
    assert.equal(beyondMasterPaidAiBudgetEnabled({}), false);
    assert.equal(
      beyondMasterPaidAiBudgetEnabled({
        BEYOND_MASTER_AI_PAID_BUDGET_ENABLED: "true",
      }),
      true,
    );
  });
});
