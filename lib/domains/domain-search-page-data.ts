import type { DomainStat, DomainTldRow } from "@/lib/domains/content";
import {
  buildStandardRegistrationQuote,
  resolveCheckoutTermYears,
  tldTermContextFromRow,
} from "@/lib/domains/registration-term";
import { getRecommendationTierPools } from "@/lib/domains/recommendation-tlds";
import { countProviderSupportedTlds } from "@/lib/domains/tld-catalogue-cache";
import { prisma } from "@/lib/prisma";

export type PopularPickPricing = {
  tld: string;
  register: number | null;
  renew: number | null;
  termYears: number;
  purchasable: boolean;
  priceCaption: string;
  renewCaption: string | null;
};

function toNumber(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export type RetailPriceTriple = {
  register: number;
  renew: number | null;
  transfer: number | null;
};

/** Retail prices from DomainTldPrice (checkout source of truth). */
export async function getRetailPriceMap(
  tlds: string[],
): Promise<Map<string, RetailPriceTriple>> {
  const keys = [
    ...new Set(
      tlds.map((t) =>
        t.startsWith(".") ? t.toLowerCase() : `.${t.toLowerCase()}`,
      ),
    ),
  ];
  if (!keys.length) return new Map();

  let rows: {
    tld: string;
    retailRegister: unknown;
    retailRenew: unknown;
    retailTransfer: unknown;
    promoRegister: unknown;
    promoEndsAt: Date | null;
  }[] = [];
  try {
    rows = await prisma.domainTldPrice.findMany({
      where: { tld: { in: keys }, enabled: true },
      select: {
        tld: true,
        retailRegister: true,
        retailRenew: true,
        retailTransfer: true,
        promoRegister: true,
        promoEndsAt: true,
      },
    });
  } catch {
    return new Map();
  }

  const now = new Date();
  const out = new Map<string, RetailPriceTriple>();
  for (const row of rows) {
    const promoActive =
      row.promoRegister != null && (!row.promoEndsAt || row.promoEndsAt > now);
    const register = promoActive
      ? toNumber(row.promoRegister)
      : toNumber(row.retailRegister);
    if (register == null) continue;
    out.set(row.tld.toLowerCase(), {
      register,
      renew: toNumber(row.retailRenew),
      transfer: toNumber(row.retailTransfer),
    });
  }
  return out;
}

/** Retail registration prices from DomainTldPrice (Orbit source of truth). */
export async function getRetailRegisterMap(
  tlds: string[],
): Promise<Map<string, number>> {
  const full = await getRetailPriceMap(tlds);
  const out = new Map<string, number>();
  for (const [tld, prices] of full) out.set(tld, prices.register);
  return out;
}

export function applyRetailOverlay(
  rows: DomainTldRow[],
  retail: Map<string, RetailPriceTriple>,
): DomainTldRow[] {
  return rows.map((row) => {
    const live = retail.get(row.tld.toLowerCase());
    if (!live) return row;
    return {
      ...row,
      register: live.register,
      renew: live.renew ?? row.renew,
      transfer: live.transfer ?? row.transfer,
    };
  });
}

export async function getPopularPickTransferPricing(
  tlds: string[],
  fallbackRows: DomainTldRow[],
): Promise<PopularPickPricing[]> {
  const keys = [
    ...new Set(
      tlds.map((t) =>
        t.startsWith(".") ? t.toLowerCase() : `.${t.toLowerCase()}`,
      ),
    ),
  ];
  let dbRows: Awaited<ReturnType<typeof prisma.domainTldPrice.findMany>> = [];
  if (keys.length) {
    try {
      dbRows = await prisma.domainTldPrice.findMany({
        where: { tld: { in: keys }, enabled: true },
      });
    } catch {
      dbRows = [];
    }
  }
  const byTld = new Map(dbRows.map((r) => [r.tld.toLowerCase(), r]));
  const fallback = new Map(fallbackRows.map((r) => [r.tld.toLowerCase(), r]));

  return keys.map((tld) => {
    const row = byTld.get(tld);
    const transferRaw =
      row && Number(row.retailTransfer) > 0
        ? toNumber(row.retailTransfer)
        : (fallback.get(tld)?.transfer ?? null);
    const renewRaw =
      row != null
        ? toNumber(row.retailRenew)
        : (fallback.get(tld)?.renew ?? null);
    const transfer = transferRaw ?? 0;
    const purchasable = transfer > 0;
    return {
      tld,
      register: purchasable ? transfer : null,
      renew: renewRaw != null && renewRaw > 0 ? renewRaw : null,
      termYears: 1,
      purchasable,
      priceCaption: purchasable
        ? "transfer in"
        : "Transfer pricing unavailable",
      renewCaption:
        renewRaw != null && renewRaw > 0
          ? `Renews at $${renewRaw.toFixed(2)}/yr`
          : null,
    };
  });
}

export async function getPopularPickPricing(
  tlds: string[],
  fallbackRows: DomainTldRow[],
): Promise<PopularPickPricing[]> {
  const keys = [
    ...new Set(
      tlds.map((t) =>
        t.startsWith(".") ? t.toLowerCase() : `.${t.toLowerCase()}`,
      ),
    ),
  ];
  let dbRows: Awaited<ReturnType<typeof prisma.domainTldPrice.findMany>> = [];
  if (keys.length) {
    try {
      dbRows = await prisma.domainTldPrice.findMany({
        where: { tld: { in: keys }, enabled: true },
      });
    } catch {
      dbRows = [];
    }
  }
  const byTld = new Map(dbRows.map((r) => [r.tld.toLowerCase(), r]));
  const fallback = new Map(fallbackRows.map((r) => [r.tld.toLowerCase(), r]));

  return keys.map((tld) => {
    const row = byTld.get(tld);
    if (row) {
      const ctx = tldTermContextFromRow(row);
      const termYears = resolveCheckoutTermYears(ctx, null);
      const quote = buildStandardRegistrationQuote(ctx, termYears);
      if (!quote) {
        const min = Math.max(1, ctx.supplierMinRegistrationPeriod);
        const fb = fallback.get(tld);
        if (min === 1 && fb && fb.register > 0) {
          return {
            tld,
            register: fb.register,
            renew: fb.renew > 0 ? fb.renew : ctx.retailRenew,
            termYears: 1,
            purchasable: true,
            priceCaption: "1st yr",
            renewCaption:
              fb.renew > 0
                ? `Renews at $${fb.renew.toFixed(2)}/yr`
                : ctx.retailRenew
                  ? `Renews at $${ctx.retailRenew.toFixed(2)}/yr`
                  : null,
          };
        }
        return {
          tld,
          register: null,
          renew: ctx.retailRenew,
          termYears: min,
          purchasable: false,
          priceCaption:
            min > 1
              ? `Requires ${min}-year registration — check search`
              : "Check search for pricing",
          renewCaption: ctx.retailRenew
            ? `Renews at $${ctx.retailRenew.toFixed(2)}/yr`
            : null,
        };
      }
      const termLabel =
        quote.termYears > 1
          ? `${quote.termYears}-yr total`
          : quote.isPromo
            ? "1st yr"
            : "/yr";
      return {
        tld,
        register: quote.registerTotal,
        renew: quote.renewPerYear,
        termYears: quote.termYears,
        purchasable: true,
        priceCaption: termLabel,
        renewCaption:
          quote.renewPerYear != null
            ? `Renews at $${quote.renewPerYear.toFixed(2)}/yr`
            : null,
      };
    }
    const fb = fallback.get(tld);
    if (fb && fb.register > 0) {
      return {
        tld,
        register: fb.register,
        renew: fb.renew,
        termYears: 1,
        purchasable: true,
        priceCaption: "1st yr",
        renewCaption: fb.renew ? `Renews at $${fb.renew.toFixed(2)}/yr` : null,
      };
    }
    return {
      tld,
      register: null,
      renew: null,
      termYears: 1,
      purchasable: false,
      priceCaption: "Check search for pricing",
      renewCaption: null,
    };
  });
}

export async function mergeRetailIntoPricingRows(
  rows: DomainTldRow[],
): Promise<DomainTldRow[]> {
  const retail = await getRetailPriceMap(rows.map((r) => r.tld));
  return applyRetailOverlay(rows, retail);
}

export async function loadDomainSearchPageMetrics(): Promise<{
  searchableCount: number;
  tier1PoolSize: number;
  tier2PoolSize: number;
}> {
  const [searchableCount, pools] = await Promise.all([
    countProviderSupportedTlds().catch(() => 0),
    getRecommendationTierPools(),
  ]);
  return {
    searchableCount,
    tier1PoolSize: pools.tier1.length,
    tier2PoolSize: pools.tier2.length,
  };
}

export function applyLiveExtensionStats(
  stats: DomainStat[],
  metrics: {
    searchableCount: number;
    tier1PoolSize: number;
  },
): DomainStat[] {
  return stats.map((stat) => {
    if (stat.id === "extensions" && metrics.searchableCount > 0) {
      return {
        ...stat,
        value: `${metrics.searchableCount}+`,
        label: "Extensions",
      };
    }
    if (stat.id === "search" && metrics.tier1PoolSize > 0) {
      return {
        ...stat,
        value: String(metrics.tier1PoolSize),
        label: "Checked per search",
      };
    }
    return stat;
  });
}
