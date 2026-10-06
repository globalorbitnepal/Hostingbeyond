import type { DomainResult } from "@/lib/domains/availability";
import { PRICE_BY_TLD } from "@/lib/domains/tlds";
import type { ProviderAvailabilityRow } from "@/lib/domains/providers/types";

export type RetailPrices = {
  register: number;
  renew: number;
  transfer: number;
};

/** Customer-facing prices from the HostingBeyond catalogue (Orbit / TLD_PRICES). */
export function getRetailPricesForTld(tld: string): RetailPrices | null {
  const key = tld.startsWith(".") ? tld : `.${tld}`;
  const row = PRICE_BY_TLD.get(key);
  if (!row) return null;
  return {
    register: row.register,
    renew: row.renew,
    transfer: row.transfer,
  };
}

function premiumRetailRegister(
  supplierRegister: number,
  catalogRegister: number,
): number {
  const markupPct = Number(process.env.DOMAIN_PREMIUM_MARKUP_PERCENT ?? 20);
  const markup =
    Number.isFinite(markupPct) && markupPct >= 0 ? markupPct / 100 : 0.2;
  const markedUp = supplierRegister * (1 + markup);
  return Math.round(Math.max(markedUp, catalogRegister) * 100) / 100;
}

/**
 * Maps registrar availability + supplier cost to public DomainResult (retail only).
 */
export function mapRowToCustomerResult(
  row: ProviderAvailabilityRow,
): DomainResult | null {
  const retail = getRetailPricesForTld(row.tld);
  if (!retail) {
    if (row.status === "invalid") {
      return {
        domain: row.domain,
        name: row.name,
        tld: row.tld,
        status: "invalid",
        register: null,
        renew: null,
        transfer: null,
        message:
          row.message ??
          `We do not sell ${row.tld || "that extension"} yet — try another extension.`,
      };
    }
    return {
      domain: row.domain,
      name: row.name,
      tld: row.tld,
      status: "invalid",
      register: null,
      renew: null,
      transfer: null,
      message: `We do not sell ${row.tld} yet — try another extension.`,
    };
  }

  if (row.status === "taken") {
    return {
      domain: row.domain,
      name: row.name,
      tld: row.tld,
      status: "taken",
      register: null,
      renew: retail.renew,
      transfer: retail.transfer,
      message:
        row.message ??
        "Already registered — transfer it or try another extension.",
    };
  }

  if (row.status === "invalid") {
    return {
      domain: row.domain,
      name: row.name,
      tld: row.tld,
      status: "invalid",
      register: null,
      renew: null,
      transfer: null,
      message: row.message ?? "Please enter a valid domain name.",
    };
  }

  const supplierReg = row.supplier.register;
  const isPremium = row.status === "premium";
  const register =
    isPremium && supplierReg != null
      ? premiumRetailRegister(supplierReg, retail.register)
      : retail.register;

  return {
    domain: row.domain,
    name: row.name,
    tld: row.tld,
    status: isPremium ? "premium" : "available",
    register,
    renew: retail.renew,
    transfer: retail.transfer,
    message: isPremium
      ? "Premium domain — price includes registry fees."
      : undefined,
  };
}
