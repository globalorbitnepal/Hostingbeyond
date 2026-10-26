import { finalizeReserve, rollbackReserve } from "@/lib/domains/wallet";
import { prisma } from "@/lib/prisma";

export type TransferWalletFinalizeResult =
  { ok: true; alreadyFinalized?: boolean } | { ok: false; code: string };

/** Open reserve for a transfer (not reversed, not yet finalized to DEBIT). */
export async function findOpenTransferReserve(input: {
  userId: string;
  transferId: string;
  walletTransactionId?: string | null;
}) {
  if (input.walletTransactionId) {
    const direct = await prisma.walletTransaction.findUnique({
      where: { id: input.walletTransactionId },
    });
    if (direct && direct.userId === input.userId) return direct;
  }
  return prisma.walletTransaction.findFirst({
    where: {
      userId: input.userId,
      referenceType: "DomainTransferRecord",
      referenceId: input.transferId,
      status: { not: "REVERSED" },
      type: { in: ["RESERVE", "DEBIT"] },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Finalize wallet reserve when transfer success is confirmed (checkout submit or status poll).
 * Idempotent: DEBIT / already finalized returns ok with alreadyFinalized.
 */
export async function finalizeTransferWalletOnce(input: {
  userId: string;
  transferId: string;
  walletTransactionId?: string | null;
  idempotencyKey?: string;
}): Promise<TransferWalletFinalizeResult> {
  const reserve = await findOpenTransferReserve(input);
  if (!reserve) {
    return { ok: false, code: "no_reserve" };
  }
  if (reserve.type === "DEBIT") {
    return { ok: true, alreadyFinalized: true };
  }
  if (reserve.type !== "RESERVE" || reserve.status === "REVERSED") {
    return { ok: false, code: "invalid_reserve_state" };
  }
  await finalizeReserve({
    userId: input.userId,
    reserveTransactionId: reserve.id,
  });
  return { ok: true };
}

/**
 * Roll back reserve only when failure is confirmed — not for unknown/reconciliation states.
 */
export async function rollbackTransferWalletOnce(input: {
  userId: string;
  transferId: string;
  amount: number;
  walletTransactionId?: string | null;
  idempotencyKey: string;
}): Promise<TransferWalletFinalizeResult> {
  const reserve = await findOpenTransferReserve({
    userId: input.userId,
    transferId: input.transferId,
    walletTransactionId: input.walletTransactionId,
  });
  if (!reserve) {
    return { ok: false, code: "no_reserve" };
  }
  if (reserve.status === "REVERSED" || reserve.type === "DEBIT") {
    return { ok: true, alreadyFinalized: true };
  }
  if (reserve.type !== "RESERVE") {
    return { ok: false, code: "invalid_reserve_state" };
  }
  await rollbackReserve({
    userId: input.userId,
    amount: input.amount,
    reserveTransactionId: reserve.id,
    idempotencyKey: input.idempotencyKey,
  });
  return { ok: true };
}

/** Pure: whether provider status string is a confirmed failure (never ambiguous). */
export function isConfirmedTransferProviderFailure(status: string): boolean {
  const s = status.toLowerCase();
  const failures = ["failed", "cancelled", "canceled", "rejected", "declined"];
  return failures.some((f) => s.includes(f));
}
