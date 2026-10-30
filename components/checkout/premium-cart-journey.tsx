"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckoutAddonOfferList,
  groupCheckoutOffers,
  hostingGroupKey,
  offerKey,
  offerToSelection,
} from "@/components/checkout/checkout-addon-offers";
import type { EmailBillingTerm } from "@/lib/hosting/business-email-term-pricing";
import { ChevronDown, Lock, ShieldCheck, ShoppingCart } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { CheckoutAuthPanel } from "@/components/domains/checkout-auth-panel";
import { useDomainCart } from "@/components/domains/domain-cart-provider";
import { CheckoutStepNav } from "@/components/checkout/checkout-step-nav";
import { PremiumOrderSummary } from "@/components/checkout/premium-order-summary";
import { routes } from "@/config/routes";
import {
  readPremiumCartServices,
  writePremiumCartServices,
} from "@/lib/checkout/premium-cart-intent";
import type {
  DomainCheckoutOffersPayload,
  DomainCheckoutServiceSelection,
} from "@/lib/domains/domain-checkout-offers";
import type { DomainCheckoutServiceOffer } from "@/lib/domains/domain-checkout-offers";
import { useLocale } from "@/components/locale/locale-provider";
import { cn } from "@/lib/utils";

type CheckoutHints = {
  offers: DomainCheckoutOffersPayload;
  payment: {
    walletCheckout: boolean;
    stripeWalletTopUp: boolean;
    khalti: boolean;
    himalayanBank: boolean;
  };
  auth: { googleOAuth: boolean; emailPassword: boolean };
};

function clampStep(raw: string | null): number {
  const n = Number(raw);
  if (n >= 1 && n <= 4) return n;
  return 1;
}

function selectionsToKeys(
  selections: DomainCheckoutServiceSelection[],
  optional: DomainCheckoutServiceOffer[],
): Set<string> {
  const keys = new Set<string>();
  for (const sel of selections) {
    if (sel.kind === "hosting") {
      const match = optional.find(
        (o) =>
          o.kind === "hosting" &&
          o.productSlug === sel.productSlug &&
          o.planKey === sel.planKey &&
          o.billing === sel.billing,
      );
      if (match) keys.add(offerKey(match));
    } else if (sel.kind === "business-email") {
      const match = optional.find(
        (o) =>
          o.kind === "business-email" &&
          o.planId === sel.planId &&
          o.term === sel.term,
      );
      if (match) keys.add(offerKey(match));
    } else if (sel.kind === "domain-protection") {
      const match = optional.find((o) => o.kind === "domain-protection");
      if (match) keys.add(offerKey(match));
    }
  }
  return keys;
}

const STEP_HEADINGS: Record<number, { title: string; subtitle: string }> = {
  1: {
    title: "Your Cart",
    subtitle: "Review your products and choose the services you need.",
  },
  2: {
    title: "Complete Your Hosting Setup",
    subtitle:
      "Add the services you need. Every price is shown before you confirm.",
  },
  3: {
    title: "Your Account & Billing Details",
    subtitle: "Sign in or create an account to continue securely.",
  },
  4: {
    title: "Secure Checkout",
    subtitle:
      "Review totals and complete domain registration from your wallet.",
  },
};

