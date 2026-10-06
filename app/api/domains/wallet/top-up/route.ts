import { NextResponse } from "next/server";

import {
  readIdempotencyKey,
  requireCustomerSession,
} from "@/lib/domains/require-customer";
import { createWalletTopUpCheckoutSession } from "@/lib/payments/wallet-payment-service";

export const runtime = "nodejs";

type Body = { amount?: number };

export async function POST(request: Request) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  const amount = Number(body?.amount);
  const idempotencyKey = readIdempotencyKey(request);

  const result = await createWalletTopUpCheckoutSession({
    userId: user.id,
    amount,
    idempotencyKey: `topup:${user.id}:${idempotencyKey}`,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        status: result.status,
        message: result.message,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    status: result.status,
    checkoutUrl: result.checkoutUrl,
    paymentPublicId: result.paymentPublicId,
  });
}
