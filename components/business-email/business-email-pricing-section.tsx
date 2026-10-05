"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Crown,
  Globe2,
  Headphones,
  Lock,
  Mail,
  Shield,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { routes } from "@/config/routes";
import type {
  CmsBusinessEmailPageContent,
  CmsBusinessEmailPlan,
} from "@/lib/orbit/business-email-page-content";
import { cn } from "@/lib/utils";

type BillingMode = "long" | "monthly";

const BOTTOM_HIGHLIGHTS = [
  { icon: Shield, title: "Advanced Security" },
  { icon: Lock, title: "End-to-end Encryption" },
  { icon: Globe2, title: "Access Anywhere" },
  { icon: Zap, title: "99.9% Uptime" },
  { icon: Truck, title: "Easy Migration" },
  { icon: Headphones, title: "24/7 Expert Support" },
] as const;

function planLines(plan: CmsBusinessEmailPlan) {
  return [plan.mailboxes, plan.storage, plan.extras, ...plan.features].filter(
    Boolean,
  );
}

function displayPrice(plan: CmsBusinessEmailPlan, mode: BillingMode) {
  if (mode === "monthly") return plan.renew;
  return plan.price;
}

export function BusinessEmailPricingSection({
  content,
  plans,
}: {
  content: CmsBusinessEmailPageContent;
  plans: CmsBusinessEmailPlan[];
}) {
  const reduce = useReducedMotion();
  const [billing, setBilling] = useState<BillingMode>("long");

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

  const fadeUp = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: {
            duration: 0.55,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-[#1a0a3e] py-16 antialiased sm:py-20 lg:py-24"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_20%,rgba(124,58,237,0.45),transparent_50%),radial-gradient(ellipse_at_85%_15%,rgba(37,99,235,0.35),transparent_48%),radial-gradient(ellipse_at_50%_100%,rgba(76,29,149,0.55),transparent_55%),linear-gradient(135deg,#2e1065_0%,#4c1d95_38%,#2563eb_100%)]" />
        <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.35]" />
        <motion.div
          className="absolute -top-24 -left-20 size-72 rounded-full bg-violet-400/25 blur-3xl"
          animate={reduce ? undefined : { x: [0, 24, 0], y: [0, 16, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-16 size-80 rounded-full bg-blue-400/20 blur-3xl"
          animate={reduce ? undefined : { x: [0, -20, 0], y: [0, 24, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute top-[18%] right-[8%] size-44 rounded-full border border-white/10 opacity-40" />
        <div className="absolute bottom-[22%] left-[6%] size-56 rounded-full border border-white/8 opacity-30" />
      </div>

      <div className="hb-shell relative">
        <motion.div {...fadeUp(0)} className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-1.5 text-[11px] font-extrabold tracking-[0.2em] text-white/95 uppercase shadow-lg backdrop-blur-md sm:text-[12px]">
            <Sparkles className="size-3.5 text-violet-200" aria-hidden />
            {badge}
          </p>
          <h2 className="font-heading mt-6 text-[clamp(2.1rem,4.8vw,3.35rem)] leading-[1.06] font-extrabold tracking-[-0.045em] text-white [text-shadow:0_4px_32px_rgba(0,0,0,0.35)]">
            {title}{" "}
            <span className="bg-gradient-to-r from-[#e9d5ff] via-[#c4b5fd] to-[#a78bfa] bg-clip-text text-transparent">
              {titleAccent}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed font-semibold text-white/88 sm:text-[17px]">
            {subheading}
          </p>

          <ul className="mt-7 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {[
              content.pricingTrust1,
              content.pricingTrust2,
              content.pricingTrust3,
            ]
              .filter(Boolean)
              .map((line, i) => (
                <li
                  key={line}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[12px] font-bold text-white/92 backdrop-blur-md sm:text-[13px]"
                >
                  <Check
                    className="size-3.5 shrink-0 text-emerald-300"
                    strokeWidth={2.75}
                  />
                  {line}
                </li>
              ))}
          </ul>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <div
              className="inline-flex items-center rounded-full border border-white/25 bg-white/10 p-1 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.5)] backdrop-blur-md"
              role="group"
              aria-label="Billing period"
            >
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                aria-pressed={billing === "monthly"}
                className={cn(
                  "min-h-10 touch-manipulation rounded-full px-5 py-2 text-[13px] font-extrabold transition-all duration-300 sm:text-[14px]",
                  billing === "monthly"
                    ? "bg-white text-[#2f1c6a] shadow-md"
                    : "text-white/85 hover:text-white",
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling("long")}
                aria-pressed={billing === "long"}
                className={cn(
                  "min-h-10 touch-manipulation rounded-full px-5 py-2 text-[13px] font-extrabold transition-all duration-300 sm:text-[14px]",
                  billing === "long"
                    ? "bg-white text-[#2f1c6a] shadow-md"
                    : "text-white/85 hover:text-white",
                )}
              >
                48 Months
              </button>
            </div>
            <span
              className={cn(
                "inline-flex min-h-9 items-center rounded-full px-3.5 py-1.5 text-[12px] font-extrabold transition-opacity duration-300 sm:text-[13px]",
                billing === "long"
                  ? "bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/40"
                  : "bg-white/5 text-white/50 opacity-70",
              )}
            >
              {saveBadge}
            </span>
          </div>
        </motion.div>

        <div className="mt-12 grid gap-5 lg:mt-14 lg:grid-cols-3 lg:items-stretch lg:gap-6 xl:gap-7">
          {plans.map((plan, index) => {
            const popular = Boolean(plan.popular);
            const price = displayPrice(plan, billing);
            const lines = planLines(plan);
            const twoCol = lines.length > 5;

            return (
              <motion.article
                key={plan.id}
                {...fadeUp(0.08 + index * 0.06)}
                className={cn(
                  "relative flex flex-col rounded-[24px] p-6 sm:p-7",
                  popular
                    ? "z-[2] border border-violet-300/50 bg-gradient-to-b from-[#5b21b6]/95 via-[#4c1d95]/98 to-[#312e81]/95 text-white shadow-[0_0_0_1px_rgba(167,139,250,0.35),0_24px_80px_-20px_rgba(124,58,237,0.75)] lg:-mt-2 lg:mb-2 lg:scale-[1.03]"
                    : "border border-white/50 bg-white/95 text-[#0f172a] shadow-[0_24px_60px_-28px_rgba(15,8,40,0.45)] backdrop-blur-xl",
                )}
              >
                {popular ? (
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute -inset-[1px] rounded-[25px] opacity-70"
                    animate={
                      reduce
                        ? undefined
                        : {
                            boxShadow: [
                              "0 0 32px rgba(167,139,250,0.35)",
                              "0 0 48px rgba(139,92,246,0.55)",
                              "0 0 32px rgba(167,139,250,0.35)",
                            ],
                          }
                    }
                    transition={{ duration: 3.5, repeat: Infinity }}
                  />
                ) : null}

                <span
                  className={cn(
                    "absolute top-5 right-5 rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide uppercase",
                    popular
                      ? "bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/35"
                      : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80",
                  )}
                >
                  {plan.off}
                </span>

                {popular ? (
                  <p className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-extrabold tracking-[0.14em] text-amber-100 uppercase ring-1 ring-amber-300/30">
                    <Crown className="size-3.5 text-amber-300" aria-hidden />
                    Most popular
                  </p>
                ) : (
                  <p className="mb-4 h-[26px]" aria-hidden />
                )}

                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "relative inline-flex size-11 shrink-0 items-center justify-center rounded-xl shadow-lg",
                      popular
                        ? "bg-white/15 ring-1 ring-white/25"
                        : "bg-gradient-to-br from-[#673de6] to-[#7c3aed] text-white",
                    )}
                  >
                    <Mail className="size-5" strokeWidth={2.25} aria-hidden />
                    {plan.id === "premium" ? (
                      <Crown
                        className="absolute -top-1.5 -right-1.5 size-3.5 text-amber-400"
                        aria-hidden
                      />
                    ) : null}
                  </span>
                  <div className="min-w-0 pt-0.5 text-left">
                    <h3
                      className={cn(
                        "font-heading text-[1.65rem] leading-tight font-extrabold tracking-[-0.03em] sm:text-[1.85rem]",
                        popular ? "text-white" : "text-[#0f172a]",
                      )}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={cn(
                        "mt-1 text-[13px] leading-snug font-semibold sm:text-[14px]",
                        popular ? "text-violet-100/90" : "text-slate-600",
                      )}
                    >
                      Best for {plan.bestFor}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-end gap-2">
                  <span
                    className={cn(
                      "text-[15px] font-bold line-through decoration-2",
                      popular ? "text-violet-200/70" : "text-slate-400",
                    )}
                  >
                    {plan.original}
                  </span>
                  <p className="flex items-end gap-1">
                    <span
                      className={cn(
                        "text-[clamp(2.25rem,4vw,2.75rem)] leading-none font-extrabold tracking-[-0.04em]",
                        popular ? "text-white" : "text-[#0f172a]",
                      )}
                    >
                      {price}
                    </span>
                    <span
                      className={cn(
                        "pb-1.5 text-[15px] font-extrabold",
                        popular ? "text-violet-100" : "text-slate-600",
                      )}
                    >
                      /mo
                    </span>
                  </p>
                </div>
                <p
                  className={cn(
                    "mt-2 text-[12px] leading-relaxed font-semibold sm:text-[13px]",
                    popular ? "text-violet-100/85" : "text-slate-600",
                  )}
                >
                  {billing === "long"
                    ? "Price per mailbox · 48-month term · Renews at "
                    : "Price per mailbox · Monthly · Renews at "}
                  <span className="font-extrabold">{plan.renew}</span>/mo
                </p>

                <ul
                  className={cn(
                    "mt-5 flex-1 gap-x-4 gap-y-2.5",
                    twoCol
                      ? "grid sm:grid-cols-2"
                      : "flex flex-col space-y-2.5",
                  )}
                >
                  {lines.map((line) => (
                    <li
                      key={line}
                      className={cn(
                        "flex gap-2 text-[13px] leading-snug font-semibold sm:text-[13.5px]",
                        popular ? "text-white/92" : "text-slate-700",
                      )}
                    >
                      <Check
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          popular ? "text-violet-200" : "text-[#673de6]",
                        )}
                        strokeWidth={2.75}
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={routes.signup}
                  className={cn(
                    "group mt-6 inline-flex min-h-12 touch-manipulation items-center justify-center gap-2 rounded-full text-[14px] font-extrabold transition-all duration-300 sm:text-[15px]",
                    popular
                      ? "bg-white text-[#4c1d95] shadow-[0_12px_32px_-12px_rgba(0,0,0,0.45)] hover:bg-violet-50"
                      : plan.id === "starter"
                        ? "bg-gradient-to-r from-[#673de6] via-[#7c3aed] to-[#2563eb] text-white shadow-[0_14px_36px_-12px_rgba(103,61,230,0.65)] hover:brightness-105"
                        : "border-2 border-[#c4b5fd] bg-white text-[#5b21b6] hover:bg-violet-50",
                  )}
                >
                  Choose {plan.name} Plan
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          {...fadeUp(0.2)}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 xl:grid-cols-6"
        >
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-white/12 bg-white/8 px-3 py-4 text-center backdrop-blur-md transition-colors duration-300 hover:bg-white/12"
              >
                <span className="mx-auto inline-flex size-10 items-center justify-center rounded-xl bg-white/12 text-violet-100 ring-1 ring-white/15">
                  <Icon className="size-5" strokeWidth={2.25} aria-hidden />
                </span>
                <p className="mt-3 text-[13px] font-extrabold text-white sm:text-[14px]">
                  {item.title}
                </p>
                {item.description ? (
                  <p className="mt-1 text-[11px] leading-snug font-medium text-white/65 sm:text-[12px]">
                    {item.description}
                  </p>
                ) : null}
              </div>
            );
          })}
        </motion.div>

        {content.includedFootnote ? (
          <p className="mx-auto mt-8 max-w-3xl text-center text-[12px] leading-relaxed font-medium text-white/70 sm:text-[13px]">
            {content.includedFootnote}
          </p>
        ) : null}
      </div>
    </section>
  );
}
