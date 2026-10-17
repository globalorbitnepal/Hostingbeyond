import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Prisma } from "@prisma/client";

import { deriveTaxSnapshotFromOrder } from "@/lib/billing/tax-snapshot";

describe("deriveTaxSnapshotFromOrder", () => {
  it("uses stored tax when present on order", () => {
    const snap = deriveTaxSnapshotFromOrder(
      {
        retailPrice: new Prisma.Decimal(100),
        discount: new Prisma.Decimal(0),
        tax: new Prisma.Decimal(13),
        total: new Prisma.Decimal(113),
        currency: "USD",
      },
      { vatInclusivePercent: null },
    );
    assert.equal(snap.taxTreatment, "STORED_ON_ORDER");
    assert.equal(snap.tax.toFixed(2), "13.00");
    assert.equal(snap.total.toFixed(2), "113.00");
    assert.equal(snap.subtotal.toFixed(2), "100.00");
  });

  it("reverse-calculates VAT-inclusive total at 13%", () => {
    const snap = deriveTaxSnapshotFromOrder(
      {
        retailPrice: new Prisma.Decimal(113),
        discount: new Prisma.Decimal(0),
        tax: null,
        total: new Prisma.Decimal(113),
        currency: "NPR",
      },
      { vatInclusivePercent: 13 },
    );
    assert.equal(snap.taxTreatment, "VAT_INCLUSIVE");
    assert.equal(snap.total.toFixed(2), "113.00");
    assert.equal(snap.subtotal.toFixed(2), "100.00");
    assert.equal(snap.tax.toFixed(2), "13.00");
  });

  it("treats order as non-VAT when no tax and no config", () => {
    const snap = deriveTaxSnapshotFromOrder(
      {
        retailPrice: new Prisma.Decimal(25),
        discount: new Prisma.Decimal(0),
        tax: null,
        total: new Prisma.Decimal(25),
        currency: "USD",
      },
      { vatInclusivePercent: null },
    );
    assert.equal(snap.taxTreatment, "NONE");
    assert.equal(snap.tax.toFixed(2), "0.00");
    assert.equal(snap.total.toFixed(2), "25.00");
  });
});
