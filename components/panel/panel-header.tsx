"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronRight,
  CreditCard,
  Headphones,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Percent,
  Search,
  Shield,
  Sun,
  User,
  Wallet,
} from "lucide-react";

import { routes } from "@/config/routes";
import { openBeyondMasterAi } from "@/lib/beyond-master/ui-store";
import { CANONICAL_HEADER_LOGO_SRC } from "@/components/shared/logo";
import { getPanelNav } from "@/lib/panel/navigation";

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
      label: "Domain search",
      href: routes.accountDomainFind,
      group: "Domains",
    },
    {
      label: "Transfers",
      href: routes.accountDomainTransfer,
      group: "Domains",
    },
    { label: "Hosting plans", href: routes.accountHosting, group: "Hosting" },
    { label: "Wallet", href: routes.accountWallet, group: "Billing" },
    { label: "Support", href: routes.accountSupport, group: "Support" },
    { label: "Security", href: routes.accountSecurity, group: "Account" },
  ];
  for (const section of getPanelNav()) {
    for (const item of section.items) {
      if (!item.href || item.soon) continue;
      if (targets.some((t) => t.href === item.href)) continue;
      targets.push({
        label: item.label,
        href: item.href,
        group: section.label || "Panel",
      });
    }
  }
  return targets;
}

export function PanelHeader({
  user,
  theme,
  onThemeChange,
  onOpenMobileNav,
}: Props) {
  const displayName = user.name?.trim() || user.email.split("@")[0];
  const initial = displayName.charAt(0).toUpperCase();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const allTargets = useMemo(searchTargets, []);
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return allTargets
      .filter((t) => t.label.toLowerCase().includes(needle))
      .slice(0, 6);
  }, [allTargets, query]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuOpen]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (results[0]) router.push(results[0].href);
    else if (query.trim()) {
      router.push(
        `${routes.accountDomainFind}?q=${encodeURIComponent(query.trim())}`,
      );
    }
    setSearchOpen(false);
    setQuery("");
  }

  return (
    <header className="hb-panel-mega">
      <div className="hb-panel-mega__shimmer" aria-hidden />
      <div
        className="hb-panel-mega__percent hb-panel-mega__percent--a"
        aria-hidden
      >
        <Percent className="size-5" />
      </div>
      <div
        className="hb-panel-mega__percent hb-panel-mega__percent--b"
        aria-hidden
      >
        <Percent className="size-4" />
      </div>

      <div className="hb-panel-mega__row">
        <button
          type="button"
          className="hb-panel-mega-icon lg:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href={routes.account} className="hb-panel-mega-logo">
          <Image
            src={CANONICAL_HEADER_LOGO_SRC}
            alt="HostingBeyond"
            width={981}
            height={182}
            priority
            unoptimized
            className="hb-panel-mega-logo__img"
          />
        </Link>

        <Link href={routes.accountDomainFind} className="hb-panel-mega-cta">
          <span className="hb-panel-mega-cta__badge">SALE!</span>
          <span>Grab the best domain deals</span>
          <span className="hb-panel-mega-cta__go" aria-hidden>
            <ChevronRight className="h-4 w-4" />
          </span>
        </Link>

        <form
          onSubmit={onSubmit}
          className="hb-panel-mega-search"
          role="search"
        >
          <Search className="h-4 w-4 shrink-0 opacity-75" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => window.setTimeout(() => setSearchOpen(false), 120)}
            placeholder="Search…"
            className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-white/55"
          />
          {searchOpen && results.length > 0 ? (
            <ul className="hb-panel-mega-search-drop">
              {results.map((result) => (
                <li key={result.href + result.label}>
                  <Link
                    href={result.href}
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery("");
                    }}
                  >
                    {result.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </form>

        <div className="hb-panel-mega-actions">
          <button
            type="button"
            className="hb-panel-mega-agent"
            onClick={() => openBeyondMasterAi()}
          >
            <Image
              src="/brand/hostingbeyond-ai-robot.png"
              alt=""
              width={26}
              height={26}
              className="size-[26px] object-contain"
            />
            <span>Agent</span>
          </button>

          <button
            type="button"
            className="hb-panel-mega-icon"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="hb-panel-mega-dot" />
          </button>

          <div className="relative">
            <button
              type="button"
              className="hb-panel-mega-avatar"
              aria-expanded={menuOpen}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
            >
              {user.image ? (
                <Image
                  src={user.image}
                  alt=""
                  width={34}
                  height={34}
                  className="size-[34px] rounded-full object-cover"
                />
              ) : (
                <span className="grid size-[34px] place-items-center rounded-full bg-white/20 text-xs font-black text-white">
                  {initial}
                </span>
              )}
            </button>

            {menuOpen ? (
              <div
                className="hb-panel-account-menu"
                role="menu"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 pb-3">
                  <p className="truncate text-sm font-bold text-[var(--hb-p-text)]">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-[var(--hb-p-muted)]">
                    {user.email}
                  </p>
                </div>
                <div className="hb-panel-menu-divider" />
                <nav className="space-y-0.5 px-2 py-1">
                  <Link
                    href={routes.account}
                    className="hb-panel-menu-item"
                    role="menuitem"
                  >
                    <User className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href={routes.accountWallet}
                    className="hb-panel-menu-item"
                    role="menuitem"
                  >
                    <Wallet className="h-4 w-4" />
                    Wallet
                  </Link>
                  <Link
                    href={routes.accountBilling}
                    className="hb-panel-menu-item"
                    role="menuitem"
                  >
                    <CreditCard className="h-4 w-4" />
                    Billing
                  </Link>
                  <Link
                    href={routes.accountSecurity}
                    className="hb-panel-menu-item"
                    role="menuitem"
                  >
                    <Shield className="h-4 w-4" />
                    Security
                  </Link>
                  <Link
                    href={routes.accountSupport}
                    className="hb-panel-menu-item"
                    role="menuitem"
                  >
                    <Headphones className="h-4 w-4" />
                    Support
                  </Link>
                </nav>
                <div className="hb-panel-menu-divider" />
                <div className="px-3 py-2">
                  <p className="mb-2 text-[11px] font-bold tracking-wide text-[var(--hb-p-muted)] uppercase">
                    Appearance
                  </p>
                  <div className="hb-panel-theme-pills" role="group">
                    <button
                      type="button"
                      data-active={theme === "light" ? "true" : "false"}
                      onClick={() => onThemeChange("light")}
                    >
                      <Sun className="h-3.5 w-3.5" />
                      Light
                    </button>
                    <button
                      type="button"
                      data-active={theme === "dark" ? "true" : "false"}
                      onClick={() => onThemeChange("dark")}
                    >
                      <Moon className="h-3.5 w-3.5" />
                      Dark
                    </button>
                    <button
                      type="button"
                      data-active="false"
                      onClick={() => {
                        const dark = window.matchMedia(
                          "(prefers-color-scheme: dark)",
                        ).matches;
                        onThemeChange(dark ? "dark" : "light");
                      }}
                    >
                      <Monitor className="h-3.5 w-3.5" />
                      System
                    </button>
                  </div>
                </div>
                <div className="hb-panel-menu-divider" />
                <div className="p-2">
                  <button
                    type="button"
                    className="hb-panel-menu-item w-full text-left"
                    onClick={() => void logout()}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
