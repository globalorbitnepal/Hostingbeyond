import type { DomainTldPrice } from "@prisma/client";

import type { ProviderTldPricing } from "@/lib/domains/providers/provider";
import type { SupplierPricing } from "@/lib/domains/providers/types";

export type RegistrationQuote = {
  termYears: number;
  /** Total registration due for termYears (customer retail). */
  registerTotal: number;
  renewPerYear: number | null;
  transfer: number | null;
  currency: string;
  isPromo: boolean;
};

export type TldTermContext = {
  supplierMinRegistrationPeriod: number;
  supplierMaxRegistrationPeriod: number | null;
  retailRegisterTermYears: number;
  retailRegister: number;
  retailRenew: number;
  retailTransfer: number;
  retailRegisterByYear: Record<string, number> | null;
  promoRegister: number | null;
  promoActive: boolean;
};

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value && typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

export function parseRetailByYear(
  json: unknown,
): Record<string, number> | null {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(json)) {
    const n = toNumber(v);
    if (Number.isFinite(n) && n >= 0) out[k] = n;
  }
  return Object.keys(out).length ? out : null;
}

export function periodPriceMapFromBlock(block: unknown): Map<number, number> {
  const map = new Map<number, number>();
  if (!Array.isArray(block)) return map;
  for (const row of block) {
    if (!row || typeof row !== "object") continue;
    const period = (row as { period?: unknown }).period;
    const price = (row as { price?: unknown }).price;
    if (typeof period !== "number" || !Number.isFinite(period)) continue;
    const n = toNumber(price);
    if (Number.isFinite(n)) map.set(period, n);
  }
  return map;
}

/** Catalogue register price for a specific period (not collapsed to 1 year). */
export function catalogueRegisterPriceForPeriod(
  pricing: ProviderTldPricing,
  periodYears: number,
): number | null {
  const map = pricing.registerPricesByPeriod;
  if (map && periodYears in map) return map[periodYears] ?? null;
  if (
    pricing.minRegistrationPeriod === periodYears &&
    pricing.register != null
  ) {
    return pricing.register;
  }
  return null;
}

export function tldTermContextFromRow(row: DomainTldPrice): TldTermContext {
  const now = new Date();
  const promoActive =
    row.promoRegister != null && (!row.promoEndsAt || row.promoEndsAt > now);
  return {
    supplierMinRegistrationPeriod: row.supplierMinRegistrationPeriod ?? 1,
    supplierMaxRegistrationPeriod: row.supplierMaxRegisterYears,
    retailRegisterTermYears: row.retailRegisterTermYears ?? 1,
    retailRegister: toNumber(row.retailRegister),
    retailRenew: toNumber(row.retailRenew),
    retailTransfer: toNumber(row.retailTransfer),
    retailRegisterByYear: parseRetailByYear(row.retailRegisterByYear),
    promoRegister:
      row.promoRegister != null ? toNumber(row.promoRegister) : null,
    promoActive,
  };
}

export function resolveCheckoutTermYears(
  ctx: TldTermContext,
  requestedTermYears?: number | null,
): number {
  const min = Math.max(1, ctx.supplierMinRegistrationPeriod);
  const requested =
    requestedTermYears != null && requestedTermYears > 0
      ? Math.floor(requestedTermYears)
      : Math.max(min, ctx.retailRegisterTermYears);
  return Math.max(min, requested);
}

export function assertTermAllowed(
  termYears: number,
  ctx: TldTermContext,
): { ok: true } | { ok: false; message: string } {
  const min = Math.max(1, ctx.supplierMinRegistrationPeriod);
  if (termYears < min) {
    return {
      ok: false,
      message: `This extension requires at least a ${min}-year registration.`,
    };
  }
  if (
    ctx.supplierMaxRegistrationPeriod != null &&
    termYears > ctx.supplierMaxRegistrationPeriod
  ) {
    return {
      ok: false,
      message: `This extension can be registered for up to ${ctx.supplierMaxRegistrationPeriod} years.`,
    };
  }
  return { ok: true };
}

/** Retail total for a fixed registration term — no silent 1yr price for multi-year minima. */
export function retailRegisterTotalForTerm(
  ctx: TldTermContext,
  termYears: number,
): number | null {
  if (ctx.promoActive && ctx.promoRegister != null && termYears === 1) {
    return ctx.promoRegister;
  }
  const byYear = ctx.retailRegisterByYear?.[String(termYears)];
  if (byYear != null && Number.isFinite(byYear)) return byYear;
  if (ctx.retailRegisterTermYears === termYears) {
    return ctx.retailRegister;
  }
  return null;
}

export function buildStandardRegistrationQuote(
  ctx: TldTermContext,
  termYears: number,
): RegistrationQuote | null {
  const allowed = assertTermAllowed(termYears, ctx);
  if (!allowed.ok) return null;
  const registerTotal = retailRegisterTotalForTerm(ctx, termYears);
  if (registerTotal == null) return null;
  return {
    termYears,
    registerTotal,
    renewPerYear: ctx.retailRenew,
    transfer: ctx.retailTransfer,
    currency: "USD",
    isPromo: ctx.promoActive && termYears === 1,
  };
}

export function buildPremiumRegistrationQuote(
  ctx: TldTermContext,
  supplier: SupplierPricing,
  markupPercent: number | null,
  computePremium: (
    supplierRegister: number,
    catalogRegister: number,
    markup: number | null,
  ) => number,
): RegistrationQuote | null {
  const supplierPeriod = supplier.registrationPeriodYears ?? null;
  const minTerm = Math.max(1, ctx.supplierMinRegistrationPeriod);
  const termYears =
    supplierPeriod != null && supplierPeriod >= minTerm
      ? supplierPeriod
      : minTerm;
  if (supplier.register == null) return null;
  const allowed = assertTermAllowed(termYears, ctx);
  if (!allowed.ok) return null;
  const floor = retailRegisterTotalForTerm(ctx, termYears);
  const catalogFloor =
    floor ?? retailRegisterTotalForTerm(ctx, ctx.retailRegisterTermYears);
  if (catalogFloor == null) return null;
  const registerTotal = computePremium(
    supplier.register,
    catalogFloor,
    markupPercent,
  );
  return {
    termYears,
    registerTotal,
    renewPerYear: ctx.retailRenew,
    transfer: ctx.retailTransfer,
    currency: supplier.currency || "USD",
    isPromo: false,
  };
}

export function supplierQuoteCoversTerm(
  supplier: SupplierPricing,
  termYears: number,
  catalogueMinPeriod: number,
): boolean {
  if (supplier.register == null) return false;
  const min = Math.max(1, catalogueMinPeriod);
  const quotedPeriod = supplier.registrationPeriodYears ?? min;
  return quotedPeriod === termYears;
}
