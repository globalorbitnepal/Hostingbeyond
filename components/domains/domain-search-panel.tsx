"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
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
import { loginPathForDomainCheckout } from "@/lib/domains/domain-purchase-intent";
import type { DomainResult } from "@/lib/domains/availability";
import { dispatchDomainCartUpdated } from "@/lib/domains/domain-cart-events";
import {
  filterRegisterableRecommendations,
  sortByRecommendationPriority,
} from "@/lib/domains/recommendation-tlds";
import { shouldFetchTier2 } from "@/lib/domains/search-orchestrator";
import { SUGGESTED_TLDS, formatPrice } from "@/lib/domains/tlds";
import { cn } from "@/lib/utils";

export type SearchMode = "single" | "bulk";

const QUICK_TLDS = SUGGESTED_TLDS.slice(0, 6);
const BULK_LIMIT = 50;

const MODE_TABS: Array<{
  id: SearchMode | "transfer";
  label: string;
  shortLabel: string;
  href: string;
  icon: typeof Search;
}> = [
  {
    id: "single",
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
  },
];

function countBulkLines(value: string) {
  return Math.min(BULK_LIMIT, value.split(/[\s,;]+/).filter(Boolean).length);
}

function sortRecommendations(a: DomainResult, b: DomainResult) {
  return sortByRecommendationPriority(a.tld, b.tld);
}

/** Provider-confirmed registerable options for recommendation cards. */
function isRegisterableRecommendation(result: DomainResult) {
  if (result.status === "available") return true;
  if (result.status === "premium" && result.register != null) return true;
  return false;
}

