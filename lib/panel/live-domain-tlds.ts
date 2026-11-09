import { prisma } from "@/lib/prisma";
import { recommendationTierIndex } from "@/lib/domains/recommendation-priority";
import type { LiveDomainTld } from "@/lib/panel/featured-domain-tld-types";

export type { LiveDomainTld };

/** Popular sale chips — only shown when the TLD is live and verified in Orbit. */
export const FEATURED_PANEL_TLDS = [
  ".com",
  ".net",
  ".org",
  ".online",
  ".shop",
] as const;

export const FEATURED_PANEL_TLD_LIMIT = 5;

export type OrbitTldPriceRow = {
  tld: string;
  enabled: boolean;
  retailRegister: unknown;
  retailRenew: unknown;
  retailTransfer: unknown;
  promoRegister: unknown;
  promoEndsAt: Date | null;
  namesiloPriceStatus: string | null;
};

function toNumber(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "object" && "toNumber" in value) {
    const n = (value as { toNumber: () => number }).toNumber();
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function normalizePanelTld(tld: string): string {
  const key = tld.trim().toLowerCase();
  return key.startsWith(".") ? key : `.${key}`;
}

/**
 * Customer-facing catalogue: enabled Orbit rows with verified registrar
 * evidence and real 1st-year + renewal prices. Missing/invalid TLDs stay out.
 */
export function mapLiveOrbitTld(
  row: OrbitTldPriceRow,
  now = new Date(),
): LiveDomainTld | null {
  if (!row.enabled) return null;
  if (row.namesiloPriceStatus !== "verified") return null;

  const promoActive =
    row.promoRegister != null && (!row.promoEndsAt || row.promoEndsAt > now);
  const register = promoActive
    ? toNumber(row.promoRegister)
    : toNumber(row.retailRegister);
  const renew = toNumber(row.retailRenew);
  if (register == null || renew == null || register <= 0 || renew <= 0) {
    return null;
  }

  return {
    tld: normalizePanelTld(row.tld),
    register,
    renew,
    transfer: toNumber(row.retailTransfer),
    isPromo: promoActive || register < renew,
  };
}

export function sortLiveDomainTlds(rows: LiveDomainTld[]): LiveDomainTld[] {
  return [...rows].sort((a, b) => {
    const tier =
      recommendationTierIndex(a.tld) - recommendationTierIndex(b.tld);
    if (tier !== 0) return tier;
    return a.tld.localeCompare(b.tld);
  });
}

export function pickFeaturedLiveTlds(
  live: LiveDomainTld[],
  preferred: readonly string[] = FEATURED_PANEL_TLDS,
  limit = FEATURED_PANEL_TLD_LIMIT,
): LiveDomainTld[] {
  const byTld = new Map(live.map((row) => [row.tld, row]));
  const picked: LiveDomainTld[] = [];
  const seen = new Set<string>();

  for (const raw of preferred) {
    if (picked.length >= limit) break;
    const tld = normalizePanelTld(raw);
    const row = byTld.get(tld);
    if (!row || seen.has(tld)) continue;
    picked.push(row);
    seen.add(tld);
  }

  if (picked.length < limit) {
    const fillers = [...live]
      .filter((row) => !seen.has(row.tld))
      .sort((a, b) => b.renew - b.register - (a.renew - a.register));
    for (const row of fillers) {
      if (picked.length >= limit) break;
      picked.push(row);
      seen.add(row.tld);
    }
  }

  return picked.slice(0, limit);
}

export async function loadLiveDomainTlds(): Promise<LiveDomainTld[]> {
  const rows = await prisma.domainTldPrice.findMany({
    where: {
      enabled: true,
      namesiloPriceStatus: "verified",
    },
    select: {
      tld: true,
      enabled: true,
      retailRegister: true,
      retailRenew: true,
      retailTransfer: true,
      promoRegister: true,
      promoEndsAt: true,
      namesiloPriceStatus: true,
    },
  });

  const now = new Date();
  const mapped: LiveDomainTld[] = [];
  for (const row of rows) {
    const live = mapLiveOrbitTld(row, now);
    if (live) mapped.push(live);
  }
  return sortLiveDomainTlds(mapped);
}

export async function loadFeaturedDomainTlds(): Promise<LiveDomainTld[]> {
  const live = await loadLiveDomainTlds();
  return pickFeaturedLiveTlds(live);
}

export async function loadPanelDomainTldCatalog(): Promise<{
  featured: LiveDomainTld[];
  live: LiveDomainTld[];
}> {
  const live = await loadLiveDomainTlds();
  return { live, featured: pickFeaturedLiveTlds(live) };
}
