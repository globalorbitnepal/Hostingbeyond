import { Suspense } from "react";

import { PanelDomainFinder } from "@/components/panel/panel-domain-finder";

export default function AccountDomainFindPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-[var(--hb-p-muted)]">Loading search…</p>
      }
    >
      <PanelDomainFinder />
    </Suspense>
  );
}
