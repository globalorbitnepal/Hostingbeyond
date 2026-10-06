import { prisma } from "@/lib/prisma";
import { TLD_PRICES } from "@/lib/domains/tlds";

function dec(n: number) {
  return n;
}

/** Ensures catalogue TLDs exist in DomainTldPrice without overwriting retail. */
export async function ensureDomainTldPricesSeeded() {
  for (const row of TLD_PRICES) {
    await prisma.domainTldPrice.upsert({
      where: { tld: row.tld },
      create: {
        tld: row.tld,
        retailRegister: dec(row.register),
        retailRenew: dec(row.renew),
        retailTransfer: dec(row.transfer),
        enabled: true,
      },
      update: {},
    });
  }
}

export type RetailQuote = {
  tld: string;
  register: number;
  renew: number;
  transfer: number;
  restore: number | null;
  currency: string;
  isPromo: boolean;
};

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

export async function getRetailQuoteForTld(
  tld: string,
): Promise<RetailQuote | null> {
  await ensureDomainTldPricesSeeded();
  const key = tld.startsWith(".") ? tld : `.${tld}`;
  const row = await prisma.domainTldPrice.findUnique({ where: { tld: key } });
  if (!row || !row.enabled) return null;

  const now = new Date();
  const promoActive =
    row.promoRegister != null && (!row.promoEndsAt || row.promoEndsAt > now);

  const register = promoActive
    ? toNumber(row.promoRegister)
    : toNumber(row.retailRegister);

  return {
    tld: key,
    register,
    renew: toNumber(row.retailRenew),
    transfer: toNumber(row.retailTransfer),
    restore: row.retailRestore != null ? toNumber(row.retailRestore) : null,
    currency: row.retailCurrency,
    isPromo: promoActive,
  };
}

export async function listRetailTldPrices() {
  await ensureDomainTldPricesSeeded();
  return prisma.domainTldPrice.findMany({ orderBy: { tld: "asc" } });
}

export function premiumRetailFromSupplier(
  supplierRegister: number,
  catalogRegister: number,
  markupPercent: number | null,
): number {
  const markup =
    markupPercent != null && Number.isFinite(markupPercent)
      ? markupPercent / 100
      : Number(process.env.DOMAIN_PREMIUM_MARKUP_PERCENT ?? 20) / 100;
  const markedUp = supplierRegister * (1 + markup);
  return Math.round(Math.max(markedUp, catalogRegister) * 100) / 100;
}
