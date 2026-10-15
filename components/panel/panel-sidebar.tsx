"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PANEL_NAV } from "@/lib/panel/navigation";
import { panelNavIcon } from "@/components/panel/panel-nav-icons";
import { cn } from "@/lib/utils";

type Props = {
  pathname: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

function isActive(pathname: string, href: string) {
  if (href === "/account") return pathname === "/account";
  if (pathname === href) return true;
  if (pathname.startsWith(href + "/")) return true;
  return false;
}

export function PanelSidebar({
  pathname,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}: Props) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!mobileOpen}
        onClick={onCloseMobile}
      />
      <aside
        className={cn(
          "hb-panel-card z-50 flex h-dvh shrink-0 flex-col border-r bg-white transition-[width,transform] duration-200",
          "fixed top-0 left-0 lg:sticky lg:top-0 lg:self-start",
          collapsed
            ? "w-[var(--hb-p-sidebar-collapsed)]"
            : "w-[var(--hb-p-sidebar-w)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        aria-label="Customer navigation"
      >
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-[var(--hb-p-border)] px-3",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {!collapsed ? (
            <span className="font-heading text-sm font-bold tracking-tight text-[var(--hb-p-primary-deep)]">
              HostingBeyond
            </span>
          ) : null}
          <button
            type="button"
            className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:inline-flex"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {PANEL_NAV.map((section) => (
            <div key={section.id} className="mb-5">
              {!collapsed ? (
                <p className="mb-2 px-2 text-[10px] font-bold tracking-[0.14em] text-slate-400 uppercase">
                  {section.label}
                </p>
              ) : null}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = panelNavIcon(item.id);
                  const active = item.href
                    ? isActive(pathname, item.href)
                    : false;
                  if (item.soon || !item.href) {
                    return (
                      <li key={item.id}>
                        <span
                          className="hb-panel-nav-link"
                          data-soon="true"
                          title={item.label}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-[var(--hb-p-primary)]" />
                          {!collapsed ? (
                            <>
                              <span className="truncate">{item.label}</span>
                              <span className="hb-panel-badge-soon">Soon</span>
                            </>
                          ) : null}
                        </span>
                      </li>
                    );
                  }
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="hb-panel-nav-link"
                        data-active={active ? "true" : "false"}
                        title={item.label}
                        onClick={onCloseMobile}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-[var(--hb-p-primary)]" />
                        {!collapsed ? (
                          <span className="truncate">{item.label}</span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
