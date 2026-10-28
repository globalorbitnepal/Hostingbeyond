"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";

import { routes } from "@/config/routes";
import type { TransferCheckResult } from "@/lib/domains/transfer";
import { CatalogPrice } from "@/components/i18n/localized-text";
import { SUGGESTED_TLDS } from "@/lib/domains/tlds";
import { cn } from "@/lib/utils";

const MODE_TABS = [
  {
    id: "search",
    label: "Search a domain",
    shortLabel: "Search",
    href: routes.domainSearch,
    icon: Search,
  },
  {
    id: "bulk",
    label: "Bulk search",
    shortLabel: "Bulk",
    href: routes.bulkDomainSearch,
    icon: Layers,
  },
  {
    id: "transfer",
    label: "Transfer in",
    shortLabel: "Transfer",
    href: routes.domainTransfer,
    icon: ArrowLeftRight,
    current: true,
  },
] as const;

const QUICK_TLDS = SUGGESTED_TLDS.slice(0, 6);

const CHECKLIST = [
  "Domain unlocked at your current registrar",
  "Auth (EPP) code ready — we never store it in the URL",
  "Transfer approval email inbox accessible",
  "Domain outside the 60-day ICANN transfer lock (if applicable)",
];

type Props = {
  layout?: "hero" | "default";
  initialDomain?: string;
  searchPlaceholder?: string;
  authPlaceholder?: string;
};

