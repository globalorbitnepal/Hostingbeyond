"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  Bell,
  ChevronRight,
  CreditCard,
  KeyRound,
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
import { HOSTINGBEYOND_AI_ROBOT_SRC } from "@/components/shared/ai-robot";
import {
  CANONICAL_HEADER_LOGO_SRC,
  PANEL_MEGA_HEADER_LOGO_SRC,
} from "@/components/shared/logo";
import { getPanelNav } from "@/lib/panel/navigation";

type PanelUser = {
  name: string | null;
  email: string;
  image: string | null;
  hasPassword?: boolean;
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
    { label: "Wallet & top up", href: routes.accountWallet, group: "Billing" },
    { label: "Domain orders", href: routes.accountOrders, group: "Billing" },
    { label: "Invoices", href: routes.accountInvoices, group: "Billing" },
    { label: "Transactions", href: routes.accountBilling, group: "Billing" },
    { label: "Support", href: routes.accountSupport, group: "Support" },
    {
      label: "Security",
      href: routes.accountProfileSecurity,
      group: "Account",
    },
    {
      label: "Change password",
      href: `${routes.accountProfileSecurity}#password`,
      group: "Account",
    },
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

function PanelUserAvatar({
  image,
  initial,
}: {
  image: string | null;
  initial: string;
}) {
  if (image?.trim()) {
    return (
      <Image
        src={image}
        alt=""
        width={34}
        height={34}
        unoptimized
        referrerPolicy="no-referrer"
        className="size-[34px] rounded-full object-cover"
      />
    );
  }
  return (
    <span className="grid size-[34px] place-items-center rounded-full bg-[#5b21b6] text-xs font-black text-white">
      {initial}
    </span>
  );
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
  const [notifyOpen, setNotifyOpen] = useState(false);

  const allTargets = useMemo(searchTargets, []);
  const quickPicks = useMemo(
    () =>
      [
        allTargets.find((t) => t.href === routes.account),
        allTargets.find((t) => t.href === routes.accountDomainFind),
        allTargets.find((t) => t.href === routes.myDomains),
        allTargets.find((t) => t.href === routes.accountWallet),
        allTargets.find((t) => t.href === routes.accountProfileSecurity),
        allTargets.find((t) => t.href === routes.accountSupport),
      ].filter(Boolean) as SearchTarget[],
    [allTargets],
  );
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return allTargets
      .filter((t) => t.label.toLowerCase().includes(needle))
      .slice(0, 8);
  }, [allTargets, query]);
  const searchHits = results.length > 0 ? results : quickPicks;

  useEffect(() => {
    if (!menuOpen && !notifyOpen) return;
    const close = () => {
      setMenuOpen(false);
      setNotifyOpen(false);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuOpen, notifyOpen]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign(routes.home);
  }

  function goSearch(event: React.FormEvent) {
    event.preventDefault();
    const needle = query.trim();
    if (results[0]) {
      router.push(results[0].href);
    } else if (!needle && quickPicks[0]) {
      router.push(quickPicks[0].href);
    } else if (needle) {
      const exact = allTargets.find(
        (t) => t.label.toLowerCase() === needle.toLowerCase(),
      );
      if (exact) router.push(exact.href);
      else
        router.push(
          `${routes.accountDomainFind}?q=${encodeURIComponent(needle)}`,
        );
    }
    setSearchOpen(false);
    setQuery("");
    inputRef.current?.blur();
  }

  return (
    <header className="hb-panel-mega" data-panel-chrome-theme={theme}>
      <div
        className="hb-panel-mega__edge hb-panel-mega__edge--left"
        aria-hidden
      />
      <div
        className="hb-panel-mega__edge hb-panel-mega__edge--right"
        aria-hidden
      />
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
          className="hb-panel-mega-icon hb-panel-mega-menu-mobile"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href={routes.account} className="hb-panel-mega-logo">
          <Image
            key={theme}
            src={
              theme === "dark"
                ? PANEL_MEGA_HEADER_LOGO_SRC
                : CANONICAL_HEADER_LOGO_SRC
            }
            alt="HostingBeyond"
            width={996}
            height={183}
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
          onSubmit={goSearch}
          className="hb-panel-mega-search"
          role="search"
        >
          <Search className="hb-panel-mega-search__icon" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => window.setTimeout(() => setSearchOpen(false), 140)}
            placeholder="Search domains, hosting, billing…"
            aria-label="Search your account"
            className="hb-panel-mega-search__input"
            autoComplete="off"
            spellCheck={false}
          />
          {searchOpen && searchHits.length > 0 ? (
            <ul className="hb-panel-mega-search-drop" role="listbox">
              {!query.trim() ? (
                <li className="hb-panel-mega-search-drop__label" aria-hidden>
                  Quick links
                </li>
              ) : null}
              {searchHits.map((result) => (
                <li key={result.href + result.label}>
                  <Link
                    href={result.href}
                    role="option"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery("");
                    }}
                  >
                    <span>{result.label}</span>
                    <span>{result.group}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </form>

        <div className="hb-panel-mega-actions">
          <div className="hb-panel-mega-theme" role="group" aria-label="Theme">
            <button
              type="button"
              data-active={theme === "light" ? "true" : "false"}
              onClick={() => onThemeChange("light")}
              aria-label="Light mode"
              title="Light"
            >
              <Sun className="h-4 w-4" />
            </button>
            <button
              type="button"
              data-active={theme === "dark" ? "true" : "false"}
              onClick={() => onThemeChange("dark")}
              aria-label="Dark mode"
              title="Dark"
            >
              <Moon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                const dark = window.matchMedia(
                  "(prefers-color-scheme: dark)",
                ).matches;
                onThemeChange(dark ? "dark" : "light");
              }}
              aria-label="Use system theme"
              title="System"
            >
              <Monitor className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            className="hb-panel-mega-agent"
            onClick={() => openBeyondMasterAi()}
          >
            <Image
              src={HOSTINGBEYOND_AI_ROBOT_SRC}
              alt=""
              width={26}
              height={26}
              className="size-[26px] object-cover"
            />
            <span>Agent</span>
          </button>

          <div className="relative">
            <button
              type="button"
              className="hb-panel-mega-icon"
              aria-label="Notifications"
              aria-expanded={notifyOpen}
              onClick={(e) => {
                e.stopPropagation();
                setNotifyOpen((v) => !v);
                setMenuOpen(false);
              }}
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="hb-panel-mega-dot" aria-hidden />
            </button>
            {notifyOpen ? (
              <div
                className="hb-panel-notify-menu"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="px-3 pb-2 text-sm font-bold text-[var(--hb-p-text)]">
                  Notifications
                </p>
                <div className="hb-panel-menu-divider" />
                <nav className="space-y-0.5 px-2 py-1">
                  <Link
                    href={routes.accountOrders}
                    className="hb-panel-menu-item"
                    onClick={() => setNotifyOpen(false)}
                  >
                    <Activity className="h-4 w-4" />
                    Domain orders
                  </Link>
                  <Link
                    href={routes.accountWallet}
                    className="hb-panel-menu-item"
                    onClick={() => setNotifyOpen(false)}
                  >
                    <Wallet className="h-4 w-4" />
                    Wallet activity
                  </Link>
                  <Link
                    href={routes.accountProfileSecurity}
                    className="hb-panel-menu-item"
                    onClick={() => setNotifyOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    Security alerts
                  </Link>
                </nav>
                <div className="hb-panel-menu-divider" />
                <p className="px-3 py-2 text-xs text-[var(--hb-p-muted)]">
                  Email and push alerts for orders will appear here as we roll
                  them out.
                </p>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              className="hb-panel-mega-avatar"
              aria-expanded={menuOpen}
              aria-label="My account"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
                setNotifyOpen(false);
              }}
            >
              <PanelUserAvatar image={user.image} initial={initial} />
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
                    href={routes.accountProfile}
                    className="hb-panel-menu-item"
                  >
                    <User className="h-4 w-4" />
                    Account information
                  </Link>
                  <Link
                    href={routes.accountBilling}
                    className="hb-panel-menu-item"
                  >
                    <CreditCard className="h-4 w-4" />
                    Billing
                  </Link>
                  <Link
                    href={routes.accountProfileSecurity}
                    className="hb-panel-menu-item"
                  >
                    <Shield className="h-4 w-4" />
                    Security
                  </Link>
                  <Link
                    href={`${routes.accountProfileSecurity}#password`}
                    className="hb-panel-menu-item"
                  >
                    <KeyRound className="h-4 w-4" />
                    {user.hasPassword === false
                      ? "Set password"
                      : "Change password"}
                  </Link>
                  <p className="px-3 py-1.5 text-xs text-[var(--hb-p-muted)]">
                    {user.hasPassword === false
                      ? "You signed in with Google — add a password to also sign in with email."
                      : "Two-factor authentication (Google Authenticator) — coming soon."}
                  </p>
                </nav>
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
