import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { BulkRetailPreviewLine } from "@/lib/orbit/bulk-retail-preview";
import {
  assertBulkApplyAllowed,
  BULK_RETAIL_PREVIEW_REQUIRED_CODE,
  bulkRetailPreviewRequiredResponse,
  isLegacyBulkRetailPutBody,
} from "@/lib/orbit/bulk-retail-policy";

function previewLine(
  overrides: Partial<BulkRetailPreviewLine> = {},
): BulkRetailPreviewLine {
  return {
    tld: ".com",
    rowUpdatedAt: "2026-01-01T00:00:00.000Z",
    retailPriceLocked: false,
    skipped: false,
    current: { register: 9.99, renew: 17.99, transfer: 12.99 },
    proposed: { register: 13.99 },
    supplier: {
      register: { amount: 11.05, kind: "verified_namesilo" },
      renew: { amount: null, kind: "missing" },
      transfer: { amount: null, kind: "missing" },
    },
    analysis: {},
    warnings: [],
    ...overrides,
  };
}

describe("bulk retail policy", () => {
  it("detects legacy bulk PUT bodies", () => {
    assert.equal(isLegacyBulkRetailPutBody({ bulk: [] }), false);
    assert.equal(
      isLegacyBulkRetailPutBody({ bulk: [{ tld: ".com", retailRegister: 1 }] }),
      true,
    );
  });

  it("documents preview-required error for legacy bulk", () => {
    const res = bulkRetailPreviewRequiredResponse();
    assert.equal(res.code, BULK_RETAIL_PREVIEW_REQUIRED_CODE);
    assert.match(res.error, /bulk-retail/);
  });

  it("rejects stale rowUpdatedAt on apply", () => {
    const result = assertBulkApplyAllowed(
      [
        {
          tld: ".com",
          retailRegister: 13.99,
          rowUpdatedAt: "2025-01-01T00:00:00.000Z",
        },
      ],
      [previewLine()],
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "stale_preview");
  });

  it("rejects locked rows on apply", () => {
    const result = assertBulkApplyAllowed(
      [
        {
          tld: ".com",
          retailRegister: 13.99,
          rowUpdatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      [previewLine({ skipped: true, skipReason: "retail_price_locked" })],
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "retail_price_locked");
  });

  it("rejects preview mismatch", () => {
    const result = assertBulkApplyAllowed(
      [
        {
          tld: ".com",
          retailRegister: 99.99,
          rowUpdatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      [previewLine({ proposed: { register: 13.99 } })],
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "preview_mismatch");
  });

  it("allows consistent preview apply", () => {
    const result = assertBulkApplyAllowed(
      [
        {
          tld: ".com",
          retailRegister: 13.99,
          rowUpdatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      [previewLine({ proposed: { register: 13.99 } })],
    );
    assert.equal(result.ok, true);
  });
});