export function DomainTransferCheckPanel({
  layout = "hero",
  initialDomain = "",
  searchPlaceholder = "Enter domain to transfer — yourbrand.com",
  authPlaceholder = "Auth / EPP code (required at checkout)",
}: Props) {
  const hero = layout === "hero";
  const [domain, setDomain] = useState(initialDomain);
  const [authCode, setAuthCode] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TransferCheckResult | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  const run = useCallback(async (name: string) => {
    setLoading(true);
    setError("");
    setReviewOpen(false);
    setReviewConfirmed(false);
    try {
      const response = await fetch("/api/domains/transfer-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain: name }),
      });
      const json = (await response.json()) as {
        result?: TransferCheckResult;
        error?: string;
      };
      if (!response.ok || !json.result) {
        setResult(null);
        setError(json.error || "Could not check this domain. Try again.");
        return;
      }
      setResult(json.result);
    } catch {
      setResult(null);
      setError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setDomain(initialDomain);
    if (initialDomain.trim()) void run(initialDomain.trim());
  }, [initialDomain, run]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!domain.trim()) {
      setError("Enter the domain you want to transfer.");
      return;
    }
    void run(domain.trim());
  }

  return (
    <div
      id="transfer-check"
      className={cn(
        "max-w-full min-w-0 overflow-x-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_34px_80px_-34px_rgba(15,10,40,0.6)] ring-1 ring-black/[0.03]",
        hero
          ? "p-4 sm:rounded-[32px] sm:p-6 md:p-7"
          : "p-4 sm:rounded-[32px] sm:p-6",
      )}
    >
      <nav
        aria-label="Domain tools"
        className="flex w-full [scrollbar-width:none] gap-0.5 overflow-x-auto rounded-full bg-[#f3f1ff] p-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {MODE_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = "current" in tab && tab.current;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-10 min-h-[44px] min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-2 text-[11px] font-bold whitespace-nowrap transition sm:h-11 sm:gap-2 sm:px-3 sm:text-[13px]",
                active
                  ? "bg-white text-[#2f1c6a] shadow-[0_6px_16px_-8px_rgba(47,28,106,0.5)]"
                  : "text-slate-500 hover:text-[#2f1c6a]",
              )}
            >
              <Icon className="size-3.5 shrink-0 sm:size-4" />
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      <p className="mt-4 text-[13px] leading-relaxed text-slate-600">
        Transfer your domain to HostingBeyond — we verify registry status and
        show the real transfer fee before checkout.
      </p>

      <ul className="mt-3 space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
        {CHECKLIST.map((line) => (
          <li
            key={line}
            className="flex gap-2 text-[12px] leading-snug text-slate-600"
          >
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#673de6]" />
            {line}
          </li>
        ))}
      </ul>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label htmlFor="domain-transfer-name" className="sr-only">
          Domain to transfer
        </label>
        <div
          className={cn(
            "flex min-w-0 flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 transition focus-within:border-[#673de6] focus-within:ring-4 focus-within:ring-[#673de6]/10 sm:flex-row sm:items-center",
            hero && "rounded-[18px] p-2.5 sm:p-3",
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
            <ArrowLeftRight className="size-5 shrink-0 text-[#673de6]" />
            <input
              id="domain-transfer-name"
              type="text"
              inputMode="url"
              autoComplete="off"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder={searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent py-3 text-[15px] font-medium text-[#1a1035] outline-none placeholder:text-slate-400 sm:text-[16px]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#673de6] px-6 text-[14px] font-bold text-white shadow-[0_12px_26px_-14px_rgba(37,99,235,0.9)] transition hover:brightness-110 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <ArrowLeftRight className="size-4" />
                Check transfer
              </>
            )}
          </button>
        </div>

        <div className="min-w-0">
          <label
            htmlFor="domain-transfer-auth"
            className="text-[12px] font-bold tracking-wide text-slate-500 uppercase"
          >
            Authorization code (optional here)
          </label>
          <div className="relative mt-2">
            <input
              id="domain-transfer-auth"
              type={showAuth ? "text" : "password"}
              autoComplete="off"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder={authPlaceholder}
              className="w-full min-w-0 rounded-xl border border-slate-200 py-3 pr-12 pl-4 text-[14px] font-medium text-[#1a1035] outline-none focus:border-[#673de6] focus:ring-4 focus:ring-[#673de6]/10"
            />
            <button
              type="button"
              aria-label={showAuth ? "Hide auth code" : "Show auth code"}
              className="absolute top-1/2 right-2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              onClick={() => setShowAuth((v) => !v)}
            >
              {showAuth ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">
            Enter your EPP code again securely at checkout — it is never sent in
            the page URL.
          </p>
        </div>
      </form>

      {error ? (
        <div
          role="alert"
          className="mt-3 flex flex-col gap-3 rounded-xl bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-[13px] font-medium text-red-800">{error}</p>
          <button
            type="button"
            disabled={loading || !domain.trim()}
            onClick={() => void run(domain.trim())}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-[13px] font-bold text-red-800 hover:bg-red-100 disabled:opacity-60"
          >
            <RefreshCw className="size-3.5" aria-hidden />
            Try again
          </button>
        </div>
      ) : null}

      {result ? (
        <div
          className={cn(
            "mt-4 rounded-2xl border p-4 sm:p-5",
            result.eligible
              ? "border-emerald-200 bg-emerald-50/90"
              : result.status === "available"
                ? "border-amber-200 bg-amber-50/90"
                : "border-slate-200 bg-slate-50",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 text-left">
              <p className="text-[11px] font-extrabold tracking-wide text-slate-500 uppercase">
                {result.domain}
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-[#1e1b4b]">
                {result.message}
              </p>
              {result.transferPrice != null && result.eligible ? (
                <p className="mt-2 text-[13px] font-bold text-[#673de6]">
                  Transfer <CatalogPrice usd={result.transferPrice} />
                  {result.renewPrice != null ? (
                    <>
                      {" "}
                      · renews at <CatalogPrice usd={result.renewPrice} />
                      /yr
                    </>
                  ) : null}
                </p>
              ) : null}
              {result.eligible && result.registryCheckOnly ? (
                <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
                  This check uses registry availability only. Auth code, lock
                  status, and ICANN rules are verified when you submit the
                  transfer — not guaranteed here.
                </p>
              ) : null}
            </div>
            {result.eligible ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-extrabold tracking-wide text-white uppercase">
                <BadgeCheck className="size-3.5" />
                Registered
              </span>
            ) : null}
          </div>

          {result.eligible && !reviewOpen ? (
            <button
              type="button"
              className="mt-4 inline-flex h-11 min-h-[44px] items-center gap-2 rounded-xl bg-[#673de6] px-5 text-[14px] font-bold text-white hover:bg-[#5c35d4]"
              onClick={() => setReviewOpen(true)}
            >
              Review and continue
              <ArrowRight className="size-4" />
            </button>
          ) : null}

          {result.eligible && reviewOpen ? (
            <div className="mt-4 space-y-3 border-t border-emerald-200/80 pt-4">
              <p className="text-[13px] font-semibold text-[#1e1b4b]">
                Confirm before checkout
              </p>
              <label className="flex cursor-pointer items-start gap-3 text-[13px] text-slate-700">
                <input
                  type="checkbox"
                  checked={reviewConfirmed}
                  onChange={(e) => setReviewConfirmed(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-slate-300"
                />
                <span>
                  I understand the transfer fee and will provide my auth code
                  only on the secure checkout page.
                </span>
              </label>
              <Link
                href={result.checkoutHref}
                className={cn(
                  "inline-flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl text-[14px] font-bold sm:w-auto sm:px-6",
                  reviewConfirmed
                    ? "bg-[#1e1b4b] text-white hover:bg-[#2f1c6a]"
                    : "pointer-events-none bg-slate-200 text-slate-500",
                )}
                aria-disabled={!reviewConfirmed}
              >
                Continue to checkout
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : null}

          {!result.eligible && result.status === "available" ? (
            <Link
              href={result.checkoutHref}
              className="mt-4 inline-flex h-11 min-h-[44px] items-center rounded-xl bg-[#1e1b4b] px-5 text-[14px] font-bold text-white hover:bg-[#2f1c6a]"
            >
              Register instead
            </Link>
          ) : null}

          {!result.eligible && result.status !== "available" ? (
            <Link
              href={routes.contact}
              className="mt-4 inline-flex h-11 min-h-[44px] items-center rounded-xl border border-slate-300 bg-white px-5 text-[14px] font-bold text-[#1e1b4b]"
            >
              Contact support
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
