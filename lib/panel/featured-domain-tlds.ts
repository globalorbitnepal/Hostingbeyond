import { PRICE_BY_TLD } from "@/lib/domains/tlds";
import { getRetailQuoteForTld } from "@/lib/domains/pricing-engine";
import type { FeaturedDomainTld } from "@/lib/panel/featured-domain-tld-types";

export type { FeaturedDomainTld };

export const FEATURED_PANEL_TLDS = [
  ".com",
  ".net",
  ".io",
  ".org",
  ".online",
  ".shop",
] as const;

export async function loadFeaturedDomainTlds(): Promise<FeaturedDomainTld[]> {
  const rows = await Promise.all(
    FEATURED_PANEL_TLDS.map(async (tld) => {
      const catalog = PRICE_BY_TLD.get(tld);
      try {
        const quote = await getRetailQuoteForTld(tld);
        return {
          tld,
          register: quote?.register ?? catalog?.register ?? 0,
          renew: quote?.renew ?? catalog?.renew ?? null,
          isPromo: quote?.isPromo ?? false,
        };
      } catch {
        return {
          tld,
          register: catalog?.register ?? 0,
          renew: catalog?.renew ?? null,
          isPromo: false,
        };
      }
    }),
  );
  return rows;
}
