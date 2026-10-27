import {
  isAuthoritativeNameSiloKind,
  resolveSupplierCostForOperation,
  type TldPriceRowInput,
} from "@/lib/orbit/bulk-retail-preview";
import {
  PROPOSED_MARGIN_TARGETS,
  recommendRetailPrice,
} from "@/lib/domains/pricing-margin-policy";
import { buildCatalogueRowMetrics } from "@/lib/orbit/pricing-financial-metrics";

export const DOMAIN_PRICING_CSV_HEADERS = [
  "tld",
  "namesilo_register",
  "namesilo_renew",
  "namesilo_transfer",
  "namesilo_status",
  "namesilo_synced_at",
  "retail_register",
  "retail_renew",
  "retail_transfer",
  "register_gross_profit",
  "register_gross_margin_pct",
  "register_markup_pct",
  "renew_gross_profit",
  "renew_gross_margin_pct",
  "renew_markup_pct",
  "transfer_gross_profit",
  "transfer_gross_margin_pct",
  "transfer_markup_pct",
  "proposed_register",
  "proposed_renew",
  "proposed_transfer",
  "retail_locked",
  "lifecycle_provider",
  "legacy_dna_register",
  "legacy_dna_renew",
  "legacy_dna_transfer",
] as const;

function csvCell(value: string | number | null | undefined): string {
  if (value == null || value === "") return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function metricCell(n: number | null | undefined, incomplete: boolean): string {
  if (incomplete || n == null || !Number.isFinite(n)) return "N/A";
  return String(n);
}

function proposedFromVerified(
  row: TldPriceRowInput,
  field: "register" | "renew" | "transfer",
  target: number,
): string {
  const cost = resolveSupplierCostForOperation(row, field);
  if (!isAuthoritativeNameSiloKind(cost.kind) || cost.amount == null) {
    return "";
  }
  const rec = recommendRetailPrice(cost.amount, target);
  return rec.ok ? String(rec.recommended) : "";
}

export function tldRowToCsvInput(row: {
  tld: string;
  updatedAt?: Date | string;
  retailPriceLocked: boolean;
  retailRegister: number;
  retailRenew: number;
  retailTransfer: number;
  supplierRegister: number | null;
  supplierRenew: number | null;
  supplierTransfer: number | null;
  supplierSyncedAt: Date | string | null;
  namesiloRegister: number | null;
  namesiloRenew: number | null;
  namesiloTransfer: number | null;
  namesiloSyncedAt: Date | string | null;
  namesiloPriceStatus: string | null;
  lifecycleProvider?: string | null;
  supplierCurrency?: string | null;
  retailCurrency?: string | null;
}): TldPriceRowInput & { lifecycleProvider: string | null } {
  const toDate = (v: Date | string | null | undefined): Date | null => {
    if (v == null) return null;
    return v instanceof Date ? v : new Date(v);
  };
  return {
    tld: row.tld,
    updatedAt: toDate(row.updatedAt) ?? new Date("1970-01-01T00:00:00.000Z"),
    retailPriceLocked: row.retailPriceLocked,
    retailRegister: row.retailRegister,
    retailRenew: row.retailRenew,
    retailTransfer: row.retailTransfer,
    supplierRegister: row.supplierRegister,
    supplierRenew: row.supplierRenew,
    supplierTransfer: row.supplierTransfer,
    supplierSyncedAt: toDate(row.supplierSyncedAt),
    namesiloRegister: row.namesiloRegister,
    namesiloRenew: row.namesiloRenew,
    namesiloTransfer: row.namesiloTransfer,
    namesiloSyncedAt: toDate(row.namesiloSyncedAt),
    namesiloPriceStatus: row.namesiloPriceStatus,
    lifecycleProvider: row.lifecycleProvider ?? null,
    supplierCurrency: row.supplierCurrency ?? "USD",
    retailCurrency: row.retailCurrency ?? "USD",
  };
}

export function buildDomainPricingCsv(
  rows: Array<Parameters<typeof tldRowToCsvInput>[0]>,
): string {
  const lines = [DOMAIN_PRICING_CSV_HEADERS.join(",")];
  for (const raw of rows) {
    const row = tldRowToCsvInput(raw);
    const metrics = buildCatalogueRowMetrics(row);
    lines.push(
      [
        csvCell(row.tld),
        csvCell(row.namesiloRegister),
        csvCell(row.namesiloRenew),
        csvCell(row.namesiloTransfer),
        csvCell(row.namesiloPriceStatus),
        csvCell(row.namesiloSyncedAt ? row.namesiloSyncedAt.toISOString() : ""),
        csvCell(row.retailRegister),
        csvCell(row.retailRenew),
        csvCell(row.retailTransfer),
        csvCell(
          metricCell(
            metrics.register.grossProfitUsd,
            metrics.register.incomplete,
          ),
        ),
        csvCell(
          metricCell(
            metrics.register.grossMarginPercent,
            metrics.register.incomplete,
          ),
        ),
        csvCell(
          metricCell(
            metrics.register.markupPercent,
            metrics.register.incomplete,
          ),
        ),
        csvCell(
          metricCell(metrics.renew.grossProfitUsd, metrics.renew.incomplete),
        ),
        csvCell(
          metricCell(
            metrics.renew.grossMarginPercent,
            metrics.renew.incomplete,
          ),
        ),
        csvCell(
          metricCell(metrics.renew.markupPercent, metrics.renew.incomplete),
        ),
        csvCell(
          metricCell(
            metrics.transfer.grossProfitUsd,
            metrics.transfer.incomplete,
          ),
        ),
        csvCell(
          metricCell(
            metrics.transfer.grossMarginPercent,
            metrics.transfer.incomplete,
          ),
        ),
        csvCell(
          metricCell(
            metrics.transfer.markupPercent,
            metrics.transfer.incomplete,
          ),
        ),
        csvCell(
          proposedFromVerified(
            row,
            "register",
            PROPOSED_MARGIN_TARGETS.registrationGrossPercent,
          ),
        ),
        csvCell(
          proposedFromVerified(
            row,
            "renew",
            PROPOSED_MARGIN_TARGETS.renewalGrossPercent,
          ),
        ),
        csvCell(
          proposedFromVerified(
            row,
            "transfer",
            PROPOSED_MARGIN_TARGETS.transferGrossPercent,
          ),
        ),
        csvCell(row.retailPriceLocked ? "yes" : "no"),
        csvCell(row.lifecycleProvider),
        csvCell(row.supplierRegister),
        csvCell(row.supplierRenew),
        csvCell(row.supplierTransfer),
      ].join(","),
    );
  }
  return lines.join("\n");
}
