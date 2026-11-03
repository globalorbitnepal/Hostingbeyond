"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  Headphones,
  Menu,
  Monitor,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { routes } from "@/config/routes";
import { panelTitleForPath, getPanelNav } from "@/lib/panel/navigation";

type PanelUser = {
  name: string | null;
  email: string;
  image: string | null;
};

type PanelTheme = "light" | "dark";

type Props = {
  user: PanelUser;
  pathname: string;
  theme: PanelTheme;
  onThemeChange: (theme: PanelTheme) => void;
  onOpenMobileNav: () => void;
};

type SearchTarget = { label: string; href: string; group: string };

function searchTargets(): SearchTarget[] {
  const targets: SearchTarget[] = [
    { label: "Dashboard", href: routes.account, group: "Overview" },
    { label: "Domain portfolio", href: routes.myDomains, group: "Domains" },
    {
      label: "Register a domain",
      href: routes.accountDomainFind,
      group: "Domains",
    },
    {
      label: "Transfer a domain",
      href: routes.accountDomainTransfer,
      group: "Domains",
    },
    { label: "Hosting plans", href: routes.accountHosting, group: "Hosting" },
    {
      label: "Hosting orders",
      href: routes.accountHostingOrders,
      group: "Hosting",
    },
    { label: "Business email", href: routes.accountEmail, group: "Email" },
    { label: "Wallet & top up", href: routes.accountWallet, group: "Billing" },
    { label: "Domain orders", href: routes.accountOrders, group: "Billing" },
    { label: "Invoices", href: routes.accountInvoices, group: "Billing" },
    { label: "Transactions", href: routes.accountBilling, group: "Billing" },
    { label: "Support", href: routes.accountSupport, group: "Support" },
    {
      label: "Security & password",
      href: routes.accountSecurity,
      group: "Account",
    },
  ];

  for (const section of getPanelNav()) {
    for (const item of section.items) {
      if (!item.href || item.soon) continue;
      if (targets.some((target) => target.href === item.href)) continue;
      targets.push({
        label: item.label,
        href: item.href,
        group: section.label,
      });
    }
  }
  return targets;
}

export function PanelHeader({
  user,
  pathname,
  theme,
  onThemeChange,
  onOpenMobileNav,
}: Props) {
  const title = panelTitleForPath(pathname);
  const displayName = user.name?.trim() || user.email.split("@")[0];
  const initial = displayName.charAt(0).toUpperCase();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const allTargets = useMemo(searchTargets, []);
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return allTargets
      .filter((target) => target.label.toLowerCase().includes(needle))
      .slice(0, 6);
  }, [allTargets, query]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuOpen]);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (results[0]) {
      router.push(results[0].href);
    } else if (query.trim()) {
      router.push(
        `${routes.accountDomainFind}?q=${encodeURIComponent(query.trim())}`,
      );
    }
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  }

  return (
    <header className="hb-panel-topbar">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          className="hb-icon-btn lg:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="hb-muted truncate text-[11px] font-semibold tracking-wide uppercase">
            Customer area
          </p>
          <h1 className="hb-h2 truncate">{title}</h1>
        </div>

        <form
          onSubmit={onSubmit}
          className="relative hidden w-full max-w-sm md:block"
          role="search"
        >
          <label className="relative block w-full">
            <span className="sr-only">Search your services</span>
            <Search
              className="hb-faint pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              aria-hidden
            />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => window.setTimeout(() => setOpen(false), 130)}
              placeholder="Search domains, hosting, billing…"
              className="hb-input !rounded-full !py-2 pr-8 pl-9 text-sm"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="hb-faint absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 hover:text-[var(--hb-p-text)]"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </label>
          {open && results.length > 0 ? (
            <ul className="hb-panel-card absolute top-full right-0 left-0 z-40 mt-2 overflow-hidden !rounded-xl p-1">
              {results.map((result) => (
                <li key={`${result.group}-${result.href}-${result.label}`}>
                  <Link
                    href={result.href}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className="hb-text-soft flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--hb-p-primary)]/10"
                  >
                    <span className="truncate">{result.label}</span>
                    <span className="hb-faint shrink-0 text-[10px] font-bold tracking-wide uppercase">
                      {result.group}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </form>

        <div className="hb-segmented" role="group" aria-label="Theme">
          <button
            type="button"
            data-active={theme === "light" ? "true" : "false"}
            onClick={() => onThemeChange("light")}
            aria-label="Cream mode"
            title="Cream mode"
          >
            <Sun className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            data-active={theme === "dark" ? "true" : "false"}
            onClick={() => onThemeChange("dark")}
            aria-label="Dark mode"
            title="Dark mode"
          >
            <Moon className="h-3.5 w-3.5" />
          </button>
        </div>

        <Link
          href={routes.accountSupport}
          className="hb-btn hb-btn-ghost hb-btn-sm hidden sm:inline-flex"
        >
          <Headphones className="h-3.5 w-3.5" />
          Support
        </Link>

        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-[var(--hb-p-border)] py-1 pr-3 pl-1"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((current) => !current);
            }}
          >
            <span
              aria-hidden
              className="grid size-8 place-items-center rounded-full text-xs font-black text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--hb-p-primary-strong), var(--hb-p-accent))",
              }}
            >
              {initial}
            </span>
            <span className="hb-text hidden max-w-[9rem] truncate text-xs font-bold sm:block">
              {displayName}
            </span>
          </button>
          {menuOpen ? (
            <div
              className="hb-panel-card absolute top-full right-0 z-50 mt-2 w-60 !rounded-2xl p-2"
              role="menu"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="border-b border-[var(--hb-p-border)] px-2 pb-2">
                <p className="hb-text truncate text-sm font-bold">
                  {displayName}
                </p>
                <p className="hb-muted truncate text-xs">{user.email}</p>
              </div>
              <div className="mt-1 space-y-0.5">
                <Link
                  href={routes.account}
                  className="hb-text-soft block rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--hb-p-primary)]/10"
                  role="menuitem"
                >
                  Dashboard
                </Link>
                <Link
                  href={routes.accountSecurity}
                  className="hb-text-soft block rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--hb-p-primary)]/10"
                  role="menuitem"
                >
                  Security
                </Link>
                <Link
                  href={routes.accountBilling}
                  className="hb-text-soft block rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--hb-p-primary)]/10"
                  role="menuitem"
                >
                  Billing
                </Link>
                <Link
                  href={routes.accountSupport}
                  className="hb-text-soft block rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--hb-p-primary)]/10"
                  role="menuitem"
                >
                  Support
                </Link>
              </div>
              <div className="mt-2 border-t border-[var(--hb-p-border)] pt-2">
                <LogoutButton />
              </div>
            </div>
          ) : null}
        </div>

        <span className="hb-faint hidden items-center gap-1 text-[11px] font-semibold xl:flex">
          <Bell className="h-3.5 w-3.5" aria-hidden />
          Live
          <ArrowRight className="h-3 w-3" aria-hidden />
          <Monitor className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </header>
  );
}
