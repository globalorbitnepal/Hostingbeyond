import { checkDomain } from "@/lib/domains/availability";
import { transferCheckoutHref } from "@/lib/domains/transfer-quote";
import { formatPrice } from "@/lib/domains/tlds";
import { routes } from "@/config/routes";

export type TransferEligibilityStatus =
  "eligible" | "available" | "invalid" | "unsupported";

export type TransferCheckResult = {
  domain: string;
  status: TransferEligibilityStatus;
  eligible: boolean;
  transferPrice: number | null;
  renewPrice: number | null;
  message: string;
  checkoutHref: string;
};

/**
 * Synchronous transfer eligibility (hash/catalogue fallback only).
 * Production checks use checkTransferEligibilityAsync() → real Domain Name API availability.
 * Set DOMAIN_TRANSFER_LOOKUP_URL to POST { domain, authCode? } to an external registrar proxy.
 */
export function checkTransferEligibility(
  input: string,
  _authCode?: string,
): TransferCheckResult {
  const result = checkDomain(input);
  const domain = result.domain;
  const href = transferCheckoutHref(domain);

  if (result.status === "invalid") {
    return {
      domain,
      status: "invalid",
      eligible: false,
      transferPrice: null,
      renewPrice: null,
      message: result.message ?? "Enter a valid domain name to transfer.",
      checkoutHref: href,
    };
  }

  if (result.status === "available" || result.status === "premium") {
    return {
      domain,
      status: "available",
      eligible: false,
      transferPrice: result.transfer,
      renewPrice: result.renew,
      message: `${domain} looks available to register — transfer is for domains you already own elsewhere.`,
      checkoutHref: `${routes.domainCheckout}?domain=${encodeURIComponent(domain)}`,
    };
  }

  if (result.transfer == null) {
    return {
      domain,
      status: "unsupported",
      eligible: false,
      transferPrice: null,
      renewPrice: null,
      message: `We do not support transfers for ${result.tld} yet.`,
      checkoutHref: href,
    };
  }

  const priceLine = formatPrice(result.transfer);
  return {
    domain,
    status: "eligible",
    eligible: true,
    transferPrice: result.transfer,
    renewPrice: result.renew,
    message: `${domain} is ready to transfer — ${priceLine}/yr plus any ICANN fees. Unlock it at your current registrar and grab your auth code.`,
    checkoutHref: href,
  };
}