export function PremiumCartJourney() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = clampStep(searchParams.get("step"));
  const reduceMotion = useReducedMotion();
  const { cart, removeDomain, checkoutHref, isAuthenticated, refreshCart } =
    useDomainCart();
  const { formatCatalogUsd, t } = useLocale();

  const [hints, setHints] = useState<CheckoutHints | null>(null);
  const [hintsError, setHintsError] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [hostingBilling, setHostingBilling] = useState<
    Record<string, "monthly" | "annually">
  >({});
  const [emailBilling, setEmailBilling] = useState<
    Record<string, EmailBillingTerm>
  >({});
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const setStep = useCallback(
    (next: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("step", String(next));
      router.push(`${routes.domainCart}?${params.toString()}`);
    },
    [router, searchParams],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/checkout/offers");
        if (!res.ok) throw new Error("offers");
        const json = (await res.json()) as CheckoutHints;
        if (!cancelled) {
          setHints(json);
          const billingInit: Record<string, "monthly" | "annually"> = {};
          const grouped = groupCheckoutOffers(json.offers.optional);
          for (const g of grouped.hostingGroups) {
            billingInit[g.groupKey] = g.monthly ? "monthly" : "annually";
          }
          setHostingBilling(billingInit);
          const emailInit: Record<string, EmailBillingTerm> = {};
          for (const g of grouped.emailGroups) {
            emailInit[g.groupKey] = "monthly";
          }
          setEmailBilling(emailInit);
          const saved = readPremiumCartServices();
          if (saved.length) {
            setSelectedKeys(selectionsToKeys(saved, json.offers.optional));
          }
        }
      } catch {
        if (!cancelled) setHintsError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selections = useMemo(() => {
    if (!hints) return [];
    const out: DomainCheckoutServiceSelection[] = [];
    for (const offer of hints.offers.optional) {
      if (selectedKeys.has(offerKey(offer))) {
        out.push(offerToSelection(offer));
      }
    }
    return out;
  }, [hints, selectedKeys]);

  useEffect(() => {
    writePremiumCartServices(selections);
  }, [selections]);

  const domainLines = useMemo(
    () =>
      cart.items.map((line) => ({
        key: line.domain,
        label: line.domain,
        detail: `Domain registration · ${line.periodYears ?? 1} year · Renews ${formatCatalogUsd(line.renew)}/yr`,
        amount: line.register,
      })),
    [cart.items, formatCatalogUsd],
  );

  const serviceLines = useMemo(() => {
    if (!hints) return [];
    const domainCount = Math.max(1, cart.items.length);
    return hints.offers.optional
      .filter((o) => selectedKeys.has(offerKey(o)))
      .map((o) => {
        const amount =
          o.kind === "domain-protection"
            ? Math.round(o.amount * domainCount * 100) / 100
            : o.amount;
        const detail =
          o.kind === "domain-protection" && domainCount > 1
            ? `${o.periodLabel} · ${domainCount} domains`
            : o.kind === "hosting" || o.kind === "business-email"
              ? `${o.planName} · ${o.periodLabel}`
              : o.periodLabel;
        return {
          key: offerKey(o),
          label: o.label,
          detail,
          amount,
        };
      });
  }, [hints, selectedKeys, cart.items.length]);

  const servicesSubtotal = serviceLines.reduce((s, l) => s + l.amount, 0);
  const total = cart.total + servicesSubtotal;

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
    if (!hints) return;
    setSelectedKeys((prev) => {
      const hadGroup = [...prev].some((k) => k.startsWith(`${groupKey}:`));
      if (!hadGroup) return prev;
      const next = new Set(prev);
      for (const k of [...next]) {
        if (k.startsWith(`${groupKey}:`)) next.delete(k);
      }
      const planId = groupKey.replace(/^email:/, "");
      const offer = hints.offers.optional.find(
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
    if (!hints) return;
    setSelectedKeys((prev) => {
      const hadGroup = [...prev].some((k) => k.startsWith(`${groupKey}:`));
      if (!hadGroup) return prev;
      const next = new Set(prev);
      for (const k of [...next]) {
        if (k.startsWith(`${groupKey}:`)) next.delete(k);
      }
      const offer = hints.offers.optional.find(
        (o) =>
          o.kind === "hosting" &&
          hostingGroupKey(o) === groupKey &&
          o.billing === billing,
      );
      if (offer) next.add(offerKey(offer));
      return next;
    });
  }

  function goToSecureCheckout() {
    writePremiumCartServices(selections);
    router.push(checkoutHref);
  }

  const motionProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.22 },
      };

  const heading = STEP_HEADINGS[step];

  return (
    <div className="hb-checkout-premium relative min-h-dvh">
      <div className="hb-checkout-premium__ambient" aria-hidden />
      <div className="relative z-10 mx-auto w-full max-w-[78rem] px-4 py-8 sm:px-6">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 text-[12px] font-semibold text-[var(--hb-co-text-muted)]"
        >
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link
                href={routes.home}
                className="hover:text-[var(--hb-co-primary)]"
              >
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-[var(--hb-co-text)]">Cart</li>
          </ol>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-[12px] font-bold text-[var(--hb-co-primary)]">
              <Lock className="size-3.5" aria-hidden />
              HostingBeyond checkout
            </p>
            <h1 className="font-heading mt-1 text-[clamp(1.5rem,3vw,2.1rem)] font-extrabold tracking-tight text-[var(--hb-co-text)]">
              {heading.title}
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] text-[var(--hb-co-text-muted)]">
              {heading.subtitle}
            </p>
          </div>
        </div>

        <CheckoutStepNav current={step} className="mt-8" />

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(100%,20rem)] lg:items-start">
          <motion.div className="min-w-0 space-y-6" {...motionProps}>
            {step === 1 && (
              <section className="hb-checkout-premium__card p-5 sm:p-6">
                {cart.count === 0 ? (
                  <div className="py-10 text-center">
                    <ShoppingCart
                      className="mx-auto size-10 text-[var(--hb-co-lavender)]"
                      aria-hidden
                    />
                    <p className="mt-3 text-[16px] font-extrabold">
                      Your cart is empty.
                    </p>
                    <Link
                      href={routes.domainSearch}
                      className="hb-checkout-premium__btn-primary mt-5 inline-flex"
                    >
                      Search domains
                    </Link>
                  </div>
                ) : (
                  <>
                    <ul className="space-y-3">
                      {cart.items.map((line) => (
                        <li
                          key={line.domain}
                          className="rounded-[14px] border border-[var(--hb-co-border)] bg-[var(--hb-co-bg-subtle)]/60 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p
                                className="text-[16px] font-extrabold break-words"
                                style={{ overflowWrap: "anywhere" }}
                              >
                                {line.domain}
                              </p>
                              <p className="mt-0.5 text-[12px] font-bold text-[var(--hb-co-primary)]">
                                Domain registration
                              </p>
                              <p className="mt-1 text-[12.5px] text-[var(--hb-co-text-muted)]">
                                {line.periodYears ?? 1} year ·{" "}
                                {formatCatalogUsd(line.register)} first year ·
                                Renews {formatCatalogUsd(line.renew)}/year
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <p className="text-[18px] font-extrabold text-[var(--hb-co-primary)]">
                                {formatCatalogUsd(line.register)}
                              </p>
                              <button
                                type="button"
                                onClick={() => void removeDomain(line.domain)}
                                className="min-h-11 text-[13px] font-bold text-[var(--hb-co-text-muted)] hover:text-[var(--hb-co-error)]"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href={routes.domainSearch}
                        className="inline-flex min-h-11 items-center rounded-full border border-[var(--hb-co-border)] px-5 text-[13px] font-bold text-[var(--hb-co-text)]"
                      >
                        Continue shopping
                      </Link>
                      <button
                        type="button"
                        disabled={cart.count === 0}
                        onClick={() => setStep(2)}
                        className="hb-checkout-premium__btn-primary"
                      >
                        Continue to add-ons
                      </button>
                    </div>
                  </>
                )}
              </section>
            )}

            {step === 2 && cart.count > 0 && (
              <section className="hb-checkout-premium__card p-5 sm:p-6">
                {hintsError ? (
                  <p
                    className="text-[13px] text-[var(--hb-co-error)]"
                    role="alert"
                  >
                    We could not load add-ons. You can skip this step and
                    continue checkout.
                  </p>
                ) : null}
                {hints?.offers.included.length ? (
                  <div className="mb-5 rounded-[14px] border border-teal-200/80 bg-teal-50/50 px-4 py-3">
                    <p className="text-[13px] font-bold text-teal-900">
                      Included with your domain
                    </p>
                    <ul className="mt-2 space-y-1">
                      {hints.offers.included.map((item) => (
                        <li
                          key={item.id}
                          className="flex gap-2 text-[12.5px] text-teal-950"
                        >
                          <ShieldCheck
                            className="mt-0.5 size-4 shrink-0 text-teal-600"
                            aria-hidden
                          />
                          <span>
                            <strong>{item.label}</strong> — {item.detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {!hints && !hintsError ? (
                  <p className="text-[13px] text-[var(--hb-co-text-muted)]">
                    Loading add-ons…
                  </p>
                ) : null}
                {hints && hints.offers.optional.length === 0 ? (
                  <p className="text-[13px] text-[var(--hb-co-text-muted)]">
                    No paid add-ons are available right now. DNS and privacy
                    features included with your domain are listed above.
                  </p>
                ) : null}
                {hints && hints.offers.optional.length > 0 ? (
                  <CheckoutAddonOfferList
                    optional={hints.offers.optional}
                    selectedKeys={selectedKeys}
                    hostingBilling={hostingBilling}
                    emailBilling={emailBilling}
                    onHostingBillingChange={onHostingBillingChange}
                    onEmailBillingChange={onEmailBillingChange}
                    onToggleOffer={toggleOffer}
                    exampleEmail={
                      cart.items[0]?.domain
                        ? `info@${cart.items[0].domain}`
                        : "info@yourdomain.com"
                    }
                  />
                ) : null}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex min-h-11 items-center rounded-full border border-[var(--hb-co-border)] px-5 text-[13px] font-bold"
                  >
                    Back to cart
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-[13px] font-bold text-[var(--hb-co-primary)] hover:underline"
                  >
                    Skip add-ons
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="hb-checkout-premium__btn-primary"
                  >
                    Continue
                  </button>
                </div>
              </section>
            )}

            {step === 3 && cart.count > 0 && (
              <section className="space-y-4">
                {isAuthenticated ? (
                  <div className="hb-checkout-premium__card p-5 sm:p-6">
                    <p className="text-[15px] font-extrabold">
                      You&apos;re signed in
                    </p>
                    <p className="mt-1 text-[13px] text-[var(--hb-co-text-muted)]">
                      Your cart and add-on choices are saved for checkout.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="hb-checkout-premium__btn-primary mt-5"
                    >
                      Continue to payment
                    </button>
                  </div>
                ) : (
                  <CheckoutAuthPanel
                    googleOAuth={hints?.auth.googleOAuth ?? false}
                    oauthNext={`${routes.domainCart}?step=3`}
                    onAuthenticated={() => {
                      void refreshCart();
                      router.refresh();
                    }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-[13px] font-semibold text-[var(--hb-co-text-muted)] hover:text-[var(--hb-co-primary)]"
                >
                  ← Back to add-ons
                </button>
              </section>
            )}

            {step === 4 && cart.count > 0 && (
              <section
                className="hb-checkout-premium__card p-5 sm:p-6"
                translate="no"
              >
                <h2 className="text-[15px] font-extrabold">Payment methods</h2>
                <ul className="mt-4 space-y-2 text-[13px]">
                  <li className="rounded-[14px] border border-[var(--hb-co-border)] px-4 py-3 font-semibold">
                    HostingBeyond wallet — used for domain registration; add-ons
                    continue on the next checkout
                  </li>
                  {hints?.payment.stripeWalletTopUp ? (
                    <li className="rounded-[14px] border border-[var(--hb-co-border)] px-4 py-3 text-[var(--hb-co-text-muted)]">
                      Card top-up (Stripe) — add funds to your wallet before
                      registering domains
                    </li>
                  ) : (
                    <li className="rounded-[14px] border border-dashed border-[var(--hb-co-border)] px-4 py-3 text-[var(--hb-co-text-muted)]">
                      Card wallet top-up is not configured on this environment.
                    </li>
                  )}
                  {!hints?.payment.khalti && !hints?.payment.himalayanBank ? (
                    <li className="text-[12px] text-[var(--hb-co-text-muted)]">
                      Khalti and bank card gateways are not enabled for this
                      checkout.
                    </li>
                  ) : null}
                </ul>
                {serviceLines.length > 0 ? (
                  <p className="mt-4 text-[13px] leading-snug text-[var(--hb-co-text-muted)]">
                    The pay button uses this order total. After domain
                    registration, hosting and email checkout continue with your
                    new domain already selected.
                  </p>
                ) : null}
                {!isAuthenticated ? (
                  <p
                    className="mt-4 text-[13px] text-[var(--hb-co-error)]"
                    role="alert"
                  >
                    Sign in on the previous step before completing payment.
                  </p>
                ) : null}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex min-h-11 items-center rounded-full border border-[var(--hb-co-border)] px-5 text-[13px] font-bold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!isAuthenticated}
                    onClick={goToSecureCheckout}
                    className="hb-checkout-premium__btn-primary"
                  >
                    Complete secure checkout · {formatCatalogUsd(total)}
                  </button>
                </div>
                <p className="mt-4 text-[11px] text-[var(--hb-co-text-muted)]">
                  By continuing you agree to our terms and refund policy. Totals
                  are revalidated on the server before any charge.
                </p>
              </section>
            )}
          </motion.div>

          <div className="lg:block">
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setMobileSummaryOpen((o) => !o)}
                className="flex min-h-12 w-full items-center justify-between rounded-[14px] border border-[var(--hb-co-border)] bg-white px-4 text-[13px] font-bold"
              >
                <span>Estimated total · {formatCatalogUsd(total)}</span>
                <ChevronDown
                  className={cn(
                    "size-4 transition",
                    mobileSummaryOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
              {mobileSummaryOpen ? (
                <div className="mt-3">
                  <PremiumOrderSummary
                    domainLines={domainLines}
                    serviceLines={serviceLines}
                    domainsSubtotal={cart.total}
                    servicesSubtotal={servicesSubtotal}
                    total={total}
                    currency={cart.currency}
                    compact
                  />
                </div>
              ) : null}
            </div>
            <div className="hidden lg:block">
              <PremiumOrderSummary
                domainLines={domainLines}
                serviceLines={serviceLines}
                domainsSubtotal={cart.total}
                servicesSubtotal={servicesSubtotal}
                total={total}
                currency={cart.currency}
              />
            </div>
          </div>
        </div>
      </div>

      {cart.count > 0 && step < 4 ? (
        <div
          className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--hb-co-border)] bg-white/95 p-4 backdrop-blur-sm lg:hidden"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] font-bold">
              {formatCatalogUsd(total)}
              <span className="mt-0.5 block text-[10px] font-medium text-[var(--hb-co-text-muted)]">
                {t.common.billedInUsd}
              </span>
            </span>
            <button
              type="button"
              className="hb-checkout-premium__btn-primary min-h-11 px-6"
              onClick={() => setStep(Math.min(4, step + 1))}
            >
              {step === 1 ? "Add-ons" : step === 2 ? "Account" : "Payment"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
