"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, User, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { mainNavigation, type NavItem } from "@/config/navigation";
import { routes } from "@/config/routes";
import { CountryLanguageSelector } from "@/components/locale/country-language-selector";
import { useLocale } from "@/components/locale/locale-provider";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

function localizeNavLabel(
  label: string,
  nav: ReturnType<typeof useLocale>["t"]["nav"],
) {
  const map: Record<string, string> = {
    Domains: nav.domains,
    Hosting: "Servers & Hosting",
    "Web Hosting": "Servers & Hosting",
    "Business Email": nav.businessEmail,
    Resources: "Solutions",
    Pricing: "Pricing",
  };
  return map[label] ?? label;
}

function NavDropdown({ item, label }: { item: NavItem; label: string }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearClose = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };
  const scheduleClose = () => {
    clearClose();
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => () => clearClose(), []);

  if (!item.children?.length) {
    return (
      <Link
        href={item.href}
        className="text-[15px] font-bold tracking-[-0.015em] whitespace-nowrap text-slate-800 transition-colors duration-150 hover:text-slate-950 xl:text-[16px]"
      >
        {label}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        clearClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 text-[15px] font-bold tracking-[-0.015em] whitespace-nowrap text-slate-800 transition-colors duration-150 hover:text-slate-950 xl:text-[16px]"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <ChevronDown
          className={cn(
            "mt-px size-[14px] shrink-0 text-slate-500 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 3 }}
            transition={{ duration: 0.13, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[calc(100%+12px)] left-1/2 z-50 min-w-[220px] -translate-x-1/2"
          >
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 py-1.5 shadow-[0_18px_48px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="block px-4 py-[10px] text-[13.5px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  onClick={() => setOpen(false)}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const NAV_ORDER = [
  "Domains",
  "Hosting",
  "Web Hosting",
  "Business Email",
  "Resources",
  "Pricing",
];

function sortNav(items: NavItem[]): NavItem[] {
  return [...items].sort((a, b) => {
    const ai = NAV_ORDER.indexOf(a.label);
    const bi = NAV_ORDER.indexOf(b.label);
    const aIdx = ai === -1 ? 99 : ai;
    const bIdx = bi === -1 ? 99 : bi;
    return aIdx - bIdx;
  });
}

export function SiteHeader({
  navigation = mainNavigation,
  loginLabel,
  loginHref = routes.login,
  getStartedLabel,
  getStartedHref = routes.getStarted,
  logoPath: _logoPath,
}: {
  navigation?: NavItem[];
  loginLabel?: string;
  loginHref?: string;
  getStartedLabel?: string;
  getStartedHref?: string;
  logoPath?: string;
} = {}) {
  const { t, preferences } = useLocale();
  const [open, setOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);

  const resolvedLogin =
    preferences.language === "en" ? loginLabel || "Login" : t.nav.login;
  const resolvedGetStarted =
    preferences.language === "en"
      ? getStartedLabel || "Get Started"
      : t.nav.getStarted;

  const filteredNav = (() => {
    const cleaned = navigation.filter(
      (item) => !/^cloud\s*&\s*vps$/i.test(item.label.trim()),
    );
    const hasHosting = cleaned.some(
      (item) => item.label === "Hosting" || item.label === "Web Hosting",
    );
    if (!hasHosting) return sortNav(mainNavigation);
    const seen = new Set<string>();
    const deduped = cleaned.filter((item) => {
      const key =
        item.label === "Web Hosting" || item.label === "Hosting"
          ? "hosting"
          : item.label;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (!deduped.some((item) => item.label === "Pricing")) {
      deduped.push({ label: "Pricing", href: routes.pricing });
    }
    return sortNav(deduped);
  })();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="relative z-50 w-full shrink-0 bg-transparent px-[3%] pt-2.5 pb-1 sm:px-[2.2%] sm:pt-4">
      <div className="mx-auto flex h-[56px] w-full max-w-[1280px] items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 shadow-[0_10px_40px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl sm:h-[70px] sm:gap-3 sm:px-5 lg:px-6">
        <div className="min-w-0 flex-1 lg:min-w-[210px] lg:flex-none xl:min-w-[270px]">
          <Logo
            src="/logo/hostingbeyond-logo-v5.png"
            variant="image"
            className="h-[26px] max-w-[min(100%,168px)] sm:h-[34px] sm:max-w-[280px] xl:h-[38px] xl:max-w-[310px]"
          />
        </div>

        <nav
          aria-label="Primary navigation"
          className="hidden min-w-0 flex-1 items-center justify-center gap-6 lg:flex xl:gap-8"
        >
          {filteredNav.map((item) => (
            <NavDropdown
              key={item.label}
              item={item}
              label={localizeNavLabel(item.label, t.nav)}
            />
          ))}
        </nav>

        <div className="hidden shrink-0 items-center justify-end gap-2.5 lg:flex">
          <CountryLanguageSelector tone="light" />
          <span
            aria-hidden
            className="mx-0.5 hidden h-6 w-px bg-slate-200 xl:block"
          />
          <Link
            href={loginHref}
            className="inline-flex h-[38px] items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3.5 text-[13px] font-semibold text-slate-800 shadow-[0_4px_14px_rgba(15,23,42,0.06)] transition hover:border-slate-300 hover:bg-slate-50"
          >
            <User className="size-4 text-slate-600" aria-hidden />
            {resolvedLogin}
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:hidden">
          <CountryLanguageSelector compact tone="light" />
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm"
            aria-expanded={open}
            aria-controls="hb-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="size-[18px]" />
            ) : (
              <Menu className="size-[18px]" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="hb-mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.17 }}
            className="mx-auto mt-2 w-full max-w-[1280px] overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/95 shadow-[0_20px_56px_rgba(15,23,42,0.12)] backdrop-blur-2xl lg:hidden"
          >
            <nav
              className="flex flex-col gap-0.5 p-4"
              aria-label="Mobile navigation"
            >
              {filteredNav.map((item) => {
                const label = localizeNavLabel(item.label, t.nav);
                const hasChildren = Boolean(item.children?.length);
                return (
                  <div key={item.label}>
                    {hasChildren ? (
                      <>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-[16px] font-bold text-slate-900"
                          onClick={() =>
                            setMobileSection((s) =>
                              s === item.label ? null : item.label,
                            )
                          }
                        >
                          {label}
                          <ChevronDown
                            className={cn(
                              "size-4 text-slate-400 transition-transform duration-200",
                              mobileSection === item.label && "rotate-180",
                            )}
                          />
                        </button>
                        <AnimatePresence>
                          {mobileSection === item.label ? (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden pl-4"
                            >
                              {item.children!.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className="block rounded-lg px-3 py-2.5 text-[13.5px] text-slate-600 hover:text-slate-950"
                                  onClick={() => setOpen(false)}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        className="block rounded-xl px-3 py-3 text-[16px] font-bold text-slate-900"
                        onClick={() => setOpen(false)}
                      >
                        {label}
                      </Link>
                    )}
                  </div>
                );
              })}
              <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
                <Link
                  href={loginHref}
                  className="flex items-center justify-center gap-2 rounded-full border border-slate-200 px-3 py-2.5 text-[14px] font-semibold text-slate-800"
                  onClick={() => setOpen(false)}
                >
                  <User className="size-4" aria-hidden />
                  {resolvedLogin}
                </Link>
                <Link
                  href={getStartedHref}
                  className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb] px-3 py-2.5 text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(124,58,237,0.28)]"
                  onClick={() => setOpen(false)}
                >
                  {resolvedGetStarted}
                </Link>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
