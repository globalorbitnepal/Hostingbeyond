"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Globe2,
  Headphones,
  Lock,
  Mail,
  Shield,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";

import { routes } from "@/config/routes";
import type {
  CmsBusinessEmailPageContent,
  CmsBusinessEmailPlan,
} from "@/lib/orbit/business-email-page-content";
import { cn } from "@/lib/utils";

/** Monthly first — user picks term; 48 mo is not the default. */
export type EmailBillingTerm = "monthly" | "12" | "24" | "36" | "48";

const TERM_OPTIONS: { value: EmailBillingTerm; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "12", label: "12 Months" },
  { value: "24", label: "24 Months" },
  { value: "36", label: "36 Months" },
  { value: "48", label: "48 Months" },
];

const BOTTOM_HIGHLIGHTS = [
  { icon: Shield, title: "Advanced Security" },
  { icon: Lock, title: "End-to-end Encryption" },
  { icon: Globe2, title: "Access Anywhere" },
  { icon: Zap, title: "99.9% Uptime" },
  { icon: Truck, title: "Easy Migration" },
  { icon: Headphones, title: "24/7 Expert Support" },
] as const;

function parseUsd(value: string): number {
  const n = parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function priceForTerm(
  plan: CmsBusinessEmailPlan,
  term: EmailBillingTerm,
): string {
  switch (term) {
    case "monthly":
      return plan.original;
    case "12":
      return plan.renew;
    case "24":
      return plan.price24;
    case "48":
      return plan.price;
    case "36": {
      const p24 = parseUsd(plan.price24);
      const p48 = parseUsd(plan.price);
      if (p24 > 0 && p48 > 0) {
        return formatUsd(p24 + (p48 - p24) * 0.5);
      }
      return plan.price24;
    }
    default:
      return plan.price;
  }
}

function termLabel(term: EmailBillingTerm): string {
  if (term === "monthly") return "Monthly";
  return `${term}-month term`;
}

function planLines(plan: CmsBusinessEmailPlan) {
  return [plan.mailboxes, plan.storage, plan.extras, ...plan.features].filter(
    Boolean,
  );
}

export function BusinessEmailPricingSection({
  content,
  plans,
}: {
  content: CmsBusinessEmailPageContent;
  plans: CmsBusinessEmailPlan[];
}) {
  const [term, setTerm] = useState<EmailBillingTerm>("monthly");

  const badge = content.pricingBadge?.trim() || "AI POWERED BUSINESS EMAIL";
  const title = content.pricingTitle?.trim() || "Professional Email for";
  const titleAccent = content.pricingTitleAccent?.trim() || "Your Business";
  const subheading =
    content.pricingSubheading?.trim() ||
    content.pricingHeading ||
    "Secure, reliable and AI-powered email hosting with everything you need to stay productive.";
  const saveBadge = content.pricingSaveBadge?.trim() || "Save up to 88%";

  const included = content.included.filter(Boolean);
  const bottomItems = useMemo(
    () =>
      BOTTOM_HIGHLIGHTS.map((item, index) => ({
        ...item,
        description: included[index] ?? "",
      })),
    [included],
  );

  const showSave = term !== "monthly";

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-[linear-gradient(160deg,#2e1065_0%,#4c1d95_42%,#3730a3_100%)] py-14 antialiased sm:py-16 lg:py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.12),transparent_55%)] opacity-90"
      />

      <div className="hb-shell relative">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-1.5 text-[11px] font-extrabold tracking-[0.18em] text-white uppercase sm:text-[12px]">
            <Sparkles className="size-3.5 text-violet-200" aria-hidden />
            {badge}
          </p>
          <h2 className="font-heading mt-5 text-[clamp(2rem,4.5vw,3.1rem)] leading-[1.08] font-extrabold tracking-[-0.04em] text-white">
            {title} <span className="text-[#ddd6fe]">{titleAccent}</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed font-semibold text-white/90 sm:text-[16px]">
            {subheading}
          </p>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {[
              content.pricingTrust1,
              content.pricingTrust2,
              content.pricingTrust3,
            ]
              .filter(Boolean)
              .map((line) => (
                <li
                  key={line}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[12px] font-bold text-white sm:text-[13px]"
                >
                  <Check
                    className="size-3.5 shrink-0 text-emerald-300"
                    strokeWidth={2.5}
                  />
                  {line}
                </li>
              ))}
          </ul>

          <div className="mt-7 flex w-full flex-col items-center gap-3">
            <div
              className="inline-flex w-full max-w-[min(100%,42rem)] [scrollbar-width:none] items-stretch overflow-x-auto rounded-2xl border border-white/25 bg-white/10 p-1 shadow-lg [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              role="group"
              aria-label="Choose billing term"
            >
              {TERM_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTerm(opt.value)}
                  aria-pressed={term === opt.value}
                  className={cn(
                    "min-h-11 min-w-0 flex-1 touch-manipulation rounded-xl px-2 py-2.5 text-[11px] font-extrabold whitespace-nowrap transition-colors duration-200 sm:px-3 sm:text-[13px]",
                    term === opt.value
                      ? "bg-white text-[#2f1c6a] shadow-sm"
                      : "text-white/88 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span
              className={cn(
                "inline-flex min-h-9 items-center rounded-full px-4 py-1.5 text-[12px] font-extrabold sm:text-[13px]",
                showSave
                  ? "bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-400/35"
                  : "text-white/45",
              )}
            >
              {showSave ? saveBadge : "Flexible monthly billing"}
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:mt-12 lg:grid-cols-3 lg:gap-5">
          {plans.map((plan) => {
            const popular = Boolean(plan.popular);
            const price = priceForTerm(plan, term);
            const lines = planLines(plan);
            const twoCol = lines.length > 5;

            return (
              <article
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-[20px] border p-5 sm:p-6",
                  popular
                    ? "border-violet-300/60 bg-gradient-to-b from-[#5b21b6] to-[#4338ca] text-white shadow-[0_16px_48px_-20px_rgba(0,0,0,0.45)] ring-1 ring-violet-300/40"
                    : "border-white/40 bg-white text-[#0f172a] shadow-[0_12px_40px_-24px_rgba(0,0,0,0.35)]",
                )}
              >
                <span
                  className={cn(
                    "absolute top-4 right-4 rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase",
                    popular
                      ? "bg-emerald-400/20 text-emerald-50 ring-1 ring-emerald-300/30"
                      : "bg-emerald-50 text-emerald-800",
                  )}
                >
                  {plan.off}
                </span>

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
                        : "bg-gradient-to-br from-[#673de6] to-[#7c3aed] text-white",
                    )}
                  >
                    <Mail
                      className="size-[1.15rem]"
                      strokeWidth={2.25}
                      aria-hidden
                    />
                  </span>
                  <div className="min-w-0 text-left">
                    <h3
                      className={cn(
                        "font-heading text-[1.5rem] leading-tight font-extrabold tracking-[-0.02em] sm:text-[1.65rem]",
                        popular ? "text-white" : "text-[#0f172a]",
                      )}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={cn(
                        "mt-0.5 text-[13px] leading-snug font-semibold",
                        popular ? "text-violet-100/90" : "text-slate-600",
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
                        popular ? "text-violet-200/65" : "text-slate-400",
                      )}
                    >
                      {plan.original}
                    </span>
                  ) : null}
                  <p className="flex items-end gap-1">
                    <span
                      className={cn(
                        "text-[clamp(2rem,3.8vw,2.5rem)] leading-none font-extrabold tracking-[-0.03em]",
                        popular ? "text-white" : "text-[#0f172a]",
                      )}
                    >
                      {price}
                    </span>
                    <span
                      className={cn(
                        "pb-1 text-[14px] font-extrabold",
                        popular ? "text-violet-100" : "text-slate-600",
                      )}
                    >
                      /mo
                    </span>
                  </p>
                </div>
                <p
                  className={cn(
                    "mt-2 text-[12px] leading-snug font-semibold sm:text-[13px]",
                    popular ? "text-violet-100/85" : "text-slate-600",
                  )}
                >
                  Per mailbox · {termLabel(term)} · Renews at{" "}
                  <span className="font-extrabold">{plan.renew}</span>/mo
                </p>

                <ul
                  className={cn(
                    "mt-4 flex-1 gap-x-3 gap-y-2",
                    twoCol ? "grid sm:grid-cols-2" : "space-y-2",
                  )}
                >
                  {lines.map((line) => (
                    <li
                      key={line}
                      className={cn(
                        "flex gap-2 text-[12.5px] leading-snug font-semibold sm:text-[13px]",
                        popular ? "text-white/90" : "text-slate-700",
                      )}
                    >
                      <Check
                        className={cn(
                          "mt-0.5 size-3.5 shrink-0",
                          popular ? "text-violet-200" : "text-[#673de6]",
                        )}
                        strokeWidth={2.5}
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={routes.signup}
                  className={cn(
                    "mt-5 inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-full text-[14px] font-extrabold transition-colors duration-200",
                    popular
                      ? "bg-white text-[#4c1d95] hover:bg-violet-50"
                      : plan.id === "starter"
                        ? "bg-gradient-to-r from-[#673de6] to-[#7c3aed] text-white hover:brightness-105"
                        : "border-2 border-[#c4b5fd] text-[#5b21b6] hover:bg-violet-50",
                  )}
                >
                  Choose {plan.name} Plan
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </article>
            );
          })}
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-xl border border-white/12 bg-white/8 px-2.5 py-3.5 text-center"
              >
                <span className="mx-auto inline-flex size-9 items-center justify-center rounded-lg bg-white/12 text-violet-100">
                  <Icon className="size-4" strokeWidth={2.25} aria-hidden />
                </span>
                <p className="mt-2 text-[12px] font-extrabold text-white sm:text-[13px]">
                  {item.title}
                </p>
                {item.description ? (
                  <p className="mt-0.5 text-[10px] leading-snug font-medium text-white/60 sm:text-[11px]">
                    {item.description}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        {content.includedFootnote ? (
          <p className="mx-auto mt-6 max-w-3xl text-center text-[12px] leading-relaxed font-medium text-white/70">
            {content.includedFootnote}
          </p>
        ) : null}
      </div>
    </section>
  );
}
