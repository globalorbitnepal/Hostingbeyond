import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { TldPriceRowInput } from "@/lib/orbit/bulk-retail-preview";
import {
  buildCatalogueRowMetrics,
  computeOperationGrossMetrics,
  markupPercent,
  roundUsd,
} from "@/lib/orbit/pricing-financial-metrics";

function baseRow(overrides: Partial<TldPriceRowInput> = {}): TldPriceRowInput {
  return {
    tld: ".com",
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    retailPriceLocked: false,
    retailRegister: 14.99,
    retailRenew: 16.99,
    retailTransfer: 12.99,
    supplierRegister: 10,
    supplierRenew: 9,
    supplierTransfer: 8,
    supplierSyncedAt: new Date("2026-01-01T00:00:00.000Z"),
    namesiloRegister: 10,
    namesiloRenew: 9,
    namesiloTransfer: 8,
    namesiloSyncedAt: new Date("2026-01-01T00:00:00.000Z"),
    namesiloPriceStatus: "verified",
    ...overrides,
  };
}

describe("pricing financial metrics", () => {
  it("computes profit when retail exceeds supplier", () => {
    const m = computeOperationGrossMetrics(14.99, {
      amount: 10,
      kind: "verified_dna",
    });
    assert.equal(m.grossProfitUsd, 4.99);
    assert.ok(m.grossMarginPercent != null && m.grossMarginPercent > 0);
    assert.equal(m.markupPercent, 49.9);
    assert.equal(m.belowSupplierCost, false);
    assert.equal(m.incomplete, false);
  });

  it("handles retail equal to supplier", () => {
    const m = computeOperationGrossMetrics(10, {
      amount: 10,
      kind: "verified_dna",
    });
    assert.equal(m.grossProfitUsd, 0);
    assert.equal(m.grossMarginPercent, 0);
    assert.equal(m.markupPercent, 0);
  });

  it("flags below-supplier retail without Infinity margin", () => {
    const m = computeOperationGrossMetrics(8, {
      amount: 10,
      kind: "verified_dna",
    });
    assert.equal(m.grossProfitUsd, -2);
    assert.ok(m.belowSupplierCost);
    assert.ok(m.grossMarginPercent != null && m.grossMarginPercent < 0);
  });

  it("returns incomplete metrics for missing supplier", () => {
    const m = computeOperationGrossMetrics(9.99, {
      amount: null,
      kind: "missing",
    });
    assert.equal(m.grossProfitUsd, null);
    assert.equal(m.grossMarginPercent, null);
    assert.equal(m.markupPercent, null);
    assert.equal(m.incomplete, true);
  });

  it("markupPercent is null for zero supplier cost", () => {
    assert.equal(markupPercent(10, 0), null);
    assert.equal(markupPercent(0, 5), null);
  });

  it("roundUsd avoids float noise", () => {
    assert.equal(roundUsd(10.126), 10.13);
  });

  it("buildCatalogueRowMetrics covers renew and transfer", () => {
    const metrics = buildCatalogueRowMetrics(baseRow());
    assert.equal(metrics.register.incomplete, false);
    assert.equal(metrics.renew.grossProfitUsd, roundUsd(16.99 - 9));
    assert.equal(metrics.transfer.grossProfitUsd, roundUsd(12.99 - 8));
  });

  it("locked row still computes from catalogue values", () => {
    const metrics = buildCatalogueRowMetrics(
      baseRow({ retailPriceLocked: true, retailRegister: 20 }),
    );
    assert.equal(metrics.register.retailPriceUsd, 20);
    assert.equal(metrics.register.grossProfitUsd, 10);
  });
});
