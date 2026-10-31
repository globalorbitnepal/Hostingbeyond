"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Globe2, Loader2, Search, ShieldCheck } from "lucide-react";

import { SiteHeader } from "@/components/layout/header";
import { CheckoutStepNav } from "@/components/checkout/checkout-step-nav";
import {
  formatAddonsReviewSummary,
  HostingCartAddonCards,
} from "@/components/hosting/hosting-cart-addon-cards";
import { useLocale } from "@/components/locale/locale-provider";
import { routes } from "@/config/routes";
import type { CartAddonUiModel } from "@/lib/hosting/addons/load-cart-ui";
import {
  hostingDomainStepComplete,
  isAnnualFreeComDomain,
  parseListedUsdPrice,
  type HostingBookingStep,
} from "@/lib/hosting/cart/booking-rules";
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

const BOOKING_NAV = [
  { id: 1, label: "Plan" },
  { id: 2, label: "Domain" },
  { id: 3, label: "Add-ons" },
  { id: 4, label: "Payment" },
] as const;

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function parseBookingStep(raw: string | null): HostingBookingStep {
  if (
    raw === "domain" ||
    raw === "addons" ||
    raw === "review" ||
    raw === "plan"
  ) {
    return raw;
  }
  if (raw === "configure") return "plan";
  return "plan";
}

function stepIndex(step: HostingBookingStep) {
  if (step === "domain") return 2;
  if (step === "addons") return 3;
  if (step === "review") return 4;
  return 1;
}

