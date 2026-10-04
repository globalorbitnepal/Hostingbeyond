"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import type { ResolvedHostingPurchaseContext } from "@/lib/hosting/resolve-purchase-context";
import { routes } from "@/config/routes";
import { serializeHostingPurchaseIntent } from "@/lib/hosting/purchase-intent";

export function HostingCheckoutView({
  context,
  logoPath,
}: {
  context: ResolvedHostingPurchaseContext;
  logoPath?: string;
}) {
  const logo = logoPath?.trim() || "/logo/hostingbeyond-logo-v6.png";
  const query = serializeHostingPurchaseIntent(context.intent);

  return (
    <div className="hb-band-cream min-h-dvh py-10 sm:py-14">
      <div className="hb-shell mx-auto max-w-lg">
        <Link href="/" className="inline-flex items-center gap-2">
          <img src={logo} alt="HostingBeyond" className="h-9 w-auto" />
        </Link>

        <h1 className="font-heading mt-8 text-[2rem] font-extrabold tracking-[-0.03em] text-[#2f1c6a]">
          Review your order
        </h1>
        <p className="mt-2 text-[15px] text-slate-600">
          Confirm your plan and billing cycle. Payment is not collected on this
          screen — you will complete checkout from your account when billing is
          enabled.
        </p>

        <div className="mt-8 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-bold tracking-[0.2em] text-slate-500 uppercase">
            {context.productName}
          </p>
          <h2 className="font-heading mt-2 text-[1.5rem] font-extrabold text-[#2f1c6a]">
            {context.planName}
          </h2>
          <p className="mt-1 text-[14px] text-slate-600">
            {context.billingLabel}
          </p>
          <p className="mt-4 text-[2rem] font-extrabold text-[#673de6]">
            {context.priceLabel}
          </p>
          <p className="text-[13px] text-slate-500">{context.billedLabel}</p>

          <ul className="mt-6 space-y-2 text-[14px] text-slate-700">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              Product: {context.intent.product}
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              Plan ID: {context.intent.plan}
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              Billing: {context.intent.billing}
            </li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`${routes.account}?${query}`}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-[#673de6] px-5 text-[15px] font-bold text-white transition hover:bg-[#5b32d6]"
          >
            Continue in account
          </Link>
          <Link
            href={`${routes.hosting}#plans`}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-[15px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            Change plan
          </Link>
        </div>

        <p className="mt-6 text-center text-[12px] text-slate-500">
          Refunds are governed by our{" "}
          <Link
            href="/legal/refund"
            className="font-semibold text-[#673de6] hover:underline"
          >
            Refund Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export function HostingCheckoutInvalid() {
  return (
    <div className="hb-band-cream flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="max-w-md rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="font-heading text-xl font-extrabold text-[#2f1c6a]">
          We could not load this checkout
        </h1>
        <p className="mt-3 text-[15px] text-slate-600">
          The product, plan, or billing cycle in the link is missing or invalid.
          Choose a plan from the hosting page and use Buy now again.
        </p>
        <Link
          href={`${routes.hosting}#plans`}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#673de6] px-5 text-sm font-bold text-white"
        >
          View hosting plans
        </Link>
      </div>
    </div>
  );
}
