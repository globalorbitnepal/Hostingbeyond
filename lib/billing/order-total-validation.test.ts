import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Prisma } from "@prisma/client";

import { validateDomainOrderTotals } from "@/lib/billing/order-total-validation";

describe("validateDomainOrderTotals", () => {
  it("accepts undiscounted order with no tax", () => {
    const r = validateDomainOrderTotals({
      retailPrice: new Prisma.Decimal(25),
      discount: new Prisma.Decimal(0),
      tax: null,
      total: new Prisma.Decimal(25),
    });
    assert.equal(r.ok, true);
  });

  it("accepts discounted order with no tax", () => {
    const r = validateDomainOrderTotals({
      retailPrice: new Prisma.Decimal(100),
      discount: new Prisma.Decimal(10),
      tax: null,
      total: new Prisma.Decimal(90),
    });
    assert.equal(r.ok, true);
  });

  it("accepts exclusive tax components", () => {
    const r = validateDomainOrderTotals({
      retailPrice: new Prisma.Decimal(100),
      discount: new Prisma.Decimal(0),
      tax: new Prisma.Decimal(13),
      total: new Prisma.Decimal(113),
    });
    assert.equal(r.ok, true);
  });

  it("rejects inconsistent total", () => {
    const r = validateDomainOrderTotals({
      retailPrice: new Prisma.Decimal(100),
      discount: new Prisma.Decimal(10),
      tax: null,
      total: new Prisma.Decimal(100),
    });
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.reason, "order_total_mismatch");
  });

  it("rejects discount greater than retail", () => {
    const r = validateDomainOrderTotals({
      retailPrice: new Prisma.Decimal(5),
      discount: new Prisma.Decimal(10),
      tax: null,
      total: new Prisma.Decimal(0),
    });
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.reason, "order_discount_exceeds_retail");
  });
});
