import type { DomainResult } from "@/lib/domains/availability";
import {
  buildRetailPricingContext,
  mapRowToCustomerResult,
  searchDomainsWithProvider,
} from "@/lib/domains/domain-service";
import { resolveLifecycleProvider } from "@/lib/domains/providers/index";
import { splitDomain } from "@/lib/domains/tlds";

/**
 * Pre-checkout availability for registration — uses the lifecycle provider when
 * configured so OTE registration tests match OTE availability (not LIVE search).
 */
export async function assertAvailableForRegistration(
  domain: string,
): Promise<DomainResult> {
  const key = domain.trim().toLowerCase();
  const lifecycle = resolveLifecycleProvider();
  if (lifecycle) {
    const rows = await lifecycle.checkAvailability([key]);
    const providerRow = rows[0];
    if (!providerRow) {
      throw new Error("domain_unavailable");
    }
    const { tld } = splitDomain(key);
    const pricingCtx = await buildRetailPricingContext([
      providerRow.tld || tld || ".com",
    ]);
    const mapped = await mapRowToCustomerResult(providerRow, pricingCtx);
    if (
      !mapped ||
      (mapped.status !== "available" && mapped.status !== "premium")
    ) {
      throw new Error("domain_unavailable");
    }
    return mapped;
  }

  const { results } = await searchDomainsWithProvider([key]);
  const row = results[0];
  if (!row || (row.status !== "available" && row.status !== "premium")) {
    throw new Error("domain_unavailable");
  }
  return row;
}
