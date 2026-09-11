"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Box,
  Check,
  Clock,
  Crown,
  Headphones,
  Layers,
  Lock,
  Rocket,
  Server,
  Shield,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import type {
  CmsHostingGuarantee,
  CmsHostingPlan,
  CmsHostingPlansContent,
} from "@/lib/orbit/defaults";

type Billing = "annually" | "monthly";

function GuaranteeIcon({
  icon,
  className,
}: {
  icon: CmsHostingGuarantee["icon"];
  className?: string;
}) {
  if (icon === "lock") return <Lock className={className} aria-hidden />;
  if (icon === "rocket") return <Rocket className={className} aria-hidden />;
  return <Shield className={className} aria-hidden />;
}

function PlanGlyph({
  accent,
  popular,
}: {
  accent: CmsHostingPlan["accent"];
  popular: boolean;
}) {
  const Icon = popular
    ? Layers
    : accent === "purple"
      ? Crown
      : accent === "gradient"
        ? Layers
        : Box;
  return (
    <span
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-2xl",
        popular
          ? "bg-white/12 text-cyan-200 ring-1 ring-white/20"
          : accent === "purple"
            ? "bg-fuchsia-50 text-[#c026d3] ring-1 ring-fuchsia-100"
            : "bg-sky-50 text-[#2563eb] ring-1 ring-sky-100",
      )}
    >
      <Icon className="size-5" strokeWidth={1.8} aria-hidden />
    </span>
  );
}

function PlanCard({
  plan,
  billing,
  delay,
}: {
  plan: CmsHostingPlan;
  billing: Billing;
  delay: number;
}) {
  const reduceMotion = useReducedMotion();
  const popular = Boolean(plan.popular);
  const isAnnual = billing === "annually";
  const price = isAnnual ? plan.priceAnnually : plan.priceMonthly;
  const original = isAnnual ? plan.originalAnnually : plan.originalMonthly;
  const billed = isAnnual ? plan.billedAnnually : plan.billedMonthly;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-[28px] p-5 sm:p-6",
        popular
          ? "z-10 border border-white/10 bg-[linear-gradient(165deg,#1d4ed8_0%,#312e81_48%,#6d28d9_100%)] text-white shadow-[0_28px_70px_-24px_rgba(49,46,129,0.65)] xl:-mt-6 xl:mb-0 xl:min-h-[560px] xl:px-6 xl:pt-7 xl:pb-7"
          : "border border-white/80 bg-white/75 shadow-[0_18px_50px_-28px_rgba(37,80,130,0.32)] backdrop-blur-2xl",
      )}
    >
      {!popular ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),transparent_42%)]"
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(125,211,252,0.22),transparent_52%)]"
        />
      )}

      <div className="relative z-10 flex items-start justify-between gap-3">
        <PlanGlyph accent={plan.accent} popular={popular} />
        {popular && plan.popularLabel ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/14 px-2.5 py-1 text-[10px] font-bold tracking-wide text-cyan-50 uppercase ring-1 ring-white/20 backdrop-blur-md">
            <Star className="size-3 fill-current" aria-hidden />
            {plan.popularLabel}
          </span>
        ) : plan.discountBadge ? (
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide uppercase",
              plan.accent === "purple"
                ? "bg-fuchsia-50 text-[#c026d3]"
                : "bg-sky-50 text-[#2563eb]",
            )}
          >
            {plan.discountBadge}
          </span>
        ) : (
          <span />
        )}
      </div>

      <h3
        className={cn(
          "font-heading relative z-10 mt-5 text-[1.35rem] font-extrabold tracking-[-0.03em] sm:text-[1.5rem]",
          popular ? "text-white" : "text-slate-950",
        )}
      >
        {plan.name}
      </h3>

      <div className="relative z-10 mt-4">
        {original ? (
          <p
            className={cn(
              "text-[13px] font-medium line-through",
              popular ? "text-white/45" : "text-slate-400",
            )}
          >
            {original}
          </p>
        ) : null}
        <p className="mt-0.5 flex items-end gap-1.5">
          <span
            className={cn(
              "text-[clamp(1.9rem,3vw,2.45rem)] leading-none font-extrabold tracking-tight",
              popular
                ? "text-white"
                : plan.accent === "purple"
                  ? "text-[#c026d3]"
                  : "text-[#2563eb]",
            )}
          >
            {price}
          </span>
          <span
            className={cn(
              "pb-1 text-[13px] font-semibold",
              popular ? "text-white/70" : "text-slate-500",
            )}
          >
            /mo
          </span>
        </p>
        {billed ? (
          <p
            className={cn(
              "mt-2 text-[12px] font-medium",
              popular ? "text-white/50" : "text-slate-500",
            )}
          >
            {billed}
          </p>
        ) : null}
      </div>

      <Link
        href={plan.ctaHref || "/get-started"}
        className={cn(
          "relative z-10 mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-bold transition",
          popular
            ? "bg-gradient-to-r from-[#22d3ee] via-[#818cf8] to-[#e879f9] text-slate-950 shadow-[0_12px_28px_rgba(34,211,238,0.28)] hover:brightness-105"
            : plan.accent === "purple"
              ? "border border-fuchsia-200 bg-white text-[#a21caf] hover:bg-fuchsia-50"
              : "border border-sky-200 bg-white text-[#1d4ed8] hover:bg-sky-50",
        )}
      >
        {plan.ctaLabel || "Choose Plan"}
        <ArrowRight className="size-4" aria-hidden />
      </Link>

      <ul className="relative z-10 mt-6 flex flex-1 flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className={cn(
              "flex items-start gap-2.5 text-[13px] leading-snug sm:text-[14px]",
              popular ? "text-white/88" : "text-slate-600",
            )}
          >
            <Check
              className={cn(
                "mt-0.5 size-4 shrink-0",
                popular
                  ? "text-cyan-200"
                  : plan.accent === "purple"
                    ? "text-[#c026d3]"
                    : "text-[#2563eb]",
              )}
              aria-hidden
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

