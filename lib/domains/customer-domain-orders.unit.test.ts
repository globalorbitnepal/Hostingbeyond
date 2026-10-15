import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Prisma } from "@prisma/client";
import type { DomainOrder } from "@prisma/client";

import { toCustomerDomainOrderSummary } from "@/lib/domains/customer-domain-orders";

function mockOrder(overrides: Partial<DomainOrder> = {}): DomainOrder {
  const now = new Date("2026-01-15T12:00:00.000Z");
  return {
    id: "ord_internal",
    publicId: "DOM-TEST-001",
    userId: "user_a",
    orderType: "renew",
    domain: "example.com",
    tld: ".com",
    status: "REGISTERED",
    provider: "domain-name-api",
    providerOrderId: "prov_secret",
    supplierCost: null,
    retailPrice: new Prisma.Decimal(12),
    discount: new Prisma.Decimal(0),
    tax: null,
    total: new Prisma.Decimal(12),
    currency: "USD",
    paymentProvider: null,
    paymentReference: null,
    walletTransactionId: "tx_1",
    idempotencyKey: "key-1",
    errorCode: null,
    errorMessageInternal: "internal only",
    errorMessageCustomer: null,
    completedAt: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("toCustomerDomainOrderSummary", () => {
  it("omits internal provider and reconciliation fields", () => {
    const summary = toCustomerDomainOrderSummary(mockOrder());
    assert.equal(summary.publicId, "DOM-TEST-001");
    assert.equal(summary.paymentMethod, "wallet");
    assert.ok(!("providerOrderId" in summary));
    assert.ok(!("walletTransactionId" in summary));
    assert.ok(!("errorMessageInternal" in summary));
    assert.ok(!("id" in summary));
  });

  it("uses renewal-specific status copy", () => {
    const summary = toCustomerDomainOrderSummary(
      mockOrder({ status: "REGISTERED", orderType: "renew" }),
    );
    assert.match(summary.statusMessage, /renewal is complete/i);
  });

  it("detects external payment when provider set", () => {
    const summary = toCustomerDomainOrderSummary(
      mockOrder({
        walletTransactionId: null,
        paymentProvider: "stripe",
        paymentReference: "pi_abc",
      }),
    );
    assert.equal(summary.paymentMethod, "external");
    assert.equal(summary.paymentReference, "pi_abc");
  });
});
