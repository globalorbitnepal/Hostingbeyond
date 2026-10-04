import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";

import { HostingCartCheckoutView } from "@/components/hosting/hosting-cart-checkout-view";
import { HostingCheckoutInvalid } from "@/components/hosting/hosting-checkout-view";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { loadCartAddonUiModels } from "@/lib/hosting/addons/load-cart-ui";
import { quoteHostingCart } from "@/lib/hosting/cart/pricing";
import { getHostingProductBySlug } from "@/lib/hosting/hosting-products";
import { parseHostingPurchaseIntentFromRecord } from "@/lib/hosting/purchase-intent";
import { validateHostingPurchaseIntent } from "@/lib/hosting/validate-purchase-intent";
import { getSiteSettings } from "@/lib/orbit/content";

export const metadata: Metadata = {
  title: "Configure hosting — HostingBeyond",
  description:
    "Configure your HostingBeyond web hosting plan, billing, and add-ons.",
  robots: { index: false, follow: true },
};

export default async function HostingCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const parsed = parseHostingPurchaseIntentFromRecord(params);
  if (!parsed) {
    return <HostingCheckoutInvalid />;
  }

  const intent = await validateHostingPurchaseIntent(parsed);
  if (!intent) {
    return <HostingCheckoutInvalid />;
  }

  const product = await getHostingProductBySlug(intent.product);
  if (!product || product.status !== "ACTIVE") {
    return <HostingCheckoutInvalid />;
  }

  const plan = product.plans.find((p) => p.active && p.planKey === intent.plan);
  if (!plan) {
    return <HostingCheckoutInvalid />;
  }

  const initialQuote = await quoteHostingCart({
    productSlug: intent.product,
    planKey: intent.plan,
    billingPeriod: intent.billing,
  });

  if (!initialQuote.planName) {
    return <HostingCheckoutInvalid />;
  }

  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );

  const [cartAddons, settings] = await Promise.all([
    loadCartAddonUiModels({
      productSlug: product.slug,
      productCategory: product.category,
      planKey: plan.planKey,
    }),
    getSiteSettings(),
  ]);

  return (
    <Suspense>
      <HostingCartCheckoutView
        intent={intent}
        initialQuote={initialQuote}
        cartAddons={cartAddons}
        logoPath={settings.logoPath}
        isLoggedIn={Boolean(user)}
        billingMonthlyEnabled={product.billingMonthlyEnabled}
        billingYearlyEnabled={product.billingYearlyEnabled}
      />
    </Suspense>
  );
}
