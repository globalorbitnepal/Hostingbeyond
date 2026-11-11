"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { BeyondMasterAiHost } from "@/components/beyond-master/beyond-master-ai";
import { PanelAiAskBar } from "@/components/panel/panel-ai-ask-bar";
import { PanelHeader } from "@/components/panel/panel-header";
import { PanelSidebar } from "@/components/panel/panel-sidebar";

type PanelUser = {
  name: string | null;
  email: string;
  image: string | null;
  hasPassword?: boolean;
};

type PanelTheme = "light" | "dark";

const THEME_KEY = "hb-panel-theme";
const SIDEBAR_KEY = "hb-panel-sidebar-collapsed";

export function PanelAccountChrome({
  user,
  children,
  trustpilotUrl = "",
  trustpilotLabel = "Reviews on Trustpilot",
}: {
  user: PanelUser;
  children: React.ReactNode;
  trustpilotUrl?: string;
  trustpilotLabel?: string;
}) {
  const pathname = usePathname() ?? "/account";
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarReady, setSidebarReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<PanelTheme>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      return;
    }
    const bootstrapped = document.documentElement.dataset.hbTheme;
    if (bootstrapped === "dark" || bootstrapped === "light") {
      setTheme(bootstrapped);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.hbTheme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(SIDEBAR_KEY) === "1");
    setSidebarReady(true);
  }, []);

  useEffect(() => {
    if (!sidebarReady) return;
    window.localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
  }, [collapsed, sidebarReady]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const applyTheme = useCallback((next: PanelTheme) => setTheme(next), []);

  return (
    <div
      className="hb-panel hb-panel--ultra flex min-h-dvh flex-col"
      data-theme={theme}
      data-panel-shell="ultra-v2"
      style={{
        ["--hb-p-sidebar-current" as string]: collapsed
          ? "var(--hb-p-sidebar-collapsed)"
          : "var(--hb-p-sidebar-w)",
      }}
    >
      <PanelHeader
        user={user}
        pathname={pathname}
        theme={theme}
        onThemeChange={applyTheme}
        onOpenMobileNav={() => setMobileOpen(true)}
      />
      <div className="hb-panel__shell flex min-h-0 flex-1">
        <PanelSidebar
          pathname={pathname}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          trustpilotUrl={trustpilotUrl}
          trustpilotLabel={trustpilotLabel}
        />
        <div className="hb-panel__main flex min-h-0 min-w-0 flex-1 flex-col">
          <main className="hb-panel__scroll flex-1 overflow-y-auto px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
            {children}
          </main>
          <div className="hb-ds-ask-dock">
            <PanelAiAskBar />
          </div>
          <BeyondMasterAiHost hideLauncher force />
        </div>
      </div>
    </div>
  );
}
