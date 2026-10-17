import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Prisma } from "@prisma/client";

import {
  creditWallet,
  ensureCustomerWallet,
  finalizeReserve,
  reserveWalletFunds,
  rollbackReserve,
} from "@/lib/domains/wallet";
import { prisma } from "@/lib/prisma";
import { isIntegrationDatabaseConfigured } from "@/lib/test/integration-gate";

const TEST_EMAIL = "transfer-wallet-test@hostingbeyond.local";

describe(
  "Transfer wallet reserve (database)",
  { skip: !isIntegrationDatabaseConfigured(), concurrency: 1 },
  () => {
    let userId = "";

    it("prepares funded wallet", async () => {
      const user = await prisma.customerUser.upsert({
        where: { email: TEST_EMAIL },
        create: { email: TEST_EMAIL, name: "Transfer Wallet Test" },
        update: {},
      });
      userId = user.id;
      await ensureCustomerWallet(userId);
      await creditWallet({
        userId,
        amount: 200,
        idempotencyKey: `transfer-wallet-fund-${userId}`,
        note: "transfer wallet integration test",
      });
    });

    it("duplicate reserve idempotency key does not double-debit", async () => {
      const key = `transfer:wallet-idem-${Date.now()}`;
      const ref = `ref-${Date.now()}`;
      const first = await reserveWalletFunds({
        userId,
        amount: 10,
        idempotencyKey: key,
        referenceType: "DomainTransferRecord",
        referenceId: ref,
      });
      const second = await reserveWalletFunds({
        userId,
        amount: 10,
        idempotencyKey: key,
        referenceType: "DomainTransferRecord",
        referenceId: ref,
      });
      assert.equal(second.id, first.id);
      const wallet = await prisma.customerWallet.findUnique({
        where: { userId },
      });
      assert.ok(wallet);
      const debitedOnce = wallet!.balance.lessThanOrEqualTo(
        new Prisma.Decimal(190),
      );
      assert.ok(debitedOnce);
      await rollbackReserve({
        userId,
        amount: 10,
        reserveTransactionId: first.id,
        idempotencyKey: key.replace(/^transfer:/, ""),
      });
    });

    it("rollback is idempotent", async () => {
      const key = `transfer:wallet-release-${Date.now()}`;
      const reserve = await reserveWalletFunds({
        userId,
        amount: 5,
        idempotencyKey: key,
        referenceType: "test",
        referenceId: `ref-release-${Date.now()}`,
      });
      const idem = key.replace(/^transfer:/, "");
      const r1 = await rollbackReserve({
        userId,
        amount: 5,
        reserveTransactionId: reserve.id,
        idempotencyKey: idem,
      });
      const r2 = await rollbackReserve({
        userId,
        amount: 5,
        reserveTransactionId: reserve.id,
        idempotencyKey: idem,
      });
      assert.equal(r2.id, r1.id);
    });

    it("finalize does not change balance again", async () => {
      const key = `transfer:wallet-finalize-${Date.now()}`;
      const reserve = await reserveWalletFunds({
        userId,
        amount: 7,
        idempotencyKey: key,
        referenceType: "test",
        referenceId: `ref-fin-${Date.now()}`,
      });
      const before = await prisma.customerWallet.findUnique({
        where: { userId },
      });
      await finalizeReserve({ userId, reserveTransactionId: reserve.id });
      const after = await prisma.customerWallet.findUnique({
        where: { userId },
      });
      assert.ok(before && after);
      assert.equal(after.balance.toString(), before.balance.toString());
    });
  },
);
