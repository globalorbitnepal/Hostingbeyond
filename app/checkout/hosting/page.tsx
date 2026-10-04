import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import {
  HostingCheckoutInvalid,
  HostingCheckoutView,
} from "@/components/hosting/hosting-checkout-view";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import {
  parseHostingPurchaseIntentFromRecord,
  signupPathForHostingIntent,
} from "@/lib/hosting/purchase-intent";
import { resolveHostingPurchaseContext } from "@/lib/hosting/resolve-purchase-context";
import { getSiteSettings } from "@/lib/orbit/content";

export const metadata: Metadata = {
  title: "Hosting checkout — HostingBeyond",
  description: "Review your selected HostingBeyond plan before checkout.",
  robots: { index: false, follow: false },
};

export default async function HostingCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const intent = parseHostingPurchaseIntentFromRecord(params);
  if (!intent) {
    return <HostingCheckoutInvalid />;
  }

  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) {
    redirect(signupPathForHostingIntent(intent));
  }

  const context = await resolveHostingPurchaseContext(intent);
  if (!context) {
    return <HostingCheckoutInvalid />;
  }

  const settings = await getSiteSettings();

  return (
    <Suspense>
      <HostingCheckoutView context={context} logoPath={settings.logoPath} />
    </Suspense>
  );
}
