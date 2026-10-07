"use client";

import { DomainCartDrawer } from "@/components/domains/domain-cart-drawer";
import { DomainCartProvider } from "@/components/domains/domain-cart-provider";

export function DomainCartShell({ children }: { children: React.ReactNode }) {
  return (
    <DomainCartProvider>
      {children}
      <DomainCartDrawer />
    </DomainCartProvider>
  );
}
