"use client";

import Link from "next/link";
import { Headphones, Lock, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

const TRUST = [
  { icon: Lock, label: "SSL encrypted checkout" },
  { icon: Zap, label: "Fast provisioning" },
  { icon: Headphones, label: "24/7 expert support" },
] as const;

export function SecureCheckoutPanel({
  headline = "Secure checkout",
  productLabel,
  isLoggedIn,
  paymentAvailable,
  loginHref,
  className,
}: {
  headline?: string;
  productLabel: string;
  isLoggedIn: boolean;
  paymentAvailable: boolean;
  loginHref: string;
  className?: string;
}) {
  const intro = !isLoggedIn
    ? `Sign in to complete your ${productLabel} order. Your plan, domain, and add-ons stay saved while you authenticate.`
    : paymentAvailable
      ? `Confirm your ${productLabel} order below, then finish payment on our secure hosted checkout page.`
      : `Review your ${productLabel} order below and save it to your account. We will email you when card payment is ready for this order.`;

  return (
    <div className={cn("min-w-0", className)}>
      <h1 className="font-heading text-[1.55rem] font-extrabold text-[var(--hb-co-royal)] sm:text-3xl">
        {headline}
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-[var(--hb-co-text-muted)]">
        {intro}
      </p>
      {!isLoggedIn ? (
        <Link
          href={loginHref}
          className="hb-checkout-premium__btn-primary mt-5 inline-flex min-h-12 items-center justify-center px-6"
        >
          Sign in to continue
        </Link>
      ) : null}
      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {TRUST.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-2 rounded-xl border border-[var(--hb-co-border)] bg-[var(--hb-co-bg-subtle)] px-3 py-2.5 text-[12px] font-semibold text-[var(--hb-co-royal)]"
          >
            <Icon
              className="size-4 shrink-0 text-[var(--hb-co-primary)]"
              aria-hidden
            />
            {label}
          </li>
        ))}
      </ul>
      {isLoggedIn && paymentAvailable ? (
        <p className="mt-4 text-[12px] font-medium text-[var(--hb-co-text-muted)]">
          Card details are entered on Stripe — not on this page — so your
          payment stays PCI compliant.
        </p>
      ) : null}
    </div>
  );
}
