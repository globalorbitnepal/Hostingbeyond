import { routes } from "@/config/routes";
import { getRetailQuoteForTld } from "@/lib/domains/pricing-engine";
import type { TransferCheckResult } from "@/lib/domains/transfer";

export function transferCheckoutHref(domain: string): string {
  return `${routes.domainCheckout}?${new URLSearchParams({
    transfer: domain.toLowerCase(),
  }).toString()}`;
}

/** Authoritative retail transfer quote for a TLD (not registration price). */
export async function getTransferRetailQuote(tld: string) {
  const retail = await getRetailQuoteForTld(tld);
  if (!retail) return null;
  if (!Number.isFinite(retail.transfer) || retail.transfer <= 0) {
    return { ...retail, purchasable: false as const };
  }
  return { ...retail, purchasable: true as const };
}

export function buildTransferCheckResult(input: {
  domain: string;
  status: TransferCheckResult["status"];
  eligible: boolean;
  message: string;
  transferPrice: number | null;
  renewPrice: number | null;
  purchasable: boolean;
  transferEligibilityConfirmed?: boolean;
  registryCheckOnly?: boolean;
}): TransferCheckResult {
  return {
    domain: input.domain,
    status: input.status,
    eligible: input.eligible,
    transferEligibilityConfirmed: input.transferEligibilityConfirmed ?? false,
    registryCheckOnly: input.registryCheckOnly,
    transferPrice: input.purchasable ? input.transferPrice : null,
    renewPrice: input.renewPrice,
    message: input.message,
    checkoutHref: transferCheckoutHref(input.domain),
  };
}
