import {
  defaultNameservers,
  defaultRegistrationContacts,
} from "@/lib/domains/contacts";
import { assertAvailableForRegistration } from "@/lib/domains/registration-availability";
import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import {
  notifyRegistrationFailed,
  notifyRegistrationReconciliation,
  notifyRegistrationSuccess,
} from "@/lib/domains/notifications";
import { getRetailQuoteForTld } from "@/lib/domains/pricing-engine";
import {
  assertTermAllowed,
  supplierQuoteCoversTerm,
  tldTermContextFromRow,
} from "@/lib/domains/registration-term";
import { resolveLifecycleProvider } from "@/lib/domains/providers/index";
import { DomainProviderError } from "@/lib/domains/providers/types";
import { publicId } from "@/lib/domains/transfer-service";
import {
  ensureCustomerWallet,
  finalizeReserve,
  reserveWalletFunds,
  rollbackReserve,
} from "@/lib/domains/wallet";
import { prisma } from "@/lib/prisma";

export async function quoteRegistration(domainInput: string) {
  const normalized = normalizeDomainSearchInput(domainInput);
  if (!normalized.ok) {
    return { ok: false as const, error: normalized.error, status: 400 };
  }
  const retail = await getRetailQuoteForTld(normalized.tld || ".com");
  if (!retail) {
    return {
      ok: false as const,
      error: "We do not sell that extension yet.",
      status: 400,
    };
  }
  return {
    ok: true as const,
    domain: normalized.query,
    tld: normalized.tld || ".com",
    register: retail.register,
    renew: retail.renew,
    transfer: retail.transfer,
    currency: retail.currency,
  };
}

