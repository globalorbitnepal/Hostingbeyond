import { NextResponse } from "next/server";

import { processStripeWalletWebhook } from "@/lib/payments/wallet-payment-service";

export const runtime = "nodejs";

/** Stripe wallet top-up webhook — credits wallet only after signature + amount verification. */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  const result = await processStripeWalletWebhook({
    rawBody,
    signature,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ received: true, handled: result.handled });
}
