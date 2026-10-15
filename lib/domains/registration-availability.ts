import type { DomainResult } from "@/lib/domains/availability";
import {
  buildRetailPricingContext,
  mapRowToCustomerResult,
  searchDomainsWithProvider,
} from "@/lib/domains/domain-service";
import { resolveLifecycleProvider } from "@/lib/domains/providers/index";
import { splitDomain } from "@/lib/domains/tlds";

/** Live availability path for checkout — never use TTL search cache. */
export const REGISTRATION_LIVE_LOOKUP_OPTIONS = { fresh: true as const };

export function validateRegistrationAvailability(
  row: DomainResult | undefined,
): DomainResult {
  if (!row || (row.status !== "available" && row.status !== "premium")) {
    throw new Error("domain_unavailable");
  }
  return row;
}

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
    return validateRegistrationAvailability(mapped ?? undefined);
  }

  const { results } = await searchDomainsWithProvider(
    [key],
    REGISTRATION_LIVE_LOOKUP_OPTIONS,
  );
  return validateRegistrationAvailability(results[0]);
}
