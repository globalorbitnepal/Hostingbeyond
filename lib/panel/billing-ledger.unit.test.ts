import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Prisma } from "@prisma/client";
import type { WalletTransaction } from "@prisma/client";

import { buildBillingLedgerEntries } from "@/lib/panel/billing-ledger";

function tx(
  overrides: Partial<WalletTransaction> & { id: string },
): WalletTransaction {
  const now = new Date("2026-01-10T10:00:00.000Z");
  return {
    userId: "user_1",
    type: "RESERVE",
    status: "COMPLETED",
    amount: new Prisma.Decimal(15),
    currency: "USD",
    balanceAfter: new Prisma.Decimal(85),
    referenceType: "DomainOrder",
    referenceId: "order_1",
    idempotencyKey: "k1",
    note: null,
    createdAt: now,
    ...overrides,
  };
}

describe("buildBillingLedgerEntries", () => {
  it("links domain orders by reference id without duplicating rows", () => {
    const rows = [
      tx({ id: "t1" }),
      tx({ id: "t1" }),
      tx({
        id: "t2",
        type: "DEBIT",
        referenceId: "order_1",
        note: "Domain purchase finalized",
      }),
    ];
    const entries = buildBillingLedgerEntries(rows, {
      order_1: "DOM-PUBLIC",
    });
    assert.equal(entries.length, 2);
    assert.equal(entries[0].domainOrderPublicId, "DOM-PUBLIC");
    assert.equal(entries[1].domainOrderPublicId, "DOM-PUBLIC");
  });

  it("does not invent order links when map is missing", () => {
    const entries = buildBillingLedgerEntries([tx({ id: "t1" })], {});
    assert.equal(entries[0].domainOrderPublicId, null);
  });

  it("labels reserve and reversed semantics", () => {
    const entries = buildBillingLedgerEntries([
      tx({ id: "r1", type: "RESERVE", status: "COMPLETED" }),
      tx({
        id: "r2",
        type: "RESERVE",
        status: "REVERSED",
        referenceId: null,
        referenceType: "wallet_release",
      }),
    ]);
    assert.match(entries[0].description, /reserved/i);
    assert.equal(entries[1].status, "REVERSED");
  });
});
