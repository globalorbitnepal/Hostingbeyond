"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { PanelHeader } from "@/components/panel/panel-header";
import { PanelSidebar } from "@/components/panel/panel-sidebar";

type PanelUser = {
  name: string | null;
  email: string;
  image: string | null;
};

type PanelTheme = "light" | "dark";

const THEME_KEY = "hb-panel-theme";

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
      return;
    }
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.hbTheme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const applyTheme = useCallback((next: PanelTheme) => setTheme(next), []);

  return (
    <div className="hb-panel flex min-h-dvh" data-theme={theme}>
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
          theme={theme}
          onThemeChange={applyTheme}
          onOpenMobileNav={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
