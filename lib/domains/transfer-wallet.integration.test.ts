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
const MIN_TEST_BALANCE = 250;

async function ensureIntegrationWalletFunded(userId: string) {
  await ensureCustomerWallet(userId);
  const wallet = await prisma.customerWallet.findUnique({ where: { userId } });
  const balance = wallet?.balance ?? new Prisma.Decimal(0);
  if (balance.lessThan(MIN_TEST_BALANCE)) {
    const topUp = MIN_TEST_BALANCE - balance.toNumber() + 50;
    await creditWallet({
      userId,
      amount: topUp,
      idempotencyKey: `transfer-wallet-topup-${userId}-${Date.now()}`,
      note: "transfer wallet integration test top-up",
    });
  }
}

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
      await ensureIntegrationWalletFunded(userId);
    });

    it("duplicate reserve idempotency key does not double-debit", async () => {
      await ensureIntegrationWalletFunded(userId);
      const before = await prisma.customerWallet.findUnique({
        where: { userId },
      });
      assert.ok(before);
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
      const expectedOnce = before.balance.sub(new Prisma.Decimal(10));
      assert.equal(wallet.balance.toString(), expectedOnce.toString());
      await rollbackReserve({
        userId,
        amount: 10,
        reserveTransactionId: first.id,
        idempotencyKey: key.replace(/^transfer:/, ""),
      });
    });

    it("rollback is idempotent", async () => {
      await ensureIntegrationWalletFunded(userId);
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
      await ensureIntegrationWalletFunded(userId);
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
      await creditWallet({
        userId,
        amount: 7,
        idempotencyKey: `transfer-wallet-finalize-cleanup-${Date.now()}`,
        note: "restore after finalize integration test",
      });
    });
  },
);
