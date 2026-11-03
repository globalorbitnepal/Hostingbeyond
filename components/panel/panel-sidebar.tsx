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
          "hb-panel-sidebar z-50 flex h-dvh shrink-0 flex-col transition-[width,transform] duration-200",
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
            "flex h-16 shrink-0 items-center border-b border-[var(--hb-p-border)] px-3",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {!collapsed ? (
            <Link
              href="/account"
              className="flex items-center gap-2"
              onClick={onCloseMobile}
            >
              <span
                aria-hidden
                className="grid size-8 place-items-center rounded-xl text-sm font-black text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--hb-p-primary-strong), var(--hb-p-accent))",
                }}
              >
                H
              </span>
              <span className="font-heading text-sm font-bold tracking-tight text-[var(--hb-p-text)]">
                HostingBeyond
              </span>
            </Link>
          ) : null}
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
          {getPanelNav().map((section) => (
            <div key={section.id} className="mb-5">
              {!collapsed ? (
                <p className="hb-eyebrow mb-2 px-2">{section.label}</p>
              ) : null}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = panelNavIcon(item.id);
                  const active = item.href
                    ? isActive(pathname, item.href)
                    : false;
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
                          item.child && !collapsed && "hb-panel-nav-child",
                        )}
                        data-active={active ? "true" : "false"}
                        title={item.label}
                        onClick={onCloseMobile}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            active ? "opacity-100" : "opacity-70",
                          )}
                        />
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
          ))}
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
