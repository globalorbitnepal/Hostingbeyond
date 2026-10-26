import { grossMarginPercent } from "@/lib/domains/pricing-margin-policy";
import type { SupplierCostKind } from "@/lib/orbit/bulk-retail-preview";
import { resolveSupplierCostForOperation } from "@/lib/orbit/bulk-retail-preview";
import type { TldPriceRowInput } from "@/lib/orbit/bulk-retail-preview";

export const PRICING_CURRENCY_NOTE =
  "Supplier and retail catalogue amounts are stored in USD; no live FX conversion is applied.";

export function roundUsd(n: number): number {
  if (!Number.isFinite(n)) return NaN;
  return Math.round(n * 100) / 100;
}

/** Markup % = (gross profit / supplier cost) × 100 */
export function markupPercent(
  retail: number,
  supplierCost: number,
): number | null {
  if (!Number.isFinite(retail) || !Number.isFinite(supplierCost)) return null;
  if (retail <= 0 || supplierCost <= 0) return null;
  const pct = ((retail - supplierCost) / supplierCost) * 100;
  return Number.isFinite(pct) ? roundUsd(pct) : null;
}

export function supplierCostBasisLabel(kind: SupplierCostKind): string {
  switch (kind) {
    case "verified_namesilo":
      return "Verified NameSilo supplier cost (USD)";
    case "verified_dna":
      return "DNA supplier catalogue cost (USD)";
    case "unverified":
      return "NameSilo cost present but not verified — estimate only";
    case "stale":
      return "DNA supplier cost older than 30 days — may be stale";
    case "invalid":
      return "Supplier cost invalid on last sync";
    case "missing":
      return "Supplier cost unavailable";
    default:
      return "Supplier cost unavailable";
  }
}

export type OperationGrossMetrics = {
  grossProfitUsd: number | null;
  grossMarginPercent: number | null;
  markupPercent: number | null;
  belowSupplierCost: boolean;
  supplierCostUsd: number | null;
  retailPriceUsd: number;
  supplierKind: SupplierCostKind;
  basis: string;
  incomplete: boolean;
};

export function computeOperationGrossMetrics(
  retail: number,
  supplier: { amount: number | null; kind: SupplierCostKind },
): OperationGrossMetrics {
  const basis = supplierCostBasisLabel(supplier.kind);
  const incomplete =
    supplier.kind === "missing" ||
    supplier.kind === "invalid" ||
    supplier.amount == null;
  if (incomplete || !Number.isFinite(retail)) {
    return {
      grossProfitUsd: null,
      grossMarginPercent: null,
      markupPercent: null,
      belowSupplierCost: false,
      supplierCostUsd: supplier.amount,
      retailPriceUsd: retail,
      supplierKind: supplier.kind,
      basis,
      incomplete: true,
    };
  }
  const cost = supplier.amount!;
  const profit = roundUsd(retail - cost);
  const margin = grossMarginPercent(retail, cost);
  const markup = markupPercent(retail, cost);
  return {
    grossProfitUsd: profit,
    grossMarginPercent: margin != null ? roundUsd(margin) : null,
    markupPercent: markup,
    belowSupplierCost: retail < cost,
    supplierCostUsd: cost,
    retailPriceUsd: retail,
    supplierKind: supplier.kind,
    basis,
    incomplete: false,
  };
}

export type CatalogueRowMetrics = {
  register: OperationGrossMetrics;
  renew: OperationGrossMetrics;
  transfer: OperationGrossMetrics;
  currencyNote: string;
};

export function buildCatalogueRowMetrics(
  row: TldPriceRowInput,
): CatalogueRowMetrics {
  return {
    register: computeOperationGrossMetrics(
      row.retailRegister,
      resolveSupplierCostForOperation(row, "register"),
    ),
    renew: computeOperationGrossMetrics(
      row.retailRenew,
      resolveSupplierCostForOperation(row, "renew"),
    ),
    transfer: computeOperationGrossMetrics(
      row.retailTransfer,
      resolveSupplierCostForOperation(row, "transfer"),
    ),
    currencyNote: PRICING_CURRENCY_NOTE,
  };
}
