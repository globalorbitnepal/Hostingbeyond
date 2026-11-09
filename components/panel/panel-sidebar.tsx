"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { getPanelNav } from "@/lib/panel/navigation";
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
  return pathname.startsWith(href + "/");
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
          "fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!mobileOpen}
        onClick={onCloseMobile}
      />
      <aside
        className={cn(
          "hb-panel-sidebar hb-panel-sidebar--dock z-50 flex shrink-0 flex-col transition-[width,transform] duration-200",
          "fixed left-0 lg:sticky lg:top-0 lg:max-h-full lg:self-stretch",
          collapsed
            ? "w-[var(--hb-p-sidebar-collapsed)]"
            : "w-[var(--hb-p-sidebar-w)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        aria-label="Customer navigation"
      >
        <div
          className={cn(
            "flex h-11 shrink-0 items-center border-b border-[var(--hb-p-border)] px-2",
            collapsed ? "justify-center" : "justify-end",
          )}
        >
          <button
            type="button"
            className="hb-icon-btn hidden lg:inline-flex"
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
          {getPanelNav().map((section) => {
            const hubActive = section.items.some(
              (item) => item.href && isActive(pathname, item.href),
            );
            return (
              <div key={section.id} className="mb-5">
                {!collapsed && section.label ? (
                  <p className="hb-eyebrow mb-2 px-2">{section.label}</p>
                ) : null}
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = panelNavIcon(item.id);
                    const exact = item.href
                      ? isActive(pathname, item.href)
                      : false;
                    const active = item.hub ? hubActive : exact;
                    if (collapsed && item.child) return null;
                    if (!item.href) {
                      return (
                        <li key={item.id}>
                          <span
                            className="hb-panel-nav-link"
                            data-soon="true"
                            title={item.label}
                          >
                            <Icon className="h-4 w-4 shrink-0 opacity-70" />
                            {!collapsed ? (
                              <>
                                <span className="truncate">{item.label}</span>
                                <span className="hb-panel-badge-soon">
                                  {item.tag ?? "Soon"}
                                </span>
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
                          className={cn(
                            "hb-panel-nav-link",
                            item.hub && "hb-panel-nav-hub",
                            item.child && !collapsed && "hb-panel-nav-child",
                          )}
                          data-active={active ? "true" : "false"}
                          title={item.label}
                          onClick={onCloseMobile}
                          aria-current={exact ? "page" : undefined}
                        >
                          {item.child && !collapsed ? null : (
                            <Icon
                              className={cn(
                                "h-4 w-4 shrink-0",
                                active ? "opacity-100" : "opacity-70",
                              )}
                            />
                          )}
                          {!collapsed ? (
                            <>
                              <span className="truncate">{item.label}</span>
                              {item.tag ? (
                                <span className="hb-panel-badge-soon">
                                  {item.tag}
                                </span>
                              ) : null}
                            </>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {!collapsed ? (
          <div className="border-t border-[var(--hb-p-border)] p-3">
            <Link
              href="/account/support"
              className="hb-muted flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-[var(--hb-p-primary)]/10"
              onClick={onCloseMobile}
            >
              24/7 support — open a ticket
            </Link>
          </div>
        ) : null}
      </aside>
    </>
  );
}
