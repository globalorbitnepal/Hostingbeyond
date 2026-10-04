"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, Loader2, Lock, Search } from "lucide-react";

import {
  formatAddonsReviewSummary,
  HostingCartAddonCards,
} from "@/components/hosting/hosting-cart-addon-cards";
import { routes } from "@/config/routes";
import type { CartAddonUiModel } from "@/lib/hosting/addons/load-cart-ui";
import {
  loginPathForCheckout,
  signupPathForCheckout,
} from "@/lib/hosting/checkout-intent";
import type { HostingCartQuote } from "@/lib/hosting/cart/types";
import { HOSTING_CART_STORAGE_KEY } from "@/lib/hosting/cart/types";
import {
  serializeHostingPurchaseIntent,
  type HostingPurchaseIntent,
} from "@/lib/hosting/purchase-intent";

type DomainSearchResult = {
  domain: string;
  status: string;
  priceFirstYear?: string;
};

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export type HostingCartCheckoutProps = {
  intent: HostingPurchaseIntent;
  initialQuote: HostingCartQuote;
  cartAddons: CartAddonUiModel[];
  logoPath: string;
  isLoggedIn: boolean;
  billingMonthlyEnabled: boolean;
  billingYearlyEnabled: boolean;
};

export function HostingCartCheckoutView(props: HostingCartCheckoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = searchParams.get("step") === "review" ? "review" : "configure";

  const [quote, setQuote] = useState(props.initialQuote);
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [domainQuery, setDomainQuery] = useState(
    props.initialQuote.configuration.domainName ?? "",
  );
  const [domainResults, setDomainResults] = useState<DomainSearchResult[]>([]);
  const [domainSource, setDomainSource] = useState<string | null>(null);
  const [domainSearching, setDomainSearching] = useState(false);
  const [domainSearchError, setDomainSearchError] = useState<string | null>(
    null,
  );

  const logo = props.logoPath?.trim() || "/logo/hostingbeyond-logo-v6.png";
  const intentQuery = serializeHostingPurchaseIntent(props.intent);

  const persistExtras = useCallback((q: HostingCartQuote) => {
    try {
      sessionStorage.setItem(
        HOSTING_CART_STORAGE_KEY,
        JSON.stringify(q.configuration),
      );
    } catch {
      /* ignore */
    }
  }, []);

  const refreshQuote = useCallback(
    async (patch: Partial<HostingCartQuote["configuration"]>) => {
      setLoading(true);
      setOrderError(null);
      const nextConfig = { ...quote.configuration, ...patch };
      try {
        const res = await fetch("/api/hosting/cart/quote", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(nextConfig),
        });
        const json = (await res.json()) as { quote?: HostingCartQuote };
        if (json.quote) {
          setQuote(json.quote);
          persistExtras(json.quote);
        }
      } finally {
        setLoading(false);
      }
    },
    [quote.configuration, persistExtras],
  );

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(HOSTING_CART_STORAGE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as HostingCartQuote["configuration"];
      if (
        stored.productSlug === props.intent.product &&
        stored.planKey === props.intent.plan
      ) {
        void refreshQuote(stored);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once
  }, []);

  const setBilling = (billing: "monthly" | "annually") => {
    const params = new URLSearchParams(intentQuery);
    params.set("billing", billing);
    router.replace(`/checkout/hosting?${params.toString()}`);
    void refreshQuote({ billingPeriod: billing });
  };

  const domainChoice = quote.configuration.domainChoice;
  const isAnnual = quote.configuration.billingPeriod === "annually";

  const domainSummary = useMemo(() => {
    if (!isAnnual || !quote.freeDomainEligible) {
      return "Add a domain separately";
    }
    if (domainChoice === "later") return "Decide later";
    if (domainChoice === "existing") {
      return quote.configuration.domainName
        ? `Existing: ${quote.configuration.domainName}`
        : "I already own a domain";
    }
    if (domainChoice === "search" && quote.configuration.domainName) {
      return quote.configuration.domainName;
    }
    return "Choose a domain option";
  }, [domainChoice, isAnnual, quote]);

  const addonsSummary = useMemo(
    () => formatAddonsReviewSummary(quote.configuration, props.cartAddons),
    [quote.configuration, props.cartAddons],
  );

  async function runDomainSearch() {
    const q = domainQuery.trim();
    if (!q) return;
    setDomainSearching(true);
    setDomainSearchError(null);
    setDomainResults([]);
    try {
      const res = await fetch("/api/domains/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const json = (await res.json()) as {
        results?: DomainSearchResult[];
        source?: string;
        error?: string;
      };
      if (!res.ok) {
        setDomainSearchError(json.error ?? "Search failed.");
        return;
      }
      setDomainResults(json.results ?? []);
      setDomainSource(json.source ?? "hostingbeyond");
    } catch {
      setDomainSearchError("Could not reach domain search.");
    } finally {
      setDomainSearching(false);
    }
  }

  async function handleContinue() {
    if (step === "configure") {
      router.push(`/checkout/hosting?${intentQuery}&step=review`);
      return;
    }
    if (!props.isLoggedIn) {
      router.push(signupPathForCheckout({ purchase: props.intent }));
      return;
    }
    setLoading(true);
    setOrderError(null);
    try {
      const res = await fetch("/api/hosting/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...quote.configuration,
          status: "PENDING_PAYMENT",
        }),
      });
      const json = (await res.json()) as { error?: string; orderId?: string };
      if (!res.ok) {
        setOrderError(json.error ?? "Could not save your order.");
        return;
      }
      router.push(`${routes.account}?order=${json.orderId ?? ""}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh [scroll-padding-bottom:7rem] bg-[#f6f4fc] lg:[scroll-padding-bottom:0]">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <img src={logo} alt="HostingBeyond" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-2 text-[13px] text-slate-600">
            <Lock className="size-3.5 text-[#673de6]" aria-hidden />
            <span className="font-semibold text-[#2f1c6a]">
              Secure checkout
            </span>
            <span className="hidden text-slate-400 sm:inline">·</span>
            <span className="hidden sm:inline">Configure your hosting</span>
          </div>
        </div>
      </header>

      <nav
        className="mx-auto max-w-[1240px] px-4 pt-6 text-[13px] text-slate-500 sm:px-6"
        aria-label="Checkout progress"
      >
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link
              href={routes.hosting}
              className="font-medium hover:text-[#673de6]"
            >
              Web Hosting
            </Link>
          </li>
          <ChevronRight className="size-3.5 opacity-50" aria-hidden />
          <li>
            <Link
              href={`${routes.hosting}#plans`}
              className="font-medium hover:text-[#673de6]"
            >
              Plan
            </Link>
          </li>
          <ChevronRight className="size-3.5 opacity-50" aria-hidden />
          <li className="font-semibold text-[#2f1c6a]">
            {step === "review" ? "Review" : "Configure"}
          </li>
        </ol>
      </nav>

      <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-8 pb-28 sm:px-6 lg:grid-cols-[1fr_360px] lg:items-start lg:pb-12">
        <div className="space-y-6">
          {step === "review" ? (
            <section className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
              <h1 className="font-heading text-2xl font-extrabold text-[#2f1c6a]">
                Order review
              </h1>
              <p className="mt-2 text-[15px] text-slate-600">
                Confirm details before you continue. Payment is collected when
                billing checkout is enabled — we do not process payment on this
                preview.
              </p>
              <dl className="mt-6 space-y-4 text-[15px]">
                <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">Hosting</dt>
                  <dd className="text-right font-semibold text-[#2f1c6a]">
                    {quote.planName}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">Billing</dt>
                  <dd className="font-semibold text-[#2f1c6a]">
                    {isAnnual ? "Annual" : "Monthly"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">Domain</dt>
                  <dd className="text-right font-semibold text-[#2f1c6a]">
                    {domainSummary}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Add-ons</dt>
                  <dd className="text-right font-semibold text-[#2f1c6a]">
                    {addonsSummary}
                  </dd>
                </div>
              </dl>
              <button
                type="button"
                className="mt-6 text-[14px] font-semibold text-[#673de6] hover:underline"
                onClick={() => router.push(`/checkout/hosting?${intentQuery}`)}
              >
                Edit configuration
              </button>
            </section>
          ) : (
            <>
              <section className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.18em] text-slate-500 uppercase">
                      {quote.productName || "Web Hosting"}
                    </p>
                    <h1 className="font-heading mt-1 text-[1.75rem] font-extrabold text-[#2f1c6a]">
                      {quote.planName}
                    </h1>
                    <p className="mt-1 text-[14px] text-slate-600">
                      Selected billing:{" "}
                      <span className="font-semibold text-[#2f1c6a]">
                        {isAnnual ? "Annual" : "Monthly"}
                      </span>
                    </p>
                    {quote.monthlyEquivalent != null ? (
                      <p className="mt-3 text-[1.5rem] font-extrabold text-[#673de6]">
                        {money(quote.monthlyEquivalent, quote.currency)}/mo
                        {isAnnual ? (
                          <span className="ml-2 text-[14px] font-medium text-slate-500">
                            promotional equivalent
                          </span>
                        ) : null}
                      </p>
                    ) : null}
                    <p className="text-[13px] text-slate-500">
                      Billed {money(quote.billedAmount, quote.currency)}
                      {isAnnual ? "/year" : "/month"}
                    </p>
                    {quote.renewalPrice != null ? (
                      <p className="mt-1 text-[13px] text-slate-500">
                        Renewal: {money(quote.renewalPrice, quote.currency)}
                      </p>
                    ) : null}
                  </div>
                  <Link
                    href={`${routes.hosting}#plans`}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-[14px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Change plan
                  </Link>
                </div>
                {quote.features.length > 0 ? (
                  <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                    {quote.features.slice(0, 6).map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-[14px] text-slate-700"
                      >
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-emerald-600"
                          aria-hidden
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>

              <section className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-heading text-lg font-extrabold text-[#2f1c6a]">
                  Billing period
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {props.billingMonthlyEnabled ? (
                    <button
                      type="button"
                      onClick={() => setBilling("monthly")}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        !isAnnual
                          ? "border-[#673de6] bg-[#f3eeff] ring-1 ring-[#673de6]/30"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-[15px] font-bold text-[#2f1c6a]">
                        Monthly
                      </span>
                      <p className="mt-1 text-[13px] text-slate-600">
                        Pay month to month
                      </p>
                    </button>
                  ) : null}
                  {props.billingYearlyEnabled ? (
                    <button
                      type="button"
                      onClick={() => setBilling("annually")}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        isAnnual
                          ? "border-[#673de6] bg-[#f3eeff] ring-1 ring-[#673de6]/30"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-[15px] font-bold text-[#2f1c6a]">
                        Annual
                      </span>
                      <p className="mt-1 text-[13px] text-slate-600">
                        {quote.discount > 0
                          ? `Save ${money(quote.discount, quote.currency)} vs monthly`
                          : "Best value when available"}
                      </p>
                    </button>
                  ) : null}
                </div>
              </section>

              <section className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-heading text-lg font-extrabold text-[#2f1c6a]">
                  Domain
                </h2>
                {isAnnual && quote.freeDomainEligible ? (
                  <>
                    <p className="mt-2 text-[14px] text-slate-600">
                      Free domain for 1 year — eligible annual plans only
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(
                        [
                          ["search", "Search new domain"],
                          ["existing", "I already own a domain"],
                          ["later", "Decide later"],
                        ] as const
                      ).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            void refreshQuote({ domainChoice: value })
                          }
                          className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
                            domainChoice === value
                              ? "bg-[#673de6] text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {domainChoice === "search" ? (
                      <div className="mt-4">
                        <label className="text-[13px] font-semibold text-slate-700">
                          Search a domain name
                        </label>
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            value={domainQuery}
                            onChange={(e) => setDomainQuery(e.target.value)}
                            placeholder="yourbrand"
                            className="h-11 flex-1 rounded-xl border border-slate-200 px-3 text-[15px]"
                          />
                          <button
                            type="button"
                            onClick={() => void runDomainSearch()}
                            disabled={domainSearching}
                            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2f1c6a] px-4 text-[14px] font-bold text-white disabled:opacity-60"
                          >
                            {domainSearching ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Search className="size-4" />
                            )}
                            Search
                          </button>
                        </div>
                        {domainSource ? (
                          <p className="mt-2 text-[12px] text-slate-500">
                            Lookup via{" "}
                            {domainSource === "registrar"
                              ? "connected registrar API"
                              : "HostingBeyond availability service"}
                            {domainSource !== "registrar"
                              ? " — set DOMAIN_LOOKUP_URL for live registrar checks"
                              : ""}
                          </p>
                        ) : null}
                        {domainSearchError ? (
                          <p className="mt-2 text-[13px] text-red-600">
                            {domainSearchError}
                          </p>
                        ) : null}
                        {domainResults.length > 0 ? (
                          <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
                            {domainResults.map((r) => (
                              <li key={r.domain}>
                                <button
                                  type="button"
                                  disabled={r.status !== "available"}
                                  onClick={() =>
                                    void refreshQuote({
                                      domainName: r.domain,
                                      domainChoice: "search",
                                    })
                                  }
                                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-[14px] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <span className="font-medium">
                                    {r.domain}
                                  </span>
                                  <span className="text-slate-500 capitalize">
                                    {r.status}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}
                    {domainChoice === "existing" ? (
                      <div className="mt-4">
                        <label
                          htmlFor="existing-domain"
                          className="text-[13px] font-semibold text-slate-700"
                        >
                          Your domain name
                        </label>
                        <input
                          id="existing-domain"
                          type="text"
                          className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-[15px]"
                          placeholder="example.com"
                          onBlur={(e) =>
                            void refreshQuote({
                              domainName: e.target.value,
                              domainChoice: "existing",
                            })
                          }
                        />
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-2 text-[14px] text-slate-600">
                    Add a domain separately. Free domain for the first year is
                    available only on eligible annual plans.
                  </p>
                )}
              </section>

              <HostingCartAddonCards
                cartAddons={props.cartAddons}
                configuration={quote.configuration}
                onChange={(addons) => void refreshQuote({ addons })}
              />
            </>
          )}

          {!props.isLoggedIn && step === "review" ? (
            <p className="text-[14px] text-slate-600">
              <Link
                href={loginPathForCheckout({ purchase: props.intent })}
                className="font-semibold text-[#673de6] hover:underline"
              >
                Sign in
              </Link>{" "}
              or create an account to save this order. Your plan selection stays
              in the link.
            </p>
          ) : null}
          {orderError ? (
            <p className="text-[14px] text-red-600" role="alert">
              {orderError}
            </p>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto">
          <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-md">
            <h2 className="font-heading text-lg font-extrabold text-[#2f1c6a]">
              Order summary
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              {quote.planName} ·{" "}
              {isAnnual ? "Annual billing" : "Monthly billing"}
            </p>
            <ul className="mt-5 space-y-2 text-[14px]">
              {quote.lines.map((line) => (
                <li key={line.id} className="flex justify-between gap-3">
                  <span className="text-slate-600">
                    {line.label}
                    {line.note ? (
                      <span className="block text-[12px] text-slate-400">
                        {line.note}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 font-semibold text-[#2f1c6a]">
                    {line.kind === "domain" && line.amount === 0
                      ? line.note?.toLowerCase().includes("separately")
                        ? "—"
                        : "FREE"
                      : money(line.amount, quote.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-[14px]">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold">
                  {money(quote.subtotal, quote.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax</span>
                <span className="text-slate-500">Calculated later</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-slate-200 pt-4">
              <span className="text-[15px] font-bold text-[#2f1c6a]">
                Total
              </span>
              <span className="text-[1.25rem] font-extrabold text-[#673de6]">
                {money(quote.total, quote.currency)}
              </span>
            </div>
            <button
              type="button"
              disabled={loading || quote.errors.length > 0}
              onClick={() => void handleContinue()}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#673de6] text-[15px] font-bold text-white transition hover:bg-[#5b32d6] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : step === "configure" ? (
                "Continue"
              ) : props.isLoggedIn ? (
                "Save order & continue"
              ) : (
                "Continue to sign up"
              )}
            </button>
            <p className="mt-4 text-center text-[12px] text-slate-500">
              Secure checkout · Clear billing · No hidden add-ons
            </p>
          </div>
        </aside>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
        aria-hidden={false}
      >
        <button
          type="button"
          disabled={loading || quote.errors.length > 0}
          onClick={() => void handleContinue()}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-[#673de6] text-[15px] font-bold text-white disabled:opacity-60"
        >
          {step === "configure" ? "Continue" : "Next step"}
        </button>
      </div>
    </div>
  );
}
