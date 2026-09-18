"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Box,
  Check,
  Cloud,
  Crown,
  Globe,
  Headphones,
  Layers,
  Lock,
  Rocket,
  Shield,
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
  if (icon === "globe") return <Globe className={className} aria-hidden />;
  if (icon === "headphones")
    return <Headphones className={className} aria-hidden />;
  if (icon === "rocket") return <Rocket className={className} aria-hidden />;
  return <Shield className={className} aria-hidden />;
}

function PlanGlyph({ plan }: { plan: CmsHostingPlan }) {
  const popular = Boolean(plan.popular);
  const Icon =
    plan.id === "ultimate"
      ? Rocket
      : popular || plan.id === "pro"
        ? Crown
        : plan.id === "plus"
          ? Layers
          : Box;
  return (
    <span className="inline-flex size-10 items-center justify-center rounded-full bg-white text-[#673de6] shadow-[0_10px_22px_-12px_rgba(47,28,106,0.45)] ring-1 ring-white">
      <Icon className="size-[18px]" strokeWidth={1.9} aria-hidden />
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
  const save = isAnnual ? plan.saveAnnually : plan.saveMonthly;
  const domainLine = plan.domainPerk?.trim() || "";
  const creditRaw = isAnnual ? plan.annualCredit?.trim() : "";
  const creditLine = creditRaw
    ? creditRaw.toLowerCase().includes("free")
      ? creditRaw
      : `Free ${creditRaw}`
    : "";
  const extras = [domainLine, creditLine].filter(Boolean);
  const features = plan.features.filter((feature) => {
    const value = feature.toLowerCase();
    return !extras.some(
      (extra) =>
        value === extra.toLowerCase() ||
        value.includes("beyond ai credit") ||
        value.includes("domain — free") ||
        value.includes("domain - free"),
    );
  });
  const list = [...extras, ...features];

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-[26px] border p-5 transition duration-300 sm:p-5",
        popular
          ? "z-10 border-white bg-[linear-gradient(180deg,#ffffff_0%,#f4f0ff_100%)] shadow-[0_28px_50px_-18px_rgba(47,28,106,0.55)] ring-2 ring-[#a78bfa]/70 hover:-translate-y-1"
          : "border-white/90 bg-[linear-gradient(180deg,#ffffff_0%,#f6f3ff_100%)] shadow-[0_22px_40px_-22px_rgba(47,28,106,0.45)] hover:-translate-y-0.5",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-36 w-44 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(196,181,253,0.45),transparent_70%)] blur-2xl"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {plan.discountBadge ? (
            <span className="rounded-full bg-[#673de6] px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase">
              {plan.discountBadge}
            </span>
          ) : null}
          {popular && plan.popularLabel ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#673de6] px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase shadow-[0_8px_16px_rgba(103,61,230,0.35)]">
              <Star className="size-3 fill-current" aria-hidden />
              {plan.popularLabel}
            </span>
          ) : null}
        </div>
        <PlanGlyph plan={plan} />
      </div>

      <h3 className="font-heading mt-4 text-[1.4rem] font-extrabold tracking-[-0.03em] text-[#2f1c6a]">
        {plan.name}
      </h3>
      {plan.tagline ? (
        <p className="mt-1 min-h-[2.5rem] text-[13px] leading-snug text-[#475569]">
          {plan.tagline}
        </p>
      ) : (
        <div className="min-h-[2.5rem]" />
      )}

      <div className="mt-3">
        {original ? (
          <p className="text-[13px] font-semibold text-[#94a3b8] line-through">
            {original}
          </p>
        ) : (
          <p className="h-[20px]" />
        )}
        <p className="mt-0.5 flex items-end gap-1.5">
          <span
            className={cn(
              "text-[2.15rem] leading-none font-extrabold tracking-tight",
              popular ? "text-[#1e1b4b]" : "text-[#673de6]",
            )}
          >
            {price}
          </span>
          <span className="pb-1 text-[13px] font-bold text-[#64748b]">/mo</span>
        </p>
        <div className="mt-2 flex min-h-[1.35rem] flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-semibold">
          {billed ? <span className="text-[#475569]">{billed}</span> : null}
          {save ? (
            <span className="font-extrabold text-[#16a34a]">{save}</span>
          ) : null}
        </div>
      </div>

      <Link
        href={plan.ctaHref || "/get-started"}
        className={cn(
          "mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-bold transition",
          popular
            ? "bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white shadow-[0_12px_24px_rgba(103,61,230,0.38)] hover:brightness-105"
            : "bg-white text-[#2f1c6a] shadow-[0_8px_18px_-10px_rgba(47,28,106,0.35)] ring-1 ring-[#e9e4ff] hover:text-[#673de6]",
        )}
      >
        {plan.ctaLabel || "Get Started"}
        <ArrowRight className="size-4" aria-hidden />
      </Link>

      <ul className="mt-5 flex flex-1 flex-col gap-2.5">
        {list.map((feature, index) => (
          <li
            key={feature}
            className={cn(
              "flex items-start gap-2.5 text-[13px] leading-snug text-[#1e1b4b]",
              index < extras.length ? "font-semibold" : "font-medium",
            )}
          >
            <span className="mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#673de6] text-white">
              <Check className="size-2.5" strokeWidth={3.2} aria-hidden />
            </span>
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
  const data = content;
  const [billing, setBilling] = useState<Billing>(
    data?.defaultBilling === "monthly" ? "monthly" : "annually",
  );

  if (!data || data.visible === false) return null;

  const plans = [...(data.plans ?? [])]
    .filter((p) => p.visible !== false)
    .sort((a, b) => a.order - b.order);

  const chips = [
    data.supportLabel
      ? {
          id: "support",
          label: data.supportLabel,
          hint: data.supportHint,
          icon: Headphones,
        }
      : null,
    data.activationLabel
      ? {
          id: "activation",
          label: data.activationLabel,
          hint: data.activationHint,
          icon: Zap,
        }
      : null,
    data.uptimeLabel
      ? {
          id: "uptime",
          label: data.uptimeLabel,
          hint: data.uptimeHint,
          icon: Shield,
        }
      : null,
    data.scaleLabel
      ? {
          id: "scale",
          label: data.scaleLabel,
          hint: data.scaleHint,
          icon: Cloud,
        }
      : null,
  ].filter(Boolean) as Array<{
    id: string;
    label: string;
    hint?: string;
    icon: typeof Headphones;
  }>;

  const guarantees = (data.guarantees ?? []).filter(Boolean).slice(0, 4);

  return (
    <section className="hb-home-section hb-band-purple relative overflow-hidden pt-10 pb-10 sm:pt-12 sm:pb-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22),transparent_64%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-10 -right-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(147,197,253,0.28),transparent_62%)] blur-2xl"
      />
      <div className="hb-shell relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/12 px-3.5 py-1 text-[11px] font-bold tracking-[0.18em] text-white uppercase">
            {data.eyebrow}
          </p>
          <h2 className="font-heading mt-4 text-[clamp(1.85rem,3.8vw,3.2rem)] leading-[1.12] font-extrabold tracking-[-0.045em] text-white">
            {data.title}{" "}
            {data.titleAccent ? (
              <span className="text-[#c7d7ff]">{data.titleAccent}</span>
            ) : null}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-white sm:text-[16px]">
            {data.description}
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-wrap items-start justify-center gap-x-5 gap-y-3 lg:justify-start">
            {chips.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id} className="flex items-start gap-2.5">
                  <Icon
                    className="mt-0.5 size-4 shrink-0 text-white"
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="block text-[13px] leading-tight font-extrabold text-white">
                      {item.label}
                    </span>
                    {item.hint ? (
                      <span className="mt-0.5 block text-[11.5px] leading-tight text-white/80">
                        {item.hint}
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
            <div className="inline-flex items-center rounded-full border border-white/25 bg-[#2f1c6a]/35 p-1">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[13px] font-bold transition",
                  billing === "monthly"
                    ? "bg-white text-[#2f1c6a]"
                    : "text-white hover:text-white",
                )}
              >
                {data.monthlyToggleLabel || "Monthly"}
              </button>
              <button
                type="button"
                onClick={() => setBilling("annually")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[13px] font-bold transition",
                  billing === "annually"
                    ? "bg-emerald-400 text-emerald-950"
                    : "text-white hover:text-white",
                )}
              >
                {data.annualToggleLabel || "Annually"}
              </button>
            </div>
            {data.saveBadge ? (
              <span className="rounded-full bg-emerald-400 px-3 py-1.5 text-[12px] font-extrabold text-emerald-950">
                {data.saveBadge}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
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
          <div className="mt-7 grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {guarantees.map((item) => (
              <div
                key={item.id}
                className="flex h-full items-start gap-3 rounded-[22px] border border-white/25 bg-white/10 px-4 py-3.5 backdrop-blur-md"
              >
                <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white/12 text-white ring-1 ring-white/25">
                  <GuaranteeIcon icon={item.icon} className="size-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] leading-snug font-extrabold text-white">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-snug text-white/80">
                    {item.description}
                  </span>
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
