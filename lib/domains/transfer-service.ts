import { prisma } from "@/lib/prisma";
import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import { searchDomainsWithProvider } from "@/lib/domains/domain-service";
import { getRetailQuoteForTld } from "@/lib/domains/pricing-engine";
import { resolveDomainRegistrarProvider } from "@/lib/domains/providers/index";
import { routes } from "@/config/routes";
import { checkTransferEligibility as legacyCheck } from "@/lib/domains/transfer";
import type { TransferCheckResult } from "@/lib/domains/transfer";

export async function checkTransferEligibilityAsync(
  input: string,
  authCode?: string,
): Promise<TransferCheckResult> {
  const normalized = normalizeDomainSearchInput(input);
  if (!normalized.ok) {
    return legacyCheck(input, authCode);
  }

  const provider = resolveDomainRegistrarProvider();
  if (!provider) {
    if (process.env.NODE_ENV === "production") {
      return {
        domain: input.trim(),
        status: "invalid",
        eligible: false,
        transferPrice: null,
        renewPrice: null,
        message: "Domain transfer is temporarily unavailable.",
        checkoutHref: routes.domainTransfer,
      };
    }
    return legacyCheck(input, authCode);
  }

  try {
    const { results } = await searchDomainsWithProvider([normalized.query]);
    const row = results[0];
    const retail = await getRetailQuoteForTld(normalized.tld || ".com");
    const href = `${routes.domainCheckout}?${new URLSearchParams({
      transfer: normalized.query,
      ...(authCode?.trim() ? { auth: authCode.trim() } : {}),
    }).toString()}`;

    if (!row || !retail) {
      return {
        domain: normalized.query,
        status: "invalid",
        eligible: false,
        transferPrice: null,
        renewPrice: null,
        message:
          "We couldn't verify transfer eligibility right now. Please try again.",
        checkoutHref: routes.domainTransfer,
      };
    }

    if (row.status === "available" || row.status === "premium") {
      return {
        domain: row.domain,
        status: "available",
        eligible: false,
        transferPrice: retail.transfer,
        renewPrice: retail.renew,
        message: `${row.domain} looks available to register — transfer is for domains you already own elsewhere.`,
        checkoutHref: `${routes.domainCheckout}?domain=${encodeURIComponent(row.domain)}`,
      };
    }

    if (row.status === "invalid") {
      return {
        domain: row.domain,
        status: "invalid",
        eligible: false,
        transferPrice: null,
        renewPrice: null,
        message: row.message ?? "Enter a valid domain name to transfer.",
        checkoutHref: href,
      };
    }

    return {
      domain: row.domain,
      status: "eligible",
      eligible: true,
      transferPrice: retail.transfer,
      renewPrice: retail.renew,
      message: `${row.domain} is ready to transfer. Unlock it at your current registrar and enter your auth code.`,
      checkoutHref: href,
    };
  } catch {
    return {
      domain: normalized.query,
      status: "invalid",
      eligible: false,
      transferPrice: null,
      renewPrice: null,
      message:
        "We couldn't verify transfer eligibility right now. Please try again.",
      checkoutHref: routes.domainTransfer,
    };
  }
}

export function publicId(prefix: string) {
  const n = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${n}`;
}

export async function createPendingDomainOrder(input: {
  userId?: string;
  domain: string;
  orderType: string;
  idempotencyKey?: string;
}) {
  const normalized = normalizeDomainSearchInput(input.domain);
  if (!normalized.ok) throw new Error("invalid_domain");

  const retail = await getRetailQuoteForTld(normalized.tld || ".com");
  if (!retail) throw new Error("tld_unsupported");

  const total = retail.register;
  return prisma.domainOrder.create({
    data: {
      publicId: publicId("DOM"),
      userId: input.userId,
      orderType: input.orderType,
      domain: normalized.query,
      tld: normalized.tld || ".com",
      status: "PENDING_PAYMENT",
      retailPrice: total,
      total,
      currency: retail.currency,
      idempotencyKey: input.idempotencyKey,
    },
  });
}
