"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Headphones, Menu, Moon, Search, Sun, X } from "lucide-react";

import { BrandMark } from "@/components/auth/brand-mark";
import { LogoutButton } from "@/components/auth/logout-button";
import { routes } from "@/config/routes";
import { panelTitleForPath, getPanelNav } from "@/lib/panel/navigation";
import { cn } from "@/lib/utils";

type PanelUser = {
  name: string | null;
  email: string;
  image: string | null;
};

type Props = {
  user: PanelUser;
  pathname: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenMobileNav: () => void;
};

type SearchTarget = { label: string; href: string; group: string };

/** Everything a customer can jump to from the panel search box. */
function searchTargets(): SearchTarget[] {
  const targets: SearchTarget[] = [
    { label: "My domains", href: routes.myDomains, group: "Domains" },
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
    { label: "Wallet & top up", href: routes.accountWallet, group: "Billing" },
    { label: "Domain orders", href: routes.accountOrders, group: "Billing" },
    {
      label: "Hosting orders",
      href: routes.accountHostingOrders,
      group: "Billing",
    },
    { label: "Invoices", href: routes.accountInvoices, group: "Billing" },
    { label: "Transactions", href: routes.accountBilling, group: "Billing" },
    { label: "Hosting plans", href: routes.accountHosting, group: "Hosting" },
    { label: "Business email", href: routes.accountEmail, group: "Email" },
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
  onToggleTheme,
  onOpenMobileNav,
}: Props) {
  const title = panelTitleForPath(pathname);
  const displayName = user.name?.trim() || user.email.split("@")[0];
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const allTargets = useMemo(searchTargets, []);
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return allTargets
      .filter((target) => target.label.toLowerCase().includes(needle))
      .slice(0, 6);
  }, [allTargets, query]);

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
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          className="rounded-lg p-2 text-[var(--hb-p-muted)] hover:bg-[var(--hb-p-primary)]/10 lg:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href={routes.account} className="hidden shrink-0 sm:block">
          <BrandMark className="!h-8 !max-w-[180px]" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-[var(--hb-p-muted)]">
            Customer area
          </p>
          <h1 className="font-heading truncate text-base font-semibold text-[var(--hb-p-text)] sm:text-lg">
            {title}
          </h1>
        </div>

        <form
          onSubmit={onSubmit}
          className="relative hidden max-w-xs flex-1 md:block"
          role="search"
        >
          <label className="relative block w-full">
            <span className="sr-only">Search your services</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
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
              placeholder="Search domains, billing, support…"
              className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 pr-8 pl-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[var(--hb-p-primary)]/40 focus:bg-white focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </label>
          {open && results.length > 0 ? (
            <ul className="absolute top-full right-0 left-0 z-40 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              {results.map((result) => (
                <li key={`${result.group}-${result.href}-${result.label}`}>
                  <Link
                    href={result.href}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-violet-50"
                  >
                    <span className="truncate">{result.label}</span>
                    <span className="shrink-0 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                      {result.group}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </form>

        <button
          type="button"
          onClick={onToggleTheme}
          className="inline-flex size-9 items-center justify-center rounded-full border border-[var(--hb-p-border)] text-[var(--hb-p-text)] hover:bg-[var(--hb-p-primary)]/10"
          aria-label={
            theme === "dark" ? "Switch to cream mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </button>
        <Link
          href={routes.accountSupport}
          className={cn(
            "hidden items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:inline-flex",
          )}
        >
          <Headphones className="h-3.5 w-3.5" />
          Support
        </Link>
        <div className="flex items-center gap-2">
          <div
            className="hidden text-right text-xs sm:block"
            title={user.email}
          >
            <p className="font-semibold text-slate-800">{displayName}</p>
            <p className="max-w-[140px] truncate text-slate-500">
              {user.email}
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
