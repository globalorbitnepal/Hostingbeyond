import type { DomainResult } from "@/lib/domains/availability";
import { lookupDomainNames } from "@/lib/domains/lookup";
import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import { getRetailQuoteForTld } from "@/lib/domains/pricing-engine";
import { getTldCatalogueSnapshot } from "@/lib/domains/tld-catalogue-cache";
import { splitDomain } from "@/lib/domains/tlds";

export type PublicDomainDetails = {
  domain: string;
  status: "AVAILABLE" | "TAKEN" | "PREMIUM" | "UNKNOWN";
  registrationPrice: number | null;
  renewalPrice: number | null;
  transferPrice: number | null;
  currency: string;
  tldSupported: boolean;
  message?: string;
};

function mapStatus(result: DomainResult): PublicDomainDetails["status"] {
  if (result.status === "available") return "AVAILABLE";
  if (result.status === "taken") return "TAKEN";
  if (result.status === "premium") return "PREMIUM";
  return "UNKNOWN";
}

/** Customer-safe domain detail (no supplier cost or provider internals). */
export async function getPublicDomainDetails(
  queryRaw: string,
): Promise<PublicDomainDetails | { error: string }> {
  const normalized = normalizeDomainSearchInput(queryRaw);
  if (!normalized.ok) {
    return { error: normalized.error };
  }

  const fqdn = normalized.tld
    ? `${normalized.name}${normalized.tld}`.toLowerCase()
    : `${normalized.name}.com`.toLowerCase();

  const { tld } = splitDomain(fqdn);
  const catalogue = await getTldCatalogueSnapshot();
  const tldKey = tld.startsWith(".") ? tld : `.${tld}`;
  const tldSupported = catalogue.searchable.includes(tldKey.toLowerCase());

  const retail = await getRetailQuoteForTld(tldKey).catch(() => null);

  const { results } = await lookupDomainNames([fqdn], {
    query: normalized.query,
  });
  const row = results[0];
  if (!row) {
    return {
      domain: fqdn,
      status: "UNKNOWN",
      registrationPrice: retail?.register ?? null,
      renewalPrice: retail?.renew ?? null,
      transferPrice: retail?.transfer ?? null,
      currency: retail?.currency ?? "USD",
      tldSupported,
      message: "Unable to verify this domain right now.",
    };
  }

  return {
    domain: row.domain,
    status: mapStatus(row),
    registrationPrice: row.register,
    renewalPrice: row.renew,
    transferPrice: row.transfer,
    currency: retail?.currency ?? "USD",
    tldSupported,
    message: row.message,
  };
}
