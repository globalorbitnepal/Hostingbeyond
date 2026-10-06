import { NextResponse } from "next/server";

import { requireCustomerSession } from "@/lib/domains/require-customer";
import { ensureCustomerWallet } from "@/lib/domains/wallet";
import {
  listWalletPaymentsForUser,
  listWalletTransactionsForUser,
} from "@/lib/payments/wallet-payment-service";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const wallet = await ensureCustomerWallet(user.id);
  const [transactions, payments] = await Promise.all([
    listWalletTransactionsForUser(user.id),
    listWalletPaymentsForUser(user.id),
  ]);

  return NextResponse.json({
    balance: Number(wallet.balance),
    currency: wallet.currency,
    transactions: transactions.map((row) => ({
      id: row.id,
      type: row.type,
      status: row.status,
      amount: Number(row.amount),
      currency: row.currency,
      balanceAfter: row.balanceAfter != null ? Number(row.balanceAfter) : null,
      note: row.note,
      createdAt: row.createdAt.toISOString(),
    })),
    payments: payments.map((row) => ({
      publicId: row.publicId,
      amount: Number(row.amount),
      currency: row.currency,
      status: row.status,
      failureReason: row.failureReason,
      createdAt: row.createdAt.toISOString(),
      completedAt: row.completedAt?.toISOString() ?? null,
    })),
  });
}
