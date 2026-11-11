"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Mail } from "lucide-react";

import { CatalogPrice } from "@/components/i18n/localized-text";
import { businessEmailBookingHref } from "@/lib/business-email/purchase-intent";
import {
  EMAIL_BILLING_TERM_OPTIONS,
  emailPlanPriceCaption,
  emailPricePerMonthForTerm,
  type EmailBillingTerm,
} from "@/lib/hosting/business-email-term-pricing";
import type { CmsBusinessEmailPlan } from "@/lib/orbit/business-email-page-content";
import { cn } from "@/lib/utils";

const TERM_LABELS: Record<EmailBillingTerm, string> = {
  monthly: "Monthly",
  "12": "Yearly",
  "24": "2 years",
  "36": "3 years",
  "48": "4 years",
};

function parseUsd(value: string): number {
  const n = parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function planLines(plan: CmsBusinessEmailPlan) {
  return [plan.mailboxes, plan.storage, plan.extras, ...plan.features].filter(
    Boolean,
  );
}

export function PanelEmailPlans({
  plans,
  compact = false,
}: {
  plans: CmsBusinessEmailPlan[];
  compact?: boolean;
}) {
  const [term, setTerm] = useState<EmailBillingTerm>("monthly");
  const visible = plans.filter((plan) => plan.visible);

  if (visible.length === 0) {
    return (
      <p className="hb-panel-card hb-muted px-4 py-3 text-sm">
        Mailbox plans are being updated. Please check back shortly.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="inline-flex w-full max-w-xl [scrollbar-width:none] items-stretch overflow-x-auto rounded-2xl border border-[var(--hb-p-border-strong)] bg-white/80 p-1 shadow-[0_8px_24px_-18px_rgba(91,33,182,0.45)] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Choose billing term"
        >
          {EMAIL_BILLING_TERM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTerm(opt.value)}
              aria-pressed={term === opt.value}
              className={cn(
                "min-h-10 min-w-0 flex-1 rounded-xl px-2 py-2 text-[11px] font-extrabold whitespace-nowrap sm:text-[12px]",
                term === opt.value
                  ? "bg-gradient-to-r from-[#5b21b6] to-[#2563eb] text-white shadow-sm"
                  : "text-[var(--hb-p-text-soft)] hover:bg-[var(--hb-p-primary)]/8",
              )}
            >
              {TERM_LABELS[opt.value]}
            </button>
          ))}
        </div>
        {term !== "monthly" ? (
          <span className="hb-pill hb-pill-ok w-fit">Save on longer terms</span>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {visible.map((plan) => {
          const popular = Boolean(plan.popular);
          const priceUsd = emailPricePerMonthForTerm(plan, term);
          const caption = emailPlanPriceCaption(plan, term);
          const lines = compact ? planLines(plan).slice(0, 4) : planLines(plan);

          return (
            <article
              key={plan.id}
              className={cn(
                "relative flex flex-col overflow-hidden rounded-[22px] border p-5 sm:p-6",
                popular
                  ? "border-violet-300/70 bg-gradient-to-b from-[#5b21b6] to-[#2563eb] text-white shadow-[0_22px_50px_-24px_rgba(46,16,101,0.7)] ring-1 ring-white/20"
                  : "border-[var(--hb-p-border)] bg-[var(--hb-p-card-solid)] text-[var(--hb-p-text)] shadow-[0_16px_40px_-28px_rgba(46,16,101,0.4)]",
              )}
            >
              {plan.off ? (
                <span
                  className={cn(
                    "absolute top-4 right-4 rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase",
                    popular
                      ? "bg-white/15 text-white ring-1 ring-white/25"
                      : "bg-[color-mix(in_srgb,var(--hb-p-primary)_12%,transparent)] text-[var(--hb-p-primary-strong)]",
                  )}
                >
                  {plan.off}
                </span>
              ) : null}

              {popular ? (
                <p className="mb-3 w-fit rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-extrabold tracking-[0.12em] text-violet-100 uppercase">
                  Most popular
                </p>
              ) : (
                <p className="mb-3 h-[20px]" aria-hidden />
              )}

              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
                    popular
                      ? "bg-white/15 text-white ring-1 ring-white/20"
                      : "bg-gradient-to-br from-[#5b21b6] to-[#2563eb] text-white",
                  )}
                >
                  <Mail className="size-[1.15rem]" strokeWidth={2.25} />
                </span>
                <div className="min-w-0">
                  <h3
                    className={cn(
                      "font-heading text-[1.45rem] leading-tight font-extrabold tracking-[-0.02em]",
                      popular ? "text-white" : "text-[var(--hb-p-text)]",
                    )}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={cn(
                      "mt-0.5 text-[13px] font-semibold",
                      popular
                        ? "text-violet-100/90"
                        : "text-[var(--hb-p-text-soft)]",
                    )}
                  >
                    Best for {plan.bestFor}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-2">
                {term !== "monthly" ? (
                  <span
                    className={cn(
                      "text-[14px] font-bold line-through",
                      popular
                        ? "text-violet-200/70"
                        : "text-[var(--hb-p-faint)]",
                    )}
                  >
                    <CatalogPrice usd={parseUsd(plan.original)} />
                  </span>
                ) : null}
                <p className="flex items-end gap-1">
                  <span
                    className={cn(
                      "text-[clamp(1.9rem,3.4vw,2.4rem)] leading-none font-extrabold tracking-[-0.03em]",
                      popular ? "text-white" : "text-[var(--hb-p-text)]",
                    )}
                  >
                    <CatalogPrice usd={priceUsd} />
                  </span>
                  <span
                    className={cn(
                      "pb-1 text-[14px] font-extrabold",
                      popular
                        ? "text-violet-100"
                        : "text-[var(--hb-p-text-soft)]",
                    )}
                  >
                    /mo
                  </span>
                </p>
              </div>
              <p
                className={cn(
                  "mt-2 text-[12px] leading-snug font-semibold",
                  popular
                    ? "text-violet-100/85"
                    : "text-[var(--hb-p-text-soft)]",
                )}
              >
                {caption}
              </p>

              <ul className="mt-4 flex-1 space-y-2">
                {lines.map((line) => (
                  <li
                    key={line}
                    className={cn(
                      "flex gap-2 text-[13px] leading-snug font-semibold",
                      popular
                        ? "text-white/92"
                        : "text-[var(--hb-p-text-soft)]",
                    )}
                  >
                    <Check
                      className={cn(
                        "mt-0.5 size-3.5 shrink-0",
                        popular
                          ? "text-violet-100"
                          : "text-[var(--hb-p-primary)]",
                      )}
                      strokeWidth={2.5}
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={businessEmailBookingHref(plan.id, term)}
                className={cn(
                  "mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-[14px] font-extrabold",
                  popular
                    ? "bg-white text-[#4c1d95] hover:bg-violet-50"
                    : "bg-gradient-to-r from-[#5b21b6] to-[#2563eb] text-white hover:brightness-105",
                )}
              >
                Buy {plan.name}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
