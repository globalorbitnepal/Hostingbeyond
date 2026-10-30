"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  Globe2,
  Loader2,
  Lock,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { BrandMark } from "@/components/auth/brand-mark";
import {
  CheckoutAddonOfferList,
  groupCheckoutOffers,
  hostingGroupKey,
  offerKey,
  offerToSelection,
} from "@/components/checkout/checkout-addon-offers";
import type { EmailBillingTerm } from "@/lib/hosting/business-email-term-pricing";
import { CheckoutStepNav } from "@/components/checkout/checkout-step-nav";
import { CheckoutAuthPanel } from "@/components/domains/checkout-auth-panel";
import { routes } from "@/config/routes";
import type {
  DomainCheckoutOffersPayload,
  DomainCheckoutServiceOffer,
  DomainCheckoutServiceSelection,
} from "@/lib/domains/domain-checkout-offers";
import {
  readPremiumCartServices,
  writePremiumCartServices,
} from "@/lib/checkout/premium-cart-intent";
import { hostingCheckoutPath } from "@/lib/hosting/purchase-intent";
import { useLocale } from "@/components/locale/locale-provider";
import { cn } from "@/lib/utils";

import type {
  DomainCheckoutLine,
  DomainCheckoutResult,
} from "./domain-checkout-view";

