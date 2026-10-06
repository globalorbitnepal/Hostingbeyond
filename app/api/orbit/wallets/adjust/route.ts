import { NextResponse } from "next/server";

import { requireOrbitAdmin } from "@/lib/orbit/api";
import {
  adminAdjustCustomerWallet,
  adminReverseWalletCredit,
} from "@/lib/payments/wallet-payment-service";

export const runtime = "nodejs";

type Body = {
  action?: "adjust" | "reverse";
  userId?: string;
  direction?: "credit" | "debit";
  amount?: number;
  reason?: string;
  idempotencyKey?: string;
  walletTransactionId?: string;
};

export async function POST(request: Request) {
  const admin = await requireOrbitAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  const action = body?.action ?? "adjust";
  const idempotencyKey =
    body?.idempotencyKey?.trim() || crypto.randomUUID().slice(0, 24);

  try {
    if (action === "reverse") {
      const walletTransactionId = body?.walletTransactionId?.trim();
      const reason = body?.reason?.trim() ?? "";
      if (!walletTransactionId || !reason) {
        return NextResponse.json(
          { error: "Transaction id and reason required." },
          { status: 400 },
        );
      }
      const tx = await adminReverseWalletCredit({
        adminUserId: admin.id,
        walletTransactionId,
        reason,
        idempotencyKey,
      });
      return NextResponse.json({ ok: true, transaction: tx });
    }

    const userId = body?.userId?.trim();
    const direction = body?.direction;
    const amount = Number(body?.amount);
    const reason = body?.reason?.trim() ?? "";
    if (
      !userId ||
      (direction !== "credit" && direction !== "debit") ||
      !reason
    ) {
      return NextResponse.json(
        { error: "userId, direction, amount, and reason required." },
        { status: 400 },
      );
    }

    const tx = await adminAdjustCustomerWallet({
      adminUserId: admin.id,
      userId,
      direction,
      amount,
      reason,
      idempotencyKey,
    });
    return NextResponse.json({ ok: true, transaction: tx });
  } catch (error) {
    const message = error instanceof Error ? error.message : "adjust_failed";
    const status =
      message === "insufficient_funds" || message === "invalid_amount"
        ? 400
        : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
