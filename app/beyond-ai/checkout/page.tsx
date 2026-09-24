import type { Metadata } from "next";
import { Suspense } from "react";

import { BeyondAiCheckoutView } from "@/components/beyond-ai/beyond-ai-checkout-view";
import { getSiteSettings } from "@/lib/orbit/content";

export const metadata: Metadata = {
  title: "Beyond AI checkout — HostingBeyond",
  description:
    "Subscribe to Beyond AI — model balance, free hosting, and on-demand credits on HostingBeyond.",
  robots: { index: false, follow: false },
};

function CheckoutInner({
  plan,
  logoPath,
}: {
  plan: string | undefined;
  logoPath?: string;
}) {
  return <BeyondAiCheckoutView planId={plan} logoPath={logoPath} />;
}

export default async function BeyondAiCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const params = await searchParams;
  const settings = await getSiteSettings();

  return (
    <Suspense>
      <CheckoutInner plan={params.plan} logoPath={settings.logoPath} />
    </Suspense>
  );
}
