"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Globe2, Loader2, Search, ShieldCheck } from "lucide-react";

import { CheckoutCouponField } from "@/components/checkout/checkout-coupon-field";
import { CheckoutStepNav } from "@/components/checkout/checkout-step-nav";
import { SiteHeader } from "@/components/layout/header";
import { useLocale } from "@/components/locale/locale-provider";
import { routes } from "@/config/routes";
import type { EmailPurchaseIntent } from "@/lib/business-email/purchase-intent";
import {
  emailCheckoutPath,
  serializeEmailPurchaseIntent,
} from "@/lib/business-email/purchase-intent";
import {
  defaultEmailCartConfiguration,
  parseListedUsdPrice,
  quoteEmailCart,
  type EmailCartConfiguration,
  type EmailCartQuote,
  type EmailHostingAddonOffer,
} from "@/lib/business-email/quote-email-cart";
import type { DomainExtras } from "@/lib/domains/domain-extras";
import {
  EMAIL_BILLING_TERM_OPTIONS,
  availableEmailTermsForPlan,
  emailDueTodayForTerm,
  emailPricePerMonthForTerm,
  type EmailBillingTerm,
} from "@/lib/hosting/business-email-term-pricing";
import {
  hostingDomainStepComplete,
  isAnnualFreeComDomain,
  type HostingBookingStep,
} from "@/lib/hosting/cart/booking-rules";
import type { CmsBusinessEmailPlan } from "@/lib/orbit/business-email-page-content";

const EMAIL_CART_STORAGE_KEY = "hb-email-cart-config";

const BOOKING_NAV = [
  { id: 1, label: "Plan" },
  { id: 2, label: "Domain" },
  { id: 3, label: "Add-ons" },
  { id: 4, label: "Payment" },
] as const;

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

