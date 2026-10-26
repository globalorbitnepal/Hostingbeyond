import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { TldPriceRowInput } from "@/lib/orbit/bulk-retail-preview";
import { resolveSupplierCostForOperation } from "@/lib/orbit/bulk-retail-preview";
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
    supplierRegister: 99,
    supplierRenew: 88,
    supplierTransfer: 77,
    supplierSyncedAt: new Date("2026-01-01T00:00:00.000Z"),
    namesiloRegister: 10,
    namesiloRenew: 9,
    namesiloTransfer: 8,
    namesiloSyncedAt: new Date(),
    namesiloPriceStatus: "verified",
    ...overrides,
  };
}

describe("pricing financial metrics", () => {
  it("computes profit when retail exceeds verified NameSilo supplier", () => {
    const m = computeOperationGrossMetrics(14.99, {
      amount: 10,
      kind: "verified_namesilo",
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
      kind: "verified_namesilo",
    });
    assert.equal(m.grossProfitUsd, 0);
    assert.equal(m.grossMarginPercent, 0);
    assert.equal(m.markupPercent, 0);
  });

  it("flags below-supplier retail without Infinity margin", () => {
    const m = computeOperationGrossMetrics(8, {
      amount: 10,
      kind: "verified_namesilo",
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

  it("never treats DNA costs as authoritative NameSilo metrics", () => {
    const m = computeOperationGrossMetrics(14.99, {
      amount: 99,
      kind: "verified_dna",
    });
    assert.equal(m.incomplete, true);
    assert.equal(m.grossProfitUsd, null);
  });

  it("excludes unverified NameSilo costs from authoritative metrics", () => {
    const m = computeOperationGrossMetrics(14.99, {
      amount: 10,
      kind: "unverified",
    });
    assert.equal(m.incomplete, true);
    assert.equal(m.grossProfitUsd, null);
  });

  it("excludes stale NameSilo costs from authoritative metrics", () => {
    const m = computeOperationGrossMetrics(14.99, {
      amount: 10,
      kind: "stale",
    });
    assert.equal(m.incomplete, true);
    assert.equal(m.grossProfitUsd, null);
  });

  it("excludes invalid NameSilo costs from authoritative metrics", () => {
    const m = computeOperationGrossMetrics(14.99, {
      amount: 10,
      kind: "invalid",
    });
    assert.equal(m.incomplete, true);
    assert.equal(m.grossProfitUsd, null);
  });

  it("markupPercent is null for zero supplier cost", () => {
    assert.equal(markupPercent(10, 0), null);
    assert.equal(markupPercent(0, 5), null);
  });

  it("zero retail and zero supplier do not throw", () => {
    const zeroRetail = computeOperationGrossMetrics(0, {
      amount: 10,
      kind: "verified_namesilo",
    });
    assert.equal(zeroRetail.grossProfitUsd, -10);
    assert.equal(zeroRetail.grossMarginPercent, null);
    const zeroCost = computeOperationGrossMetrics(10, {
      amount: 0,
      kind: "verified_namesilo",
    });
    assert.equal(zeroCost.grossProfitUsd, 10);
    assert.equal(zeroCost.markupPercent, null);
  });

  it("buildCatalogueRowMetrics uses NameSilo not DNA for all operations", () => {
    const metrics = buildCatalogueRowMetrics(baseRow());
    assert.equal(metrics.register.incomplete, false);
    assert.equal(metrics.register.supplierCostUsd, 10);
    assert.equal(metrics.renew.grossProfitUsd, roundUsd(16.99 - 9));
    assert.equal(metrics.transfer.grossProfitUsd, roundUsd(12.99 - 8));
    assert.equal(metrics.register.supplierKind, "verified_namesilo");
  });

  it("missing NameSilo does not fall back to DNA for any operation", () => {
    const metrics = buildCatalogueRowMetrics(
      baseRow({
        namesiloRegister: null,
        namesiloRenew: null,
        namesiloTransfer: null,
        namesiloPriceStatus: "missing",
      }),
    );
    assert.equal(metrics.register.incomplete, true);
    assert.equal(metrics.renew.incomplete, true);
    assert.equal(metrics.transfer.incomplete, true);
    assert.equal(metrics.register.supplierCostUsd, null);
    assert.notEqual(metrics.register.supplierKind, "verified_dna");
    assert.equal(
      resolveSupplierCostForOperation(
        baseRow({
          namesiloRegister: null,
          namesiloPriceStatus: "missing",
          supplierRegister: 99,
        }),
        "register",
      ).kind,
      "missing",
    );
  });

  it("stale NameSilo timestamp excludes metrics even if status is verified", () => {
    const metrics = buildCatalogueRowMetrics(
      baseRow({
        namesiloSyncedAt: new Date("2020-01-01T00:00:00.000Z"),
      }),
    );
    assert.equal(metrics.register.incomplete, true);
    assert.equal(metrics.register.supplierKind, "stale");
    assert.equal(metrics.register.supplierCostUsd, 10);
  });

  it("locked row still computes from catalogue values", () => {
    const metrics = buildCatalogueRowMetrics(
      baseRow({ retailPriceLocked: true, retailRegister: 20 }),
    );
    assert.equal(metrics.register.retailPriceUsd, 20);
    assert.equal(metrics.register.grossProfitUsd, 10);
  });

  it("roundUsd avoids float noise", () => {
    assert.equal(roundUsd(10.126), 10.13);
  });
});
