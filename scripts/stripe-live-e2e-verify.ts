/**
 * Live Stripe TEST mode verification (requires sk_test_ + whsec_ in .env).
 * Does not print secrets. Does not credit from redirect — only exercises Checkout create + optional webhook replay.
 */
import "dotenv/config";

import assert from "node:assert/strict";

import { processDomainRegistrationCheckout } from "@/lib/domains/registration-service";
import { ensureCustomerWallet } from "@/lib/domains/wallet";
import { prisma } from "@/lib/prisma";
import {
  createWalletTopUpCheckoutSession,
  handleCheckoutSessionCompleted,
} from "@/lib/payments/wallet-payment-service";
import { getStripeClient } from "@/lib/payments/stripe-config";

const EMAIL = "stripe-live-e2e@hostingbeyond.local";

function configured(): boolean {
  const sk = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  const wh = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  return sk.startsWith("sk_test_") && wh.startsWith("whsec_");
}

async function main() {
  if (!configured()) {
    console.log(
      JSON.stringify({
        ok: false,
        reason: "stripe_test_credentials_missing",
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY?.trim()?.startsWith(
          "sk_test_",
        )
          ? "CONFIGURED"
          : "NOT_CONFIGURED",
        STRIPE_WEBHOOK_SECRET:
          process.env.STRIPE_WEBHOOK_SECRET?.trim()?.startsWith("whsec_")
            ? "CONFIGURED"
            : "NOT_CONFIGURED",
      }),
    );
    process.exit(2);
  }

  const user = await prisma.customerUser.upsert({
    where: { email: EMAIL },
    create: { email: EMAIL, name: "Stripe Live E2E" },
    update: {},
  });
  await ensureCustomerWallet(user.id);

  const amount = 30;
  const sessionResult = await createWalletTopUpCheckoutSession({
    userId: user.id,
    amount,
    idempotencyKey: `live-e2e-${Date.now()}`,
  });
  assert.equal(sessionResult.ok, true);
  if (!sessionResult.ok) throw new Error("checkout_create_failed");

  const payment = await prisma.walletPayment.findFirst({
    where: { publicId: sessionResult.paymentPublicId },
  });
  assert.ok(payment?.providerCheckoutSessionId);

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(
    payment!.providerCheckoutSessionId!,
  );

  console.log(
    JSON.stringify({
      step: "checkout_created",
      paymentPublicId: payment!.publicId,
      sessionStatus: session.status,
      checkoutUrlPresent: Boolean(session.url),
      note: "Complete payment in browser with test card 4242424242424242, then run webhook replay or wait for Stripe CLI forward",
    }),
  );

  if (session.payment_status === "paid") {
    const hook = await handleCheckoutSessionCompleted(session);
    assert.equal(hook.ok, true);
    const wallet = await prisma.customerWallet.findUnique({
      where: { userId: user.id },
    });
    console.log(
      JSON.stringify({
        step: "wallet_credited",
        balance: Number(wallet?.balance ?? 0),
      }),
    );

    const domain = `hbstripe-${Date.now().toString(36)}.com`;
    const reg = await processDomainRegistrationCheckout({
      userId: user.id,
      userEmail: EMAIL,
      domainInput: domain,
      idempotencyKey: `stripe-reg-${Date.now()}`,
    });
    console.log(
      JSON.stringify({
        step: "domain_registration",
        ok: reg.ok,
        orderStatus: reg.ok ? reg.order.status : undefined,
        error: !reg.ok ? reg.error : undefined,
      }),
    );
  }

  console.log(JSON.stringify({ ok: true }));
}

main().catch((error) => {
  console.error(
    JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exit(1);
});
