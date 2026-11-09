import { prisma } from "@/lib/prisma";
import { isCustomerSellableNameSiloStatus } from "@/lib/domains/namesilo-price-status";
import { TLD_PRICES } from "@/lib/domains/tlds";

function dec(n: number) {
  return n;
}

/**
 * Seeding 700+ TLD rows on every price read was a major panel stall.
 * Run once per process, then reuse the promise; failures retry after a pause.
 */
let seedPromise: Promise<void> | null = null;
let seedFailedAt = 0;
const SEED_RETRY_MS = 5 * 60 * 1000;

/** Ensures catalogue TLDs exist in DomainTldPrice without overwriting retail. */
export async function ensureDomainTldPricesSeeded() {
  if (seedPromise) return seedPromise;
  if (seedFailedAt && Date.now() - seedFailedAt < SEED_RETRY_MS) return;

  seedPromise = (async () => {
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
  })()
    .catch((error) => {
      seedPromise = null;
      seedFailedAt = Date.now();
      throw error;
    })
    .then(() => {
      seedFailedAt = 0;
    });

  return seedPromise;
}

/** @internal test helper */
export function resetDomainTldSeedCacheForTests() {
  seedPromise = null;
  seedFailedAt = 0;
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

/** One query for many TLDs — used by portfolio lists instead of N lookups. */
export async function getRetailQuoteMapForTlds(
  tlds: string[],
): Promise<Map<string, RetailQuote>> {
  const keys = [
    ...new Set(
      tlds.map((tld) => {
        const key = tld.trim().toLowerCase();
        return key.startsWith(".") ? key : `.${key}`;
      }),
    ),
  ];
  const out = new Map<string, RetailQuote>();
  if (!keys.length) return out;

  await ensureDomainTldPricesSeeded();
  const rows = await prisma.domainTldPrice.findMany({
    where: { tld: { in: keys }, enabled: true },
  });
  const now = new Date();
  for (const row of rows) {
    const promoActive =
      row.promoRegister != null && (!row.promoEndsAt || row.promoEndsAt > now);
    out.set(row.tld.toLowerCase(), {
      tld: row.tld,
      register: promoActive
        ? toNumber(row.promoRegister)
        : toNumber(row.retailRegister),
      renew: toNumber(row.retailRenew),
      transfer: toNumber(row.retailTransfer),
      restore: row.retailRestore != null ? toNumber(row.retailRestore) : null,
      currency: row.retailCurrency,
      isPromo: promoActive,
    });
  }
  return out;
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
