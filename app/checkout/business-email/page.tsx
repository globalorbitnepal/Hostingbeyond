import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";

import { BusinessEmailCartCheckoutView } from "@/components/business-email/business-email-cart-checkout-view";
import { BusinessEmailCheckoutInvalid } from "@/components/business-email/business-email-checkout-invalid";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { parseEmailPurchaseIntentFromRecord } from "@/lib/business-email/purchase-intent";
import type { EmailHostingAddonOffer } from "@/lib/business-email/quote-email-cart";
import { extrasFromSiteSettings } from "@/lib/domains/domain-extras";
import { availableEmailTermsForPlan } from "@/lib/hosting/business-email-term-pricing";
import { getHostingProductBySlug } from "@/lib/hosting/hosting-products";
import {
  getBusinessEmailPageContent,
  getSiteSettings,
} from "@/lib/orbit/content";

export const metadata: Metadata = {
  title: "Book Business Email — HostingBeyond",
  description:
    "Four-step HostingBeyond booking: mailbox plan, domain, add-ons, and payment.",
  robots: { index: false, follow: true },
};

export default async function BusinessEmailCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const intent = parseEmailPurchaseIntentFromRecord(params);
  if (!intent) {
    return <BusinessEmailCheckoutInvalid />;
  }

  const [emailContent, settings] = await Promise.all([
    getBusinessEmailPageContent(),
    getSiteSettings(),
  ]);

  const visiblePlans = emailContent.plans.filter((p) => p.visible);
  const plan =
    visiblePlans.find((p) => p.id === intent.plan) ??
    visiblePlans.find((p) => p.id === intent.plan.toLowerCase());

  if (!plan) {
    return <BusinessEmailCheckoutInvalid />;
  }

  if (!availableEmailTermsForPlan(plan).includes(intent.term)) {
    return <BusinessEmailCheckoutInvalid />;
  }

  const extras = extrasFromSiteSettings(settings);
  const webHosting = await getHostingProductBySlug("web-hosting");
  let hostingOffer: EmailHostingAddonOffer | null = null;
  if (webHosting?.status === "ACTIVE") {
    const entryPlan =
      webHosting.plans.find((p) => p.active && p.planKey === "essential") ??
      webHosting.plans.find((p) => p.active);
    if (entryPlan) {
      hostingOffer = {
        productSlug: webHosting.slug,
        planKey: entryPlan.planKey,
        planName: entryPlan.planName,
        monthlyUsd: Number(entryPlan.monthlyPrice) || 0,
        yearlyUsd: Number(entryPlan.yearlyPrice) || 0,
        billingMonthlyEnabled: webHosting.billingMonthlyEnabled,
        billingYearlyEnabled: webHosting.billingYearlyEnabled,
      };
    }
  }

  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );

  return (
    <Suspense>
      <BusinessEmailCartCheckoutView
        intent={intent}
        plan={plan}
        visiblePlans={visiblePlans}
        extras={extras}
        hostingOffer={hostingOffer}
        logoPath={settings.logoPath}
        isLoggedIn={Boolean(user)}
      />
    </Suspense>
  );
}
