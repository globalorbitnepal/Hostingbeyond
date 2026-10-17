import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Prisma } from "@prisma/client";

import { assessWalletPaymentForInvoice } from "@/lib/billing/payment-reconciliation-assess";

function invoice(
  overrides: Partial<{
    status: "ISSUED" | "PAID" | "VOID";
    total: Prisma.Decimal;
    currency: string;
  }> = {},
) {
  return {
    status: overrides.status ?? ("ISSUED" as const),
    userId: "user_1",
    total: overrides.total ?? new Prisma.Decimal(25),
    currency: overrides.currency ?? "USD",
  };
}

function walletTx(
  overrides: Partial<{
    type: "DEBIT" | "RESERVE" | "CREDIT";
    status: "COMPLETED" | "FAILED" | "REVERSED";
    amount: Prisma.Decimal;
    currency: string;
    referenceId: string;
  }> = {},
) {
  return {
    id: "tx_1",
    userId: "user_1",
    type: overrides.type ?? ("DEBIT" as const),
    status: overrides.status ?? ("COMPLETED" as const),
    amount: overrides.amount ?? new Prisma.Decimal(25),
    currency: overrides.currency ?? "USD",
    referenceType: "DomainOrder",
    referenceId: overrides.referenceId ?? "order_1",
  } as const;
}

const order = {
  id: "order_1",
  userId: "user_1",
  total: new Prisma.Decimal(25),
  currency: "USD",
  walletTransactionId: "tx_1",
};

describe("assessWalletPaymentForInvoice", () => {
  it("marks paid when debit matches invoice and order", () => {
    const r = assessWalletPaymentForInvoice({
      invoice: invoice(),
      order,
      walletTx: walletTx() as never,
    });
    assert.deepEqual(r, { markPaid: true });
  });

  it("rejects reserve", () => {
    const r = assessWalletPaymentForInvoice({
      invoice: invoice(),
      order,
      walletTx: walletTx({ type: "RESERVE" }) as never,
    });
    assert.equal(r.markPaid, false);
    if (!r.markPaid) assert.equal(r.reason, "wallet_tx_reserve_not_captured");
  });

  it("rejects wrong amount", () => {
    const r = assessWalletPaymentForInvoice({
      invoice: invoice(),
      order,
      walletTx: walletTx({ amount: new Prisma.Decimal(10) }) as never,
    });
    assert.equal(r.markPaid, false);
    if (!r.markPaid) assert.equal(r.reason, "wallet_tx_amount_mismatch");
  });

  it("rejects currency mismatch", () => {
    const r = assessWalletPaymentForInvoice({
      invoice: invoice({ currency: "USD" }),
      order: { ...order, currency: "NPR" },
      walletTx: walletTx({ currency: "NPR" }) as never,
    });
    assert.equal(r.markPaid, false);
    if (!r.markPaid) assert.equal(r.reason, "currency_mismatch");
  });

  it("rejects unrelated transaction reference", () => {
    const r = assessWalletPaymentForInvoice({
      invoice: invoice(),
      order,
      walletTx: walletTx({ referenceId: "other_order" }) as never,
    });
    assert.equal(r.markPaid, false);
    if (!r.markPaid)
      assert.equal(r.reason, "wallet_tx_order_reference_mismatch");
  });

  it("rejects failed transaction", () => {
    const r = assessWalletPaymentForInvoice({
      invoice: invoice(),
      order,
      walletTx: walletTx({ status: "FAILED" }) as never,
    });
    assert.equal(r.markPaid, false);
    if (!r.markPaid) assert.equal(r.reason, "wallet_tx_not_completed");
  });

  it("rejects reversed transaction", () => {
    const r = assessWalletPaymentForInvoice({
      invoice: invoice(),
      order,
      walletTx: walletTx({ status: "REVERSED" }) as never,
    });
    assert.equal(r.markPaid, false);
    if (!r.markPaid) assert.equal(r.reason, "wallet_tx_not_completed");
  });

  it("is idempotent for already paid invoice", () => {
    const r = assessWalletPaymentForInvoice({
      invoice: invoice({ status: "PAID" }),
      order,
      walletTx: walletTx() as never,
    });
    assert.equal(r.markPaid, false);
    if (!r.markPaid) assert.equal(r.reason, "invoice_terminal_status");
  });

  it("rejects cross-user wallet transaction", () => {
    const badTx = { ...walletTx(), userId: "user_2" };
    const r2 = assessWalletPaymentForInvoice({
      invoice: invoice(),
      order,
      walletTx: badTx as never,
    });
    assert.equal(r2.markPaid, false);
    if (!r2.markPaid) assert.equal(r2.reason, "wallet_tx_user_mismatch");
  });
});