export async function processDomainRegistrationCheckout(input: {
  userId: string;
  userEmail: string;
  domainInput: string;
  idempotencyKey: string;
}) {
  if (!resolveLifecycleProvider()) {
    throw new Error("lookup_unconfigured");
  }

  const quote = await quoteRegistration(input.domainInput);
  if (!quote.ok) {
    return { ok: false as const, error: quote.error, status: quote.status };
  }

  const existingOrder = await prisma.domainOrder.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });
  if (existingOrder) {
    return {
      ok: true as const,
      order: existingOrder,
      duplicate: true,
    };
  }

  const inflight = await prisma.domainOrder.findFirst({
    where: {
      domain: quote.domain,
      status: {
        in: ["REGISTERING", "RECONCILIATION_REQUIRED", "PROCESSING"],
      },
    },
  });
  if (inflight) {
    return {
      ok: false as const,
      error: "This domain is already being registered.",
      status: 409,
    };
  }

  const taken = await prisma.domainRegistration.findUnique({
    where: { domain: quote.domain },
  });
  if (taken && taken.status === "ACTIVE") {
    return {
      ok: false as const,
      error: "This domain is already registered in your account.",
      status: 409,
    };
  }

  const availability = await assertAvailableForRegistration(quote.domain);
  if (availability.register == null) {
    return {
      ok: false as const,
      error:
        availability.message ??
        "Pricing is unavailable for this domain. Please search again.",
      status: 400,
    };
  }
  const termYears = availability.registerTermYears ?? 1;
  const priceRow = await prisma.domainTldPrice.findUnique({
    where: { tld: quote.tld },
  });
  if (!priceRow?.enabled) {
    return {
      ok: false as const,
      error: "We do not sell that extension yet.",
      status: 400,
    };
  }
  const termCtx = tldTermContextFromRow(priceRow);
  const termCheck = assertTermAllowed(termYears, termCtx);
  if (!termCheck.ok) {
    return { ok: false as const, error: termCheck.message, status: 400 };
  }
  const registerPrice = availability.register;
  await ensureCustomerWallet(input.userId);

  const order = await prisma.domainOrder.create({
    data: {
      publicId: publicId("DOM"),
      userId: input.userId,
      orderType: "register",
      domain: quote.domain,
      tld: quote.tld,
      status: "PROCESSING",
      retailPrice: registerPrice,
      total: registerPrice,
      currency: quote.currency,
      idempotencyKey: input.idempotencyKey,
    },
  });

  let reserveTxId: string | null = null;
  try {
    const reserve = await reserveWalletFunds({
      userId: input.userId,
      amount: registerPrice,
      idempotencyKey: `register:${input.idempotencyKey}`,
      referenceType: "DomainOrder",
      referenceId: order.id,
    });
    reserveTxId = reserve.id;

    await prisma.domainOrder.update({
      where: { id: order.id },
      data: {
        status: "REGISTERING",
        walletTransactionId: reserve.id,
      },
    });

    const provider = resolveLifecycleProvider()!;
    const supplierRow = await provider.checkAvailability([quote.domain]);
    const supplier = supplierRow[0]?.supplier;
    const supplierCost = supplier?.register ?? null;
    if (
      !supplier ||
      !supplierQuoteCoversTerm(
        supplier,
        termYears,
        termCtx.supplierMinRegistrationPeriod,
      )
    ) {
      await rollbackReserve({
        userId: input.userId,
        amount: registerPrice,
        reserveTransactionId: reserve.id,
        idempotencyKey: input.idempotencyKey,
      });
      await prisma.domainOrder.update({
        where: { id: order.id },
        data: {
          status: "FAILED",
          errorMessageInternal: "supplier_term_mismatch",
          errorMessageCustomer:
            "Registration pricing could not be confirmed. Please search again.",
        },
      });
      return {
        ok: false as const,
        error:
          "Registration pricing could not be confirmed. Please search again.",
        status: 400,
      };
    }

    let registerOutcome;
    try {
      registerOutcome = await provider.registerDomain({
        domain: quote.domain,
        periodYears: termYears,
        contacts: defaultRegistrationContacts(),
        nameservers: defaultNameservers(),
      });
    } catch (error) {
      if (error instanceof DomainProviderError && error.code === "timeout") {
        registerOutcome = {
          outcome: "unknown" as const,
          domain: quote.domain,
          expiresAt: null,
          errorCode: "timeout",
          errorMessageInternal: "Provider timeout during register",
        };
      } else {
        throw error;
      }
    }

    if (registerOutcome.outcome === "unknown") {
      const updated = await prisma.domainOrder.update({
        where: { id: order.id },
        data: {
          status: "RECONCILIATION_REQUIRED",
          supplierCost: supplierCost ?? null,
          errorCode: registerOutcome.errorCode,
          errorMessageInternal: registerOutcome.errorMessageInternal,
          errorMessageCustomer:
            "We are confirming your registration with the registry.",
        },
      });
      await prisma.domainAuditLog.create({
        data: {
          action: "DOMAIN_ORDER_RECONCILE",
          resource: "DomainOrder",
          resourceId: order.id,
          details: { domain: quote.domain },
        },
      });
      await notifyRegistrationReconciliation({
        email: input.userEmail,
        domain: quote.domain,
      });
      return { ok: true as const, order: updated, reconciliation: true };
    }

    if (registerOutcome.outcome === "failed") {
      await rollbackReserve({
        userId: input.userId,
        amount: registerPrice,
        reserveTransactionId: reserve.id,
        idempotencyKey: input.idempotencyKey,
      });
      const failed = await prisma.domainOrder.update({
        where: { id: order.id },
        data: {
          status: "FAILED",
          supplierCost: supplierCost ?? null,
          errorCode: registerOutcome.errorCode,
          errorMessageInternal: registerOutcome.errorMessageInternal,
          errorMessageCustomer: "Registration failed. Please try again.",
        },
      });
      await notifyRegistrationFailed({
        email: input.userEmail,
        domain: quote.domain,
        message: "Registration failed.",
      });
      return {
        ok: false as const,
        error: failed.errorMessageCustomer!,
        status: 502,
      };
    }

    if (registerOutcome.outcome !== "success") {
      await rollbackReserve({
        userId: input.userId,
        amount: registerPrice,
        reserveTransactionId: reserve.id,
        idempotencyKey: input.idempotencyKey,
      });
      const failed = await prisma.domainOrder.update({
        where: { id: order.id },
        data: {
          status: "FAILED",
          errorMessageCustomer: "Registration failed. Please try again.",
        },
      });
      return {
        ok: false as const,
        error: failed.errorMessageCustomer!,
        status: 502,
      };
    }

    await finalizeReserve({
      userId: input.userId,
      reserveTransactionId: reserve.id,
    });

    const expiresAt = registerOutcome.expiresAt
      ? new Date(registerOutcome.expiresAt)
      : null;

    const completed = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.domainOrder.update({
        where: { id: order.id },
        data: {
          status: "REGISTERED",
          providerOrderId: registerOutcome.providerOrderId,
          supplierCost: supplierCost ?? null,
          completedAt: new Date(),
        },
      });
      await tx.domainRegistration.upsert({
        where: { domain: quote.domain },
        create: {
          userId: input.userId,
          domain: quote.domain,
          tld: quote.tld,
          status: "ACTIVE",
          orderId: order.id,
          providerDomainId: registerOutcome.providerOrderId,
          registeredAt: new Date(),
          expiresAt,
          autoRenew: true,
        },
        update: {
          userId: input.userId,
          status: "ACTIVE",
          orderId: order.id,
          providerDomainId: registerOutcome.providerOrderId,
          registeredAt: new Date(),
          expiresAt,
        },
      });
      return updatedOrder;
    });

    await notifyRegistrationSuccess({
      email: input.userEmail,
      domain: quote.domain,
      orderPublicId: completed.publicId,
    });

    return { ok: true as const, order: completed };
  } catch (error) {
    if (reserveTxId) {
      await rollbackReserve({
        userId: input.userId,
        amount: registerPrice,
        reserveTransactionId: reserveTxId,
        idempotencyKey: input.idempotencyKey,
      }).catch(() => undefined);
    }
    await prisma.domainOrder.update({
      where: { id: order.id },
      data: {
        status: "FAILED",
        errorMessageInternal:
          error instanceof Error ? error.message : "checkout_failed",
        errorMessageCustomer: "Registration could not be completed.",
      },
    });
    await notifyRegistrationFailed({
      email: input.userEmail,
      domain: quote.domain,
      message: "Registration could not be completed.",
    });
    return {
      ok: false as const,
      error: "Registration could not be completed.",
      status: 502,
    };
  }
}

export async function listCustomerDomains(userId: string) {
  const rows = await prisma.domainRegistration.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  const enriched = await Promise.all(
    rows.map(async (row) => {
      const retail = await getRetailQuoteForTld(row.tld);
      return {
        domain: row.domain,
        status: row.status,
        registeredAt: row.registeredAt,
        expiresAt: row.expiresAt,
        autoRenew: row.autoRenew,
        renewalPrice: retail?.renew ?? null,
        currency: retail?.currency ?? "USD",
      };
    }),
  );
  return enriched;
}
