import { routes } from "@/config/routes";

import { checkDomain } from "@/lib/domains/availability";
import { formatPrice } from "@/lib/domains/tlds";

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

function checkoutHref(domain: string, authCode?: string) {
  const params = new URLSearchParams({ transfer: domain });
  if (authCode?.trim()) params.set("auth", authCode.trim());
  return `${routes.getStarted}?${params.toString()}`;
}

/**
 * Transfer eligibility from the same catalogue as domain search.
 * Set DOMAIN_TRANSFER_LOOKUP_URL to POST { domain, authCode? } to a registrar.
 */
export function checkTransferEligibility(
  input: string,
  authCode?: string,
): TransferCheckResult {
  const result = checkDomain(input);
  const domain = result.domain;
  const href = checkoutHref(domain, authCode);

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
      checkoutHref: `${routes.getStarted}?domain=${encodeURIComponent(domain)}`,
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
