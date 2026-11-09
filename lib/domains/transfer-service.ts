import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import { isAvailabilityProviderConfigured } from "@/lib/domains/providers/index";
import {
  resolveSearchRouteAvailabilityBackend,
  runWithSearchAvailabilityBackend,
} from "@/lib/domains/search-availability-backend";
import { checkTransferEligibility as legacyCheck } from "@/lib/domains/transfer";
import type { TransferCheckResult } from "@/lib/domains/transfer";
import {
  buildTransferCheckResult,
  getTransferRetailQuote,
} from "@/lib/domains/transfer-quote";
import { lookupPublicWhois } from "@/lib/domains/public-whois";
import { checkNameSiloTransferAvailability } from "@/lib/domains/providers/namesilo-registrar";
import {
  addYears,
  buildTransferRequirements,
  looksUnregistered,
  transferBlockedSummary,
  transferRequirementsReady,
} from "@/lib/domains/transfer-requirements";
import { prisma } from "@/lib/prisma";

export async function checkTransferEligibilityAsync(
  input: string,
  _authCode?: string,
): Promise<TransferCheckResult> {
  return runWithSearchAvailabilityBackend(
    resolveSearchRouteAvailabilityBackend(),
    async () => checkTransferEligibilityAsyncScoped(input),
  );
}

async function checkTransferEligibilityAsyncScoped(
  input: string,
): Promise<TransferCheckResult> {
  const normalized = normalizeDomainSearchInput(input);
  if (!normalized.ok) {
    return legacyCheck(input);
  }

  if (!isAvailabilityProviderConfigured()) {
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
    /**
     * Real readiness: NameSilo confirms the domain is registered and
     * transferable, public RDAP tells us the lock state and live expiry.
     * Nothing here is guessed from our own catalogue.
     */
    const [availability, whois] = await Promise.all([
      checkNameSiloTransferAvailability(normalized.query),
      lookupPublicWhois(normalized.query).catch(() => null),
    ]);

    const whoisRecord = whois && !("error" in whois) ? whois : null;

    const requirements = buildTransferRequirements({
      registrarAvailable: availability.ok,
      registrarReason: availability.ok ? undefined : availability.reason,
      registeredOn: whoisRecord?.registeredOn ?? null,
      statuses: whoisRecord?.statuses ?? [],
    });

    const ready = transferRequirementsReady(requirements);
    const expectedExpiresOn = addYears(whoisRecord?.expiresOn ?? null, 1);

    const supplierTransfer = availability.ok
      ? availability.supplierTransfer
      : null;
    const supplierRenew = availability.ok ? availability.supplierRenew : null;

    if (!availability.ok) {
      const registerable = looksUnregistered(availability.reason);
      return buildTransferCheckResult({
        domain: normalized.query,
        status: registerable ? "available" : "invalid",
        eligible: false,
        message: registerable
          ? `${normalized.query} is not registered yet, so it cannot be transferred — you can register it instead.`
          : availability.reason,
        transferPrice: quote.transfer,
        renewPrice: quote.renew,
        purchasable: false,
        requirements,
        currentRegistrar: whoisRecord?.registrar ?? null,
        currentExpiresOn: whoisRecord?.expiresOn ?? null,
        expectedExpiresOn,
      });
    }

    const blocked = transferBlockedSummary(requirements);
    const message = ready
      ? `${availability.domain || normalized.query} passed our live registrar checks. Pay the transfer fee and we submit the move to the registry.`
      : `${availability.domain || normalized.query} cannot be transferred yet: ${blocked.join("; ")}.`;

    return buildTransferCheckResult({
      domain: availability.domain || normalized.query,
      status: ready ? "eligible" : "invalid",
      eligible: ready,
      transferPrice: quote.transfer,
      renewPrice: quote.renew,
      purchasable: ready,
      registryCheckOnly: false,
      transferEligibilityConfirmed: availability.ok && ready,
      message,
      requirements,
      currentRegistrar: whoisRecord?.registrar ?? null,
      currentExpiresOn: whoisRecord?.expiresOn ?? null,
      expectedExpiresOn,
      supplierTransfer,
      supplierRenew,
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