function mergeResults(
  primary: DomainResult[],
  more: DomainResult[],
): DomainResult[] {
  const map = new Map<string, DomainResult>();
  for (const row of [...primary, ...more]) {
    map.set(row.domain.toLowerCase(), row);
  }
  return [...map.values()];
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
  if (status === "unknown") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-amber-800 uppercase">
        Unavailable
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
  onRegister,
  registering,
  bulkSelectable = false,
  bulkSelected = false,
  onBulkToggle,
}: {
  result: DomainResult;
  featured?: boolean;
  onRegister: (domain: string) => void;
  registering: string | null;
  bulkSelectable?: boolean;
  bulkSelected?: boolean;
  onBulkToggle?: (domain: string) => void;
}) {
  const buyable = isRegisterableRecommendation(result);
  const meta =
    featured && result.status === "taken"
      ? "This domain is already registered."
      : result.message
        ? result.message
        : buyable
          ? `Renewal ${formatPrice(result.renew ?? 0)}/year after the first year.`
          : undefined;

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
            {bulkSelectable ? (
              <input
                type="checkbox"
                checked={bulkSelected}
                onChange={() => onBulkToggle?.(result.domain)}
                className="size-4 rounded border-slate-300 text-[#673de6]"
                aria-label={`Select ${result.domain}`}
              />
            ) : null}
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
          {meta ? (
            <p className="mt-1 text-[12.5px] leading-snug text-slate-500">
              {meta}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          {buyable ? (
            <div className="text-left sm:text-right">
              <p className="text-[18px] font-extrabold tracking-tight whitespace-nowrap text-[#1a1035] sm:text-[20px]">
                {formatPrice(result.register ?? 0)}
                <span className="text-[12px] font-bold text-slate-500">
                  {" "}
                  / 1st year
                </span>
              </p>
              <p className="text-[11.5px] font-semibold text-slate-500">
                Renews {formatPrice(result.renew ?? 0)}/year
              </p>
            </div>
          ) : null}
          {buyable ? (
            <button
              type="button"
              disabled={registering !== null}
              onClick={() => onRegister(result.domain)}
              className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#673de6] px-5 text-[13.5px] font-bold whitespace-nowrap text-white shadow-[0_10px_22px_-10px_rgba(103,61,230,0.85)] transition hover:bg-[#5a31d4] disabled:opacity-70 sm:w-auto"
            >
              {registering === result.domain ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Add to cart
                  <ArrowRight className="size-4" aria-hidden />
                </>
              )}
            </button>
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
  const [loadingPrimary, setLoadingPrimary] = useState(false);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [alternativesComplete, setAlternativesComplete] = useState(false);
  const [error, setError] = useState("");
  const [cartSuccess, setCartSuccess] = useState("");
  const [results, setResults] = useState<DomainResult[]>([]);
  const [searched, setSearched] = useState("");
  const [anchorDomain, setAnchorDomain] = useState("");
  const [registering, setRegistering] = useState<string | null>(null);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(
    () => new Set(),
  );
  const [bulkAdding, setBulkAdding] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const searchGeneration = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const loading = loadingPrimary || loadingAlternatives;

  const refreshCartCount = useCallback(async () => {
    try {
      const res = await fetch("/api/domains/cart");
      if (res.status === 401) {
        setCartCount(0);
        return;
      }
      if (!res.ok) return;
      const json = (await res.json()) as { count?: number };
      if (typeof json.count === "number") setCartCount(json.count);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refreshCartCount();
  }, [refreshCartCount]);

  const runBulk = useCallback(async (bulkPayload: string) => {
    const gen = ++searchGeneration.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoadingPrimary(true);
    setLoadingAlternatives(false);
    setAlternativesComplete(false);
    setError("");
    setCartSuccess("");
    setResults([]);
    try {
      const response = await fetch("/api/domains/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bulk: bulkPayload }),
        signal: controller.signal,
      });
      const json = (await response.json()) as {
        results?: DomainResult[];
        error?: string;
      };
      if (gen !== searchGeneration.current) return;
      if (!response.ok || !json.results) {
        setResults([]);
        setAnchorDomain("");
        setError(
          json.error ||
            "We couldn't check this domain right now. Please try again.",
        );
        return;
      }
      setResults(json.results);
      setAnchorDomain(json.results[0]?.domain ?? "");
      setSearched("bulk");
      setBulkSelected(new Set());
    } catch (err) {
      if (gen !== searchGeneration.current) return;
      if (err instanceof DOMException && err.name === "AbortError") return;
      setResults([]);
      setAnchorDomain("");
      setError("We couldn't check this domain right now. Please try again.");
    } finally {
      if (gen === searchGeneration.current) setLoadingPrimary(false);
    }
  }, []);

  const runSingle = useCallback(async (queryStr: string) => {
    const trimmed = queryStr.trim();
    if (!trimmed) return;

    const gen = ++searchGeneration.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoadingPrimary(true);
    setLoadingAlternatives(true);
    setAlternativesComplete(false);
    setError("");
    setCartSuccess("");
    setResults([]);
    setSearched(trimmed);

    const searchJson = async (body: Record<string, unknown>) => {
      const res = await fetch("/api/domains/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const json = (await res.json()) as {
        results?: DomainResult[];
        anchorDomain?: string;
        error?: string;
      };
      return { res, json };
    };

    try {
      const { res: primaryRes, json: primaryJson } = await searchJson({
        query: trimmed,
        scope: "primary",
      });
      if (gen !== searchGeneration.current) return;
      const primaryRow = primaryJson.results?.[0] ?? null;
      if (!primaryRes.ok || !primaryRow) {
        setResults([]);
        setAnchorDomain("");
        setError(
          primaryJson.error ||
            "We couldn't check this domain right now. Please try again.",
        );
        setLoadingPrimary(false);
        setLoadingAlternatives(false);
        setAlternativesComplete(true);
        return;
      }

      setResults([primaryRow]);
      setAnchorDomain(primaryJson.anchorDomain ?? primaryRow.domain);
      setBulkSelected(new Set());
      setLoadingPrimary(false);

      const { res: altRes, json: altJson } = await searchJson({
        query: trimmed,
        scope: "alternatives",
        tier: 1,
      });
      if (gen !== searchGeneration.current) return;
      let tier1Recs: DomainResult[] = [];
      if (altRes.ok && altJson.results?.length) {
        tier1Recs = altJson.results;
        setResults((prev) => mergeResults(prev, tier1Recs));
      }

      const registerableCount =
        filterRegisterableRecommendations(tier1Recs).length;
      if (
        shouldFetchTier2(registerableCount, true) &&
        !controller.signal.aborted
      ) {
        const { res: tier2Res, json: tier2Json } = await searchJson({
          query: trimmed,
          scope: "alternatives",
          tier: 2,
        });
        if (gen !== searchGeneration.current) return;
        if (tier2Res.ok && tier2Json.results?.length) {
          setResults((prev) => mergeResults(prev, tier2Json.results!));
        }
      }
    } catch (err) {
      if (gen !== searchGeneration.current) return;
      if (err instanceof DOMException && err.name === "AbortError") return;
      setResults([]);
      setAnchorDomain("");
      setError("We couldn't check this domain right now. Please try again.");
    } finally {
      if (gen === searchGeneration.current) {
        setLoadingPrimary(false);
        setLoadingAlternatives(false);
        setAlternativesComplete(true);
      }
    }
  }, []);

  const registerDomain = useCallback(
    async (domain: string) => {
      if (registering) return;
      setRegistering(domain);
      setError("");
      try {
        const response = await fetch("/api/domains/cart", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ domain }),
        });
        if (response.status === 401) {
          window.location.assign(loginPathForDomainCheckout([domain]));
          return;
        }
        const json = (await response.json()) as {
          count?: number;
          error?: string;
        };
        if (!response.ok) {
          setError(
            json.error ||
              (response.status === 409
                ? "This domain is no longer available. Please choose another domain."
                : "We couldn't add this domain right now. Please try again."),
          );
          return;
        }
        const nextCount =
          typeof json.count === "number" ? json.count : cartCount + 1;
        setCartCount(nextCount);
        dispatchDomainCartUpdated(nextCount);
        setCartSuccess(`${domain} was added to your cart.`);
        void refreshCartCount();
      } catch {
        setError("We couldn't add this domain right now. Please try again.");
      } finally {
        setRegistering(null);
      }
    },
    [registering, refreshCartCount],
  );

  const buyableResults = results.filter(isRegisterableRecommendation);

  const toggleBulkDomain = useCallback((domain: string) => {
    setBulkSelected((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  }, []);

  const selectAllBuyable = useCallback(() => {
    setBulkSelected(new Set(buyableResults.map((r) => r.domain)));
  }, [buyableResults]);

  const clearBulkSelection = useCallback(() => {
    setBulkSelected(new Set());
  }, []);

  const addBulkToCart = useCallback(async () => {
    if (bulkAdding || bulkSelected.size === 0) return;
    setBulkAdding(true);
    setError("");
    try {
      const domains = [...bulkSelected];
      const response = await fetch("/api/domains/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domains }),
      });
      if (response.status === 401) {
        window.location.assign(loginPathForDomainCheckout(domains));
        return;
      }
      const json = (await response.json()) as {
        cart?: { count?: number };
        added?: string[];
        rejected?: Array<{ domain: string; error: string }>;
        error?: string;
      };
      const cartTotal = json.cart?.count ?? 0;
      const addedCount = json.added?.length ?? 0;
      if (!response.ok) {
        setError(json.error || "We couldn't add these domains right now.");
        return;
      }
      if (addedCount === 0 && cartTotal === 0) {
        setError(
          json.error ||
            "No selected domains are available anymore. Search again.",
        );
        return;
      }
      setCartCount(cartTotal);
      dispatchDomainCartUpdated(cartTotal);
      if (json.rejected?.length) {
        setError(
          `Some domains could not be added: ${json.rejected.map((r) => r.domain).join(", ")}`,
        );
      } else {
        setCartSuccess(
          `${addedCount} domain${addedCount === 1 ? "" : "s"} added to your cart.`,
        );
      }
    } catch {
      setError("We couldn't add these domains right now. Please try again.");
    } finally {
      setBulkAdding(false);
    }
  }, [bulkAdding, bulkSelected]);

  useEffect(() => {
    if (mode === "single" && initialQuery.trim()) {
      void runSingle(initialQuery);
    }
  }, [initialQuery, mode, runSingle]);

  function onSingleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) {
      setError("Please enter a domain name.");
      return;
    }
    void runSingle(query);
  }

  function onBulkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bulk.trim()) {
      setError(`Add one domain per line, up to ${BULK_LIMIT} at a time.`);
      return;
    }
    void runBulk(bulk);
  }

  const exact =
    results.find((item) => item.domain === anchorDomain) ??
    results.find((item) => item.domain === searched) ??
    results[0];
  const recommendationCandidates = results
    .filter(
      (item) =>
        item.domain !== exact?.domain && isRegisterableRecommendation(item),
    )
    .sort(sortRecommendations);
  const recommendationAvailableCount = recommendationCandidates.length;
  const showAvailabilitySummary =
    mode === "single" &&
    !loadingPrimary &&
    alternativesComplete &&
    recommendationCandidates.length >= 0 &&
    exact != null;

  return (
    <div
      className={cn(
        "w-full rounded-[24px] border border-white/70 bg-white shadow-[0_34px_80px_-34px_rgba(15,10,40,0.6)] ring-1 ring-black/[0.03] sm:rounded-[28px] 2xl:rounded-[32px]",
        hero ? "p-4 sm:p-6 md:p-7 lg:p-8" : "p-4 sm:rounded-[32px] sm:p-6",
      )}
    >
      <nav
        aria-label="Search mode"
        className="flex w-full [scrollbar-width:none] gap-0.5 overflow-x-auto rounded-full bg-[#f3f1ff] p-1 [-ms-overflow-style:none] sm:gap-1 [&::-webkit-scrollbar]:hidden"
      >
        {MODE_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.id === "transfer" ? false : mode === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              title={tab.label}
              className={cn(
                "inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-2 text-[11px] font-bold whitespace-nowrap transition sm:h-11 sm:gap-2 sm:px-3 sm:text-[13px] md:text-[14px]",
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

      {cartSuccess ? (
        <p
          role="status"
          className="mt-3 rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-2.5 text-[13px] font-semibold text-[#166534]"
        >
          {cartSuccess}{" "}
          <Link href={routes.domainCheckout} className="font-bold underline">
            View cart
          </Link>
        </p>
      ) : null}

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
                  void runSingle(next);
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

      <div aria-live="polite" aria-busy={loading} className="mt-5">
        {loadingPrimary && results.length === 0 ? (
          <div className="space-y-2.5">
            <SkeletonRow />
          </div>
        ) : null}

        {results.length > 0 ? (
          <div key={searched} className="hb-fade-up space-y-2.5">
            {mode === "bulk" && buyableResults.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#e9e5ff] bg-[#f8f5ff] px-3 py-2">
                <button
                  type="button"
                  onClick={selectAllBuyable}
                  className="text-[12px] font-bold text-[#4c1d95] hover:underline"
                >
                  Select all available ({buyableResults.length})
                </button>
                <button
                  type="button"
                  onClick={clearBulkSelection}
                  className="text-[12px] font-bold text-slate-500 hover:underline"
                >
                  Clear
                </button>
                <button
                  type="button"
                  disabled={bulkSelected.size === 0 || bulkAdding}
                  onClick={() => void addBulkToCart()}
                  className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full bg-[#673de6] px-4 text-[12px] font-bold text-white disabled:opacity-60"
                >
                  {bulkAdding ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : null}
                  Add {bulkSelected.size} to cart
                </button>
              </div>
            ) : null}
            {showAvailabilitySummary && recommendationAvailableCount > 0 ? (
              <div className="flex flex-wrap items-center gap-2 text-[12.5px] font-semibold text-slate-500">
                <BadgeCheck className="size-4 text-[#15803d]" />
                {recommendationAvailableCount} available alternative
                {recommendationAvailableCount === 1 ? "" : "s"} found.
              </div>
            ) : null}
            {exact ? (
              <ResultRow
                result={exact}
                featured
                onRegister={registerDomain}
                registering={registering}
                bulkSelectable={
                  mode === "bulk" &&
                  buyableResults.some((r) => r.domain === exact.domain)
                }
                bulkSelected={bulkSelected.has(exact.domain)}
                onBulkToggle={toggleBulkDomain}
              />
            ) : null}
            {mode === "single" && loadingAlternatives ? (
              <p className="flex items-center gap-2 pt-1 text-[12.5px] font-semibold text-slate-500">
                <Loader2 className="size-4 animate-spin text-[#673de6]" />
                Finding available alternatives…
              </p>
            ) : null}
            {mode === "single" && recommendationCandidates.length > 0 ? (
              <>
                <p className="pt-2 text-[12px] font-bold tracking-wide text-slate-500 uppercase">
                  {exact?.status === "taken"
                    ? "Available alternatives"
                    : "Other available extensions"}
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 [@media(min-width:1800px)]:grid-cols-4">
                  {recommendationCandidates.map((item) => (
                    <ResultRow
                      key={item.domain}
                      result={item}
                      onRegister={registerDomain}
                      registering={registering}
                    />
                  ))}
                </div>
              </>
            ) : null}
            {mode === "bulk" ? (
              <>
                <p className="pt-2 text-[12px] font-bold tracking-wide text-slate-500 uppercase">
                  Your list
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                  {results
                    .filter((item) => item.domain !== exact?.domain)
                    .map((item) => (
                      <ResultRow
                        key={item.domain}
                        result={item}
                        onRegister={registerDomain}
                        registering={registering}
                        bulkSelectable={
                          item.status === "available" ||
                          item.status === "premium"
                        }
                        bulkSelected={bulkSelected.has(item.domain)}
                        onBulkToggle={toggleBulkDomain}
                      />
                    ))}
                </div>
              </>
            ) : null}
            {mode === "single" &&
            exact?.status === "taken" &&
            alternativesComplete &&
            !loadingAlternatives &&
            recommendationCandidates.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-600">
                No available alternatives were found for this name. Try a
                different spelling or search another brand.
              </p>
            ) : null}
          </div>
        ) : null}

        {!loading && results.length === 0 && !error ? (
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-500">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-[#673de6]" />
            {mode === "bulk"
              ? `Paste your shortlist — we check every line and show first-year plus renewal pricing side by side.`
              : `Type any idea — we check popular extensions in parallel and show first-year plus renewal pricing before you buy.`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
