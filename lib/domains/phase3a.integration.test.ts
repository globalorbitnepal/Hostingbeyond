import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import { describe, it, before } from "node:test";

import { Prisma } from "@prisma/client";

import {
  getCustomerDomainOrderByPublicId,
  listCustomerDomainOrders,
} from "@/lib/domains/customer-domain-orders";
import { inflightDomainOrderFilter } from "@/lib/domains/domain-order-inflight";
import { buildBillingLedgerEntries } from "@/lib/panel/billing-ledger";
import { loadBillingLedgerForUser } from "@/lib/panel/load-billing-ledger";
import { prisma } from "@/lib/prisma";
import {
  reserveWalletFunds,
  rollbackReserve,
  ensureCustomerWallet,
} from "@/lib/domains/wallet";

function requireIntegrationDb() {
  if (!existsSync(".env.integration.local")) {
    return { skip: true as const, reason: "missing .env.integration.local" };
  }
  if (!process.env.DATABASE_URL?.includes("hostingbeyond_integration_test")) {
    return {
      skip: true as const,
      reason: "DATABASE_URL not targeting hostingbeyond_integration_test",
    };
  }
  return { skip: false as const };
}

describe("Phase 3a integration (isolated PostgreSQL)", () => {
  const gate = requireIntegrationDb();
  if (gate.skip) {
    it(`skipped: ${gate.reason}`, () => {
      assert.ok(true);
    });
    return;
  }

  const userA = "phase3a-user-a";
  const userB = "phase3a-user-b";
  let orderPublicIdA = "";

  before(async () => {
    await prisma.customerUser.upsert({
      where: { id: userA },
      create: { id: userA, email: "phase3a-a@example.test" },
      update: {},
    });
    await prisma.customerUser.upsert({
      where: { id: userB },
      create: { id: userB, email: "phase3a-b@example.test" },
      update: {},
    });
    await prisma.customerWallet.upsert({
      where: { userId: userA },
      create: { userId: userA, balance: 100, currency: "USD" },
      update: { balance: 100 },
    });

    const order = await prisma.domainOrder.create({
      data: {
        publicId: `DOM-PH3A-${Date.now()}`,
        userId: userA,
        orderType: "renew",
        domain: "phase3a-example.test",
        tld: ".test",
        status: "REGISTERED",
        retailPrice: 12,
        total: 12,
        currency: "USD",
        idempotencyKey: `phase3a-key-${Date.now()}`,
        completedAt: new Date(),
      },
    });
    orderPublicIdA = order.publicId;

    await prisma.walletTransaction.create({
      data: {
        userId: userA,
        type: "RESERVE",
        status: "COMPLETED",
        amount: 12,
        currency: "USD",
        referenceType: "DomainOrder",
        referenceId: order.id,
        idempotencyKey: `phase3a-tx-${Date.now()}`,
      },
    });
  });

  it("lists only the owning customer orders", async () => {
    const ordersA = await listCustomerDomainOrders(userA, 50);
    assert.ok(ordersA.some((o) => o.publicId === orderPublicIdA));
    const ordersB = await listCustomerDomainOrders(userB, 50);
    assert.equal(
      ordersB.some((o) => o.publicId === orderPublicIdA),
      false,
    );
  });

  it("returns null for cross-customer order publicId", async () => {
    const row = await getCustomerDomainOrderByPublicId(userB, orderPublicIdA);
    assert.equal(row, null);
  });

  it("ledger links order publicId only for owning user", async () => {
    const entriesA = await loadBillingLedgerForUser(userA, 50);
    const linked = entriesA.find(
      (e) => e.domainOrderPublicId === orderPublicIdA,
    );
    assert.ok(linked);
    const entriesB = await loadBillingLedgerForUser(userB, 50);
    assert.equal(
      entriesB.some((e) => e.domainOrderPublicId === orderPublicIdA),
      false,
    );
  });

  it("dedupes ledger rows by transaction id", () => {
    const tx = {
      id: "tx-dup",
      userId: userA,
      type: "RESERVE" as const,
      status: "COMPLETED" as const,
      amount: new Prisma.Decimal(5),
      currency: "USD",
      balanceAfter: null,
      referenceType: "DomainOrder",
      referenceId: "ord-1",
      idempotencyKey: "k1",
      note: null,
      createdAt: new Date(),
    };
    const entries = buildBillingLedgerEntries([tx, tx], { "ord-1": "DOM-X" });
    assert.equal(entries.length, 1);
  });

  it("renew inflight filter scopes by user and orderType", async () => {
    const domain = `concurrent-renew-${Date.now()}.test`;
    await prisma.domainOrder.create({
      data: {
        publicId: `DOM-INF-${Date.now()}`,
        userId: userA,
        orderType: "renew",
        domain,
        tld: ".test",
        status: "PROCESSING",
        retailPrice: 10,
        total: 10,
        currency: "USD",
        idempotencyKey: `inflight-${Date.now()}`,
      },
    });
    const found = await prisma.domainOrder.findFirst({
      where: inflightDomainOrderFilter({
        domain,
        userId: userA,
        orderType: "renew",
      }),
    });
    assert.ok(found);
    const otherUser = await prisma.domainOrder.findFirst({
      where: inflightDomainOrderFilter({
        domain,
        userId: userB,
        orderType: "renew",
      }),
    });
    assert.equal(otherUser, null);
  });

  it("unique renew inflight index exists when migration applied", async () => {
    const rows = await prisma.$queryRaw<{ indexname: string }[]>`
      SELECT indexname FROM pg_indexes
      WHERE indexname = 'DomainOrder_user_domain_renew_inflight_key'
    `;
    assert.equal(rows.length, 1);
  });

  it("rejects duplicate in-flight renew rows via unique index (P2002)", async () => {
    const domain = `unique-renew-${Date.now()}.test`;
    const base = {
      publicId: `DOM-U1-${Date.now()}`,
      userId: userA,
      orderType: "renew" as const,
      domain,
      tld: ".test",
      status: "PROCESSING" as const,
      retailPrice: 10,
      total: 10,
      currency: "USD",
    };
    await prisma.domainOrder.create({
      data: { ...base, idempotencyKey: `u1-${Date.now()}` },
    });
    await assert.rejects(
      () =>
        prisma.domainOrder.create({
          data: {
            ...base,
            publicId: `DOM-U2-${Date.now()}`,
            idempotencyKey: `u2-${Date.now()}`,
          },
        }),
      (err: unknown) =>
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002",
    );
  });

  it("reserveWalletFunds is idempotent for duplicate-charge prevention", async () => {
    const walletUser = "phase3a-wallet-user";
    await prisma.customerUser.upsert({
      where: { id: walletUser },
      create: { id: walletUser, email: "phase3a-wallet@example.test" },
      update: {},
    });
    await ensureCustomerWallet(walletUser);
    await prisma.customerWallet.update({
      where: { userId: walletUser },
      data: { balance: 50 },
    });
    const key = `phase3a-reserve-${Date.now()}`;
    const refId = `ord-ref-${Date.now()}`;
    const first = await reserveWalletFunds({
      userId: walletUser,
      amount: 10,
      idempotencyKey: key,
      referenceType: "DomainOrder",
      referenceId: refId,
    });
    const second = await reserveWalletFunds({
      userId: walletUser,
      amount: 10,
      idempotencyKey: key,
      referenceType: "DomainOrder",
      referenceId: refId,
    });
    assert.equal(first.id, second.id);
    const count = await prisma.walletTransaction.count({
      where: { userId: walletUser, idempotencyKey: key },
    });
    assert.equal(count, 1);
    const wallet = await prisma.customerWallet.findUnique({
      where: { userId: walletUser },
    });
    assert.ok(wallet?.balance.equals(new Prisma.Decimal(40)));
  });

  it("rollbackReserve restores balance and marks reserve reversed", async () => {
    const walletUser = "phase3a-rollback-user";
    await prisma.customerUser.upsert({
      where: { id: walletUser },
      create: { id: walletUser, email: "phase3a-rollback@example.test" },
      update: {},
    });
    await ensureCustomerWallet(walletUser);
    await prisma.customerWallet.update({
      where: { userId: walletUser },
      data: { balance: 30 },
    });
    const idem = `phase3a-rb-${Date.now()}`;
    const reserve = await reserveWalletFunds({
      userId: walletUser,
      amount: 8,
      idempotencyKey: idem,
      referenceType: "DomainOrder",
      referenceId: `ref-${Date.now()}`,
    });
    await rollbackReserve({
      userId: walletUser,
      amount: 8,
      reserveTransactionId: reserve.id,
      idempotencyKey: idem,
    });
    const wallet = await prisma.customerWallet.findUnique({
      where: { userId: walletUser },
    });
    assert.ok(wallet?.balance.equals(new Prisma.Decimal(30)));
    const updated = await prisma.walletTransaction.findUnique({
      where: { id: reserve.id },
    });
    assert.equal(updated?.status, "REVERSED");
  });

  it("domain order and ledger routes enforce session before data access", () => {
    const routes = [
      "app/api/domains/orders/route.ts",
      "app/api/domains/orders/[publicId]/route.ts",
      "app/api/domains/wallet/ledger/route.ts",
    ];
    for (const path of routes) {
      const src = readFileSync(path, "utf8");
      assert.match(src, /requireCustomerSession/);
      assert.match(src, /status:\s*401/);
      assert.match(src, /Sign in required/i);
    }
  });
});
