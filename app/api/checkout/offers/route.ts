import { NextResponse } from "next/server";

import { getDomainCheckoutOffers } from "@/lib/domains/domain-checkout-offers";
import { isPaymentProviderConfigured } from "@/lib/domains/wallet-top-up";
import { getOAuthProvider } from "@/lib/customer/oauth";

/** Public catalog offers for cart add-ons (prices from product DB). */
export async function GET() {
  const offers = await getDomainCheckoutOffers();
  const google = getOAuthProvider("google");
  return NextResponse.json({
    offers,
    payment: {
      walletCheckout: true,
      stripeWalletTopUp: isPaymentProviderConfigured(),
      khalti: false,
      himalayanBank: false,
    },
    auth: {
      googleOAuth: google.configured,
      emailPassword: true,
    },
  });
}
