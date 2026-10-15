import { NextResponse } from "next/server";

import { getDomainCheckoutOffers } from "@/lib/domains/domain-checkout-offers";
import { isPaymentProviderConfigured } from "@/lib/domains/wallet-top-up";
import { customerAuthHints } from "@/lib/customer/oauth-availability";

/** Public catalog offers for cart add-ons (prices from product DB). */
export async function GET() {
  const offers = await getDomainCheckoutOffers();
  const auth = customerAuthHints();
  return NextResponse.json({
    offers,
    payment: {
      walletCheckout: true,
      stripeWalletTopUp: isPaymentProviderConfigured(),
      khalti: false,
      himalayanBank: false,
    },
    auth: {
      googleOAuth: auth.googleOAuth,
      emailPassword: auth.emailPassword,
    },
  });
}
