import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function ensureCustomerWallet(userId: string) {
  return prisma.customerWallet.upsert({
    where: { userId },
    create: { userId, balance: 0, currency: "USD" },
    update: {},
  });
}

export async function creditWallet(input: {
  userId: string;
  amount: number;
  idempotencyKey?: string;
  note?: string;
  referenceType?: string;
  referenceId?: string;
}) {
  if (input.amount <= 0) throw new Error("invalid_amount");
  return prisma.$transaction(async (tx) => {
    if (input.idempotencyKey) {
      const existing = await tx.walletTransaction.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) return existing;
    }
    const wallet = await tx.customerWallet.upsert({
      where: { userId: input.userId },
      create: { userId: input.userId, balance: 0 },
      update: {},
    });
    const next = wallet.balance.add(new Prisma.Decimal(input.amount));
    await tx.customerWallet.update({
      where: { id: wallet.id },
      data: { balance: next },
    });
    return tx.walletTransaction.create({
      data: {
        userId: input.userId,
        type: "CREDIT",
        status: "COMPLETED",
        amount: input.amount,
        balanceAfter: next,
        idempotencyKey: input.idempotencyKey,
        note: input.note,
        referenceType: input.referenceType ?? "manual_credit",
        referenceId: input.referenceId,
      },
    });
  });
}

/** Holds funds — not captured until finalizeReserve. */
export async function reserveWalletFunds(input: {
  userId: string;
  amount: number;
  idempotencyKey: string;
  referenceType: string;
  referenceId: string;
}) {
  if (input.amount <= 0) throw new Error("insufficient_funds");
  return prisma.$transaction(async (tx) => {
    const existing = await tx.walletTransaction.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });
    if (existing) return existing;

    const wallet = await tx.customerWallet.findUnique({
      where: { userId: input.userId },
    });
    if (!wallet || wallet.balance.lessThan(input.amount)) {
      throw new Error("insufficient_funds");
    }
    const next = wallet.balance.sub(new Prisma.Decimal(input.amount));
    await tx.customerWallet.update({
      where: { id: wallet.id },
      data: { balance: next },
    });
    return tx.walletTransaction.create({
      data: {
        userId: input.userId,
        type: "RESERVE",
        status: "COMPLETED",
        amount: input.amount,
        balanceAfter: next,
        idempotencyKey: input.idempotencyKey,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        note: "Domain checkout reserve",
      },
    });
  });
}

/** Converts reserve into spend (already deducted from balance on reserve). */
export async function finalizeReserve(input: {
  userId: string;
  reserveTransactionId: string;
}) {
  return prisma.walletTransaction.update({
    where: { id: input.reserveTransactionId },
    data: { type: "DEBIT", note: "Domain purchase finalized" },
  });
}

/** Returns reserved funds after known failure. */
export async function rollbackReserve(input: {
  userId: string;
  amount: number;
  reserveTransactionId: string;
  idempotencyKey: string;
}) {
  return prisma.$transaction(async (tx) => {
    const releaseKey = `${input.idempotencyKey}:release`;
    const existing = await tx.walletTransaction.findUnique({
      where: { idempotencyKey: releaseKey },
    });
    if (existing) return existing;

    const wallet = await tx.customerWallet.findUnique({
      where: { userId: input.userId },
    });
    if (!wallet) throw new Error("wallet_missing");
    const next = wallet.balance.add(new Prisma.Decimal(input.amount));
    await tx.customerWallet.update({
      where: { id: wallet.id },
      data: { balance: next },
    });
    await tx.walletTransaction.update({
      where: { id: input.reserveTransactionId },
      data: { status: "REVERSED" },
    });
    return tx.walletTransaction.create({
      data: {
        userId: input.userId,
        type: "RELEASE",
        status: "COMPLETED",
        amount: input.amount,
        balanceAfter: next,
        idempotencyKey: releaseKey,
        referenceId: input.reserveTransactionId,
        referenceType: "wallet_release",
        note: "Checkout rollback",
      },
    });
  });
}
