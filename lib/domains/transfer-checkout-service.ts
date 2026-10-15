import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import {
  notifyTransferFailed,
  notifyTransferStarted,
} from "@/lib/domains/notifications";
import { getTransferRetailQuote } from "@/lib/domains/transfer-quote";
import { resolveDomainRegistrarProvider } from "@/lib/domains/providers/index";
import { searchDomainsWithProvider } from "@/lib/domains/domain-service";
import { publicId } from "@/lib/domains/transfer-service";
import {
  ensureCustomerWallet,
  finalizeReserve,
  reserveWalletFunds,
  rollbackReserve,
} from "@/lib/domains/wallet";
import {
  createInFlightTransferRecord,
  findInFlightTransferForUserDomain,
} from "@/lib/domains/transfer-inflight";
import { resolveTransferProviderAction } from "@/lib/domains/transfer-provider-outcome";
import { internalTransferErrorNote } from "@/lib/domains/transfer-security";
import { prisma } from "@/lib/prisma";

/** Registry shows the name is active here — not inferred from HTTP success alone. */
const COMPLETED_PROVIDER_STATUSES = new Set([
  "active",
  "ok",
  "transfer completed",
]);

export type ProcessDomainTransferCheckoutDeps = {
  searchDomainsWithProvider?: typeof searchDomainsWithProvider;
  getTransferRetailQuote?: typeof getTransferRetailQuote;
  resolveDomainRegistrarProvider?: typeof resolveDomainRegistrarProvider;
};

export async function processDomainTransferCheckout(
  input: {
    userId: string;
    userEmail: string;
    domainInput: string;
    authCode: string;
    idempotencyKey: string;
  },
  deps: ProcessDomainTransferCheckoutDeps = {},
) {
  const resolveProvider =
    deps.resolveDomainRegistrarProvider ?? resolveDomainRegistrarProvider;
  const searchDomains =
    deps.searchDomainsWithProvider ?? searchDomainsWithProvider;
  const getQuote = deps.getTransferRetailQuote ?? getTransferRetailQuote;

  if (!resolveProvider()) {
    return {
      ok: false as const,
      error: "Domain transfer is temporarily unavailable.",
      status: 503,
    };
  }

  const authCode = input.authCode?.trim();
  if (!authCode || authCode.length < 4) {
    return {
      ok: false as const,
      error: "Enter a valid EPP / auth code from your current registrar.",
      status: 400,
    };
  }

  const normalized = normalizeDomainSearchInput(input.domainInput);
  if (!normalized.ok) {
    return { ok: false as const, error: normalized.error, status: 400 };
  }

  const retail = await getQuote(normalized.tld || ".com");
  if (!retail?.purchasable) {
    return {
      ok: false as const,
      error: "We do not support transfers for that extension.",
      status: 400,
    };
  }

  const { results } = await searchDomains([normalized.query]);
  const row = results[0];
  if (!row || row.status === "available" || row.status === "premium") {
    return {
      ok: false as const,
      error:
        "That domain looks available to register — use registration instead of transfer.",
      status: 409,
    };
  }
  if (row.status === "invalid" || row.status === "unknown") {
    return {
      ok: false as const,
      error:
        row.message ??
        "We could not confirm transfer eligibility. Please try again.",
      status: 400,
    };
  }

  const existingTx = await prisma.walletTransaction.findUnique({
    where: { idempotencyKey: `transfer:${input.idempotencyKey}` },
  });
  if (existingTx) {
    const refId = existingTx.referenceId?.trim();
    const linked = refId
      ? await prisma.domainTransferRecord.findUnique({ where: { id: refId } })
      : null;
    if (linked) {
      return { ok: true as const, transfer: linked, duplicate: true };
    }
    return {
      ok: false as const,
      error:
        "A transfer request for this domain is already being processed. Retry with the same idempotency key.",
      status: 409,
    };
  }

  const existing = await findInFlightTransferForUserDomain(
    input.userId,
    normalized.query,
  );
  if (existing) {
    return {
      ok: false as const,
      error: "A transfer for this domain is already in progress.",
      status: 409,
      transfer: existing,
    };
  }

  await ensureCustomerWallet(input.userId);
  const total = retail.transfer;

  const claimed = await createInFlightTransferRecord({
    publicId: publicId("TRF"),
    userId: input.userId,
    domain: normalized.query,
    tld: normalized.tld || ".com",
    retailPrice: retail.transfer,
    total,
    currency: retail.currency,
    authCodeHint: `${authCode.slice(0, 2)}***`,
  });
  if (!claimed.ok) {
    return {
      ok: false as const,
      error: "A transfer for this domain is already in progress.",
      status: 409,
      transfer: claimed.existing,
    };
  }
  const transfer = claimed.record;

  let reserveTxId: string | null = null;
  try {
    const reserve = await reserveWalletFunds({
      userId: input.userId,
      amount: total,
      idempotencyKey: `transfer:${input.idempotencyKey}`,
      referenceType: "DomainTransferRecord",
      referenceId: transfer.id,
    });
    reserveTxId = reserve.id;

    const provider = resolveProvider()!;
    const availability = await provider.checkAvailability([normalized.query]);
    const supplierCost = availability[0]?.supplier.transfer;
    const outcome = await provider.transferDomain({
      domain: normalized.query,
      authCode,
      periodYears: 1,
    });

    const providerAction = resolveTransferProviderAction(outcome);

    if (providerAction.action === "reconciliation") {
      const pending = await prisma.domainTransferRecord.update({
        where: { id: transfer.id },
        data: {
          status: "IN_PROGRESS",
          providerTransferId: outcome.providerTransferId,
          supplierCost: supplierCost ?? null,
          errorCode: outcome.errorCode,
          errorMessageInternal: internalTransferErrorNote(outcome.errorCode),
        },
      });
      await notifyTransferStarted({
        email: input.userEmail,
        domain: normalized.query,
        publicId: pending.publicId,
      });
      return { ok: true as const, transfer: pending, reconciliation: true };
    }

    if (providerAction.action === "failed") {
      await rollbackReserve({
        userId: input.userId,
        amount: total,
        reserveTransactionId: reserve.id,
        idempotencyKey: input.idempotencyKey,
      });
      const failed = await prisma.domainTransferRecord.update({
        where: { id: transfer.id },
        data: {
          status: "FAILED",
          supplierCost: supplierCost ?? null,
          errorCode: outcome.errorCode,
          errorMessageInternal: internalTransferErrorNote(outcome.errorCode),
        },
      });
      await notifyTransferFailed({
        email: input.userEmail,
        domain: normalized.query,
        message: "Transfer could not be started.",
      });
      return {
        ok: false as const,
        error: "Transfer could not be started.",
        status: 502,
        transfer: failed,
      };
    }

    await finalizeReserve({
      userId: input.userId,
      reserveTransactionId: reserve.id,
    });

    const submitted = await prisma.domainTransferRecord.update({
      where: { id: transfer.id },
      data: {
        status: "SUBMITTED",
        providerTransferId: outcome.providerTransferId,
        supplierCost: supplierCost ?? null,
      },
    });

    await notifyTransferStarted({
      email: input.userEmail,
      domain: normalized.query,
      publicId: submitted.publicId,
    });

    return { ok: true as const, transfer: submitted };
  } catch (error) {
    if (reserveTxId) {
      await rollbackReserve({
        userId: input.userId,
        amount: total,
        reserveTransactionId: reserveTxId,
        idempotencyKey: input.idempotencyKey,
      }).catch(() => undefined);
    }
    await prisma.domainTransferRecord.update({
      where: { id: transfer.id },
      data: {
        status: "FAILED",
        errorMessageInternal: internalTransferErrorNote(
          error instanceof Error ? error.name : null,
          "transfer_checkout_failed",
        ),
      },
    });
    await notifyTransferFailed({
      email: input.userEmail,
      domain: normalized.query,
      message: "Transfer could not be started.",
    });
    return {
      ok: false as const,
      error: "Transfer could not be started.",
      status: 502,
    };
  }
}

