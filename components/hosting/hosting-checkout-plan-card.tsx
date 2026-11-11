"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Check,
  Code2,
  Cpu,
  Database,
  FolderClosed,
  Globe2,
  HardDrive,
  Lock,
  RefreshCw,
  Star,
  Terminal,
} from "lucide-react";

import { HostingCheckoutPlanArt } from "@/components/hosting/hosting-checkout-plan-art";
import {
  annualSavePercent,
  checkoutPlanIsPopular,
  checkoutPlanTagline,
  hostingPlanCatalogHref,
} from "@/lib/hosting/checkout-plan-presentation";
import type { HostingCartQuote } from "@/lib/hosting/cart/types";

function featureVisual(label: string): { Icon: LucideIcon; chip?: string } {
  const t = label.toLowerCase();
  if (t.includes("nvme") || t.includes("storage")) {
    return { Icon: HardDrive, chip: t.includes("nvme") ? "NVMe" : undefined };
  }
  if (t.includes("website") || t.includes("wordpress") || t.includes("site")) {
    return { Icon: Globe2 };
  }
  if (t.includes("ram") || t.includes("vcpu") || t.includes("cpu")) {
    return { Icon: Cpu };
  }
  if (t.includes("mysql") || t.includes("postgres") || t.includes("database")) {
    return { Icon: Database };
  }
  if (t.includes("ftp") || t.includes("file manager") || t.includes("dns")) {
    return { Icon: FolderClosed };
  }
  if (
    t.includes("php") ||
    t.includes("node") ||
    t.includes("laravel") ||
    t.includes("version")
  ) {
    return { Icon: Code2 };
  }
  if (t.includes("ssl")) return { Icon: Lock };
  if (t.includes("backup")) return { Icon: RefreshCw };
  if (t.includes("ssh")) return { Icon: Terminal };
  return { Icon: Check };
}

export function HostingCheckoutPlanCard({
  quote,
  isAnnual,
  billingMonthlyEnabled,
  billingYearlyEnabled,
  formatQuoteAmount,
  onBilling,
}: {
  quote: HostingCartQuote;
  isAnnual: boolean;
  billingMonthlyEnabled: boolean;
  billingYearlyEnabled: boolean;
  formatQuoteAmount: (value: number) => string;
  onBilling: (billing: "monthly" | "annually") => void;
}) {
  const productSlug = quote.configuration.productSlug;
  const popular = checkoutPlanIsPopular(
    productSlug,
    quote.configuration.planKey,
  );
  const tagline = checkoutPlanTagline(
    productSlug,
    quote.configuration.planKey,
    quote.planName,
  );
  const savePct = annualSavePercent(quote.discount, quote.billedAmount);

  return (
    <section className="hb-checkout-premium__card hb-checkout-plan">
      <div className="hb-checkout-plan__hero">
        <div className="min-w-0">
          <p className="hb-checkout-plan__kicker">
            {quote.productName || "Web Hosting"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="hb-checkout-plan__title font-heading">
              {quote.planName}
            </h1>
            {popular ? (
              <span className="hb-checkout-plan__popular">
                <Star className="size-3.5 fill-current" aria-hidden />
                Most Popular
              </span>
            ) : null}
          </div>
          <p className="hb-checkout-plan__tagline">{tagline}</p>
          {quote.monthlyEquivalent != null ? (
            <p className="hb-checkout-plan__price">
              {formatQuoteAmount(quote.monthlyEquivalent)}
              <span>/mo</span>
            </p>
          ) : null}
          <p className="hb-checkout-plan__meta">
            Due today {formatQuoteAmount(quote.total)} · Billed{" "}
            {formatQuoteAmount(quote.billedAmount)}
            {isAnnual ? "/year" : "/month"}
          </p>
          {quote.renewalPrice != null ? (
            <p className="hb-checkout-plan__meta">
              Renews at {formatQuoteAmount(quote.renewalPrice)}
              {isAnnual ? "/year" : "/month"} at the standard rate.
            </p>
          ) : null}
        </div>
        <div className="hb-checkout-plan__art">
          <HostingCheckoutPlanArt className="h-auto w-full max-w-[220px]" />
        </div>
      </div>

      <div className="hb-checkout-plan__billing">
        {billingMonthlyEnabled ? (
          <button
            type="button"
            onClick={() => onBilling("monthly")}
            className="hb-checkout-plan__cycle"
            data-active={!isAnnual ? "true" : "false"}
          >
            <span className="hb-checkout-plan__radio" aria-hidden />
            <span>
              <strong>Monthly</strong>
              <em>No free domain. Buy a domain and email with this order.</em>
            </span>
          </button>
        ) : null}
        {billingYearlyEnabled ? (
          <button
            type="button"
            onClick={() => onBilling("annually")}
            className="hb-checkout-plan__cycle"
            data-active={isAnnual ? "true" : "false"}
          >
            <span className="hb-checkout-plan__radio" aria-hidden />
            <span>
              <strong>
                Annually
                {savePct > 0 ? (
                  <i className="hb-checkout-plan__save">Save {savePct}%</i>
                ) : null}
              </strong>
              <em>
                {quote.freeDomainEligible
                  ? "Optional: register a .com free for 1 year (.net, .org, etc. are billed). Skip and add from your dashboard anytime."
                  : quote.discount > 0
                    ? `Save ${formatQuoteAmount(quote.discount)} vs monthly`
                    : "Best value when available"}
              </em>
            </span>
          </button>
        ) : null}
      </div>

      {quote.features.length > 0 ? (
        <ul className="hb-checkout-plan__features">
          {quote.features.slice(0, 8).map((feature) => {
            const { Icon, chip } = featureVisual(feature);
            return (
              <li key={feature}>
                <span className="hb-checkout-plan__feat-icon">
                  <Icon aria-hidden />
                </span>
                {chip ? (
                  <span className="hb-checkout-plan__chip">{chip}</span>
                ) : null}
                <span>{feature}</span>
              </li>
            );
          })}
        </ul>
      ) : null}

      <Link
        href={hostingPlanCatalogHref(productSlug)}
        className="hb-checkout-plan__change"
      >
        <ArrowLeftRight className="size-3.5" aria-hidden />
        Change plan
        <ArrowLeftRight className="size-3.5" aria-hidden />
      </Link>
    </section>
  );
}
