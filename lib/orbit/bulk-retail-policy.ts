import type { BulkRetailPreviewLine } from "@/lib/orbit/bulk-retail-preview";

export const BULK_RETAIL_PREVIEW_REQUIRED_CODE = "bulk_retail_preview_required";

export const bulkRetailPreviewRequiredResponse = () => ({
  error:
    "Bulk retail price changes require preview and explicit confirmation. Use POST /api/orbit/domain-pricing/bulk-retail?action=preview, review the result, then POST with action=apply and { confirm: true }.",
  code: BULK_RETAIL_PREVIEW_REQUIRED_CODE,
});

export function isLegacyBulkRetailPutBody(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const bulk = (body as { bulk?: unknown }).bulk;
  return Array.isArray(bulk) && bulk.length > 0;
}

export type BulkApplyItem = {
  tld: string;
  retailRegister?: number;
  retailRenew?: number;
  retailTransfer?: number;
  rowUpdatedAt?: string;
};

export function assertBulkApplyAllowed(
  items: BulkApplyItem[],
  previewLines: BulkRetailPreviewLine[],
): { ok: true } | { ok: false; code: string; tld?: string; message?: string } {
  if (!items.length) {
    return { ok: false, code: "items_empty", message: "No items to apply." };
  }

  const byTld = new Map(previewLines.map((line) => [line.tld, line]));

  for (const item of items) {
    const key = item.tld.startsWith(".") ? item.tld : `.${item.tld}`;
    const line = byTld.get(key);
    if (!line) {
      return { ok: false, code: "tld_not_found", tld: key };
    }
    if (!item.rowUpdatedAt) {
      return {
        ok: false,
        code: "stale_preview",
        tld: key,
        message: "rowUpdatedAt required from preview response.",
      };
    }
    if (line.rowUpdatedAt !== item.rowUpdatedAt) {
      return {
        ok: false,
        code: "stale_preview",
        tld: key,
        message: "Row changed since preview.",
      };
    }
    if (line.skipped) {
      return {
        ok: false,
        code: line.skipReason ?? "apply_blocked",
        tld: key,
        message:
          line.skipReason === "retail_price_locked"
            ? "Retail price is locked."
            : "Row cannot be applied.",
      };
    }
    if (
      item.retailRegister !== undefined &&
      line.proposed.register !== undefined &&
      item.retailRegister !== line.proposed.register
    ) {
      return {
        ok: false,
        code: "preview_mismatch",
        tld: key,
        message: "retailRegister does not match preview.",
      };
    }
    if (
      item.retailRenew !== undefined &&
      line.proposed.renew !== undefined &&
      item.retailRenew !== line.proposed.renew
    ) {
      return {
        ok: false,
        code: "preview_mismatch",
        tld: key,
        message: "retailRenew does not match preview.",
      };
    }
    if (
      item.retailTransfer !== undefined &&
      line.proposed.transfer !== undefined &&
      item.retailTransfer !== line.proposed.transfer
    ) {
      return {
        ok: false,
        code: "preview_mismatch",
        tld: key,
        message: "retailTransfer does not match preview.",
      };
    }
  }

  return { ok: true };
}