function parseBookingStep(raw: string | null): HostingBookingStep {
  if (
    raw === "domain" ||
    raw === "addons" ||
    raw === "review" ||
    raw === "plan"
  ) {
    return raw;
  }
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

export type BusinessEmailCartCheckoutProps = {
  intent: EmailPurchaseIntent;
  plan: CmsBusinessEmailPlan;
  visiblePlans: CmsBusinessEmailPlan[];
  extras: DomainExtras;
  hostingOffer: EmailHostingAddonOffer | null;
  logoPath: string;
  isLoggedIn: boolean;
};

export function BusinessEmailCartCheckoutView(
  props: BusinessEmailCartCheckoutProps,
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatCatalogUsd, t } = useLocale();
  const step = parseBookingStep(searchParams.get("step"));

  const [config, setConfig] = useState<EmailCartConfiguration>(() =>
    defaultEmailCartConfiguration(props.intent),
  );
  const [held, setHeld] = useState(false);
  const [stepHint, setStepHint] = useState<string | null>(null);
  const [domainQuery, setDomainQuery] = useState("");
  const [domainResults, setDomainResults] = useState<DomainSearchResult[]>([]);
  const [domainSource, setDomainSource] = useState<string | null>(null);
  const [domainSearching, setDomainSearching] = useState(false);
  const [domainSearchError, setDomainSearchError] = useState<string | null>(
    null,
  );

  const quote: EmailCartQuote = useMemo(
    () =>
      quoteEmailCart({
        plan: props.plan,
        configuration: config,
        extras: props.extras,
        hostingOffer: props.hostingOffer,
      }),
    [config, props.extras, props.hostingOffer, props.plan],
  );

  const formatQuoteAmount = (value: number) =>
    quote.currency === "USD"
      ? formatCatalogUsd(value)
      : money(value, quote.currency);

  const intentQuery = serializeEmailPurchaseIntent(props.intent);
  const domainChoice = config.domainChoice ?? "later";
  const domainIncluded = domainChoice !== "later";
  const termOptions = useMemo(
    () =>
      EMAIL_BILLING_TERM_OPTIONS.filter((o) =>
        availableEmailTermsForPlan(props.plan).includes(o.value),
      ),
    [props.plan],
  );

  const persistConfig = useCallback((next: EmailCartConfiguration) => {
    try {
      sessionStorage.setItem(EMAIL_CART_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const patchConfig = useCallback(
    (patch: Partial<EmailCartConfiguration>) => {
      setConfig((prev) => {
        const next = { ...prev, ...patch };
        persistConfig(next);
        return next;
      });
      setStepHint(null);
    },
    [persistConfig],
  );

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(EMAIL_CART_STORAGE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as EmailCartConfiguration;
      if (stored.planId === props.intent.plan) {
        setConfig((prev) => ({ ...prev, ...stored, term: props.intent.term }));
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once
  }, []);

  useEffect(() => {
    setConfig((prev) => {
      if (
        prev.planId === props.intent.plan &&
        prev.term === props.intent.term
      ) {
        return prev;
      }
      const next = {
        ...prev,
        planId: props.intent.plan,
        term: props.intent.term,
      };
      persistConfig(next);
      return next;
    });
  }, [props.intent.plan, props.intent.term, persistConfig]);

  const goStep = (next: HostingBookingStep) => {
    const params = new URLSearchParams(intentQuery);
    params.set("term", config.term);
    params.set("step", next);
    router.replace(`/checkout/business-email?${params.toString()}`);
  };

  const setTerm = (term: EmailBillingTerm) => {
    const params = new URLSearchParams(intentQuery);
    params.set("term", term);
    params.set("step", "plan");
    router.replace(`/checkout/business-email?${params.toString()}`);
    patchConfig({ term });
  };

  const domainReady = hostingDomainStepComplete({
    domainChoice,
    domainName: config.domainName,
  });

  const domainSummary = useMemo(() => {
    const name = config.domainName;
    if (domainChoice === "later") {
      return "Add a domain later from your dashboard";
    }
    if (domainChoice === "existing" && name) return `Connect ${name}`;
    if (domainChoice === "search" && name) {
      return isAnnualFreeComDomain(
        name,
        config.hostingAddon.enabled &&
          config.hostingAddon.billing === "annually"
          ? "annually"
          : "monthly",
        quote.freeComDomainEligible,
      )
        ? `${name} · free .com for 1 year with annual hosting`
        : `${name} · first-year registration`;
    }
    return "Optional — turn on domain below or skip";
  }, [
    config.domainName,
    config.hostingAddon.billing,
    config.hostingAddon.enabled,
    domainChoice,
    quote.freeComDomainEligible,
  ]);

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
          ? "Continue to payment"
          : held
            ? "Booking saved"
            : "Hold this booking";

  const perMonth = emailPricePerMonthForTerm(props.plan, config.term);
  const dueToday = quote.firstMonthFree
    ? 0
    : emailDueTodayForTerm(props.plan, config.term);

  return (
    <div className="hb-checkout-premium hb-checkout-premium--email hb-checkout-premium--hosting hb-hosting-booking relative">
      <div className="hb-checkout-premium__ambient" aria-hidden />
      <div className="relative z-20">
        <SiteHeader layout="checkout" />
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
                Business Email
              </p>
              <h1 className="font-heading mt-1 text-[1.7rem] font-extrabold tracking-tight text-[var(--hb-co-royal)] sm:text-4xl">
                {props.plan.name}
              </h1>
              <p className="mt-2 text-[14px] text-[var(--hb-co-text-muted)]">
                {props.plan.bestFor}
              </p>
              <p className="mt-4 text-[1.65rem] font-extrabold text-[var(--hb-co-primary)]">
                {formatQuoteAmount(perMonth)}
                <span className="ml-1 text-[15px] font-semibold text-[var(--hb-co-text-muted)]">
                  /mo per mailbox
                </span>
              </p>
              <p className="text-[14px] text-[var(--hb-co-text-muted)]">
                Due today {formatQuoteAmount(dueToday)} ·{" "}
                {quote.firstMonthFree
                  ? "1st month free on monthly billing"
                  : quote.termLabel}
              </p>
              <div
                className="mt-6 flex w-full max-w-full [scrollbar-width:none] overflow-x-auto rounded-2xl border border-[var(--hb-co-border)] bg-[var(--hb-co-bg-subtle)] p-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                role="group"
                aria-label="Billing term"
              >
                {termOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTerm(opt.value)}
                    className={`min-h-10 min-w-[4.5rem] flex-1 touch-manipulation rounded-xl px-2 text-[11px] font-extrabold whitespace-nowrap transition sm:px-3 sm:text-[12px] ${
                      config.term === opt.value
                        ? "bg-gradient-to-r from-[#6025c5] to-[#3730a3] text-white shadow-sm"
                        : "text-[var(--hb-co-text-muted)] hover:text-[var(--hb-co-text)]"
                    }`}
                    aria-pressed={config.term === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {props.plan.features.length > 0 ? (
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {props.plan.features.slice(0, 8).map((f) => (
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
              {props.visiblePlans.length > 1 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {props.visiblePlans.map((p) => (
                    <Link
                      key={p.id}
                      href={emailCheckoutPath(
                        { plan: p.id, term: config.term },
                        "plan",
                      )}
                      className={`inline-flex min-h-10 items-center rounded-full border px-4 text-[13px] font-bold ${
                        p.id === props.plan.id
                          ? "border-[var(--hb-co-primary)] bg-[var(--hb-co-surface)] text-[var(--hb-co-royal)]"
                          : "border-[var(--hb-co-border)] text-[var(--hb-co-text-muted)]"
                      }`}
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  href={`${routes.businessEmail}#plans`}
                  className="mt-5 inline-flex min-h-11 items-center text-[14px] font-semibold text-[var(--hb-co-primary)]"
                >
                  Change plan
                </Link>
              )}
            </section>
          ) : null}

          {step === "domain" ? (
            <section className="hb-checkout-premium__card p-5 sm:p-7">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ede9fe] to-[#dbeafe] text-[var(--hb-co-primary)]">
                  <Globe2 className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h1 className="font-heading text-[1.55rem] font-extrabold text-[var(--hb-co-royal)] sm:text-3xl">
                    Domain for your mailboxes
                  </h1>
                  <p className="mt-2 text-[14px] leading-relaxed text-[var(--hb-co-text-muted)]">
                    Optional. Register or connect a domain now, or skip and add
                    one later from your dashboard.
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
                    patchConfig(
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
                          patchConfig({
                            domainChoice: value,
                            domainName:
                              value === domainChoice ? config.domainName : null,
                            domainRegisterUsd:
                              value === "search"
                                ? config.domainRegisterUsd
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
                      {quote.freeComDomainEligible ? (
                        <p className="mb-3 text-[12px] font-semibold text-[var(--hb-co-primary)]">
                          Free .com for one year applies when annual web hosting
                          is added on the next step.
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
                              quote.freeComDomainEligible &&
                              isAnnualFreeComDomain(
                                r.domain,
                                "annually",
                                quote.freeComDomainEligible,
                              );
                            const selected = config.domainName === r.domain;
                            return (
                              <li key={r.domain}>
                                <button
                                  type="button"
                                  disabled={r.status !== "available"}
                                  onClick={() =>
                                    patchConfig({
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
                                        ? "Free .com w/ annual hosting"
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
                      {config.domainName ? (
                        <p className="mt-3 text-[14px] font-semibold text-[var(--hb-co-success)]">
                          Selected {config.domainName}
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
                              {props.extras.privacyLabel}
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
                          checked={config.domainProtection}
                          label="Domain protection"
                          title={props.extras.protectionLabel}
                          description={`${formatQuoteAmount(props.extras.protectionPriceUsd)} / year · ${props.extras.protectionDetail}`}
                          priceLabel={
                            config.domainProtection
                              ? formatQuoteAmount(
                                  props.extras.protectionPriceUsd,
                                )
                              : "Off"
                          }
                          onToggle={() =>
                            patchConfig({
                              domainProtection: !config.domainProtection,
                            })
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5">
                      <label
                        htmlFor="existing-domain-email"
                        className="text-[13px] font-semibold text-[var(--hb-co-text)]"
                      >
                        Domain you already own
                      </label>
                      <input
                        id="existing-domain-email"
                        type="text"
                        defaultValue={config.domainName ?? ""}
                        className="mt-2 h-12 w-full min-w-0 rounded-xl border border-[var(--hb-co-border)] bg-white px-3 text-[15px] shadow-sm"
                        placeholder="example.com"
                        onBlur={(e) =>
                          patchConfig({
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
          ) : null}

          {step === "addons" ? (
            <section className="hb-checkout-premium__card p-5 sm:p-6">
              <p className="text-[11px] font-bold tracking-[0.16em] text-[var(--hb-co-primary)] uppercase">
                Add-ons for this order
              </p>
              <p className="mt-1 text-[13px] text-[var(--hb-co-text-muted)]">
                Optional web hosting. Annual hosting unlocks a free .com when
                you register a domain on step 2.
              </p>
              {props.hostingOffer ? (
                <div className="mt-5 rounded-2xl border border-[var(--hb-co-border)] bg-[var(--hb-co-bg-subtle)] p-4">
                  <CheckoutOfferRow
                    checked={config.hostingAddon.enabled}
                    label="Web hosting"
                    title="Web Hosting"
                    description={`${props.hostingOffer.planName} — launch a site on your domain.`}
                    priceLabel={
                      config.hostingAddon.enabled
                        ? formatQuoteAmount(
                            config.hostingAddon.billing === "annually"
                              ? props.hostingOffer.yearlyUsd
                              : props.hostingOffer.monthlyUsd,
                          )
                        : "Off"
                    }
                    onToggle={() =>
                      patchConfig({
                        hostingAddon: {
                          ...config.hostingAddon,
                          enabled: !config.hostingAddon.enabled,
                          productSlug: props.hostingOffer!.productSlug,
                          planKey: props.hostingOffer!.planKey,
                        },
                      })
                    }
                  />
                  {config.hostingAddon.enabled ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {props.hostingOffer.billingMonthlyEnabled ? (
                        <button
                          type="button"
                          onClick={() =>
                            patchConfig({
                              hostingAddon: {
                                ...config.hostingAddon,
                                billing: "monthly",
                              },
                            })
                          }
                          className={`min-h-14 rounded-2xl border px-4 py-3 text-left text-[14px] font-bold ${
                            config.hostingAddon.billing === "monthly"
                              ? "border-[var(--hb-co-primary)] bg-white text-[var(--hb-co-royal)]"
                              : "border-[var(--hb-co-border)]"
                          }`}
                        >
                          Monthly hosting
                        </button>
                      ) : null}
                      {props.hostingOffer.billingYearlyEnabled ? (
                        <button
                          type="button"
                          onClick={() =>
                            patchConfig({
                              hostingAddon: {
                                ...config.hostingAddon,
                                billing: "annually",
                              },
                            })
                          }
                          className={`min-h-14 rounded-2xl border px-4 py-3 text-left text-[14px] font-bold ${
                            config.hostingAddon.billing === "annually"
                              ? "border-[var(--hb-co-primary)] bg-white text-[var(--hb-co-royal)]"
                              : "border-[var(--hb-co-border)]"
                          }`}
                        >
                          Annual hosting · free .com eligible
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="mt-4 text-[14px] text-[var(--hb-co-text-muted)]">
                  Web hosting add-on is not available right now. Continue to
                  payment.
                </p>
              )}
            </section>
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
                    {props.isLoggedIn
                      ? "Confirm billing details. Card fields are Stripe sandbox only."
                      : "Sign in from your account area before live checkout. Card fields are Stripe sandbox only."}
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
                  <dt className="text-[var(--hb-co-text-muted)]">
                    Mailbox plan
                  </dt>
                  <dd className="text-right font-semibold text-[var(--hb-co-royal)]">
                    {quote.planName} · {quote.termLabel}
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
                    {config.hostingAddon.enabled
                      ? `Web hosting · ${config.hostingAddon.billing === "annually" ? "Annual" : "Monthly"}`
                      : "None selected"}
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
              {quote.planName} · {quote.termLabel}
            </p>
            {quote.firstMonthFree ? (
              <p className="mt-3 rounded-xl bg-[var(--hb-co-surface)] px-3 py-2 text-[13px] font-semibold text-[var(--hb-co-royal)]">
                1 month free · renews at{" "}
                {formatQuoteAmount(quote.renewalPerMonth)}
                /mo
              </p>
            ) : null}
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
                    {line.amount === 0 && line.kind === "email"
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
            <CheckoutCouponField className="mt-4" />
            <p className="mt-2 text-[12px] text-[var(--hb-co-text-muted)]">
              {t.common.billedInUsd}
            </p>
            <button
              type="button"
              disabled={quote.errors.length > 0 || held}
              onClick={() => handleContinue()}
              className="hb-checkout-premium__cta mt-5 hidden w-full disabled:opacity-50 lg:inline-flex"
            >
              {continueLabel}
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
            disabled={quote.errors.length > 0 || held}
            onClick={() => handleContinue()}
            className="hb-checkout-premium__cta min-w-0 flex-1 disabled:opacity-50"
          >
            {continueLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
