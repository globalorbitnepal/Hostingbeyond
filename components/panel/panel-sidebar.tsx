"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight, Star } from "lucide-react";

import { getPanelNav, type PanelNavItem } from "@/lib/panel/navigation";
import { panelNavIcon } from "@/components/panel/panel-nav-icons";
import { cn } from "@/lib/utils";

type Props = {
  pathname: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  trustpilotUrl?: string;
  trustpilotLabel?: string;
};

function isActive(pathname: string, href: string) {
  if (href === "/account") return pathname === "/account";
  if (pathname === href) return true;
  return pathname.startsWith(href + "/");
}

function splitHubSection(items: PanelNavItem[]) {
  const hub = items.find((item) => item.hub);
  const children = items.filter((item) => item.child);
  const rest = items.filter((item) => !item.hub && !item.child);
  const isHubSection = Boolean(hub && children.length > 0);
  return { hub, children, rest, isHubSection };
}

function sectionHasActiveChild(pathname: string, children: PanelNavItem[]) {
  return children.some((item) => item.href && isActive(pathname, item.href));
}

export function PanelSidebar({
  pathname,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
  trustpilotUrl = "",
  trustpilotLabel = "Reviews on Trustpilot",
}: Props) {
  const [openHubs, setOpenHubs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenHubs((prev) => {
      const next = { ...prev };
      for (const section of getPanelNav()) {
        const { children, isHubSection } = splitHubSection(section.items);
        if (!isHubSection) continue;
        if (sectionHasActiveChild(pathname, children)) {
          next[section.id] = true;
        }
      }
      return next;
    });
  }, [pathname]);

  function renderNavItem(
    item: PanelNavItem,
    options?: { child?: boolean; hubActive?: boolean },
  ) {
    const Icon = panelNavIcon(item.id);
    const exact = item.href ? isActive(pathname, item.href) : false;
    const active = item.hub ? Boolean(options?.hubActive) : exact;
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
            (options?.child ?? item.child) &&
              !collapsed &&
              "hb-panel-nav-child",
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
                <span className="hb-panel-badge-soon">{item.tag}</span>
              ) : null}
            </>
          ) : null}
        </Link>
      </li>
    );
  }

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
          "fixed left-0 lg:relative lg:h-full lg:max-h-full lg:self-stretch",
          collapsed
            ? "w-[var(--hb-p-sidebar-collapsed)]"
            : "w-[var(--hb-p-sidebar-w)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        aria-label="Customer navigation"
      >
        <nav className="flex-1 overflow-y-auto px-2.5 pt-3 pb-2">
          {getPanelNav().map((section) => {
            const { hub, children, rest, isHubSection } = splitHubSection(
              section.items,
            );
            const hubOpen = Boolean(openHubs[section.id]);
            const hubActive = sectionHasActiveChild(pathname, children);

            return (
              <div key={section.id} className="hb-panel-nav-group">
                {!collapsed && section.label ? (
                  <p className="hb-panel-nav-label">{section.label}</p>
                ) : null}
                <ul className="space-y-0.5">
                  {isHubSection && hub ? (
                    <>
                      <li>
                        <button
                          type="button"
                          className={cn(
                            "hb-panel-nav-link hb-panel-nav-hub w-full text-left",
                          )}
                          data-active={hubActive ? "true" : "false"}
                          aria-expanded={hubOpen}
                          aria-controls={`panel-hub-${section.id}`}
                          title={hub.label}
                          onClick={() =>
                            setOpenHubs((prev) => ({
                              ...prev,
                              [section.id]: !prev[section.id],
                            }))
                          }
                        >
                          {(() => {
                            const HubIcon = panelNavIcon(hub.id);
                            return (
                              <HubIcon
                                className={cn(
                                  "h-4 w-4 shrink-0",
                                  hubActive ? "opacity-100" : "opacity-70",
                                )}
                              />
                            );
                          })()}
                          {!collapsed ? (
                            <>
                              <span className="truncate">{hub.label}</span>
                              <ChevronDown
                                className={cn(
                                  "ml-auto h-4 w-4 shrink-0 opacity-70 transition-transform duration-200",
                                  hubOpen && "rotate-180",
                                )}
                                aria-hidden
                              />
                            </>
                          ) : null}
                        </button>
                      </li>
                      {hubOpen && !collapsed ? (
                        <li
                          id={`panel-hub-${section.id}`}
                          className="list-none"
                        >
                          <ul
                            className="hb-panel-nav-children space-y-0.5"
                            role="group"
                            aria-label={`${hub.label} links`}
                          >
                            {children.map((child) =>
                              renderNavItem(child, {
                                child: true,
                                hubActive,
                              }),
                            )}
                          </ul>
                        </li>
                      ) : null}
                      {rest.map((item) => renderNavItem(item))}
                    </>
                  ) : (
                    section.items.map((item) => renderNavItem(item))
                  )}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-[var(--hb-p-border)] p-2.5">
          {trustpilotUrl ? (
            <a
              href={trustpilotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hb-panel-feedback mb-2"
              title={trustpilotLabel}
              onClick={onCloseMobile}
            >
              <span className="hb-panel-feedback__mark" aria-hidden>
                <Star className="size-3.5" strokeWidth={2.4} />
              </span>
              {!collapsed ? (
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-extrabold tracking-tight">
                    {trustpilotLabel}
                  </span>
                  <span className="hb-muted block truncate text-[11px] font-semibold">
                    Leave a review
                  </span>
                </span>
              ) : null}
            </a>
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
      </aside>
    </>
  );
}
