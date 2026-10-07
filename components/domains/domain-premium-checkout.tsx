"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  Globe2,
  Loader2,
  Lock,
  Mail,
  Server,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { BrandMark } from "@/components/auth/brand-mark";
import { routes } from "@/config/routes";
import type {
  DomainCheckoutOffersPayload,
  DomainCheckoutServiceOffer,
  DomainCheckoutServiceSelection,
} from "@/lib/domains/domain-checkout-offers";
import { formatPrice } from "@/lib/domains/tlds";
import { hostingCheckoutPath } from "@/lib/hosting/purchase-intent";
import { cn } from "@/lib/utils";

import type {
  DomainCheckoutLine,
  DomainCheckoutResult,
} from "./domain-checkout-view";

const STEPS = [
  { id: "domains", label: "Domains" },
  { id: "services", label: "Services" },
  { id: "details", label: "Details" },
  { id: "payment", label: "Payment" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

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

function offerKey(offer: DomainCheckoutServiceOffer): string {
  if (offer.kind === "hosting") {
    return `hosting:${offer.productSlug}:${offer.planKey}:${offer.billing}`;
  }
  return `email:${offer.planId}`;
}

function offerToSelection(
  offer: DomainCheckoutServiceOffer,
): DomainCheckoutServiceSelection {
  if (offer.kind === "hosting") {
    return {
      kind: "hosting",
      productSlug: offer.productSlug,
      planKey: offer.planKey,
      billing: offer.billing,
    };
  }
  return { kind: "business-email", planId: offer.planId };
}

type PremiumCheckoutProps = {
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
};

export function DomainPremiumCheckout({
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
}: PremiumCheckoutProps) {
  const [step, setStep] = useState<StepId>("domains");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const selections = useMemo(() => {
    const out: DomainCheckoutServiceSelection[] = [];
    for (const offer of offers.optional) {
      const key = offerKey(offer);
      if (selectedKeys.has(key)) out.push(offerToSelection(offer));
    }
    return out;
  }, [offers.optional, selectedKeys]);

  const refreshQuote = useCallback(async () => {
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
  }, [selections]);

  useEffect(() => {
    void refreshQuote();
  }, [refreshQuote]);

  const domainsTotal =
    quote?.domainsSubtotal ?? lines.reduce((s, l) => s + l.register, 0);
  const servicesTotal = quote?.servicesSubtotal ?? 0;
  const displayTotal = quote?.total ?? domainsTotal + servicesTotal;
  const walletDue = quote?.walletChargeToday ?? domainsTotal;

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
      next.add(key);
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
      return {
        label: `Register ${lines.length === 1 ? "domain" : `${lines.length} domains`} · ${walletCurrency} ${walletDue.toFixed(2)}`,
        action: () => void onCompleteCheckout(),
        disabled:
          submitting ||
          insufficient ||
          lines.length === 0 ||
          !priceConfirmed ||
          allDone,
      };
    }
    if (step === "details") {
      return { label: "Continue to payment", action: goNext, disabled: false };
    }
    if (step === "services") {
      return { label: "Continue to details", action: goNext, disabled: false };
    }
    return {
      label: "Continue to services",
      action: goNext,
      disabled: lines.length === 0,
    };
  }, [
    step,
    lines.length,
    walletCurrency,
    walletDue,
    submitting,
    insufficient,
    priceConfirmed,
    allDone,
    onCompleteCheckout,
  ]);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#f6f2ff] via-white to-[#f8fafc] px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:pb-10">
      <div className="mx-auto w-full max-w-[72rem]">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href={routes.home} className="shrink-0">
            <BrandMark />
          </Link>
          <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-600">
            <Lock className="size-4 text-[#673de6]" aria-hidden />
            Secure checkout
          </p>
        </header>

        <div className="mt-6 lg:mt-8">
          <p className="text-[11px] font-bold tracking-[0.14em] text-[#673de6] uppercase">
            Domain registration &amp; services
          </p>
          <h1 className="font-heading mt-1 text-[clamp(1.35rem,3vw,1.85rem)] font-extrabold tracking-tight text-[#1a1035]">
            Complete your order
          </h1>
        </div>

        <nav
          aria-label="Checkout steps"
          className="mt-6 flex flex-wrap gap-2 sm:gap-3"
        >
          {STEPS.map((s, i) => {
            const done = i < stepIndex;
            const current = s.id === step;
            return (
              <button
                key={s.id}
                type="button"
                disabled={i > stepIndex + 1}
                onClick={() => {
                  if (i <= stepIndex) setStep(s.id);
                }}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[13px] font-bold transition",
                  current
                    ? "bg-[#673de6] text-white shadow-[0_10px_24px_-14px_rgba(103,61,230,0.65)]"
                    : done
                      ? "border border-violet-200 bg-white text-[#673de6]"
                      : "border border-slate-200 bg-white/80 text-slate-500",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-[11px]",
                    current ? "bg-white/20" : "bg-slate-100",
                  )}
                  aria-hidden
                >
                  {done ? <Check className="size-3.5" /> : i + 1}
                </span>
                {s.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(100%,22rem)] lg:items-start">
          <div className="min-w-0 space-y-6">
            {step === "domains" ? (
              <section
                className="rounded-[22px] border border-violet-100/80 bg-white/95 p-5 shadow-[0_16px_40px_-28px_rgba(47,28,106,0.35)] sm:p-6"
                aria-labelledby="checkout-domains-heading"
              >
                <h2
                  id="checkout-domains-heading"
                  className="text-[15px] font-extrabold text-[#1a1035]"
                >
                  Your domains
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
                          {change.domain}: {formatPrice(change.previous)} →{" "}
                          {formatPrice(change.current)}
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
                <ul className="mt-4 space-y-3">
                  {lines.map((line) => (
                    <li
                      key={line.domain}
                      className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-[#faf8ff] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className="text-[16px] font-extrabold break-words text-[#1a1035]"
                            style={{ overflowWrap: "anywhere" }}
                          >
                            {line.domain}
                          </p>
                          <p className="mt-1 text-[12.5px] font-medium text-slate-500">
                            Domain registration · 1 year
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[17px] font-extrabold text-[#673de6]">
                            {formatPrice(line.register)}
                            <span className="text-[12px] font-bold text-slate-500">
                              {" "}
                              / first year
                            </span>
                          </p>
                          <p className="text-[11.5px] font-semibold text-slate-500">
                            Renews at {formatPrice(line.renew)}/year
                          </p>
                        </div>
                      </div>
                      {!submitting && results.length === 0 ? (
                        <button
                          type="button"
                          className="mt-3 min-h-11 text-[13px] font-bold text-slate-400 hover:text-red-600"
                          onClick={() => void onRemoveLine(line.domain)}
                        >
                          Remove
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
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

            {step === "services" ? (
              <section
                className="rounded-[22px] border border-violet-100/80 bg-white/95 p-5 sm:p-6"
                aria-labelledby="checkout-services-heading"
              >
                <h2
                  id="checkout-services-heading"
                  className="text-[15px] font-extrabold text-[#1a1035]"
                >
                  Recommended for your domain
                </h2>
                <p className="mt-1 text-[13px] text-slate-500">
                  Optional — skip anytime. Prices are confirmed on our servers.
                </p>
                {offers.optional.length === 0 ? (
                  <p className="mt-4 text-[13px] text-slate-600">
                    No additional services are available for checkout right now.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {offers.optional.map((offer) => {
                      const key = offerKey(offer);
                      const added = selectedKeys.has(key);
                      const Icon = offer.kind === "hosting" ? Server : Mail;
                      const exampleEmail = lines[0]?.domain
                        ? `info@${lines[0].domain}`
                        : "info@yourdomain.com";
                      return (
                        <li
                          key={key}
                          className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_8px_24px_-22px_rgba(47,28,106,0.3)]"
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f3edff] text-[#673de6]"
                              aria-hidden
                            >
                              <Icon className="size-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[15px] font-extrabold text-[#1a1035]">
                                {offer.label}
                              </p>
                              <p className="mt-1 text-[13px] text-slate-600">
                                {offer.description}
                              </p>
                              {offer.kind === "business-email" ? (
                                <p className="mt-1 text-[12px] font-medium text-[#673de6]">
                                  {exampleEmail}
                                </p>
                              ) : null}
                              <p className="mt-2 text-[14px] font-extrabold text-slate-900">
                                {formatPrice(offer.amount)}{" "}
                                <span className="text-[12px] font-semibold text-slate-500">
                                  {offer.periodLabel}
                                </span>
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleOffer(offer)}
                              className={cn(
                                "min-h-11 shrink-0 rounded-full px-5 text-[13px] font-bold transition",
                                added
                                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : "bg-[#673de6] text-white hover:bg-[#5b32d6]",
                              )}
                              aria-pressed={added}
                            >
                              {added ? "✓ Added" : "Add"}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <button
                  type="button"
                  onClick={goNext}
                  className="mt-5 min-h-11 text-[13px] font-bold text-[#673de6] hover:underline"
                >
                  Continue without extras
                </button>
              </section>
            ) : null}

            {step === "details" ? (
              <section
                className="rounded-[22px] border border-violet-100/80 bg-white/95 p-5 sm:p-6"
                aria-labelledby="checkout-details-heading"
              >
                <h2
                  id="checkout-details-heading"
                  className="text-[15px] font-extrabold text-[#1a1035]"
                >
                  Customer details
                </h2>
                <p className="mt-1 text-[13px] text-slate-500">
                  Registration uses your HostingBeyond account contact. Update
                  your profile anytime in account settings.
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
            ) : null}

            {step === "payment" ? (
              <section
                className="rounded-[22px] border border-violet-100/80 bg-white/95 p-5 sm:p-6"
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
                {insufficient ? (
                  <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Your wallet balance is too low for domain registration (
                    {walletCurrency} {walletDue.toFixed(2)} required).{" "}
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
                {selectedKeys.size > 0 && !allDone ? (
                  <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-[13px] text-slate-700">
                    <p className="font-semibold text-[#1a1035]">
                      After registration
                    </p>
                    <p className="mt-1">
                      Complete hosting or email setup with your new domain:
                    </p>
                    <ul className="mt-2 space-y-1">
                      {offers.optional
                        .filter((o) => selectedKeys.has(offerKey(o)))
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
            <div className="rounded-[22px] border border-violet-200/55 bg-white/95 p-5 shadow-[0_22px_52px_-30px_rgba(47,28,106,0.4)] ring-1 ring-violet-100/70">
              <h2 className="text-[12px] font-bold tracking-wide text-slate-500 uppercase">
                Order summary
              </h2>
              <ul className="mt-4 space-y-3 border-b border-slate-100 pb-4">
                {lines.map((line) => (
                  <li key={line.domain} className="flex justify-between gap-2">
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
                      {formatPrice(line.register)}
                    </span>
                  </li>
                ))}
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
                      {formatPrice(line.amount)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-1.5 text-[13px]">
                <div className="flex justify-between text-slate-600">
                  <span>Domains subtotal</span>
                  <span className="font-semibold text-slate-900">
                    {quoteLoading ? "…" : formatPrice(domainsTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Services</span>
                  <span className="font-semibold text-slate-900">
                    {quoteLoading ? "…" : formatPrice(servicesTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Taxes / fees</span>
                  <span>Included where shown</span>
                </div>
                <div className="flex justify-between pt-2 text-[17px] font-extrabold text-[#1a1035]">
                  <span>Total</span>
                  <span>{quoteLoading ? "…" : formatPrice(displayTotal)}</span>
                </div>
                <p className="pt-1 text-[11px] text-slate-500">
                  Due today from wallet: {walletCurrency} {walletDue.toFixed(2)}{" "}
                  (domains)
                </p>
              </div>
              {!allDone ? (
                <button
                  type="button"
                  disabled={primaryCta.disabled}
                  onClick={primaryCta.action}
                  className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#673de6] to-[#2563eb] text-[14px] font-bold text-white disabled:opacity-55"
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
            className="flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#673de6] to-[#2563eb] text-[14px] font-bold text-white disabled:opacity-55"
          >
            {primaryCta.label}
          </button>
        </div>
      ) : null}
    </div>
  );
}
