import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import {
  notifyRenewalFailed,
  notifyRenewalSuccess,
} from "@/lib/domains/notifications";
import { getRetailQuoteForTld } from "@/lib/domains/pricing-engine";
import { resolveDomainRegistrarProvider } from "@/lib/domains/providers/index";
import { DomainProviderError } from "@/lib/domains/providers/types";
import { publicId } from "@/lib/domains/transfer-service";
import {
  ensureCustomerWallet,
  finalizeReserve,
  reserveWalletFunds,
  rollbackReserve,
} from "@/lib/domains/wallet";
import { prisma } from "@/lib/prisma";

export async function processDomainRenewalCheckout(input: {
  userId: string;
  userEmail: string;
  domainInput: string;
  idempotencyKey: string;
  periodYears?: number;
}) {
  if (!resolveDomainRegistrarProvider()) {
    return {
      ok: false as const,
      error: "Domain renewal is temporarily unavailable.",
      status: 503,
    };
  }

  const normalized = normalizeDomainSearchInput(input.domainInput);
  if (!normalized.ok) {
    return { ok: false as const, error: normalized.error, status: 400 };
  }

  const registration = await prisma.domainRegistration.findFirst({
    where: { userId: input.userId, domain: normalized.query },
  });
  if (!registration || registration.status !== "ACTIVE") {
    return {
      ok: false as const,
      error: "That domain is not in your account.",
      status: 404,
    };
  }

  const retail = await getRetailQuoteForTld(normalized.tld || ".com");
  if (!retail) {
    return {
      ok: false as const,
      error: "We do not sell that extension.",
      status: 400,
    };
  }

  const period = input.periodYears ?? 1;
  const total = Math.round(retail.renew * period * 100) / 100;

  const existingOrder = await prisma.domainOrder.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });
  if (existingOrder) {
    return { ok: true as const, order: existingOrder, duplicate: true };
  }

  await ensureCustomerWallet(input.userId);

  const order = await prisma.domainOrder.create({
    data: {
      publicId: publicId("DOM"),
      userId: input.userId,
      orderType: "renew",
      domain: normalized.query,
      tld: normalized.tld || ".com",
      status: "PROCESSING",
      retailPrice: retail.renew,
      total,
      currency: retail.currency,
      idempotencyKey: input.idempotencyKey,
    },
  });

  let reserveTxId: string | null = null;
  try {
    const reserve = await reserveWalletFunds({
      userId: input.userId,
      amount: total,
      idempotencyKey: `renew:${input.idempotencyKey}`,
      referenceType: "DomainOrder",
      referenceId: order.id,
    });
    reserveTxId = reserve.id;

    const provider = resolveDomainRegistrarProvider()!;
    let expiresAt: string | null = null;
    try {
      const result = await provider.renewDomain(normalized.query, period);
      expiresAt = result.expiresAt;
    } catch (error) {
      if (error instanceof DomainProviderError && error.code === "timeout") {
        await prisma.domainOrder.update({
          where: { id: order.id },
          data: {
            status: "RECONCILIATION_REQUIRED",
            errorCode: "timeout",
            errorMessageCustomer:
              "We are confirming your renewal with the registry.",
          },
        });
        return {
          ok: true as const,
          order,
          reconciliation: true,
        };
      }
      throw error;
    }

    await finalizeReserve({
      userId: input.userId,
      reserveTransactionId: reserve.id,
    });

    const expiryDate = expiresAt ? new Date(expiresAt) : null;
    const completed = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.domainOrder.update({
        where: { id: order.id },
        data: {
          status: "REGISTERED",
          completedAt: new Date(),
        },
      });
      await tx.domainRegistration.update({
        where: { id: registration.id },
        data: {
          expiresAt: expiryDate ?? registration.expiresAt,
          lastRenewalAt: new Date(),
        },
      });
      return updatedOrder;
    });

    await notifyRenewalSuccess({
      email: input.userEmail,
      domain: normalized.query,
      expiresAt,
    });

    return { ok: true as const, order: completed };
  } catch (error) {
    if (reserveTxId) {
      await rollbackReserve({
        userId: input.userId,
        amount: total,
        reserveTransactionId: reserveTxId,
        idempotencyKey: input.idempotencyKey,
      }).catch(() => undefined);
    }
    await prisma.domainOrder.update({
      where: { id: order.id },
      data: {
        status: "FAILED",
        errorMessageInternal:
          error instanceof Error ? error.message : "renew_failed",
        errorMessageCustomer: "Renewal could not be completed.",
      },
    });
    await notifyRenewalFailed({
      email: input.userEmail,
      domain: normalized.query,
      message: "Renewal could not be completed.",
    });
    return {
      ok: false as const,
      error: "Renewal could not be completed.",
      status: 502,
    };
  }
}
