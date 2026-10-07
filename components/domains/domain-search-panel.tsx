"use client";

import {
  type FormEvent,
  memo,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
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
  Globe2,
  Layers,
  Loader2,
  Lock,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useDomainCart } from "@/components/domains/domain-cart-provider";
import { routes } from "@/config/routes";
import { loginPathForDomainCheckout } from "@/lib/domains/domain-purchase-intent";
import type { DomainResult } from "@/lib/domains/availability";
import { dispatchDomainCartUpdated } from "@/lib/domains/domain-cart-events";
import { sortByRecommendationPriority } from "@/lib/domains/recommendation-priority";
import { SUGGESTED_TLDS, formatPrice } from "@/lib/domains/tlds";
import { cn } from "@/lib/utils";

export type SearchMode = "single" | "bulk";

const QUICK_TLDS = SUGGESTED_TLDS.slice(0, 6);
const BULK_LIMIT = 50;
const MAX_CUSTOMER_ALTERNATIVES = 10;
const ALTERNATIVE_SKELETON_COUNT = 3;

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

/** Merge provider alternatives without reordering existing rows until `sort` is true. */
function mergeRegisterableAlternatives(
  current: DomainResult[],
  incoming: DomainResult[],
  primaryDomain: string,
  options: { sort: boolean },
): DomainResult[] {
  const primaryKey = primaryDomain.toLowerCase();
  const order: string[] = current.map((r) => r.domain.toLowerCase());
  const map = new Map<string, DomainResult>();
  for (const row of current) {
    map.set(row.domain.toLowerCase(), row);
  }
  for (const row of incoming) {
    const key = row.domain.toLowerCase();
    if (key === primaryKey) continue;
    if (!isRegisterableRecommendation(row)) continue;
    if (!map.has(key)) order.push(key);
    map.set(key, row);
  }
  let list = order
    .map((key) => map.get(key))
    .filter((row): row is DomainResult => row != null);
  if (options.sort) {
    list = list.sort(sortRecommendations);
  }
  return list.slice(0, MAX_CUSTOMER_ALTERNATIVES);
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

type CartButtonState = "idle" | "loading" | "added" | "in-cart";

const ResultRow = memo(function ResultRow({
  result,
  featured = false,
  animateIn = false,
  onRegister,
  registering,
  cartButtonState = "idle",
  onViewCart,
  bulkSelectable = false,
  bulkSelected = false,
  onBulkToggle,
}: {
  result: DomainResult;
  featured?: boolean;
  animateIn?: boolean;
  onRegister: (domain: string) => void;
  registering: string | null;
  cartButtonState?: CartButtonState;
  onViewCart?: () => void;
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
        animateIn && "hb-domain-card-in",
        featured
          ? "border-[#d4c9ff] bg-gradient-to-br from-[#faf8ff] to-white shadow-[0_10px_28px_-18px_rgba(47,28,106,0.28)] sm:p-4"
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
            {featured ? (
              <Globe2
                className="size-4 shrink-0 text-[#673de6]/80"
                aria-hidden
              />
            ) : null}
            <p
              className={cn(
                "min-w-0 font-extrabold tracking-tight break-words text-[#1a1035]",
                featured ? "text-[17px] sm:text-[20px]" : "text-[15.5px]",
              )}
              style={{ overflowWrap: "anywhere" }}
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
            cartButtonState === "in-cart" ? (
              <button
                type="button"
                onClick={() => onViewCart?.()}
                className="inline-flex h-11 min-h-[44px] w-full shrink-0 items-center justify-center gap-1.5 rounded-full border-2 border-[#673de6] bg-white px-5 text-[13.5px] font-bold whitespace-nowrap text-[#673de6] transition hover:bg-[#f7f4ff] sm:w-auto"
              >
                View cart
                <ArrowRight className="size-4" aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                disabled={registering !== null}
                onClick={() => onRegister(result.domain)}
                className={cn(
                  "inline-flex h-11 min-h-[44px] w-full shrink-0 items-center justify-center gap-1.5 rounded-full px-5 text-[13.5px] font-bold whitespace-nowrap text-white shadow-[0_10px_22px_-10px_rgba(103,61,230,0.85)] transition disabled:opacity-70 sm:w-auto",
                  cartButtonState === "added"
                    ? "bg-[#15803d] hover:bg-[#166534]"
                    : "bg-[#673de6] hover:bg-[#5a31d4]",
                )}
              >
                {cartButtonState === "loading" ||
                registering === result.domain ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : cartButtonState === "added" ? (
                  <>
                    <Check className="size-4" strokeWidth={3} />
                    Added
                  </>
                ) : (
                  <>
                    Add to cart
                    <ArrowRight className="size-4" aria-hidden />
                  </>
                )}
              </button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
});

function PrimaryResultSkeleton() {
  return (
    <div
      className="rounded-2xl border border-[#e8e4ff] bg-gradient-to-br from-[#faf8ff] to-white p-4 shadow-[0_10px_28px_-18px_rgba(47,28,106,0.2)] sm:p-4"
      aria-busy="true"
      aria-label="Checking domain availability"
    >
      <div className="hb-domain-skeleton-shimmer flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="h-6 w-48 max-w-full rounded-lg bg-slate-200/80" />
          <div className="h-3.5 w-56 max-w-full rounded bg-slate-100" />
        </div>
        <div className="h-10 w-32 rounded-full bg-slate-100/90" />
      </div>
    </div>
  );
}

const AlternativeCardSkeleton = memo(function AlternativeCardSkeleton({
  nameHint,
}: {
  nameHint: string;
}) {
  const base = nameHint.split(".")[0]?.trim() || "yourname";
  return (
    <div
      className="flex h-full min-h-[148px] flex-col rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_8px_24px_-20px_rgba(47,28,106,0.32)]"
      aria-hidden
    >
      <div className="hb-domain-skeleton-shimmer flex min-h-[116px] flex-col space-y-2">
        <p className="text-[15.5px] font-extrabold tracking-tight text-[#1a1035]">
          {base}
          <span className="ml-0.5 inline-block h-[0.95em] w-10 translate-y-[1px] rounded bg-slate-200/90 align-middle" />
        </p>
        <p className="text-[12px] font-semibold text-slate-400">
          Checking availability…
        </p>
        <div className="mt-auto space-y-1.5 pt-4">
          <div className="h-5 w-24 rounded bg-slate-200/75" />
          <div className="h-3 w-[4.5rem] rounded bg-slate-100" />
        </div>
        <div className="h-11 w-full rounded-full bg-slate-100/90" />
      </div>
    </div>
  );
});

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
  const [loadingTier2, setLoadingTier2] = useState(false);
  const [alternativesComplete, setAlternativesComplete] = useState(false);
  const [alternativesWarning, setAlternativesWarning] = useState("");
  const [error, setError] = useState("");
  const [cartSuccess, setCartSuccess] = useState("");
  const [primaryResult, setPrimaryResult] = useState<DomainResult | null>(null);
  const [alternativeResults, setAlternativeResults] = useState<DomainResult[]>(
    [],
  );
  const [results, setResults] = useState<DomainResult[]>([]);
  const [searched, setSearched] = useState("");
  const [anchorDomain, setAnchorDomain] = useState("");
  const [registering, setRegistering] = useState<string | null>(null);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(
    () => new Set(),
  );
  const [bulkAdding, setBulkAdding] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [justAddedDomains, setJustAddedDomains] = useState<Set<string>>(
    () => new Set(),
  );
  const { addDomain, domainsInCart, openDrawer } = useDomainCart();
  const searchGeneration = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  /** Only disables the submit control while the exact match is loading. */
  const searchSubmitting = loadingPrimary;
  const alternativesBusy = loadingAlternatives || loadingTier2;

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
    setLoadingTier2(false);
    setAlternativesComplete(false);
    setAlternativesWarning("");
    setError("");
    setCartSuccess("");
    setPrimaryResult(null);
    setAlternativeResults([]);
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
    setLoadingTier2(false);
    setAlternativesComplete(false);
    setAlternativesWarning("");
    setError("");
    setCartSuccess("");
    setPrimaryResult(null);
    setAlternativeResults([]);
    setResults([]);
    setSearched(trimmed);

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms);
      });

    const searchJson = async (body: Record<string, unknown>, retries = 4) => {
      for (let attempt = 0; attempt < retries; attempt++) {
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
          suggestTier2?: boolean;
          deepDiscoveryAvailable?: boolean;
          primary?: DomainResult | null;
          recommendations?: DomainResult[];
          alternativesComplete?: boolean;
          fastChunk2Available?: boolean;
        };
        if (res.status === 429 && attempt < retries - 1) {
          await sleep(600 * (attempt + 1));
          continue;
        }
        return { res, json };
      }
      return {
        res: new Response(null, { status: 429 }),
        json: {
          error: "Availability check is temporarily busy. Please try again.",
        },
      };
    };

    try {
      const { res: primaryRes, json: primaryJson } = await searchJson({
        query: trimmed,
        scope: "primary",
      });
      if (gen !== searchGeneration.current) return;

      const primaryRow =
        primaryJson.primary ?? primaryJson.results?.[0] ?? null;

      if (!primaryRes.ok || !primaryRow) {
        setPrimaryResult(null);
        setAlternativeResults([]);
        setAnchorDomain("");
        setError(
          primaryJson.error ||
            "Domain availability is temporarily taking longer than usual. Please try again.",
        );
        setLoadingPrimary(false);
        setLoadingAlternatives(false);
        setAlternativesComplete(true);
        return;
      }

      setPrimaryResult(primaryRow);
      setAlternativeResults([]);
      setAnchorDomain(primaryJson.anchorDomain ?? primaryRow.domain);
      setBulkSelected(new Set());
      setLoadingPrimary(false);
      setLoadingAlternatives(true);

      const { res: altRes, json: altJson } = await searchJson({
        query: trimmed,
        scope: "alternatives",
        tier: 1,
      });
      if (gen !== searchGeneration.current) return;

      const fastAlts =
        altJson.recommendations ??
        altJson.results?.filter((r) => r.domain !== primaryRow.domain) ??
        [];

      if (!altRes.ok) {
        setAlternativesWarning(
          "Some additional suggestions could not be loaded.",
        );
      } else if (fastAlts.length) {
        startTransition(() => {
          setAlternativeResults((prev) =>
            mergeRegisterableAlternatives(prev, fastAlts, primaryRow.domain, {
              sort: false,
            }),
          );
        });
      }
      setLoadingAlternatives(false);

      let altCount = mergeRegisterableAlternatives(
        [],
        fastAlts,
        primaryRow.domain,
        { sort: false },
      ).length;
      let deepStillAvailable = altJson.deepDiscoveryAvailable === true;
      let searchComplete = altJson.alternativesComplete ?? false;

      const runFastChunk2 =
        altJson.fastChunk2Available === true &&
        altCount < MAX_CUSTOMER_ALTERNATIVES &&
        !controller.signal.aborted;

      if (runFastChunk2) {
        setLoadingTier2(true);
        const { res: fastBRes, json: fastBJson } = await searchJson({
          query: trimmed,
          scope: "alternatives",
          tier: 2,
        });
        if (gen !== searchGeneration.current) return;
        const fastBAlts =
          fastBJson.recommendations ??
          fastBJson.results?.filter((r) => r.domain !== primaryRow.domain) ??
          [];
        if (fastBRes.ok && fastBAlts.length) {
          startTransition(() => {
            setAlternativeResults((prev) =>
              mergeRegisterableAlternatives(
                prev,
                fastBAlts,
                primaryRow.domain,
                {
                  sort: false,
                },
              ),
            );
          });
          altCount = mergeRegisterableAlternatives(
            [],
            [...fastAlts, ...fastBAlts],
            primaryRow.domain,
            { sort: false },
          ).length;
        } else if (!fastBRes.ok) {
          setAlternativesWarning(
            "Some additional suggestions could not be loaded.",
          );
        }
        deepStillAvailable = fastBJson.deepDiscoveryAvailable === true;
        searchComplete = fastBJson.alternativesComplete ?? searchComplete;
        setLoadingTier2(false);
      }

      const runDeep =
        deepStillAvailable &&
        altCount < MAX_CUSTOMER_ALTERNATIVES &&
        !controller.signal.aborted;

      if (runDeep) {
        setLoadingTier2(true);
        const { res: deepRes, json: deepJson } = await searchJson({
          query: trimmed,
          scope: "deep",
        });
        if (gen !== searchGeneration.current) return;
        if (deepRes.ok && deepJson.results?.length) {
          startTransition(() => {
            setAlternativeResults((prev) =>
              mergeRegisterableAlternatives(
                prev,
                deepJson.results!,
                primaryRow.domain,
                { sort: false },
              ),
            );
          });
        } else if (!deepRes.ok) {
          setAlternativesWarning(
            "Some additional suggestions could not be loaded.",
          );
        }
        setLoadingTier2(false);
        searchComplete = true;
      }

      if (gen === searchGeneration.current) {
        startTransition(() => {
          setAlternativeResults((prev) =>
            mergeRegisterableAlternatives(prev, [], primaryRow.domain, {
              sort: true,
            }),
          );
          setAlternativesComplete(searchComplete || altCount >= 0);
        });
      }
    } catch (err) {
      if (gen !== searchGeneration.current) return;
      if (err instanceof DOMException && err.name === "AbortError") return;
      setPrimaryResult(null);
      setAlternativeResults([]);
      setAnchorDomain("");
      setError("We couldn't check this domain right now. Please try again.");
    } finally {
      if (gen === searchGeneration.current) {
        setLoadingPrimary(false);
        setLoadingAlternatives(false);
        setLoadingTier2(false);
      }
    }
  }, []);

  const registerDomain = useCallback(
    async (domain: string) => {
      if (registering) return;
      if (domainsInCart.has(domain.toLowerCase())) {
        openDrawer();
        return;
      }
      setRegistering(domain);
      setError("");
      try {
        const result = await addDomain(domain);
        if (!result.ok) {
          setError(
            result.error ||
              "We couldn't add this domain right now. Please try again.",
          );
          return;
        }
        if (result.duplicate) {
          setCartSuccess("You already added this domain.");
          openDrawer();
          return;
        }
        setJustAddedDomains((prev) => new Set(prev).add(domain.toLowerCase()));
        window.setTimeout(() => {
          setJustAddedDomains((prev) => {
            const next = new Set(prev);
            next.delete(domain.toLowerCase());
            return next;
          });
        }, 2200);
        setCartSuccess(`${domain} was added to your cart.`);
        void refreshCartCount();
      } catch {
        setError("We couldn't add this domain right now. Please try again.");
      } finally {
        setRegistering(null);
      }
    },
    [registering, addDomain, domainsInCart, openDrawer, refreshCartCount],
  );

  const cartButtonStateFor = useCallback(
    (domain: string): CartButtonState => {
      const key = domain.toLowerCase();
      if (registering === domain) return "loading";
      if (justAddedDomains.has(key)) return "added";
      if (domainsInCart.has(key)) return "in-cart";
      return "idle";
    },
    [registering, justAddedDomains, domainsInCart],
  );

  const buyableResults = useMemo(
    () => results.filter(isRegisterableRecommendation),
    [results],
  );

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
    mode === "single"
      ? primaryResult
      : (results.find((item) => item.domain === anchorDomain) ??
        results.find((item) => item.domain === searched) ??
        results[0]);

  const recommendationCandidates = useMemo(() => {
    if (mode !== "single") return [];
    return alternativeResults;
  }, [mode, alternativeResults]);

  const hasResults =
    mode === "single" ? primaryResult != null : results.length > 0;

  const showAlternativesSection =
    mode === "single" &&
    exact != null &&
    (alternativesBusy || recommendationCandidates.length > 0);

  const alternativeSkeletonSlots = showAlternativesSection
    ? Math.max(
        0,
        Math.min(
          ALTERNATIVE_SKELETON_COUNT,
          MAX_CUSTOMER_ALTERNATIVES - recommendationCandidates.length,
        ),
      )
    : 0;

  const showAlternativeSkeletons =
    alternativesBusy && alternativeSkeletonSlots > 0;

  const alternativesHeading =
    exact?.status === "taken"
      ? "Available alternatives"
      : "Other available extensions";
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
          <button
            type="button"
            onClick={() => openDrawer()}
            className="font-bold underline"
          >
            View cart
          </button>
          <span className="text-slate-400"> · </span>
          <Link href={routes.domainCart} className="font-bold underline">
            Full cart page
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
              disabled={searchSubmitting}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#673de6] font-bold text-white shadow-[0_12px_26px_-14px_rgba(37,99,235,0.9)] transition hover:brightness-110 disabled:opacity-70",
                hero
                  ? "h-12 px-7 text-[14px] sm:h-14 sm:px-8 sm:text-[15px]"
                  : "h-12 px-6 text-[14px]",
              )}
            >
              {searchSubmitting ? (
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
              disabled={searchSubmitting}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#673de6] px-6 text-[14px] font-bold text-white shadow-[0_12px_26px_-14px_rgba(37,99,235,0.9)] transition hover:brightness-110 disabled:opacity-70"
            >
              {searchSubmitting ? (
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

      <div
        aria-live="polite"
        aria-busy={loadingPrimary || alternativesBusy}
        className="mx-auto mt-5 w-full max-w-[78rem]"
      >
        {loadingPrimary && !hasResults ? (
          <div className="space-y-2.5">
            <PrimaryResultSkeleton />
          </div>
        ) : null}

        {hasResults ? (
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
                animateIn={mode === "single"}
                onRegister={registerDomain}
                registering={registering}
                cartButtonState={
                  mode === "single" ? cartButtonStateFor(exact.domain) : "idle"
                }
                onViewCart={openDrawer}
                bulkSelectable={
                  mode === "bulk" &&
                  buyableResults.some((r) => r.domain === exact.domain)
                }
                bulkSelected={bulkSelected.has(exact.domain)}
                onBulkToggle={toggleBulkDomain}
              />
            ) : null}
            {alternativesWarning ? (
              <p className="text-[12.5px] font-medium text-slate-500">
                {alternativesWarning}
              </p>
            ) : null}
            {showAlternativesSection ? (
              <section aria-label={alternativesHeading} className="pt-1">
                <p className="text-[12px] font-bold tracking-wide text-slate-500 uppercase">
                  {alternativesHeading}
                </p>
                {alternativesBusy && recommendationCandidates.length === 0 ? (
                  <p className="mt-1 text-[12.5px] font-medium text-slate-500">
                    Checking other extensions for this name…
                  </p>
                ) : null}
                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {recommendationCandidates.map((item) => (
                    <ResultRow
                      key={item.domain}
                      result={item}
                      onRegister={registerDomain}
                      registering={registering}
                      cartButtonState={cartButtonStateFor(item.domain)}
                      onViewCart={openDrawer}
                    />
                  ))}
                  {showAlternativeSkeletons
                    ? Array.from({ length: alternativeSkeletonSlots }).map(
                        (_, index) => (
                          <AlternativeCardSkeleton
                            key={`alt-skeleton-${index}`}
                            nameHint={searched}
                          />
                        ),
                      )
                    : null}
                </div>
                {loadingTier2 && recommendationCandidates.length > 0 ? (
                  <p className="mt-2 text-[11.5px] font-medium text-slate-400">
                    Still checking a few more extensions…
                  </p>
                ) : null}
              </section>
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
            !alternativesBusy &&
            recommendationCandidates.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-600">
                No available alternatives were found for this name. Try a
                different spelling or search another brand.
              </p>
            ) : null}
          </div>
        ) : null}

        {!searchSubmitting && !hasResults && !error ? (
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
