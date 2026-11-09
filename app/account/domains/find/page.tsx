import { Suspense } from "react";

import { PanelDomainFinder } from "@/components/panel/panel-domain-finder";
import { loadPanelDomainTldCatalog } from "@/lib/panel/live-domain-tlds";

export const dynamic = "force-dynamic";

export default async function AccountDomainFindPage() {
  const { featured, live } = await loadPanelDomainTldCatalog();
  return (
    <Suspense
      fallback={
        <p className="text-sm text-[var(--hb-p-muted)]">Loading search…</p>
      }
    >
      <PanelDomainFinder featuredTlds={featured} liveTlds={live} />
    </Suspense>
  );
}