export function HostingPlansSection({
  content,
}: {
  content?: CmsHostingPlansContent;
}) {
  const reduceMotion = useReducedMotion();
  const data = content;
  const [billing, setBilling] = useState<Billing>(
    data?.defaultBilling === "monthly" ? "monthly" : "annually",
  );

  if (!data || data.visible === false) return null;

  const plans = [...(data.plans ?? [])]
    .filter((p) => p.visible !== false)
    .sort((a, b) => a.order - b.order);

  const guarantees = data.guarantees ?? [];
  const trust = [
    guarantees[0]
      ? {
          id: guarantees[0].id,
          label: guarantees[0].title,
          icon: (
            <GuaranteeIcon icon={guarantees[0].icon} className="size-[18px]" />
          ),
        }
      : null,
    data.activationLabel
      ? {
          id: "activation",
          label: data.activationLabel,
          icon: <Zap className="size-[18px]" aria-hidden />,
        }
      : null,
    {
      id: "cancel",
      label: "Cancel anytime",
      icon: <Clock className="size-[18px]" aria-hidden />,
    },
    data.supportLabel
      ? {
          id: "support",
          label: data.supportLabel,
          icon: <Headphones className="size-[18px]" aria-hidden />,
        }
      : null,
  ].filter(Boolean) as Array<{ id: string; label: string; icon: ReactNode }>;

  return (
    <section className="relative isolate overflow-hidden bg-[#f4f8fd] pt-10 pb-16 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#eef4fb_0%,#f7fbff_45%,#e7f1fb_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-16%] left-[-10%] h-[52%] w-[55%] rounded-full bg-[radial-gradient(ellipse,rgba(147,197,253,0.4),transparent_68%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-12%] bottom-[-10%] h-[46%] w-[48%] rounded-full bg-[radial-gradient(ellipse,rgba(167,139,250,0.18),transparent_70%)] blur-3xl"
      />

      <div className="hb-shell relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-1.5 text-[11px] font-bold tracking-[0.16em] text-slate-500 uppercase shadow-[0_8px_24px_rgba(37,80,130,0.08)] backdrop-blur-xl"
          >
            <Server className="size-3.5 text-[#2563eb]" aria-hidden />
            {data.eyebrow}
          </motion.span>

          <motion.h2
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.04 }}
            className="font-heading mt-5 text-[clamp(1.85rem,4.2vw,3.35rem)] leading-[1.12] font-extrabold tracking-[-0.045em] text-slate-950"
          >
            <span className="block">{data.title}</span>
            <span className="mt-1 block bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#c026d3] bg-clip-text text-transparent">
              {data.titleAccent}
            </span>
          </motion.h2>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="mx-auto mt-4 max-w-[38rem] text-[15px] leading-relaxed text-slate-600 sm:text-[17px]"
          >
            {data.description}
          </motion.p>
        </div>

        {trust.length > 0 ? (
          <div className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-4 sm:gap-4">
            {trust.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2.5 rounded-2xl border border-white/80 bg-white/65 px-3 py-3 shadow-[0_10px_28px_-18px_rgba(37,80,130,0.28)] backdrop-blur-xl sm:justify-center sm:px-2 lg:px-3"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#2563eb] ring-1 ring-sky-100">
                  {item.icon}
                </span>
                <p className="text-left text-[12px] leading-snug font-semibold text-slate-700 sm:text-[13px]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-7 flex justify-center sm:mt-8">
          <div className="inline-flex max-w-full items-center rounded-full border border-white/80 bg-white/70 p-1 shadow-[0_8px_22px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <Sparkles
              className="ml-2 hidden size-3.5 text-[#2563eb] sm:ml-3 sm:block"
              aria-hidden
            />
            <button
              type="button"
              title={data.annualToggleLabel || "Annually"}
              onClick={() => setBilling("annually")}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-bold whitespace-nowrap transition sm:px-4",
                billing === "annually"
                  ? "bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white shadow-[0_8px_18px_rgba(79,70,229,0.28)]"
                  : "text-slate-500 hover:text-slate-800",
              )}
            >
              Annually
            </button>
            <button
              type="button"
              title={data.monthlyToggleLabel || "Monthly"}
              onClick={() => setBilling("monthly")}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-bold whitespace-nowrap transition sm:px-4",
                billing === "monthly"
                  ? "bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white shadow-[0_8px_18px_rgba(79,70,229,0.28)]"
                  : "text-slate-500 hover:text-slate-800",
              )}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 items-stretch gap-4 sm:mt-10 sm:grid-cols-2 xl:mt-12 xl:grid-cols-4 xl:items-end xl:gap-5">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billing={billing}
              delay={0.05 * index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
