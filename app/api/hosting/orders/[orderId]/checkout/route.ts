import { NextResponse } from "next/server";

import { requireCustomerSession } from "@/lib/domains/require-customer";
import { readIdempotencyKey } from "@/lib/domains/require-customer";
import { createHostingOrderStripeCheckout } from "@/lib/hosting/hosting-order-stripe-payment";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { orderId } = await context.params;
  if (!orderId || orderId.length > 64) {
    return NextResponse.json({ error: "Invalid order." }, { status: 400 });
  }

  const idempotencyKey = readIdempotencyKey(request);

  const result = await createHostingOrderStripeCheckout({
    orderId,
    userId: user.id,
    idempotencyKey,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ ok: true, checkoutUrl: result.checkoutUrl });
}
