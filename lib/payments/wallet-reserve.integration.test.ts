import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { reserveWalletFunds } from "@/lib/domains/wallet";
import {
  assertIntegrationDatabaseTarget,
  isIntegrationDatabaseConfigured,
} from "@/lib/test/integration-gate";

describe(
  "Wallet reserve insufficient balance (integration DB)",
  { skip: !isIntegrationDatabaseConfigured(), concurrency: 1 },
  () => {
    it("rejects reserve when balance is insufficient", async () => {
      assertIntegrationDatabaseTarget();
      await assert.rejects(
        () =>
          reserveWalletFunds({
            userId: "nonexistent-user-for-wallet-test",
            amount: 999_999,
            idempotencyKey: `test-insufficient-${Date.now()}`,
            referenceType: "test",
            referenceId: "test",
          }),
        /insufficient_funds/,
      );
    });
  },
);
