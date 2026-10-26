import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assertBulkApplyStaleGuard,
  buildBulkRetailPreview,
  type TldPriceRowInput,
} from "@/lib/orbit/bulk-retail-preview";

function row(overrides: Partial<TldPriceRowInput> = {}): TldPriceRowInput {
  return {
    tld: ".com",
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    retailPriceLocked: false,
    retailRegister: 9.99,
    retailRenew: 17.99,
    retailTransfer: 12.99,
    supplierRegister: 11.05,
    supplierRenew: 11.05,
    supplierTransfer: 10.8,
    supplierSyncedAt: new Date("2026-01-01T00:00:00.000Z"),
    namesiloRegister: 11.05,
    namesiloRenew: 11.05,
    namesiloTransfer: 10.8,
    namesiloSyncedAt: new Date(),
    namesiloPriceStatus: "verified",
    ...overrides,
  };
}

describe("bulk retail preview", () => {
  it("flags below supplier cost and locked rows", () => {
    const map = new Map([
      [".com", row()],
      [".net", row({ tld: ".net", retailPriceLocked: true })],
    ]);
    const preview = buildBulkRetailPreview(map, [
      { tld: ".com", retailRegister: 10.99 },
      { tld: ".net", retailRegister: 19.99 },
    ]);
    const com = preview.find((p) => p.tld === ".com");
    const net = preview.find((p) => p.tld === ".net");
    assert.ok(com?.warnings.includes("register_below_supplier_cost"));
    assert.equal(net?.skipReason, "retail_price_locked");
  });

  it("rejects stale apply when updatedAt differs", () => {
    const r = row();
    const stale = assertBulkApplyStaleGuard(r, "2025-01-01T00:00:00.000Z");
    assert.equal(stale.ok, false);
  });

  it("does not compute margin profit for missing supplier", () => {
    const map = new Map([
      [
        ".xyz",
        row({
          tld: ".xyz",
          namesiloPriceStatus: "missing",
          namesiloRegister: null,
          supplierRegister: null,
        }),
      ],
    ]);
    const preview = buildBulkRetailPreview(map, [
      { tld: ".xyz", retailRegister: 3.99 },
    ]);
    assert.ok(preview[0]?.warnings.includes("supplier_register_unverified"));
    assert.ok(preview[0]?.warnings.includes("namesilo_sync_required"));
    assert.equal(preview[0]?.analysis.register?.grossProfit, null);
  });

  it("does not fall back to DNA costs for bulk recommendations", () => {
    const map = new Map([
      [
        ".com",
        row({
          namesiloPriceStatus: "missing",
          namesiloRegister: null,
          namesiloRenew: null,
          namesiloTransfer: null,
          supplierRegister: 1.11,
          supplierRenew: 1.11,
          supplierTransfer: 1.11,
        }),
      ],
    ]);
    const preview = buildBulkRetailPreview(map, [
      { tld: ".com", retailRegister: 20 },
    ]);
    assert.equal(preview[0]?.supplier.register.kind, "missing");
    assert.equal(preview[0]?.supplier.register.amount, null);
    assert.equal(preview[0]?.analysis.register?.grossProfit, null);
    assert.ok(preview[0]?.warnings.includes("namesilo_sync_required"));
  });

  it("does not treat unverified NameSilo amounts as bulk margin basis", () => {
    const map = new Map([
      [
        ".com",
        row({
          namesiloPriceStatus: "unverified",
          namesiloRegister: 11.05,
        }),
      ],
    ]);
    const preview = buildBulkRetailPreview(map, [
      { tld: ".com", retailRegister: 20 },
    ]);
    assert.equal(preview[0]?.supplier.register.kind, "unverified");
    assert.equal(preview[0]?.analysis.register?.grossProfit, null);
  });
});
