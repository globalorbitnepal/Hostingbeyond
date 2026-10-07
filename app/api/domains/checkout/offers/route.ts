import { NextResponse } from "next/server";

import { getDomainCheckoutOffers } from "@/lib/domains/domain-checkout-offers";
import { requireCustomerSession } from "@/lib/domains/require-customer";

export async function GET() {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const offers = await getDomainCheckoutOffers();
  return NextResponse.json(offers);
}