const STEPS = [
  { id: "domains", label: "Cart" },
  { id: "services", label: "Add-ons" },
  { id: "details", label: "Account" },
  { id: "payment", label: "Payment" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const STEP_COPY: Record<StepId, { title: string; subtitle: string }> = {
  domains: {
    title: "Your Cart",
    subtitle: "Review your products and choose the services you need.",
  },
  services: {
    title: "Complete Your Hosting Setup",
    subtitle:
      "Add the services you need. Every price is shown before you confirm.",
  },
  details: {
    title: "Your Account & Billing Details",
    subtitle: "Sign in or confirm your account to continue.",
  },
  payment: {
    title: "Secure Checkout",
    subtitle: "Pay from your wallet with server-verified totals.",
  },
};

type QuoteResponse = {
  currency: string;
  domainsSubtotal: number;
  servicesSubtotal: number;
  taxes: number;
  total: number;
  walletChargeToday: number;
  serviceLines: Array<{
    key: string;
    label: string;
    detail: string;
    amount: number;
  }>;
  paymentNote?: string;
  serviceErrors?: string[];
};

type PremiumCheckoutProps = {
  isAuthenticated: boolean;
  onAuthenticated: () => void;
  lines: DomainCheckoutLine[];
  walletBalance: number;
  walletCurrency: string;
  paymentProviderReady: boolean;
  cartRejected?: string[];
  priceChanges?: Array<{ domain: string; previous: number; current: number }>;
  requiresPriceConfirmation?: boolean;
  offers: DomainCheckoutOffersPayload;
  customerEmail: string;
  customerName: string | null;
  onRemoveLine: (domain: string) => Promise<void>;
  onCompleteCheckout: () => Promise<void>;
  submitting: boolean;
  error: string | null;
  results: DomainCheckoutResult[];
  priceConfirmed: boolean;
  onConfirmPrices: () => void;
  rejectedNotice: string[];
  insufficient: boolean;
  allDone: boolean;
  googleOAuth?: boolean;
};

export function DomainPremiumCheckout({
  isAuthenticated,
  onAuthenticated,
  lines,
  walletBalance,
  walletCurrency,
  paymentProviderReady,
  priceChanges = [],
  requiresPriceConfirmation = false,
  offers,
  customerEmail,
  customerName,
  onRemoveLine,
  onCompleteCheckout,
  submitting,
  error,
  results,
  priceConfirmed,
  onConfirmPrices,
  rejectedNotice,
  insufficient,
  allDone,
  googleOAuth = false,
}: PremiumCheckoutProps) {
  const { t, formatCatalogUsd } = useLocale();
  const [step, setStep] = useState<StepId>("domains");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => {
    const saved = readPremiumCartServices();
    if (!saved.length) return new Set();
    const keys = new Set<string>();
    for (const sel of saved) {
      if (sel.kind === "hosting") {
        keys.add(`hosting:${sel.productSlug}:${sel.planKey}:${sel.billing}`);
      } else if (sel.kind === "business-email") {
        keys.add(`email:${sel.planId}:${sel.term}`);
      } else if (sel.kind === "domain-protection") {
        keys.add("domain-protection");
      }
    }
    return keys;
  });
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [hostingBilling, setHostingBilling] = useState<
    Record<string, "monthly" | "annually">
  >(() => {
    const initial: Record<string, "monthly" | "annually"> = {};
    for (const g of groupCheckoutOffers(offers.optional).hostingGroups) {
      initial[g.groupKey] = g.monthly ? "monthly" : "annually";
    }
    return initial;
  });
  const [emailBilling, setEmailBilling] = useState<
    Record<string, EmailBillingTerm>
  >(() => {
    const initial: Record<string, EmailBillingTerm> = {};
    for (const g of groupCheckoutOffers(offers.optional).emailGroups) {
      initial[g.groupKey] = "monthly";
    }
    return initial;
  });

  const selections = useMemo(() => {
    const out: DomainCheckoutServiceSelection[] = [];
    for (const offer of offers.optional) {
      const key = offerKey(offer);
      if (selectedKeys.has(key)) out.push(offerToSelection(offer));
    }
    return out;
  }, [offers.optional, selectedKeys]);

  const refreshQuote = useCallback(async () => {
    if (!isAuthenticated) {
      setQuote(null);
      return;
    }
    setQuoteLoading(true);
    try {
      const res = await fetch("/api/domains/checkout/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ services: selections }),
      });
      const json = (await res.json()) as QuoteResponse;
      if (res.ok) setQuote(json);
    } catch {
      /* ignore */
    } finally {
      setQuoteLoading(false);
    }
  }, [selections, isAuthenticated]);

  useEffect(() => {
    void refreshQuote();
  }, [refreshQuote]);

  useEffect(() => {
    writePremiumCartServices(selections);
  }, [selections]);

  const domainsTotal =
    quote?.domainsSubtotal ?? lines.reduce((s, l) => s + l.register, 0);
  const clientServicesTotal = useMemo(() => {
    return offers.optional
      .filter((offer) => selectedKeys.has(offerKey(offer)))
      .reduce((sum, offer) => sum + offer.amount, 0);
  }, [offers.optional, selectedKeys]);
  const servicesTotal = quote?.servicesSubtotal ?? clientServicesTotal;
  const displayTotal = quote?.total ?? domainsTotal + servicesTotal;
  const walletDue = quote?.walletChargeToday ?? domainsTotal;
  const walletShort =
    !allDone &&
    ((isAuthenticated && walletBalance + 1e-9 < walletDue) || insufficient);

  function toggleOffer(offer: DomainCheckoutServiceOffer) {
    const key = offerKey(offer);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        return next;
      }
      if (offer.kind === "hosting") {
        for (const k of [...next]) {
          if (k.startsWith("hosting:")) next.delete(k);
        }
      }
      if (offer.kind === "business-email") {
        for (const k of [...next]) {
          if (k.startsWith("email:")) next.delete(k);
        }
      }
      next.add(key);
      return next;
    });
  }

  function onEmailBillingChange(groupKey: string, term: EmailBillingTerm) {
    setEmailBilling((prev) => ({ ...prev, [groupKey]: term }));
    setSelectedKeys((prev) => {
      const hadGroup = [...prev].some((k) => k.startsWith(`${groupKey}:`));
      if (!hadGroup) return prev;
      const next = new Set(prev);
      for (const k of [...next]) {
        if (k.startsWith(`${groupKey}:`)) next.delete(k);
      }
      const planId = groupKey.replace(/^email:/, "");
      const offer = offers.optional.find(
        (o) =>
          o.kind === "business-email" && o.planId === planId && o.term === term,
      );
      if (offer) next.add(offerKey(offer));
      return next;
    });
  }

  function onHostingBillingChange(
    groupKey: string,
    billing: "monthly" | "annually",
  ) {
    setHostingBilling((prev) => ({ ...prev, [groupKey]: billing }));
    setSelectedKeys((prev) => {
      const hadGroup = [...prev].some((k) => k.startsWith(`${groupKey}:`));
      if (!hadGroup) return prev;
      const next = new Set(prev);
      for (const k of [...next]) {
        if (k.startsWith(`${groupKey}:`)) next.delete(k);
      }
      const offer = offers.optional.find(
        (o) =>
          o.kind === "hosting" &&
          hostingGroupKey(o) === groupKey &&
          o.billing === billing,
      );
      if (offer) next.add(offerKey(offer));
      return next;
    });
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  function goNext() {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]!.id);
  }

  function goBack() {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx > 0) setStep(STEPS[idx - 1]!.id);
  }

  const primaryCta = useMemo(() => {
    if (step === "payment") {
      if (!isAuthenticated) {
        return {
          label: "Sign in to complete payment",
          action: () => setStep("details"),
          disabled: lines.length === 0,
        };
      }
      const itemLabel =
        servicesTotal > 0
          ? "Complete order"
          : `Register ${lines.length === 1 ? "domain" : `${lines.length} domains`}`;
      return {
        label: `${itemLabel} · ${formatCatalogUsd(displayTotal)}`,
        action: () => void onCompleteCheckout(),
        disabled:
          submitting ||
          quoteLoading ||
          walletShort ||
          lines.length === 0 ||
          !priceConfirmed ||
          allDone,
      };
    }
    if (step === "details") {
      return {
        label: isAuthenticated ? "Continue to payment" : "Continue",
        action: goNext,
        disabled: false,
      };
    }
    if (step === "services") {
      return { label: "Continue to account", action: goNext, disabled: false };
    }
    return {
      label: "Continue to add-ons",
      action: goNext,
      disabled: lines.length === 0,
    };
  }, [
    step,
    lines.length,
    displayTotal,
    servicesTotal,
    formatCatalogUsd,
    submitting,
    quoteLoading,
    walletShort,
    priceConfirmed,
    allDone,
    onCompleteCheckout,
  ]);

  const stepCopy = STEP_COPY[step];

  return (
    <div className="hb-checkout-premium relative min-h-dvh pb-28 lg:pb-10">
      <div className="hb-checkout-premium__ambient" aria-hidden />
      <div className="relative z-10 mx-auto w-full max-w-[77.5rem] px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href={routes.home} className="shrink-0">
            <BrandMark />
          </Link>
          <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--hb-co-text-muted)]">
            <Lock className="size-4 text-[var(--hb-co-primary)]" aria-hidden />
            Secure checkout
          </p>
        </header>

        <div className="mt-6 lg:mt-8">
          <h1 className="font-heading text-[clamp(1.5rem,3vw,2.1rem)] font-extrabold tracking-tight text-[var(--hb-co-text)]">
            {stepCopy.title}
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] text-[var(--hb-co-text-muted)]">
            {stepCopy.subtitle}
          </p>
        </div>

        <CheckoutStepNav current={stepIndex + 1} className="mt-8" />

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(100%,22rem)] lg:items-start">
          <div className="min-w-0 space-y-6">
            {lines.length === 0 ? (
              <section className="rounded-[22px] border border-dashed border-violet-200 bg-white/90 p-8 text-center">
                <p className="text-[16px] font-extrabold text-[#1a1035]">
                  Your domains cart is empty
                </p>
                <p className="mt-2 text-[14px] text-slate-600">
                  Search for a domain and add it to continue checkout.
                </p>
                <Link
                  href={routes.domainSearch}
                  className="mt-5 inline-flex min-h-12 items-center rounded-full bg-[#673de6] px-8 text-[14px] font-bold text-white"
                >
                  Search domains
                </Link>
              </section>
            ) : null}

            {step === "domains" && lines.length > 0 ? (
              <section
                className="hb-checkout-premium__card p-5 sm:p-6"
                aria-labelledby="checkout-domains-heading"
              >
                <h2
                  id="checkout-domains-heading"
                  className="text-[13px] font-bold tracking-wide text-[var(--hb-co-text-muted)] uppercase"
                >
                  Domain registrations
                </h2>
                {rejectedNotice.length > 0 ? (
                  <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Removed (no longer available): {rejectedNotice.join(", ")}
                  </p>
                ) : null}
                {priceChanges.length > 0 && !priceConfirmed ? (
                  <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950">
                    <p className="font-semibold">Pricing updated</p>
                    <ul className="mt-2 list-disc pl-5">
                      {priceChanges.map((change) => (
                        <li key={change.domain}>
                          {change.domain}: {formatCatalogUsd(change.previous)} →{" "}
                          {formatCatalogUsd(change.current)}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="mt-3 min-h-11 rounded-full bg-[#673de6] px-5 text-xs font-bold text-white"
                      onClick={onConfirmPrices}
                    >
                      Confirm updated prices
                    </button>
                  </div>
                ) : null}
                <div className="mt-4 overflow-x-auto rounded-[14px] border border-[var(--hb-co-border)]">
                  <table className="w-full min-w-[28rem] text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-[var(--hb-co-border)] bg-[var(--hb-co-bg-subtle)] text-[11px] font-bold tracking-wide text-[var(--hb-co-text-muted)] uppercase">
                        <th className="px-4 py-3 font-bold">Item</th>
                        <th className="px-4 py-3 font-bold">Duration</th>
                        <th className="px-4 py-3 text-right font-bold">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line) => (
                        <tr
                          key={line.domain}
                          className="border-b border-[var(--hb-co-border)] last:border-0"
                        >
                          <td className="px-4 py-3.5 align-top">
                            <p
                              className="text-[15px] font-extrabold break-words text-[var(--hb-co-text)]"
                              style={{ overflowWrap: "anywhere" }}
                            >
                              {line.domain}
                            </p>
                            <p className="mt-0.5 text-[12px] font-semibold text-[var(--hb-co-primary)]">
                              Registration
                            </p>
                            {!submitting && results.length === 0 ? (
                              <button
                                type="button"
                                className="mt-2 min-h-9 text-[12px] font-bold text-[var(--hb-co-text-muted)] hover:text-[var(--hb-co-error)]"
                                onClick={() => void onRemoveLine(line.domain)}
                              >
                                Remove
                              </button>
                            ) : null}
                          </td>
                          <td className="px-4 py-3.5 align-top text-[var(--hb-co-text-muted)]">
                            1 year
                            <span className="mt-1 block text-[11px]">
                              Renews {formatCatalogUsd(line.renew)}/yr
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right align-top font-extrabold text-[var(--hb-co-text)]">
                            {formatCatalogUsd(line.register)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                  <p className="text-[13px] font-bold text-emerald-900">
                    Protect your domain
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {offers.included.map((item) => (
                      <li
                        key={item.id}
                        className="flex gap-2 text-[12.5px] text-emerald-950"
                      >
                        <ShieldCheck
                          className="mt-0.5 size-4 shrink-0 text-emerald-600"
                          aria-hidden
                        />
                        <span>
                          <strong>{item.label}</strong> — {item.detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : null}

            {step === "services" && lines.length > 0 ? (
              <section
                className="space-y-4"
                aria-labelledby="checkout-services-heading"
              >
                <CheckoutAddonOfferList
                  optional={offers.optional}
                  selectedKeys={selectedKeys}
                  hostingBilling={hostingBilling}
                  emailBilling={emailBilling}
                  onHostingBillingChange={onHostingBillingChange}
                  onEmailBillingChange={onEmailBillingChange}
                  onToggleOffer={toggleOffer}
                  exampleEmail={
                    lines[0]?.domain
                      ? `info@${lines[0].domain}`
                      : "info@yourdomain.com"
                  }
                />
                <button
                  type="button"
                  onClick={goNext}
                  className="min-h-11 text-[13px] font-bold text-[var(--hb-co-primary)] hover:underline"
                >
                  Skip add-ons
                </button>
              </section>
            ) : null}

            {step === "details" && lines.length > 0 ? (
              isAuthenticated ? (
                <section
                  className="hb-checkout-premium__card p-5 sm:p-6"
                  aria-labelledby="checkout-details-heading"
                >
                  <h2
                    id="checkout-details-heading"
                    className="text-[15px] font-extrabold text-[#1a1035]"
                  >
                    Customer details
                  </h2>
                  <p className="mt-1 text-[13px] text-slate-500">
                    Registration uses your HostingBeyond account contact.
                  </p>
                  <div className="mt-4 space-y-3">
                    <label className="block">
                      <span className="text-[12px] font-bold text-slate-500 uppercase">
                        Email
                      </span>
                      <input
                        readOnly
                        value={customerEmail}
                        className="mt-1 flex min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-800"
                      />
                    </label>
                    {customerName ? (
                      <label className="block">
                        <span className="text-[12px] font-bold text-slate-500 uppercase">
                          Name
                        </span>
                        <input
                          readOnly
                          value={customerName}
                          className="mt-1 flex min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-800"
                        />
                      </label>
                    ) : null}
                  </div>
                </section>
              ) : (
                <CheckoutAuthPanel
                  onAuthenticated={onAuthenticated}
                  googleOAuth={googleOAuth}
                />
              )
            ) : null}

            {step === "payment" && lines.length > 0 ? (
              <section
                className="hb-checkout-premium__card p-5 sm:p-6"
                aria-labelledby="checkout-payment-heading"
              >
                <h2
                  id="checkout-payment-heading"
                  className="text-[15px] font-extrabold text-[#1a1035]"
                >
                  Payment
                </h2>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Wallet className="size-4 text-[#673de6]" />
                    Wallet balance
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {walletCurrency} {walletBalance.toFixed(2)}
                  </span>
                </div>
                {!isAuthenticated ? (
                  <CheckoutAuthPanel
                    onAuthenticated={onAuthenticated}
                    className="mt-4"
                    googleOAuth={googleOAuth}
                  />
                ) : null}
                {walletShort ? (
                  <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Your wallet balance is too low for this order (
                    {formatCatalogUsd(displayTotal)} total
                    {walletDue + 1e-9 < displayTotal
                      ? `, ${formatCatalogUsd(walletDue)} due from wallet now`
                      : ""}
                    ).{" "}
                    <Link
                      href={routes.accountWallet}
                      className="font-semibold text-[#673de6] underline"
                    >
                      Add funds
                    </Link>
                    {!paymentProviderReady ? (
                      <span className="mt-1 block text-xs text-amber-800/80">
                        Card payments are not enabled yet — wallet top-up will
                        complete once billing is connected.
                      </span>
                    ) : null}
                  </p>
                ) : null}
                {quote?.paymentNote ? (
                  <p className="mt-3 text-[12.5px] leading-snug text-slate-500">
                    {quote.paymentNote}
                  </p>
                ) : null}
                {offers.optional.some(
                  (o) =>
                    selectedKeys.has(offerKey(o)) &&
                    o.kind !== "domain-protection",
                ) && !allDone ? (
                  <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-[13px] text-slate-700">
                    <p className="font-semibold text-[#1a1035]">
                      Included in this order
                    </p>
                    <p className="mt-1">
                      After domain payment, checkout continues automatically for
                      hosting and email on your new domain.
                    </p>
                    <ul className="mt-2 space-y-1">
                      {offers.optional
                        .filter(
                          (o) =>
                            selectedKeys.has(offerKey(o)) &&
                            o.kind !== "domain-protection",
                        )
                        .map((o) => {
                          if (o.kind === "hosting") {
                            return (
                              <li key={offerKey(o)}>
                                <Link
                                  href={hostingCheckoutPath({
                                    product: o.productSlug,
                                    plan: o.planKey,
                                    billing: o.billing,
                                  })}
                                  className="font-semibold text-[#673de6] hover:underline"
                                >
                                  Set up {o.label}
                                </Link>
                              </li>
                            );
                          }
                          return (
                            <li key={offerKey(o)}>
                              <Link
                                href={routes.businessEmail}
                                className="font-semibold text-[#673de6] hover:underline"
                              >
                                Set up {o.label}
                              </Link>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                ) : null}
                {error ? (
                  <p
                    className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}
                {results.length > 0 ? (
                  <div className="mt-6 space-y-3" aria-live="polite">
                    {results.map((item) => (
                      <div
                        key={item.domain}
                        className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm"
                      >
                        <p className="font-bold text-slate-900">
                          {item.domain}
                        </p>
                        <p className="mt-1 text-slate-600">{item.message}</p>
                      </div>
                    ))}
                    <Link
                      href={routes.myDomains}
                      className="inline-flex min-h-11 items-center rounded-full border border-slate-200 px-5 text-sm font-semibold"
                    >
                      Go to My Domains
                    </Link>
                  </div>
                ) : null}
              </section>
            ) : null}

            {stepIndex > 0 && !allDone ? (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex min-h-11 items-center gap-1 text-[13px] font-semibold text-slate-500 hover:text-[#673de6]"
              >
                <ChevronLeft className="size-4" />
                Back
              </button>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-6" aria-label="Order summary">
            <div className="hb-checkout-premium__card p-5">
              <h2 className="text-[12px] font-bold tracking-wide text-[var(--hb-co-text-muted)] uppercase">
                Order summary
              </h2>
              <ul className="mt-4 space-y-3 border-b border-slate-100 pb-4">
                {step === "domains" ? (
                  <li className="text-[13px] text-[var(--hb-co-text-muted)]">
                    <span className="font-bold text-[var(--hb-co-text)]">
                      {lines.length}
                    </span>{" "}
                    domain{lines.length === 1 ? "" : "s"} in cart — see table
                    for line items
                  </li>
                ) : (
                  lines.map((line) => (
                    <li
                      key={line.domain}
                      className="flex justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p
                          className="text-[13px] font-bold break-words text-slate-800"
                          style={{ overflowWrap: "anywhere" }}
                        >
                          {line.domain}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Domain registration · 1 year
                        </p>
                      </div>
                      <span className="shrink-0 text-[13px] font-bold text-slate-900">
                        {formatCatalogUsd(line.register)}
                      </span>
                    </li>
                  ))
                )}
                {quote?.serviceLines?.map((line) => (
                  <li key={line.key} className="flex justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-slate-800">
                        {line.label}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {line.detail}
                      </p>
                    </div>
                    <span className="shrink-0 text-[13px] font-bold text-slate-900">
                      {formatCatalogUsd(line.amount)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-1.5 text-[13px]">
                <div className="flex justify-between text-slate-600">
                  <span>Domains subtotal</span>
                  <span className="font-semibold text-slate-900">
                    {quoteLoading ? "…" : formatCatalogUsd(domainsTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Services</span>
                  <span className="font-semibold text-slate-900">
                    {quoteLoading ? "…" : formatCatalogUsd(servicesTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Taxes / fees</span>
                  <span>Included where shown</span>
                </div>
                <div className="flex justify-between pt-2 text-[17px] font-extrabold text-[#1a1035]">
                  <span>Total</span>
                  <span>
                    {quoteLoading ? "…" : formatCatalogUsd(displayTotal)}
                  </span>
                </div>
                <p className="pt-1 text-[11px] text-slate-500">
                  Due today: {formatCatalogUsd(displayTotal)}
                  {walletDue + 1e-9 < displayTotal
                    ? ` · wallet ${formatCatalogUsd(walletDue)} for domains, then hosting & email`
                    : " from wallet"}
                </p>
                <p className="text-[11px] font-semibold text-slate-500">
                  {t.common.billedInUsd}
                </p>
              </div>
              {!allDone ? (
                <button
                  type="button"
                  disabled={primaryCta.disabled}
                  onClick={primaryCta.action}
                  className="hb-checkout-premium__btn-primary mt-5 w-full"
                >
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : step === "payment" ? (
                    <Globe2 className="size-4" />
                  ) : null}
                  {primaryCta.label}
                </button>
              ) : null}
            </div>
          </aside>
        </div>
      </div>

      {!allDone && step !== "payment" ? (
        <div
          className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/90 bg-white/95 p-4 backdrop-blur-md lg:hidden"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            disabled={primaryCta.disabled}
            onClick={primaryCta.action}
            className="hb-checkout-premium__btn-primary w-full"
          >
            {primaryCta.label}
          </button>
        </div>
      ) : null}
    </div>
  );
}
