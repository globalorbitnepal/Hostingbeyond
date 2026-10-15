"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import { PanelHeader } from "@/components/panel/panel-header";
import { PanelSidebar } from "@/components/panel/panel-sidebar";

type PanelUser = {
  name: string | null;
  email: string;
  image: string | null;
};

export function PanelAccountChrome({
  user,
  children,
}: {
  user: PanelUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "/account";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="hb-panel flex min-h-dvh">
      <PanelSidebar
        pathname={pathname}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="hb-panel__main flex min-h-dvh flex-col lg:min-w-0">
        <PanelHeader
          user={user}
          pathname={pathname}
          onOpenMobileNav={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