function CheckoutOfferRow({
  checked,
  label,
  title,
  description,
  badge,
  priceLabel,
  onToggle,
  disabled,
}: {
  checked: boolean;
  label: string;
  title: string;
  description: string;
  badge?: string;
  priceLabel: string;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="hb-checkout-premium__offer-row">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className="hb-checkout-premium__switch mt-0.5 shrink-0"
        onClick={onToggle}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-extrabold tracking-tight text-[var(--hb-co-royal)]">
          {title}
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-[var(--hb-co-text-muted)]">
          {description}
        </p>
        {badge ? (
          <span className="mt-2 inline-flex rounded-md bg-[#f5c518] px-2 py-0.5 text-[11px] font-extrabold text-[#1a1035]">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="shrink-0 text-right text-[15px] font-extrabold text-[var(--hb-co-royal)]">
        {priceLabel}
      </p>
    </div>
  );
}

export type HostingCartCheckoutProps = {
  intent: HostingPurchaseIntent;
  initialQuote: HostingCartQuote;
  cartAddons: CartAddonUiModel[];
  logoPath: string;
  isLoggedIn: boolean;
  billingMonthlyEnabled: boolean;
  billingYearlyEnabled: boolean;
  hostingCheckoutPaymentAvailable: boolean;
};

export function HostingCartCheckoutView(props: HostingCartCheckoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatCatalogUsd, t } = useLocale();
  const step = parseBookingStep(searchParams.get("step"));

  const [quote, setQuote] = useState(props.initialQuote);
  const formatQuoteAmount = (value: number) =>
    quote.currency === "USD"
      ? formatCatalogUsd(value)
      : money(value, quote.currency);
  const [loading, setLoading] = useState(false);
  const [held, setHeld] = useState(false);
  const [stepHint, setStepHint] = useState<string | null>(null);
  const [domainQuery, setDomainQuery] = useState(
    props.initialQuote.configuration.domainName ?? "",
  );
  const [domainResults, setDomainResults] = useState<DomainSearchResult[]>([]);
  const [domainSource, setDomainSource] = useState<string | null>(null);
  const [domainSearching, setDomainSearching] = useState(false);
  const [domainSearchError, setDomainSearchError] = useState<string | null>(
    null,
  );

  const intentQuery = serializeHostingPurchaseIntent(props.intent);
  const isAnnual = quote.configuration.billingPeriod === "annually";
  const domainChoice = quote.configuration.domainChoice ?? "later";
  const domainIncluded = domainChoice !== "later";
  const freeDomainYear = isAnnual && quote.freeDomainEligible;
  const emailRenewal = quote.emailTrialRenewalUsd;
  const emailAddon = props.cartAddons.find((a) => a.slug === "business-email");

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
      setStepHint(null);
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

  const goStep = (next: HostingBookingStep) => {
    const params = new URLSearchParams(intentQuery);
    params.set("billing", quote.configuration.billingPeriod);
    params.set("step", next);
    router.replace(`/checkout/hosting?${params.toString()}`);
  };

  const setBilling = (billing: "monthly" | "annually") => {
    const params = new URLSearchParams(intentQuery);
    params.set("billing", billing);
    params.set("step", "plan");
    router.replace(`/checkout/hosting?${params.toString()}`);
    void refreshQuote({
      billingPeriod: billing,
      freeEmailMonth: true,
      domainRegisterUsd:
        billing === "annually" ? null : quote.configuration.domainRegisterUsd,
    });
  };

  const domainReady = hostingDomainStepComplete({
    domainChoice,
    domainName: quote.configuration.domainName,
  });

  const toggleFreeEmail = () => {
    void refreshQuote({
      freeEmailMonth: !quote.configuration.freeEmailMonth,
      addons: quote.configuration.addons.map((addon) =>
        addon.addonSlug === "business-email"
          ? { ...addon, enabled: false }
          : addon,
      ),
    });
  };

  const emailOfferRow = (
    <CheckoutOfferRow
      checked={quote.configuration.freeEmailMonth}
      label="Business Email"
      title="Professional Email"
      description={
        emailRenewal
          ? `1 month free · renews at ${formatQuoteAmount(emailRenewal)}/mo next month`
          : "1 month free · renews next month at the mailbox rate"
      }
      badge="1 Month Free"
      priceLabel={
        quote.configuration.freeEmailMonth ? formatQuoteAmount(0) : "Off"
      }
      onToggle={toggleFreeEmail}
    />
  );

  const domainSummary = useMemo(() => {
    const name = quote.configuration.domainName;
    if (domainChoice === "later") {
      return "Add a domain later from your dashboard";
    }
    if (domainChoice === "existing" && name) return `Connect ${name}`;
    if (domainChoice === "search" && name) {
      return isAnnualFreeComDomain(
        name,
        quote.configuration.billingPeriod,
        quote.freeDomainEligible,
      )
        ? `${name} · free .com for 1 year`
        : `${name} · first-year registration`;
    }
    return "Optional — turn on domain below or skip";
  }, [
    domainChoice,
    quote.configuration.billingPeriod,
    quote.configuration.domainName,
    quote.freeDomainEligible,
  ]);

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

  function handleContinue() {
    if (step === "plan") {
      goStep("domain");
      return;
    }
    if (step === "domain") {
      if (!domainReady) {
        setStepHint(
          "Turn off domain to skip, or select a domain / enter one you own.",
        );
        return;
      }
      goStep("addons");
      return;
    }
    if (step === "addons") {
      goStep("review");
      return;
    }
    setHeld(true);
  }

  const continueLabel =
    step === "plan"
      ? "Continue to domain"
      : step === "domain"
        ? "Continue to add-ons"
        : step === "addons"
          ? "Continue to review"
          : held
            ? "Booking saved"
            : "Hold this booking";

  return (
    <div className="hb-checkout-premium hb-checkout-premium--hosting hb-hosting-booking relative">
      <div className="hb-checkout-premium__ambient" aria-hidden />
      <div className="relative z-20">
        <SiteHeader />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1180px] min-w-0 px-4 pt-6 sm:px-6">
        <CheckoutStepNav
          current={stepIndex(step)}
          steps={BOOKING_NAV}
          className="mb-6"
        />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1180px] min-w-0 gap-6 px-4 pb-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="min-w-0 space-y-5">
          {step === "plan" ? (
            <section className="hb-checkout-premium__card p-5 sm:p-7">
              <p className="text-[11px] font-bold tracking-[0.18em] text-[var(--hb-co-primary)] uppercase">
                {quote.productName || "Web Hosting"}
              </p>
              <h1 className="font-heading mt-1 text-[1.7rem] font-extrabold tracking-tight text-[var(--hb-co-royal)] sm:text-4xl">
                {quote.planName}
              </h1>
              {quote.monthlyEquivalent != null ? (
                <p className="mt-4 text-[1.65rem] font-extrabold text-[var(--hb-co-primary)]">
                  {formatQuoteAmount(quote.monthlyEquivalent)}
                  <span className="ml-1 text-[15px] font-semibold text-[var(--hb-co-text-muted)]">
                    /mo
                  </span>
                </p>
              ) : null}
              <p className="text-[14px] text-[var(--hb-co-text-muted)]">
                Due today {formatQuoteAmount(quote.total)} · billed{" "}
                {formatQuoteAmount(quote.billedAmount)}
                {isAnnual ? "/year" : "/month"}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {props.billingMonthlyEnabled ? (
                  <button
                    type="button"
                    onClick={() => setBilling("monthly")}
                    className={`min-h-[5.5rem] rounded-2xl border px-4 py-4 text-left ${
                      !isAnnual
                        ? "border-[var(--hb-co-primary)] bg-[var(--hb-co-surface)] ring-2 ring-[var(--hb-co-lavender)]/40"
                        : "border-[var(--hb-co-border)] bg-white"
                    }`}
                  >
                    <span className="text-[15px] font-bold text-[var(--hb-co-royal)]">
                      Monthly
                    </span>
                    <p className="mt-1 text-[13px] text-[var(--hb-co-text-muted)]">
                      No free domain. Buy a domain and email with this order.
                    </p>
                  </button>
                ) : null}
                {props.billingYearlyEnabled ? (
                  <button
                    type="button"
                    onClick={() => setBilling("annually")}
                    className={`min-h-[5.5rem] rounded-2xl border px-4 py-4 text-left ${
                      isAnnual
                        ? "border-[var(--hb-co-primary)] bg-[var(--hb-co-surface)] ring-2 ring-[var(--hb-co-lavender)]/40"
                        : "border-[var(--hb-co-border)] bg-white"
                    }`}
                  >
                    <span className="text-[15px] font-bold text-[var(--hb-co-royal)]">
                      Annually
                    </span>
                    <p className="mt-1 text-[13px] text-[var(--hb-co-text-muted)]">
                      {quote.freeDomainEligible
                        ? "Optional: register a .com free for 1 year (.net, .org, etc. are billed). Skip and add from your dashboard anytime."
                        : quote.discount > 0
                          ? `Save ${formatQuoteAmount(quote.discount)} vs monthly`
                          : "Best value when available"}
                    </p>
                  </button>
                ) : null}
              </div>
              {quote.features.length > 0 ? (
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {quote.features.slice(0, 8).map((f) => (
                    <li
                      key={f}
                      className="flex min-w-0 items-start gap-2 rounded-xl bg-[var(--hb-co-bg-subtle)] px-3 py-2 text-[14px] text-[var(--hb-co-text)]"
                    >
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-[var(--hb-co-success)]"
                        aria-hidden
                      />
                      <span className="min-w-0 break-words">{f}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link
                href={`${routes.hosting}#plans`}
                className="mt-5 inline-flex min-h-11 items-center text-[14px] font-semibold text-[var(--hb-co-primary)]"
              >
                Change plan
              </Link>
            </section>
          ) : null}

          {step === "domain" ? (
            <>
              <section className="hb-checkout-premium__card p-5 sm:p-7">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ede9fe] to-[#dbeafe] text-[var(--hb-co-primary)]">
                    <Globe2 className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h1 className="font-heading text-[1.55rem] font-extrabold text-[var(--hb-co-royal)] sm:text-3xl">
                      Domain for this order
                    </h1>
                    <p className="mt-2 text-[14px] leading-relaxed text-[var(--hb-co-text-muted)]">
                      {freeDomainYear
                        ? "Optional. Annual plans include one year of a new .com only — other extensions are charged at our price."
                        : "Optional. Monthly hosting does not include a free domain. Turn off to skip and add a domain later from your dashboard."}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[var(--hb-co-border)] bg-[var(--hb-co-bg-subtle)] p-4 sm:p-5">
                  <CheckoutOfferRow
                    checked={domainIncluded}
                    label="Add domain to this order"
                    title="Register or connect a domain"
                    description={
                      domainIncluded
                        ? "Search and register, or connect a domain you already own."
                        : "Off — you can add a domain later from your customer dashboard."
                    }
                    priceLabel={domainIncluded ? "On" : "Off"}
                    onToggle={() =>
                      void refreshQuote(
                        domainIncluded
                          ? {
                              domainChoice: "later",
                              domainName: null,
                              domainRegisterUsd: null,
                              domainProtection: false,
                            }
                          : {
                              domainChoice: "search",
                              domainName: null,
                              domainRegisterUsd: null,
                            },
                      )
                    }
                  />
                </div>

                {domainIncluded ? (
                  <>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {(
                        [
                          ["search", "Register a new domain"],
                          ["existing", "I already own a domain"],
                        ] as const
                      ).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            void refreshQuote({
                              domainChoice: value,
                              domainName:
                                value === domainChoice
                                  ? quote.configuration.domainName
                                  : null,
                              domainRegisterUsd:
                                value === "search"
                                  ? quote.configuration.domainRegisterUsd
                                  : null,
                            })
                          }
                          className={`min-h-14 rounded-2xl border px-4 py-3 text-left text-[14px] font-bold transition ${
                            domainChoice === value
                              ? "border-[var(--hb-co-primary)] bg-[var(--hb-co-surface)] text-[var(--hb-co-royal)] shadow-sm"
                              : "border-[var(--hb-co-border)] bg-white text-[var(--hb-co-text)]"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {domainChoice === "search" ? (
                      <div className="mt-5">
                        {freeDomainYear ? (
                          <p className="mb-3 text-[12px] font-semibold text-[var(--hb-co-primary)]">
                            Free year applies to .com only when you select an
                            available .com below.
                          </p>
                        ) : null}
                        <label className="text-[13px] font-semibold text-[var(--hb-co-text)]">
                          Search a domain
                        </label>
                        <div className="mt-2 flex min-w-0 flex-col gap-2 sm:flex-row">
                          <input
                            type="text"
                            value={domainQuery}
                            onChange={(e) => setDomainQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") void runDomainSearch();
                            }}
                            placeholder="yourbrand.com"
                            className="h-12 min-w-0 flex-1 rounded-xl border border-[var(--hb-co-border)] bg-white px-3 text-[15px] shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => void runDomainSearch()}
                            disabled={domainSearching}
                            className="hb-checkout-premium__btn-primary h-12 shrink-0 px-5"
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
                          <p className="mt-2 text-[12px] text-[var(--hb-co-text-muted)]">
                            Availability via{" "}
                            {domainSource === "registrar"
                              ? "connected registrar"
                              : "HostingBeyond lookup"}
                          </p>
                        ) : null}
                        {domainSearchError ? (
                          <p className="mt-2 text-[13px] text-[var(--hb-co-error)]">
                            {domainSearchError}
                          </p>
                        ) : null}
                        {domainResults.length > 0 ? (
                          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto rounded-xl border border-[var(--hb-co-border)] bg-white p-2">
                            {domainResults.map((r) => {
                              const listed = parseListedUsdPrice(
                                r.priceFirstYear,
                              );
                              const complimentary =
                                freeDomainYear &&
                                isAnnualFreeComDomain(
                                  r.domain,
                                  quote.configuration.billingPeriod,
                                  quote.freeDomainEligible,
                                );
                              const selected =
                                quote.configuration.domainName === r.domain;
                              return (
                                <li key={r.domain}>
                                  <button
                                    type="button"
                                    disabled={r.status !== "available"}
                                    onClick={() =>
                                      void refreshQuote({
                                        domainName: r.domain,
                                        domainChoice: "search",
                                        domainRegisterUsd: complimentary
                                          ? 0
                                          : listed,
                                      })
                                    }
                                    className={`flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left text-[14px] disabled:cursor-not-allowed disabled:opacity-50 ${
                                      selected
                                        ? "border-[var(--hb-co-primary)] bg-[var(--hb-co-surface)]"
                                        : "border-transparent hover:border-[var(--hb-co-border)]"
                                    }`}
                                  >
                                    <span className="min-w-0 font-semibold break-all">
                                      {r.domain}
                                    </span>
                                    <span className="shrink-0 text-[13px] text-[var(--hb-co-text-muted)]">
                                      {r.status !== "available"
                                        ? r.status
                                        : complimentary
                                          ? "Free .com year"
                                          : listed
                                            ? formatQuoteAmount(listed)
                                            : "Select"}
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        ) : null}
                        {quote.configuration.domainName ? (
                          <p className="mt-3 text-[14px] font-semibold text-[var(--hb-co-success)]">
                            Selected {quote.configuration.domainName}
                            {isAnnualFreeComDomain(
                              quote.configuration.domainName,
                              quote.configuration.billingPeriod,
                              quote.freeDomainEligible,
                            )
                              ? " · free .com for 1 year"
                              : ""}
                          </p>
                        ) : null}
                        <div className="mt-4 space-y-3">
                          <div className="hb-checkout-premium__offer-row hb-checkout-premium__offer-row--nested">
                            <button
                              type="button"
                              role="switch"
                              aria-checked
                              disabled
                              className="hb-checkout-premium__switch shrink-0"
                              aria-label="Domain privacy on"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-[15px] font-extrabold text-[var(--hb-co-royal)]">
                                Domain privacy
                              </p>
                              <p className="text-[12px] text-[var(--hb-co-text-muted)]">
                                FREE · stays on with registration
                              </p>
                            </div>
                            <p className="shrink-0 text-[14px] font-extrabold text-[var(--hb-co-success)]">
                              FREE
                            </p>
                          </div>
                          <CheckoutOfferRow
                            checked={quote.configuration.domainProtection}
                            label="Domain protection"
                            title="Domain protection"
                            description={`${formatQuoteAmount(9.99)} / year · registry lock & theft protection`}
                            priceLabel={
                              quote.configuration.domainProtection
                                ? formatQuoteAmount(9.99)
                                : "Off"
                            }
                            onToggle={() =>
                              void refreshQuote({
                                domainProtection:
                                  !quote.configuration.domainProtection,
                              })
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5">
                        <label
                          htmlFor="existing-domain"
                          className="text-[13px] font-semibold text-[var(--hb-co-text)]"
                        >
                          Domain you already own
                        </label>
                        <input
                          id="existing-domain"
                          type="text"
                          defaultValue={quote.configuration.domainName ?? ""}
                          className="mt-2 h-12 w-full min-w-0 rounded-xl border border-[var(--hb-co-border)] bg-white px-3 text-[15px] shadow-sm"
                          placeholder="example.com"
                          onBlur={(e) =>
                            void refreshQuote({
                              domainName: e.target.value,
                              domainChoice: "existing",
                              domainRegisterUsd: null,
                            })
                          }
                        />
                      </div>
                    )}
                  </>
                ) : null}
              </section>

              <section className="hb-checkout-premium__card p-5 sm:p-6">
                <p className="text-[11px] font-bold tracking-[0.16em] text-[var(--hb-co-primary)] uppercase">
                  Included with hosting
                </p>
                {emailOfferRow}
              </section>
            </>
          ) : null}

          {step === "addons" ? (
            <>
              <section className="hb-checkout-premium__card p-5 sm:p-6">
                <p className="text-[11px] font-bold tracking-[0.16em] text-[var(--hb-co-primary)] uppercase">
                  Add-ons for this order
                </p>
                <p className="mt-1 text-[13px] text-[var(--hb-co-text-muted)]">
                  Turn options on or off — prices update in your summary.
                </p>
                <div className="mt-4 border-t border-[var(--hb-co-border)] pt-4">
                  {emailOfferRow}
                </div>
              </section>
              <HostingCartAddonCards
                cartAddons={props.cartAddons}
                configuration={quote.configuration}
                hideBusinessEmail={quote.configuration.freeEmailMonth}
                onChange={(addons) => {
                  const paidEmail = addons.some(
                    (addon) =>
                      addon.addonSlug === "business-email" && addon.enabled,
                  );
                  void refreshQuote({
                    addons,
                    freeEmailMonth: paidEmail
                      ? false
                      : quote.configuration.freeEmailMonth,
                  });
                }}
              />
              {!emailAddon && isAnnual ? (
                <section className="hb-checkout-premium__card p-5">
                  <p className="text-[14px] text-[var(--hb-co-text-muted)]">
                    No extra add-ons for this plan. Continue to review.
                  </p>
                </section>
              ) : null}
            </>
          ) : null}

          {step === "review" ? (
            <section className="hb-checkout-premium__card p-5 sm:p-7">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--hb-co-surface)] text-[var(--hb-co-primary)]">
                  <ShieldCheck className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h1 className="font-heading text-[1.55rem] font-extrabold text-[var(--hb-co-royal)] sm:text-3xl">
                    Secure payment
                  </h1>
                  <p className="mt-2 text-[14px] leading-relaxed text-[var(--hb-co-text-muted)]">
                    Confirm who this booking is for. Card fields are Stripe
                    sandbox only — nothing is charged until live mode is turned
                    on.
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <label className="text-[13px] font-semibold">
                      Full name
                      <input
                        required
                        className="mt-1 h-12 w-full rounded-xl border border-[var(--hb-co-border)] px-3"
                        autoComplete="name"
                      />
                    </label>
                    <label className="text-[13px] font-semibold">
                      Email
                      <input
                        required
                        type="email"
                        className="mt-1 h-12 w-full rounded-xl border border-[var(--hb-co-border)] px-3"
                        autoComplete="email"
                      />
                    </label>
                    <label className="text-[13px] font-semibold sm:col-span-2">
                      Address
                      <input
                        className="mt-1 h-12 w-full rounded-xl border border-[var(--hb-co-border)] px-3"
                        autoComplete="street-address"
                      />
                    </label>
                  </div>
                  <div className="hb-checkout-premium__stripe mt-5">
                    <p className="text-[12px] font-bold tracking-wide text-[var(--hb-co-text-muted)] uppercase">
                      Card · Stripe sandbox
                    </p>
                    <div className="hb-checkout-premium__stripe-row mt-3">
                      <input
                        readOnly
                        aria-label="Card number"
                        placeholder="Card number"
                      />
                      <input
                        readOnly
                        aria-label="Expiry"
                        placeholder="MM / YY"
                      />
                      <input readOnly aria-label="CVC" placeholder="CVC" />
                    </div>
                  </div>
                </div>
              </div>
              <dl className="mt-6 space-y-4 text-[15px]">
                <div className="flex justify-between gap-4 border-b border-[var(--hb-co-border)] pb-3">
                  <dt className="text-[var(--hb-co-text-muted)]">Hosting</dt>
                  <dd className="text-right font-semibold text-[var(--hb-co-royal)]">
                    {quote.planName} · {isAnnual ? "Annual" : "Monthly"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-[var(--hb-co-border)] pb-3">
                  <dt className="text-[var(--hb-co-text-muted)]">Domain</dt>
                  <dd className="text-right font-semibold text-[var(--hb-co-royal)]">
                    {domainSummary}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--hb-co-text-muted)]">Add-ons</dt>
                  <dd className="text-right font-semibold text-[var(--hb-co-royal)]">
                    {addonsSummary}
                  </dd>
                </div>
              </dl>
              {held ? (
                <p
                  className="mt-5 rounded-xl bg-[var(--hb-co-surface)] px-4 py-3 text-[14px] font-semibold text-[var(--hb-co-royal)]"
                  role="status"
                >
                  Booking held. No charge today. Payment will be enabled in a
                  later update.
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="text-[14px] font-semibold text-[var(--hb-co-primary)]"
                  onClick={() => goStep("plan")}
                >
                  Edit plan
                </button>
                <button
                  type="button"
                  className="text-[14px] font-semibold text-[var(--hb-co-primary)]"
                  onClick={() => goStep("domain")}
                >
                  Edit domain
                </button>
                <button
                  type="button"
                  className="text-[14px] font-semibold text-[var(--hb-co-primary)]"
                  onClick={() => goStep("addons")}
                >
                  Edit add-ons
                </button>
              </div>
            </section>
          ) : null}

          {stepHint ? (
            <p className="text-[14px] text-[var(--hb-co-error)]" role="alert">
              {stepHint}
            </p>
          ) : null}
          {quote.errors.length > 0 ? (
            <p className="text-[14px] text-[var(--hb-co-error)]" role="alert">
              {quote.errors[0]}
            </p>
          ) : null}
        </div>

        <aside className="min-w-0 lg:sticky lg:top-6">
          <div className="hb-checkout-premium__card p-5">
            <h2 className="font-heading text-lg font-extrabold text-[var(--hb-co-royal)]">
              Order summary
            </h2>
            <p className="mt-1 text-[13px] text-[var(--hb-co-text-muted)]">
              {quote.planName} · {isAnnual ? "Annual" : "Monthly"}
            </p>
            <ul className="mt-5 space-y-3 text-[14px]">
              {quote.lines.map((line) => (
                <li
                  key={line.id}
                  className="flex min-w-0 justify-between gap-3"
                >
                  <span className="min-w-0 text-[var(--hb-co-text-muted)]">
                    {line.label}
                    {line.note ? (
                      <span className="mt-0.5 block text-[12px] break-words">
                        {line.note}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 font-semibold text-[var(--hb-co-royal)]">
                    {line.amount === 0 &&
                    (line.kind === "domain" || line.id === "email-trial")
                      ? "FREE"
                      : formatQuoteAmount(line.amount)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between rounded-xl bg-[var(--hb-co-surface)] px-3 py-3">
              <span className="text-[15px] font-bold text-[var(--hb-co-royal)]">
                Total due today
              </span>
              <span className="text-[1.2rem] font-extrabold text-[var(--hb-co-primary)]">
                {formatQuoteAmount(quote.total)}
              </span>
            </div>
            <p className="mt-2 text-[12px] text-[var(--hb-co-text-muted)]">
              {t.common.billedInUsd}
            </p>
            <button
              type="button"
              disabled={loading || quote.errors.length > 0 || held}
              onClick={() => handleContinue()}
              className="hb-checkout-premium__cta mt-5 hidden w-full disabled:opacity-50 lg:inline-flex"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                continueLabel
              )}
            </button>
            {step !== "plan" ? (
              <button
                type="button"
                className="mt-3 hidden w-full text-center text-[13px] font-semibold text-[var(--hb-co-primary)] lg:block"
                onClick={() =>
                  goStep(
                    step === "review"
                      ? "addons"
                      : step === "addons"
                        ? "domain"
                        : "plan",
                  )
                }
              >
                Back
              </button>
            ) : null}
          </div>
        </aside>
      </div>

      <div className="hb-hosting-booking__dock">
        <div className="mx-auto flex max-w-[1180px] min-w-0 items-center gap-3">
          {step !== "plan" ? (
            <button
              type="button"
              className="inline-flex h-12 shrink-0 items-center rounded-full border border-[var(--hb-co-border)] px-4 text-[14px] font-bold text-[var(--hb-co-royal)]"
              onClick={() =>
                goStep(
                  step === "review"
                    ? "addons"
                    : step === "addons"
                      ? "domain"
                      : "plan",
                )
              }
            >
              Back
            </button>
          ) : null}
          <button
            type="button"
            disabled={loading || quote.errors.length > 0 || held}
            onClick={() => handleContinue()}
            className="hb-checkout-premium__cta min-w-0 flex-1 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              continueLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
