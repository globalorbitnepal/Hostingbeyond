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

/** Retail registration prices from DomainTldPrice (Orbit source of truth). */
export async function getRetailRegisterMap(
  tlds: string[],
): Promise<Map<string, number>> {
  const keys = [
    ...new Set(
      tlds.map((t) =>
        t.startsWith(".") ? t.toLowerCase() : `.${t.toLowerCase()}`,
      ),
    ),
  ];
  if (!keys.length) return new Map();

  const rows = await prisma.domainTldPrice.findMany({
    where: { tld: { in: keys }, enabled: true },
    select: {
      tld: true,
      retailRegister: true,
      promoRegister: true,
      promoEndsAt: true,
    },
  });

  const now = new Date();
  const out = new Map<string, number>();
  for (const row of rows) {
    const promoActive =
      row.promoRegister != null && (!row.promoEndsAt || row.promoEndsAt > now);
    const register = promoActive
      ? toNumber(row.promoRegister)
      : toNumber(row.retailRegister);
    if (register != null) out.set(row.tld.toLowerCase(), register);
  }
  return out;
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
  const dbRows = keys.length
    ? await prisma.domainTldPrice.findMany({
        where: { tld: { in: keys }, enabled: true },
      })
    : [];
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
        return {
          tld,
          register: null,
          renew: ctx.retailRenew,
          termYears: min,
          purchasable: false,
          priceCaption:
            min > 1
              ? `${min}-year registration — pricing not configured`
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
  const retail = await getRetailRegisterMap(rows.map((r) => r.tld));
  return rows.map((row) => {
    const reg = retail.get(row.tld.toLowerCase());
    if (reg == null) return row;
    return { ...row, register: reg };
  });
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
