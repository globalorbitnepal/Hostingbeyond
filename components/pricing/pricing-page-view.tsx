"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  Globe2,
  Headphones,
  Lock,
  Mail,
  Search,
  Server,
  ShoppingBag,
  Sparkles,
  Wand2,
  Shield,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { PricingPlanPanel } from "@/components/pricing/pricing-plan-panel";
import { useLocale } from "@/components/locale/locale-provider";
import { routes } from "@/config/routes";
import {
  aiAgentPlans,
  aiBuilderPlans,
  businessEmailCatalogPlans,
  domainHighlights,
  ecommercePlanOverrides,
  pricingCategories,
  type PricingCategoryId,
  vpsPlans,
} from "@/config/pricing-plans";
import type {
  CmsHostingPlan,
  CmsHostingPlansContent,
} from "@/lib/orbit/defaults";
import { cn } from "@/lib/utils";

const categoryIcons: Record<PricingCategoryId, typeof Globe2> = {
  websites: Globe2,
  ecommerce: ShoppingBag,
  domains: Search,
  "ai-builder": Wand2,
  vps: Server,
  "ai-agents": Bot,
  "business-email": Mail,
};

function parseCategoryFromHash(): PricingCategoryId {
  const raw = window.location.hash.replace(/^#/, "");
  const found = pricingCategories.find((c) => c.id === raw);
  return found?.id ?? "websites";
}

function buildEcommercePlans(plans: CmsHostingPlan[]): CmsHostingPlan[] {
  return plans.map((plan) => {
    const override = ecommercePlanOverrides[plan.id];
    if (!override) return plan;
    return {
      ...plan,
      tagline: override.tagline,
      features: [...override.extraFeatures, ...plan.features],
    };
  });
}

function DomainsPricingBlock() {
  const { formatPrice } = useLocale();
  const [query, setQuery] = useState("");
  const basePrice = formatPrice("domain_yearly");

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = query.trim();
    window.location.href = q
      ? `${routes.domains}?q=${encodeURIComponent(q)}`
      : routes.domains;
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#f4f0ff_48%,#eef4ff_100%)] p-6 shadow-[0_24px_48px_-20px_rgba(47,28,106,0.35)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <p className="text-[13px] font-bold tracking-wide text-[#673de6] uppercase">
              Domains from
            </p>
            <p className="font-heading mt-2 text-[clamp(2.2rem,4vw,3rem)] font-extrabold tracking-tight text-[#2f1c6a]">
              {basePrice}
              <span className="text-[1rem] font-bold text-[#64748b]">
                {" "}
                /year
              </span>
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-[#475569]">
              Free privacy protection, DNS management, and 24/7 support on every
              domain you register with HostingBeyond.
            </p>
          </div>
          <form
            onSubmit={onSearch}
            className="flex w-full max-w-lg flex-col gap-2 sm:flex-row"
          >
            <label className="sr-only" htmlFor="pricing-domain-search">
              Search domain
            </label>
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#94a3b8]"
                aria-hidden
              />
              <input
                id="pricing-domain-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find your perfect domain"
                className="h-12 w-full rounded-full border border-[#e9e4ff] bg-white pr-4 pl-10 text-[15px] text-[#1e1b4b] shadow-inner ring-[#673de6]/30 outline-none placeholder:text-[#94a3b8] focus:ring-2"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-6 text-[14px] font-bold text-white shadow-[0_12px_24px_rgba(103,61,230,0.35)] hover:brightness-105"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {domainHighlights.map((item) => (
          <Link
            key={item.tld}
            href={routes.domains}
            className="group rounded-[22px] border border-[#e9e4ff] bg-white p-5 shadow-[0_16px_32px_-18px_rgba(47,28,106,0.2)] transition hover:-translate-y-0.5 hover:border-[#c4b5fd]"
          >
            <span className="rounded-full bg-[#f4f0ff] px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-[#673de6] uppercase">
              {item.badge}
            </span>
            <p className="font-heading mt-3 text-[1.75rem] font-extrabold text-[#2f1c6a]">
              {item.tld}
            </p>
            <p className="mt-1 text-[13px] text-[#64748b]">{item.note}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-bold text-[#2563eb]">
              Check availability
              <ArrowRight
                className="size-3.5 transition group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </Link>
        ))}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          "Free domain privacy protection",
          "Easy DNS & forwarding",
          "Transfer lock & security",
          "Bulk search for agencies",
          "Connect to hosting in one click",
          "24/7 domain specialists",
        ].map((line) => (
          <li
            key={line}
            className="flex items-start gap-2.5 rounded-2xl border border-[#eef2ff] bg-white/70 px-4 py-3 text-[13px] font-medium text-[#1e1b4b]"
          >
            <span className="mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#673de6] text-white">
              <Check className="size-2.5" strokeWidth={3.2} aria-hidden />
            </span>
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

const trustPills = [
  { icon: Shield, label: "30-day money-back" },
  { icon: Headphones, label: "24/7 expert support" },
  { icon: Lock, label: "Free SSL on hosting" },
  { icon: Sparkles, label: "Beyond AI included" },
];

export function PricingPageView({
  hostingPlans,
}: {
  hostingPlans: CmsHostingPlansContent;
}) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<PricingCategoryId>("websites");

  const syncFromHash = useCallback(() => {
    setActive(parseCategoryFromHash());
  }, []);

  useEffect(() => {
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [syncFromHash]);

  const selectCategory = (id: PricingCategoryId) => {
    setActive(id);
    window.history.replaceState(null, "", `#${id}`);
    document.getElementById("pricing-offers")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const websitePlans = useMemo(
    () =>
      [...(hostingPlans.plans ?? [])]
        .filter((p) => p.visible !== false)
        .sort((a, b) => a.order - b.order),
    [hostingPlans.plans],
  );

  const ecommercePlans = useMemo(
    () => buildEcommercePlans(websitePlans),
    [websitePlans],
  );

  const activeMeta = pricingCategories.find((c) => c.id === active)!;

  return (
    <>
      <section className="hb-band-purple relative overflow-hidden pt-4 pb-6 sm:pb-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/4 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_65%)] blur-2xl"
        />
        <div className="hb-shell relative z-10">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/12 px-3.5 py-1 text-[11px] font-bold tracking-[0.18em] text-white uppercase">
              Plans & pricing
            </p>
            <h1 className="font-heading mt-4 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-white">
              Everything you need to{" "}
              <span className="text-[#c7d7ff]">grow online</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-white/90 sm:text-[16px]">
              Transparent pricing across websites, stores, domains, AI, VPS, and
              business email — one premium platform, no surprise upsells.
            </p>
          </motion.div>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {trustPills.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-md"
              >
                <Icon className="size-3.5" aria-hidden />
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-8 -mb-2">
            <div
              className="flex [scrollbar-width:none] gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              role="tablist"
              aria-label="Pricing categories"
            >
              {pricingCategories.map((cat) => {
                const Icon = categoryIcons[cat.id];
                const selected = active === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => selectCategory(cat.id)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold transition",
                      selected
                        ? "bg-white text-[#2f1c6a] shadow-[0_12px_28px_-8px_rgba(0,0,0,0.35)]"
                        : "border border-white/30 bg-white/10 text-white hover:bg-white/20",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    <span className="hidden sm:inline">{cat.label}</span>
                    <span className="sm:hidden">{cat.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section
        id="pricing-offers"
        className="hb-band-cream relative scroll-mt-24 pt-10 pb-16 sm:pt-12 sm:pb-20"
      >
        <div className="hb-shell">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-[clamp(1.65rem,3.2vw,2.35rem)] font-extrabold tracking-[-0.04em] text-[#2f1c6a]">
              {activeMeta.headline}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              {activeMeta.description}
            </p>
          </div>

          <div className="mt-10" role="tabpanel">
            {active === "websites" ? (
              <PricingPlanPanel
                hostingContent={hostingPlans}
                plans={websitePlans}
              />
            ) : null}
            {active === "ecommerce" ? (
              <PricingPlanPanel
                hostingContent={hostingPlans}
                plans={ecommercePlans}
                saveBadge="Store-ready hosting"
              />
            ) : null}
            {active === "domains" ? <DomainsPricingBlock /> : null}
            {active === "ai-builder" ? (
              <PricingPlanPanel
                plans={aiBuilderPlans}
                columns={4}
                defaultBilling="annually"
                saveBadge="50% off annual"
              />
            ) : null}
            {active === "vps" ? (
              <PricingPlanPanel
                plans={vpsPlans}
                columns={4}
                saveBadge="Launch pricing"
              />
            ) : null}
            {active === "ai-agents" ? (
              <PricingPlanPanel
                plans={aiAgentPlans}
                columns={3}
                saveBadge="Intro pricing"
              />
            ) : null}
            {active === "business-email" ? (
              <PricingPlanPanel
                plans={businessEmailCatalogPlans}
                columns={3}
                showBillingToggle={false}
              />
            ) : null}
          </div>

          <div className="mt-12 rounded-[28px] border border-[#e9e4ff] bg-[linear-gradient(180deg,#ffffff_0%,#f8f5ff_100%)] p-6 sm:p-8">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-[13px] font-bold tracking-wide text-[#673de6] uppercase">
                  Not sure yet?
                </p>
                <h3 className="font-heading mt-2 text-[1.5rem] font-extrabold text-[#2f1c6a]">
                  We will help you pick the right stack
                </h3>
                <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-[#64748b]">
                  Tell us about your project — migration, domains, WooCommerce,
                  or AI — and our team will recommend a plan in minutes.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={routes.getStarted}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-6 text-[14px] font-bold text-white shadow-[0_12px_24px_rgba(103,61,230,0.35)]"
                >
                  Get started
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href={routes.contact}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[#e9e4ff] bg-white px-6 text-[14px] font-bold text-[#2f1c6a] hover:border-[#c4b5fd]"
                >
                  Contact sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
