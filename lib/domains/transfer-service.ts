import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import { searchDomainsWithProvider } from "@/lib/domains/domain-service";
import { resolveAvailabilityProvider } from "@/lib/domains/providers/index";
import { routes } from "@/config/routes";
import { checkTransferEligibility as legacyCheck } from "@/lib/domains/transfer";
import type { TransferCheckResult } from "@/lib/domains/transfer";
import {
  buildTransferCheckResult,
  getTransferRetailQuote,
  transferCheckoutHref,
} from "@/lib/domains/transfer-quote";
import { prisma } from "@/lib/prisma";

export async function checkTransferEligibilityAsync(
  input: string,
  _authCode?: string,
): Promise<TransferCheckResult> {
  const normalized = normalizeDomainSearchInput(input);
  if (!normalized.ok) {
    return legacyCheck(input);
  }

  const provider = resolveAvailabilityProvider();
  if (!provider) {
    if (process.env.NODE_ENV === "production") {
      return buildTransferCheckResult({
        domain: input.trim(),
        status: "invalid",
        eligible: false,
        message: "Domain transfer is temporarily unavailable.",
        transferPrice: null,
        renewPrice: null,
        purchasable: false,
      });
    }
    return legacyCheck(input);
  }

  const quote = await getTransferRetailQuote(normalized.tld || ".com");
  if (!quote) {
    return buildTransferCheckResult({
      domain: normalized.query,
      status: "unsupported",
      eligible: false,
      message: `We do not support transfers for ${normalized.tld || "this extension"} yet.`,
      transferPrice: null,
      renewPrice: null,
      purchasable: false,
    });
  }

  if (!quote.purchasable) {
    return buildTransferCheckResult({
      domain: normalized.query,
      status: "unsupported",
      eligible: false,
      message:
        "Transfer pricing is not configured for this extension. Contact support for a quote.",
      transferPrice: null,
      renewPrice: quote.renew,
      purchasable: false,
    });
  }

  try {
    const { results } = await searchDomainsWithProvider([normalized.query]);
    const row = results[0];

    if (!row) {
      return buildTransferCheckResult({
        domain: normalized.query,
        status: "invalid",
        eligible: false,
        message:
          "We couldn't verify transfer eligibility right now. Please try again.",
        transferPrice: quote.transfer,
        renewPrice: quote.renew,
        purchasable: false,
      });
    }

    if (row.status === "available" || row.status === "premium") {
      return {
        domain: row.domain,
        status: "available",
        eligible: false,
        transferEligibilityConfirmed: false,
        transferPrice: quote.transfer,
        renewPrice: quote.renew,
        message: `${row.domain} looks available to register — transfer is for domains you already own elsewhere.`,
        checkoutHref: `${routes.domainCheckout}?domain=${encodeURIComponent(row.domain)}`,
      };
    }

    if (row.status === "invalid") {
      return buildTransferCheckResult({
        domain: row.domain,
        status: "invalid",
        eligible: false,
        message: row.message ?? "Enter a valid domain name.",
        transferPrice: quote.transfer,
        renewPrice: quote.renew,
        purchasable: false,
      });
    }

    if (row.status === "unknown") {
      return buildTransferCheckResult({
        domain: row.domain,
        status: "invalid",
        eligible: false,
        message:
          "We could not confirm registry status. Try again in a moment — we will not guess transfer eligibility.",
        transferPrice: quote.transfer,
        renewPrice: quote.renew,
        purchasable: false,
      });
    }

    return buildTransferCheckResult({
      domain: row.domain,
      status: "eligible",
      eligible: true,
      transferPrice: quote.transfer,
      renewPrice: quote.renew,
      purchasable: true,
      registryCheckOnly: true,
      transferEligibilityConfirmed: false,
      message: `${row.domain} appears registered in our availability check — not a guarantee the registry will accept a transfer. Unlock the domain at your current registrar and enter your auth (EPP) code at checkout. Transfer fee is shown before you pay.`,
    });
  } catch {
    return buildTransferCheckResult({
      domain: normalized.query,
      status: "invalid",
      eligible: false,
      message:
        "We couldn't verify transfer eligibility right now. Please try again.",
      transferPrice: quote.transfer,
      renewPrice: quote.renew,
      purchasable: false,
    });
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

  const quote = await getTransferRetailQuote(normalized.tld || ".com");
  if (!quote?.purchasable) throw new Error("tld_unsupported");

  const isTransfer = input.orderType.toLowerCase().includes("transfer");
  const total = isTransfer ? quote.transfer : quote.register;

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
      currency: quote.currency,
      idempotencyKey: input.idempotencyKey,
    },
  });
}
