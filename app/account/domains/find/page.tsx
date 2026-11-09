import { Suspense } from "react";

import { PanelDomainFinder } from "@/components/panel/panel-domain-finder";
import { loadFeaturedDomainTlds } from "@/lib/panel/featured-domain-tlds";

export default async function AccountDomainFindPage() {
  const featuredTlds = await loadFeaturedDomainTlds();
  return (
    <Suspense
      fallback={
        <p className="text-sm text-[var(--hb-p-muted)]">Loading search…</p>
      }
    >
      <PanelDomainFinder featuredTlds={featuredTlds} />
    </Suspense>
  );
}
