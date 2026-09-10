"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Headphones,
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

const accentStyles = {
  blue: {
    card: "border-[#3b82f6]/45 shadow-[0_0_0_1px_rgba(59,130,246,0.14),0_0_36px_rgba(59,130,246,0.1)]",
    price: "text-[#3b82f6]",
    check: "text-[#60a5fa]",
    cta: "border-[#3b82f6]/55 text-white hover:bg-[#3b82f6]/15 shadow-[0_0_20px_rgba(59,130,246,0.15)]",
  },
  purple: {
    card: "border-[#a855f7]/45 shadow-[0_0_0_1px_rgba(168,85,247,0.14),0_0_36px_rgba(168,85,247,0.12)]",
    price: "text-[#c084fc]",
    check: "text-[#c084fc]",
    cta: "border-[#a855f7]/55 text-white hover:bg-[#a855f7]/15 shadow-[0_0_20px_rgba(168,85,247,0.15)]",
  },
  gradient: {
    card: "border-transparent shadow-[0_0_0_1px_rgba(99,102,241,0.35),0_0_48px_rgba(124,58,237,0.18)]",
    price:
      "bg-gradient-to-r from-[#3b82f6] to-[#a855f7] bg-clip-text text-transparent",
    check: "text-[#818cf8]",
    cta: "border-transparent bg-gradient-to-r from-[#2f6bff] to-[#9333ea] text-white shadow-[0_10px_28px_rgba(99,102,241,0.35)] hover:brightness-110",
  },
} as const;

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
  const styles = accentStyles[plan.accent] ?? accentStyles.blue;
  const isAnnual = billing === "annually";
  const price = isAnnual ? plan.priceAnnually : plan.priceMonthly;
  const original = isAnnual ? plan.originalAnnually : plan.originalMonthly;
  const billed = isAnnual ? plan.billedAnnually : plan.billedMonthly;
  const solidCta = plan.accent === "gradient" || plan.popular;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, duration: 0.35 }}
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-[22px] border bg-white/[0.045] p-5 backdrop-blur-2xl sm:p-6",
        styles.card,
        plan.popular &&
          "bg-[linear-gradient(180deg,rgba(59,130,246,0.08),rgba(168,85,247,0.06)_40%,rgba(255,255,255,0.03))]",
      )}
    >
      {plan.accent === "gradient" || plan.popular ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[22px] p-px"
          style={{
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.85), rgba(168,85,247,0.75), rgba(59,130,246,0.45))",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      ) : null}

      <div className="relative z-10 flex items-start justify-between gap-2">
        {plan.discountBadge ? (
          <span className="inline-flex rounded-md bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase shadow-[0_6px_18px_rgba(79,70,229,0.35)]">
            {plan.discountBadge}
          </span>
        ) : (
          <span />
        )}
        {plan.popular && plan.popularLabel ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#a855f7]/45 bg-[#a855f7]/15 px-2.5 py-1 text-[10px] font-bold text-[#e9d5ff]">
            <Star className="size-3 fill-current" aria-hidden />
            {plan.popularLabel}
          </span>
        ) : null}
      </div>

      <h3 className="relative z-10 mt-5 text-[20px] font-extrabold tracking-tight text-white">
        {plan.name}
      </h3>

      <div className="relative z-10 mt-4">
        {original ? (
          <p className="text-[13px] font-medium text-white/40 line-through">
            {original}
          </p>
        ) : null}
        <p className="mt-0.5 flex items-end gap-1.5">
          <span
            className={cn(
              "text-[clamp(1.85rem,2.4vw,2.35rem)] leading-none font-extrabold tracking-tight",
              styles.price,
            )}
          >
            {price}
          </span>
          <span className="pb-1 text-[13px] font-semibold text-white/55">
            /mo
          </span>
        </p>
        <p className="mt-2 text-[12px] font-medium text-white/50">{billed}</p>
      </div>

      <Link
        href={plan.ctaHref || "/get-started"}
        className={cn(
          "relative z-10 mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-[13px] font-bold transition",
          solidCta ? accentStyles.gradient.cta : styles.cta,
          !solidCta && "bg-transparent",
        )}
      >
        {plan.ctaLabel || "Get Started"}
        <ArrowRight className="size-4" aria-hidden />
      </Link>

      <ul className="relative z-10 mt-5 space-y-2.5 border-t border-white/10 pt-5">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-[13px] leading-snug text-white/80"
          >
            <Check
              className={cn("mt-0.5 size-4 shrink-0", styles.check)}
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

  return (
    <section className="relative isolate overflow-hidden bg-[#07122a] px-4 pt-4 pb-14 sm:px-6 sm:pt-5 sm:pb-16 lg:px-8 lg:pt-6 lg:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[18%] left-1/2 h-[55%] w-[70%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(47,107,255,0.14),transparent_68%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[8%] bottom-[10%] h-[35%] w-[40%] rounded-full bg-[radial-gradient(ellipse,rgba(124,58,237,0.12),transparent_70%)] blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-[1280px]">
        <div className="text-center">
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-[#3b82f6]/35 bg-white/[0.04] px-4 py-1.5 text-[11px] font-bold tracking-[0.14em] text-white/85 uppercase backdrop-blur-md"
          >
            <Server className="size-3.5 text-[#60a5fa]" aria-hidden />
            {data.eyebrow}
          </motion.span>

          <motion.h2
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.04 }}
            className="font-heading mt-4 text-[clamp(1.85rem,3.4vw,2.75rem)] leading-[1.12] font-extrabold tracking-[-0.03em] text-white"
          >
            {data.title}{" "}
            <span className="bg-gradient-to-r from-[#3b82f6] via-[#818cf8] to-[#a855f7] bg-clip-text text-transparent">
              {data.titleAccent}
            </span>
          </motion.h2>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="mx-auto mt-3 max-w-[640px] text-[14px] leading-relaxed text-white/55 sm:text-[15px]"
          >
            {data.description}
          </motion.p>
        </div>

        <div className="mt-7 flex flex-col gap-4 sm:mt-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-semibold text-white/70">
            <span className="inline-flex items-center gap-2">
              <Headphones className="size-4 text-[#60a5fa]" aria-hidden />
              {data.supportLabel}
            </span>
            <span className="inline-flex items-center gap-2">
              <Zap className="size-4 text-[#a78bfa]" aria-hidden />
              {data.activationLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/50">
              <Sparkles className="size-3.5 text-[#60a5fa]" aria-hidden />
              {data.annualToggleLabel}
            </span>
            <div className="inline-flex rounded-full border border-white/12 bg-white/[0.04] p-1 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setBilling("annually")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[12px] font-bold transition",
                  billing === "annually"
                    ? "border border-[#3b82f6]/55 bg-[#3b82f6]/20 text-white shadow-[0_0_18px_rgba(59,130,246,0.25)]"
                    : "text-white/55 hover:text-white",
                )}
              >
                Annually
              </button>
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[12px] font-bold transition",
                  billing === "monthly"
                    ? "border border-[#3b82f6]/55 bg-[#3b82f6]/20 text-white shadow-[0_0_18px_rgba(59,130,246,0.25)]"
                    : "text-white/55 hover:text-white",
                )}
              >
                {data.monthlyToggleLabel || "Monthly"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:mt-7 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billing={billing}
              delay={0.05 * index}
            />
          ))}
        </div>

        {guarantees.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-3 sm:gap-4">
            {guarantees.map((item, index) => (
              <motion.div
                key={item.id}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.04 * index }}
                className="flex gap-3.5 rounded-[18px] border border-white/12 bg-white/[0.04] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_12px_32px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:p-5"
              >
                <span
                  className={cn(
                    "inline-flex size-11 shrink-0 items-center justify-center rounded-xl border",
                    item.icon === "lock"
                      ? "border-[#a855f7]/40 bg-[#a855f7]/12 text-[#d8b4fe]"
                      : "border-[#3b82f6]/40 bg-[#3b82f6]/12 text-[#93c5fd]",
                  )}
                >
                  <GuaranteeIcon icon={item.icon} className="size-5" />
                </span>
                <div>
                  <h4 className="text-[14px] font-extrabold tracking-tight text-white">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/50">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
