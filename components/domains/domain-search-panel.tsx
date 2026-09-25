"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Crown,
  Layers,
  Loader2,
  Lock,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { routes } from "@/config/routes";
import type { DomainResult } from "@/lib/domains/availability";
import { SUGGESTED_TLDS, formatPrice } from "@/lib/domains/tlds";
import { cn } from "@/lib/utils";

export type SearchMode = "single" | "bulk";

const QUICK_TLDS = SUGGESTED_TLDS.slice(0, 6);
const BULK_LIMIT = 50;

const MODE_TABS: Array<{
  id: SearchMode;
  label: string;
  href: string;
  icon: typeof Search;
}> = [
  {
    id: "single",
    label: "Search a domain",
    href: routes.domainSearch,
    icon: Search,
  },
  {
    id: "bulk",
    label: "Bulk search",
    href: routes.bulkDomainSearch,
    icon: Layers,
  },
];

function cartHref(domain: string) {
  return `${routes.getStarted}?domain=${encodeURIComponent(domain)}`;
}

function transferHref(domain: string) {
  return `${routes.domainTransfer}?domain=${encodeURIComponent(domain)}#transfer-check`;
}

function countBulkLines(value: string) {
  return Math.min(BULK_LIMIT, value.split(/[\s,;]+/).filter(Boolean).length);
}

function StatusPill({ status }: { status: DomainResult["status"] }) {
  if (status === "available") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-[#15803d] uppercase">
        <Check className="size-3" strokeWidth={3} />
        Available
      </span>
    );
  }
  if (status === "premium") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3c7] px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-[#b45309] uppercase">
        <Crown className="size-3" strokeWidth={2.5} />
        Premium
      </span>
    );
  }
  if (status === "taken") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#ede9fe] px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-[#5b21b6] uppercase">
        <Lock className="size-3" strokeWidth={2.5} />
        Registered
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-slate-500 uppercase">
      <X className="size-3" strokeWidth={3} />
      Not valid
    </span>
  );
}

