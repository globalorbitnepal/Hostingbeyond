import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  creditWallet,
  ensureCustomerWallet,
  reserveWalletFunds,
} from "@/lib/domains/wallet";
import { prisma } from "@/lib/prisma";
import {
  assertIntegrationDatabaseTarget,
  shouldRunDatabaseIntegrationTests,
} from "@/lib/test/integration-gate";

describe(
  "Wallet reserve insufficient balance (integration DB)",
  { skip: !shouldRunDatabaseIntegrationTests(), concurrency: 1 },
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

    it("does not let concurrent reserves overdraw the wallet", async () => {
      assertIntegrationDatabaseTarget();
      const email = `wallet-race-${Date.now()}@hostingbeyond.local`;
      const user = await prisma.customerUser.create({
        data: { email, name: "Wallet race test" },
      });
      await ensureCustomerWallet(user.id);
      await creditWallet({
        userId: user.id,
        amount: 10,
        idempotencyKey: `wallet-race-credit-${user.id}`,
        note: "concurrent reserve fixture",
      });
      const results = await Promise.allSettled([
        reserveWalletFunds({
          userId: user.id,
          amount: 10,
          idempotencyKey: `wallet-race-a-${user.id}`,
          referenceType: "test",
          referenceId: "a",
        }),
        reserveWalletFunds({
          userId: user.id,
          amount: 10,
          idempotencyKey: `wallet-race-b-${user.id}`,
          referenceType: "test",
          referenceId: "b",
        }),
      ]);
      const fulfilled = results.filter((row) => row.status === "fulfilled");
      const rejected = results.filter((row) => row.status === "rejected");
      assert.equal(fulfilled.length, 1);
      assert.equal(rejected.length, 1);
      const wallet = await prisma.customerWallet.findUnique({
        where: { userId: user.id },
      });
      assert.ok(wallet);
      assert.equal(wallet.balance.toString(), "0");
    });
  },
);
