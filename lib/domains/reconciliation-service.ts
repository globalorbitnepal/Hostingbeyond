import { defaultNameservers } from "@/lib/domains/contacts";
import { resolveDomainRegistrarProvider } from "@/lib/domains/providers/index";
import { DomainProviderError } from "@/lib/domains/providers/types";
import { finalizeReserve, rollbackReserve } from "@/lib/domains/wallet";
import { notifyRegistrationSuccess } from "@/lib/domains/notifications";
import { prisma } from "@/lib/prisma";

export type ReconciliationProviderSnapshot = {
  checkedAt: string;
  providerStatus: string | null;
  expiresAt: string | null;
  domainExistsAtProvider: boolean;
  errorCode?: string;
};

async function audit(
  adminUserId: string,
  action: string,
  orderId: string,
  details: Record<string, unknown>,
) {
  await prisma.domainAuditLog.create({
    data: {
      adminUserId,
      action,
      resource: "DomainOrder",
      resourceId: orderId,
      details: JSON.parse(JSON.stringify(details)) as object,
    },
  });
}

export async function listReconciliationOrders() {
  return prisma.domainOrder.findMany({
    where: { status: "RECONCILIATION_REQUIRED" },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });
}

export async function checkProviderStatusForOrder(orderId: string): Promise<{
  ok: true;
  snapshot: ReconciliationProviderSnapshot;
}> {
  const order = await prisma.domainOrder.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("order_not_found");

  const provider = resolveDomainRegistrarProvider();
  if (!provider) throw new Error("provider_unconfigured");

  const checkedAt = new Date().toISOString();
  try {
    const details = await provider.getDomainDetails(order.domain);
    const status = details.status?.toLowerCase() ?? "";
    const exists =
      Boolean(details.domain) &&
      !status.includes("notfound") &&
      !status.includes("not found");
    return {
      ok: true,
      snapshot: {
        checkedAt,
        providerStatus: details.status,
        expiresAt: details.expiresAt,
        domainExistsAtProvider: exists,
      },
    };
  } catch (error) {
    const code =
      error instanceof DomainProviderError ? error.code : "provider_failure";
    return {
      ok: true,
      snapshot: {
        checkedAt,
        providerStatus: null,
        expiresAt: null,
        domainExistsAtProvider: false,
        errorCode: code,
      },
    };
  }
}

export async function finalizeReconciliationOrder(input: {
  adminUserId: string;
  orderId: string;
  snapshot: ReconciliationProviderSnapshot;
}) {
  if (!input.snapshot.domainExistsAtProvider) {
    throw new Error("provider_not_confirmed");
  }

  const order = await prisma.domainOrder.findUnique({
    where: { id: input.orderId },
  });
  if (!order || order.status !== "RECONCILIATION_REQUIRED") {
    throw new Error("invalid_order_state");
  }
  if (!order.userId || !order.walletTransactionId) {
    throw new Error("order_missing_wallet");
  }

  await finalizeReserve({
    userId: order.userId,
    reserveTransactionId: order.walletTransactionId,
  });

  const expiresAt = input.snapshot.expiresAt
    ? new Date(input.snapshot.expiresAt)
    : null;

  const updated = await prisma.$transaction(async (tx) => {
    const completed = await tx.domainOrder.update({
      where: { id: order.id },
      data: {
        status: "REGISTERED",
        completedAt: new Date(),
        errorMessageCustomer: null,
      },
    });
    await tx.domainRegistration.upsert({
      where: { domain: order.domain },
      create: {
        userId: order.userId!,
        domain: order.domain,
        tld: order.tld,
        status: "ACTIVE",
        orderId: order.id,
        registeredAt: new Date(),
        expiresAt,
        autoRenew: true,
        nameservers: defaultNameservers(),
      },
      update: {
        userId: order.userId!,
        status: "ACTIVE",
        orderId: order.id,
        registeredAt: new Date(),
        expiresAt,
      },
    });
    return completed;
  });

  const user = await prisma.customerUser.findUnique({
    where: { id: order.userId },
  });
  if (user?.email) {
    await notifyRegistrationSuccess({
      email: user.email,
      domain: order.domain,
      orderPublicId: updated.publicId,
    });
  }

  await audit(input.adminUserId, "DOMAIN_RECONCILE_FINALIZE", order.id, {
    snapshot: input.snapshot,
  });

  return updated;
}

export async function rollbackReconciliationOrder(input: {
  adminUserId: string;
  orderId: string;
  snapshot: ReconciliationProviderSnapshot;
  idempotencyKey: string;
}) {
  if (input.snapshot.domainExistsAtProvider) {
    throw new Error("provider_still_registered");
  }

  const order = await prisma.domainOrder.findUnique({
    where: { id: input.orderId },
  });
  if (!order || order.status !== "RECONCILIATION_REQUIRED") {
    throw new Error("invalid_order_state");
  }
  if (!order.userId || !order.walletTransactionId) {
    throw new Error("order_missing_wallet");
  }

  await rollbackReserve({
    userId: order.userId,
    amount: Number(order.total),
    reserveTransactionId: order.walletTransactionId,
    idempotencyKey: input.idempotencyKey,
  });

  const updated = await prisma.domainOrder.update({
    where: { id: order.id },
    data: {
      status: "FAILED",
      errorMessageCustomer:
        "Registration could not be confirmed. Your account balance has been restored.",
    },
  });

  await audit(input.adminUserId, "DOMAIN_RECONCILE_ROLLBACK", order.id, {
    snapshot: input.snapshot,
  });

  return updated;
}
