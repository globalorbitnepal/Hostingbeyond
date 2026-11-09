import { routes } from "@/config/routes";
import type { TransferRequirement } from "@/lib/domains/transfer-requirements";
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
  requirements?: TransferRequirement[];
  currentRegistrar?: string | null;
  currentExpiresOn?: string | null;
  expectedExpiresOn?: string | null;
  supplierTransfer?: number | null;
  supplierRenew?: number | null;
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
    requirements: input.requirements,
    currentRegistrar: input.currentRegistrar ?? null,
    currentExpiresOn: input.currentExpiresOn ?? null,
    expectedExpiresOn: input.expectedExpiresOn ?? null,
    supplierTransfer: input.supplierTransfer ?? null,
    supplierRenew: input.supplierRenew ?? null,
  };
}