/** Poll provider — only marks COMPLETED when registry confirms active registration here. */
export async function refreshTransferStatus(input: {
  userId: string;
  userEmail: string;
  publicId: string;
}) {
  const record = await prisma.domainTransferRecord.findFirst({
    where: { publicId: input.publicId, userId: input.userId },
  });
  if (!record) {
    return { ok: false as const, error: "Transfer not found.", status: 404 };
  }
  if (record.status === "COMPLETED" || record.status === "FAILED") {
    return { ok: true as const, transfer: record };
  }

  const provider = resolveDomainRegistrarProvider();
  if (!provider) {
    return {
      ok: false as const,
      error: "Status check unavailable.",
      status: 503,
    };
  }

  try {
    const details = await provider.getDomainDetails(record.domain);
    const normalizedStatus = details.status.toLowerCase();
    if (COMPLETED_PROVIDER_STATUSES.has(normalizedStatus)) {
      const completed = await prisma.$transaction(async (tx) => {
        const updated = await tx.domainTransferRecord.update({
          where: { id: record.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });
        await tx.domainRegistration.upsert({
          where: { domain: record.domain },
          create: {
            userId: input.userId,
            domain: record.domain,
            tld: record.tld,
            status: "ACTIVE",
            registeredAt: new Date(),
            expiresAt: details.expiresAt ? new Date(details.expiresAt) : null,
            autoRenew: true,
          },
          update: {
            userId: input.userId,
            status: "ACTIVE",
            expiresAt: details.expiresAt ? new Date(details.expiresAt) : null,
          },
        });
        return updated;
      });
      const { notifyTransferCompleted } =
        await import("@/lib/domains/notifications");
      await notifyTransferCompleted({
        email: input.userEmail,
        domain: record.domain,
      });
      return { ok: true as const, transfer: completed };
    }

    const inProgress = await prisma.domainTransferRecord.update({
      where: { id: record.id },
      data: { status: "IN_PROGRESS" },
    });
    return { ok: true as const, transfer: inProgress };
  } catch {
    return { ok: true as const, transfer: record };
  }
}