function ResultRow({
  result,
  featured = false,
}: {
  result: DomainResult;
  featured?: boolean;
}) {
  const buyable = result.status === "available" || result.status === "premium";
  const meta = result.message
    ? result.message
    : featured
      ? `Renews at ${formatPrice(result.renew ?? 0)}/yr · free WHOIS privacy · free DNS`
      : `Renews at ${formatPrice(result.renew ?? 0)}/yr`;

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition",
        featured
          ? "border-[#c7b8ff] bg-gradient-to-br from-[#f8f5ff] to-white sm:p-5"
          : "border-slate-200 bg-white hover:border-[#c7b8ff] hover:shadow-[0_12px_28px_-22px_rgba(47,28,106,0.6)]",
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-3",
          featured && "sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        )}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <p
              className={cn(
                "min-w-0 font-extrabold tracking-tight break-words text-[#1a1035]",
                featured ? "text-[19px] sm:text-[24px]" : "text-[15.5px]",
              )}
            >
              {result.name}
              <span className="text-[#673de6]">{result.tld}</span>
            </p>
            <StatusPill status={result.status} />
          </div>
          <p className="mt-1 text-[12.5px] leading-snug text-slate-500">
            {meta}
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
          {buyable ? (
            <p className="text-[18px] font-extrabold tracking-tight whitespace-nowrap text-[#1a1035] sm:text-[20px]">
              {formatPrice(result.register ?? 0)}
              <span className="text-[12px] font-bold text-slate-500">
                /1st yr
              </span>
            </p>
          ) : (
            <span aria-hidden />
          )}
          {buyable ? (
            <Link
              href={cartHref(result.domain)}
              className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[#673de6] px-5 text-[13.5px] font-bold whitespace-nowrap text-white shadow-[0_10px_22px_-10px_rgba(103,61,230,0.85)] transition hover:bg-[#5a31d4]"
            >
              Add to cart
              <ArrowRight className="size-4" />
            </Link>
          ) : result.status === "taken" ? (
            <Link
              href={transferHref(result.domain)}
              className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-[#c7b8ff] bg-white px-5 text-[13.5px] font-bold whitespace-nowrap text-[#4c1d95] transition hover:bg-[#f7f4ff]"
            >
              Transfer it
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="w-full space-y-2">
        <div className="h-4 w-1/3 animate-pulse rounded-full bg-slate-200" />
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-100" />
      </div>
      <div className="h-11 w-28 shrink-0 animate-pulse rounded-full bg-slate-100" />
    </div>
  );
}

export function DomainSearchPanel({
  mode,
  initialQuery = "",
  layout = "default",
}: {
  mode: SearchMode;
  initialQuery?: string;
  layout?: "default" | "hero";
}) {
  const hero = layout === "hero";
  const [query, setQuery] = useState(initialQuery);
  const [bulk, setBulk] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<DomainResult[]>([]);
  const [searched, setSearched] = useState("");

  const run = useCallback(
    async (payload: { query?: string; bulk?: string }) => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/domains/search", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = (await response.json()) as {
          results?: DomainResult[];
          error?: string;
        };
        if (!response.ok || !json.results) {
          setResults([]);
          setError(json.error || "Search failed. Please try again.");
          return;
        }
        setResults(json.results);
        setSearched(payload.query?.trim() || "bulk");
      } catch {
        setResults([]);
        setError("Network error — check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (mode === "single" && initialQuery.trim()) {
      void run({ query: initialQuery });
    }
  }, [initialQuery, mode, run]);

  function onSingleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) {
      setError("Type a name to check, for example yourbrand.com");
      return;
    }
    void run({ query });
  }

  function onBulkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bulk.trim()) {
      setError(`Add one domain per line, up to ${BULK_LIMIT} at a time.`);
      return;
    }
    void run({ bulk });
  }

  const exact = results.find((item) => item.domain === searched) ?? results[0];
  const alternatives = results.filter((item) => item !== exact);
  const availableCount = results.filter(
    (item) => item.status === "available" || item.status === "premium",
  ).length;

  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/70 bg-white shadow-[0_34px_80px_-34px_rgba(15,10,40,0.6)] ring-1 ring-black/[0.03]",
        hero ? "p-5 sm:rounded-[32px] sm:p-7" : "p-4 sm:rounded-[32px] sm:p-6",
      )}
    >
      <nav
        aria-label="Search mode"
        className="flex w-full gap-1 rounded-full bg-[#f3f1ff] p-1"
      >
        {MODE_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = mode === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-[13px] font-bold transition sm:text-[14px]",
                active
                  ? "bg-white text-[#2f1c6a] shadow-[0_6px_16px_-8px_rgba(47,28,106,0.5)]"
                  : "text-slate-500 hover:text-[#2f1c6a]",
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {mode === "single" ? (
        <form onSubmit={onSingleSubmit} className="mt-4">
          <label htmlFor="domain-name-search" className="sr-only">
            Search for a domain name
          </label>
          <div
            className={cn(
              "flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 transition focus-within:border-[#673de6] focus-within:ring-4 focus-within:ring-[#673de6]/10 sm:flex-row sm:items-center",
              hero && "rounded-[18px] p-2.5 sm:p-3",
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
              <Search
                className={cn(
                  "shrink-0 text-[#673de6]",
                  hero ? "size-5 sm:size-6" : "size-5",
                )}
              />
              <input
                id="domain-name-search"
                type="text"
                inputMode="url"
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Type a domain — e.g. yourbrand.com"
                className={cn(
                  "min-w-0 flex-1 bg-transparent font-medium text-[#1a1035] outline-none placeholder:text-slate-400",
                  hero
                    ? "py-3.5 text-[16px] sm:py-4 sm:text-[18px]"
                    : "py-3 text-[15px] sm:text-[16px]",
                )}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#673de6] font-bold text-white shadow-[0_12px_26px_-14px_rgba(37,99,235,0.9)] transition hover:brightness-110 disabled:opacity-70",
                hero
                  ? "h-12 px-7 text-[14px] sm:h-14 sm:px-8 sm:text-[15px]"
                  : "h-12 px-6 text-[14px]",
              )}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              Search domain
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[12px] font-bold text-slate-500">
              Popular:
            </span>
            {QUICK_TLDS.map((tld) => (
              <button
                key={tld}
                type="button"
                onClick={() => {
                  const base = query.split(".")[0]?.trim();
                  if (!base) {
                    setError("Type a name first, then pick an extension.");
                    return;
                  }
                  const next = `${base}${tld}`;
                  setQuery(next);
                  void run({ query: next });
                }}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-[12px] font-bold text-[#4c1d95] transition hover:border-[#c7b8ff] hover:bg-[#f7f4ff]"
              >
                {tld}
              </button>
            ))}
          </div>
        </form>
      ) : (
        <form onSubmit={onBulkSubmit} className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="domain-bulk-search"
              className="text-[12px] font-bold tracking-wide text-slate-500 uppercase"
            >
              One domain per line — up to {BULK_LIMIT}
            </label>
            <span className="text-[12px] font-bold text-[#4c1d95]">
              {countBulkLines(bulk)}/{BULK_LIMIT} names
            </span>
          </div>
          <textarea
            id="domain-bulk-search"
            value={bulk}
            onChange={(event) => setBulk(event.target.value)}
            rows={7}
            placeholder={"yourbrand.com\nyourbrand.io\nyourbrand.store"}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-[13.5px] leading-relaxed text-[#1a1035] transition outline-none focus:border-[#673de6] focus:ring-4 focus:ring-[#673de6]/10"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12.5px] text-slate-500">
              Built for agencies clearing a whole brand shortlist at once.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#673de6] px-6 text-[14px] font-bold text-white shadow-[0_12px_26px_-14px_rgba(37,99,235,0.9)] transition hover:brightness-110 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Layers className="size-4" />
              )}
              Check all domains
            </button>
          </div>
        </form>
      )}

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-2xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#b91c1c]"
        >
          {error}
        </p>
      ) : null}

      <div aria-live="polite" className="mt-5">
        {loading ? (
          <div className="space-y-2.5">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : null}

        {!loading && results.length > 0 ? (
          <div key={searched} className="hb-fade-up space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 text-[12.5px] font-semibold text-slate-500">
              <BadgeCheck className="size-4 text-[#15803d]" />
              {availableCount} of {results.length} options are free to register
              right now.
            </div>
            {exact ? <ResultRow result={exact} featured /> : null}
            {alternatives.length > 0 ? (
              <>
                <p className="pt-2 text-[12px] font-bold tracking-wide text-slate-500 uppercase">
                  {mode === "bulk" ? "Your list" : "Other great matches"}
                </p>
                <div className="grid gap-2.5 2xl:grid-cols-2">
                  {alternatives.map((item) => (
                    <ResultRow key={item.domain} result={item} />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {!loading && results.length === 0 && !error ? (
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-500">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-[#673de6]" />
            {mode === "bulk"
              ? `Paste your shortlist — we check every line and show first-year plus renewal pricing side by side.`
              : `Type any idea — we check ${SUGGESTED_TLDS.length} extensions at once and show first-year plus renewal pricing before you buy.`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
