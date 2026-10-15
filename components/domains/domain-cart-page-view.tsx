"use client";

import { Suspense } from "react";

import { PremiumCartJourney } from "@/components/checkout/premium-cart-journey";

function CartJourneyFallback() {
  return (
    <div className="hb-checkout-premium min-h-[40vh] px-4 py-12 text-center text-[var(--hb-co-text-muted)]">
      Loading cart…
    </div>
  );
}

export function DomainCartPageView() {
  return (
    <Suspense fallback={<CartJourneyFallback />}>
      <PremiumCartJourney />
    </Suspense>
  );
}
