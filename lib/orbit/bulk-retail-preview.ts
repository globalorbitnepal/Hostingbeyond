import {
  PROPOSED_MARGIN_TARGETS,
  grossMarginPercent,
  recommendRetailPrice,
} from "@/lib/domains/pricing-margin-policy";
import type { RetailPriceFields } from "@/lib/orbit/domain-pricing-update";
import {
  assertRetailUpdateAllowed,
  retailPriceFieldsInUpdate,
} from "@/lib/orbit/retail-price-lock";

export type SupplierCostKind =
  | "verified_namesilo"
  | "verified_dna"
  | "missing"
  | "invalid"
  | "unverified"
  | "stale";

/** NameSilo costs older than this are stale and excluded from authoritative metrics. */
export const NAMESILO_SUPPLIER_MAX_AGE_MS = 30 * 24 * 3600_000;

export function isAuthoritativeNameSiloKind(kind: SupplierCostKind): boolean {
  return kind === "verified_namesilo";
}

export type BulkRetailPreviewLine = {
  tld: string;
  rowUpdatedAt: string;
  retailPriceLocked: boolean;
  skipped: boolean;
  skipReason?: "retail_price_locked" | "no_changes" | "tld_not_found";
  current: { register: number; renew: number; transfer: number };
  proposed: { register?: number; renew?: number; transfer?: number };
  supplier: {
    register: {
      amount: number | null;
      kind: SupplierCostKind;
    };
    renew: { amount: number | null; kind: SupplierCostKind };
    transfer: { amount: number | null; kind: SupplierCostKind };
  };
  analysis: {
    register?: LineAnalysis;
    renew?: LineAnalysis;
    transfer?: LineAnalysis;
  };
  warnings: string[];
};

export type LineAnalysis = {
  grossProfit: number | null;
  grossMarginPercent: number | null;
  belowSupplierCost: boolean;
  belowMarginTarget: boolean;
  marginTargetPercent: number;
};

export type TldPriceRowInput = {
  tld: string;
  updatedAt: Date;
  retailPriceLocked: boolean;
  retailRegister: number;
  retailRenew: number;
  retailTransfer: number;
  supplierRegister: number | null;
  supplierRenew: number | null;
  supplierTransfer: number | null;
  supplierSyncedAt: Date | null;
  namesiloRegister: number | null;
  namesiloRenew: number | null;
  namesiloTransfer: number | null;
  namesiloSyncedAt: Date | null;
  namesiloPriceStatus: string | null;
  supplierCurrency?: string | null;
  retailCurrency?: string | null;
};

export function catalogueCurrenciesCompatible(row: TldPriceRowInput): boolean {
  const supplier = (row.supplierCurrency ?? "USD").trim().toUpperCase();
  const retail = (row.retailCurrency ?? "USD").trim().toUpperCase();
  return supplier === retail && supplier === "USD";
}

