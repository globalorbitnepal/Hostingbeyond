import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import {
  notifyTransferFailed,
  notifyTransferStarted,
} from "@/lib/domains/notifications";
import { getRetailQuoteForTld } from "@/lib/domains/pricing-engine";
import { resolveDomainRegistrarProvider } from "@/lib/domains/providers/index";
import { searchDomainsWithProvider } from "@/lib/domains/domain-service";
import { publicId } from "@/lib/domains/transfer-service";
import {
  ensureCustomerWallet,
  finalizeReserve,
  reserveWalletFunds,
  rollbackReserve,
} from "@/lib/domains/wallet";
import { prisma } from "@/lib/prisma";

const COMPLETED_PROVIDER_STATUSES = new Set([
  "active",
  "ok",
  "clienttransferprohibited",
  "transfer completed",
]);

export async function processDomainTransferCheckout(input: {
  userId: string;
  userEmail: string;
  domainInput: string;
  authCode: string;
  idempotencyKey: string;
}) {
  if (!resolveDomainRegistrarProvider()) {
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

  const retail = await getRetailQuoteForTld(normalized.tld || ".com");
  if (!retail) {
    return {
      ok: false as const,
      error: "We do not support transfers for that extension.",
      status: 400,
    };
  }

  const { results } = await searchDomainsWithProvider([normalized.query]);
  const row = results[0];
  if (!row || row.status === "available" || row.status === "premium") {
    return {
      ok: false as const,
      error:
        "That domain looks available to register — use registration instead of transfer.",
      status: 409,
    };
  }
  if (row.status === "invalid") {
    return {
      ok: false as const,
      error: row.message ?? "Enter a valid domain name.",
      status: 400,
    };
  }

  const existing = await prisma.domainTransferRecord.findFirst({
    where: {
      domain: normalized.query,
      userId: input.userId,
      status: { in: ["SUBMITTED", "IN_PROGRESS", "PAID"] },
    },
  });
  if (existing) {
    return {
      ok: false as const,
      error: "A transfer for this domain is already in progress.",
      status: 409,
    };
  }

  const existingTx = await prisma.walletTransaction.findUnique({
    where: { idempotencyKey: `transfer:${input.idempotencyKey}` },
  });
  if (existingTx) {
    const linked = await prisma.domainTransferRecord.findFirst({
      where: { id: existingTx.referenceId ?? "" },
    });
    if (linked) {
      return { ok: true as const, transfer: linked, duplicate: true };
    }
  }

  await ensureCustomerWallet(input.userId);
  const total = retail.transfer;

  const transfer = await prisma.domainTransferRecord.create({
    data: {
      publicId: publicId("TRF"),
      userId: input.userId,
      domain: normalized.query,
      tld: normalized.tld || ".com",
      status: "PENDING_PAYMENT",
      retailPrice: retail.transfer,
      total,
      currency: retail.currency,
      authCodeHint: `${authCode.slice(0, 2)}***`,
    },
  });

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

    const provider = resolveDomainRegistrarProvider()!;
    const availability = await provider.checkAvailability([normalized.query]);
    const supplierCost = availability[0]?.supplier.transfer;
    const outcome = await provider.transferDomain({
      domain: normalized.query,
      authCode,
      periodYears: 1,
    });

    if (outcome.outcome === "unknown") {
      const pending = await prisma.domainTransferRecord.update({
        where: { id: transfer.id },
        data: {
          status: "IN_PROGRESS",
          providerTransferId: outcome.providerTransferId,
          supplierCost: supplierCost ?? null,
          errorCode: outcome.errorCode,
          errorMessageInternal: outcome.errorMessageInternal,
        },
      });
      await notifyTransferStarted({
        email: input.userEmail,
        domain: normalized.query,
        publicId: pending.publicId,
      });
      return { ok: true as const, transfer: pending, reconciliation: true };
    }

    if (outcome.outcome === "failed") {
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
          errorMessageInternal: outcome.errorMessageInternal,
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
        errorMessageInternal:
          error instanceof Error ? error.message : "transfer_checkout_failed",
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
