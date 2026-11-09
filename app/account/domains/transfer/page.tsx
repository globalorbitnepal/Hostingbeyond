import { Suspense } from "react";

import { PanelDomainTransfer } from "@/components/panel/panel-domain-transfer";
import { loadFeaturedDomainTlds } from "@/lib/panel/live-domain-tlds";

export const dynamic = "force-dynamic";

export default async function AccountDomainTransferPage() {
  const featuredTlds = await loadFeaturedDomainTlds();
  return (
    <Suspense
      fallback={
        <p className="text-sm text-[var(--hb-p-muted)]">Loading transfer…</p>
      }
    >
      <PanelDomainTransfer featuredTlds={featuredTlds} />
    </Suspense>
  );
}