function num(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "object" && v !== null && "toNumber" in v) {
    return (v as { toNumber: () => number }).toNumber();
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function resolveSupplierCostForOperation(
  row: TldPriceRowInput,
  field: "register" | "renew" | "transfer",
): { amount: number | null; kind: SupplierCostKind } {
  const nsKey =
    field === "register"
      ? "namesiloRegister"
      : field === "renew"
        ? "namesiloRenew"
        : "namesiloTransfer";
  const nsVal = num(row[nsKey]);
  const status = row.namesiloPriceStatus;
  const staleByAge =
    row.namesiloSyncedAt != null &&
    Date.now() - row.namesiloSyncedAt.getTime() > NAMESILO_SUPPLIER_MAX_AGE_MS;

  // DNA/legacy `supplier*` costs are never authoritative for NameSilo metrics.
  if (status === "invalid") {
    return { amount: nsVal, kind: "invalid" };
  }
  if (status === "missing") {
    return { amount: nsVal, kind: "missing" };
  }
  if (nsVal == null) {
    return { amount: null, kind: "missing" };
  }
  if (status === "stale" || staleByAge) {
    return { amount: nsVal, kind: "stale" };
  }
  if (status === "verified" && row.namesiloSyncedAt != null && !staleByAge) {
    return { amount: nsVal, kind: "verified_namesilo" };
  }
  return { amount: nsVal, kind: "unverified" };
}

function analyzeLine(
  proposed: number | undefined,
  supplier: { amount: number | null; kind: SupplierCostKind },
  marginTarget: number,
): LineAnalysis | undefined {
  if (proposed === undefined) return undefined;
  if (!isAuthoritativeNameSiloKind(supplier.kind) || supplier.amount == null) {
    return {
      grossProfit: null,
      grossMarginPercent: null,
      belowSupplierCost: false,
      belowMarginTarget: false,
      marginTargetPercent: marginTarget,
    };
  }
  const cost = supplier.amount;
  if (cost == null) {
    return {
      grossProfit: null,
      grossMarginPercent: null,
      belowSupplierCost: false,
      belowMarginTarget: false,
      marginTargetPercent: marginTarget,
    };
  }
  const margin = grossMarginPercent(proposed, cost);
  const rec = recommendRetailPrice(cost, marginTarget);
  const targetRetail = rec.ok
    ? rec.recommended
    : cost / (1 - marginTarget / 100);
  return {
    grossProfit: proposed - cost,
    grossMarginPercent: margin,
    belowSupplierCost: proposed < cost,
    belowMarginTarget:
      margin != null ? margin + 0.0001 < marginTarget : proposed < targetRetail,
    marginTargetPercent: marginTarget,
  };
}

export function buildBulkRetailPreview(
  rowsByTld: Map<string, TldPriceRowInput>,
  items: Array<{
    tld: string;
    retailRegister?: number;
    retailRenew?: number;
    retailTransfer?: number;
  }>,
): BulkRetailPreviewLine[] {
  const out: BulkRetailPreviewLine[] = [];
  for (const item of items) {
    const key = item.tld.startsWith(".") ? item.tld : `.${item.tld}`;
    const row = rowsByTld.get(key);
    if (!row) {
      out.push({
        tld: key,
        rowUpdatedAt: "",
        retailPriceLocked: false,
        skipped: true,
        skipReason: "tld_not_found",
        current: { register: 0, renew: 0, transfer: 0 },
        proposed: {},
        supplier: {
          register: { amount: null, kind: "missing" },
          renew: { amount: null, kind: "missing" },
          transfer: { amount: null, kind: "missing" },
        },
        analysis: {},
        warnings: ["tld_not_found"],
      });
      continue;
    }

    const proposed = {
      register: item.retailRegister,
      renew: item.retailRenew,
      transfer: item.retailTransfer,
    };
    const updateData: RetailPriceFields = {};
    if (item.retailRegister !== undefined) {
      updateData.retailRegister = item.retailRegister;
    }
    if (item.retailRenew !== undefined) {
      updateData.retailRenew = item.retailRenew;
    }
    if (item.retailTransfer !== undefined) {
      updateData.retailTransfer = item.retailTransfer;
    }

    const warnings: string[] = [];
    let skipped = false;
    let skipReason: BulkRetailPreviewLine["skipReason"];

    if (!retailPriceFieldsInUpdate(updateData)) {
      skipped = true;
      skipReason = "no_changes";
    } else {
      const lock = assertRetailUpdateAllowed(row, updateData);
      if (!lock.ok) {
        skipped = true;
        skipReason = "retail_price_locked";
        warnings.push("retail_price_locked");
      }
    }

    const supReg = resolveSupplierCostForOperation(row, "register");
    const supRen = resolveSupplierCostForOperation(row, "renew");
    const supTr = resolveSupplierCostForOperation(row, "transfer");

    if (!isAuthoritativeNameSiloKind(supReg.kind)) {
      warnings.push("supplier_register_unverified");
      warnings.push("namesilo_sync_required");
    }
    if (proposed.register !== undefined) {
      const a = analyzeLine(
        proposed.register,
        supReg,
        PROPOSED_MARGIN_TARGETS.registrationGrossPercent,
      );
      if (a?.belowSupplierCost) warnings.push("register_below_supplier_cost");
      if (a?.belowMarginTarget) warnings.push("register_below_margin_target");
    }

    out.push({
      tld: key,
      rowUpdatedAt: row.updatedAt.toISOString(),
      retailPriceLocked: row.retailPriceLocked,
      skipped,
      skipReason,
      current: {
        register: row.retailRegister,
        renew: row.retailRenew,
        transfer: row.retailTransfer,
      },
      proposed,
      supplier: {
        register: supReg,
        renew: supRen,
        transfer: supTr,
      },
      analysis: {
        register: analyzeLine(
          proposed.register,
          supReg,
          PROPOSED_MARGIN_TARGETS.registrationGrossPercent,
        ),
        renew: analyzeLine(
          proposed.renew,
          supRen,
          PROPOSED_MARGIN_TARGETS.renewalGrossPercent,
        ),
        transfer: analyzeLine(
          proposed.transfer,
          supTr,
          PROPOSED_MARGIN_TARGETS.transferGrossPercent,
        ),
      },
      warnings,
    });
  }
  return out;
}

export function assertBulkApplyStaleGuard(
  dbRow: TldPriceRowInput,
  expectedUpdatedAt: string,
): { ok: true } | { ok: false; code: "stale_preview" } {
  if (dbRow.updatedAt.toISOString() !== expectedUpdatedAt) {
    return { ok: false, code: "stale_preview" };
  }
  return { ok: true };
}
