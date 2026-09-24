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

import { GlassVideoFrame } from "@/components/home/glass-video-frame";
import { PricingEcommercePanel } from "@/components/pricing/pricing-ecommerce-panel";
import { PricingFaqsSection } from "@/components/pricing/pricing-faqs-section";
import { PricingHighlights } from "@/components/pricing/pricing-highlights";
import { PricingPlanPanel } from "@/components/pricing/pricing-plan-panel";
import { useLocale } from "@/components/locale/locale-provider";
import { routes } from "@/config/routes";
import { domainHighlights } from "@/config/pricing-plans";
import type {
  CmsPricingPageContent,
  PricingCategoryId,
} from "@/lib/orbit/pricing-content";
import { getCategoryById } from "@/lib/orbit/pricing-content";
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

const trustIcon = {
  refund: Shield,
  support: Headphones,
  ssl: Lock,
  ai: Sparkles,
} as const;

function parseCategoryFromHash(): PricingCategoryId {
  if (typeof window === "undefined") return "websites";
  const raw = window.location.hash.replace(/^#/, "");
  const ids: PricingCategoryId[] = [
    "websites",
    "ecommerce",
    "domains",
    "ai-builder",
    "vps",
    "ai-agents",
    "business-email",
  ];
  return ids.includes(raw as PricingCategoryId)
    ? (raw as PricingCategoryId)
    : "websites";
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
      <div className="rounded-[28px] border border-[#e9e4ff] bg-[linear-gradient(135deg,#ffffff_0%,#f4f0ff_48%,#eef4ff_100%)] p-6 shadow-[0_24px_48px_-20px_rgba(47,28,106,0.35)] sm:p-8">
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
    </div>
  );
}

export function PricingPageView({
  pricing,
  hostingPlans,
}: {
  pricing: CmsPricingPageContent;
  hostingPlans: CmsHostingPlansContent;
}) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<PricingCategoryId>("websites");
  const [billing, setBilling] = useState<"annually" | "monthly">("annually");

  const categories = useMemo(
    () =>
      [...pricing.categories]
        .filter((c) => c.visible !== false)
        .sort((a, b) => a.order - b.order),
    [pricing.categories],
  );

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

  const activeMeta = getCategoryById(pricing, active);

  const websitePlans = useMemo(
    () =>
      [...(hostingPlans.plans ?? [])]
        .filter((p) => p.visible !== false)
        .sort((a, b) => a.order - b.order),
    [hostingPlans.plans],
  );

  const planPanelForCategory = (): {
    plans?: CmsHostingPlan[];
    hostingContent?: CmsHostingPlansContent;
    columns: 3 | 4;
    showBilling: boolean;
    saveBadge?: string;
    ecommerce?: boolean;
  } => {
    switch (active) {
      case "websites":
        return {
          hostingContent: hostingPlans,
          plans: websitePlans,
          columns: 4,
          showBilling: true,
          saveBadge: hostingPlans.saveBadge,
        };
      case "ecommerce":
        return {
          plans: pricing.ecommercePlans,
          columns: 4,
          showBilling: false,
          saveBadge: activeMeta.saveBadge,
          ecommerce: true,
        };
      case "vps":
        return {
          plans: pricing.vpsPlans,
          columns: 4,
          showBilling: true,
          saveBadge: activeMeta.saveBadge,
        };
      case "ai-builder":
        return {
          plans: pricing.aiBuilderPlans,
          columns: 4,
          showBilling: true,
          saveBadge: activeMeta.saveBadge,
        };
      case "ai-agents":
        return {
          plans: pricing.aiAgentPlans,
          columns: 3,
          showBilling: true,
          saveBadge: activeMeta.saveBadge,
        };
      case "business-email":
        return {
          plans: pricing.businessEmailPlans,
          columns: 3,
          showBilling: false,
        };
      default:
        return { columns: 4, showBilling: true };
    }
  };

  const panel = planPanelForCategory();

  return (
    <>
      <section className="hb-band-purple relative overflow-hidden pt-2 pb-4 sm:pb-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.2),transparent_65%)] blur-2xl"
        />
        <div className="hb-shell relative z-10">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left"
            >
              <p className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/12 px-3.5 py-1 text-[11px] font-bold tracking-[0.18em] text-white uppercase">
                {pricing.heroEyebrow}
              </p>
              <h1 className="font-heading mt-4 text-[clamp(2rem,4.5vw,3.35rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-white">
                {pricing.heroTitle}{" "}
                <span className="text-[#c7d7ff]">
                  {pricing.heroTitleAccent}
                </span>
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-white/90 sm:text-[16px] lg:mx-0">
                {pricing.heroDescription}
              </p>
              <ul className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
                {pricing.trustPills
                  .filter((p) => p.visible)
                  .map((pill) => {
                    const Icon =
                      trustIcon[pill.id as keyof typeof trustIcon] ?? Shield;
                    return (
                      <li
                        key={pill.id}
                        className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-md"
                      >
                        <Icon className="size-3.5" aria-hidden />
                        {pill.label}
                      </li>
                    );
                  })}
              </ul>
            </motion.div>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="relative mx-auto w-full max-w-xl lg:max-w-none"
            >
              <GlassVideoFrame
                src={pricing.heroMediaSrc}
                alt={pricing.heroMediaAlt}
                playing={!reduceMotion}
                loop
                className="min-h-[260px] sm:min-h-[300px]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          </div>

          <div className="mt-10 flex justify-center pb-2">
            <div
              className="sticky top-[4.5rem] z-30 w-full max-w-5xl rounded-[24px] border border-white/30 bg-white/10 p-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-2.5"
              role="tablist"
              aria-label="Pricing categories"
            >
              <div className="flex flex-wrap items-center justify-center gap-2">
                {categories.map((cat) => {
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
                        "inline-flex items-center justify-center gap-2 rounded-full px-3.5 py-2.5 text-[12px] font-bold transition sm:px-4 sm:text-[13px]",
                        selected
                          ? "bg-white text-[#2f1c6a] shadow-[0_10px_24px_-8px_rgba(0,0,0,0.35)]"
                          : "text-white/95 hover:bg-white/15",
                      )}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      <span className="hidden md:inline">{cat.label}</span>
                      <span className="md:hidden">{cat.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="pricing-offers"
        className="hb-band-cream relative scroll-mt-32 pt-10 pb-8 sm:pt-12"
      >
        <div className="hb-shell">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-[clamp(1.75rem,3.4vw,2.5rem)] font-extrabold tracking-[-0.04em] text-[#2f1c6a]">
              {activeMeta.headline}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              {activeMeta.description}
            </p>
          </div>

          <div className="mt-10 grid items-center gap-8 lg:grid-cols-2">
            <GlassVideoFrame
              src={activeMeta.mediaSrc}
              alt={activeMeta.mediaAlt}
              playing={!reduceMotion}
              loop
              className="min-h-[240px] lg:min-h-[280px]"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <div className="text-center lg:text-left">
              <h3 className="font-heading text-[1.5rem] font-extrabold text-[#2f1c6a] sm:text-[1.75rem]">
                {activeMeta.showcaseTitle}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[#64748b]">
                {activeMeta.showcaseBody}
              </p>
              <Link
                href={routes.getStarted}
                className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-6 text-[14px] font-bold text-white shadow-lg"
              >
                Get started
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>

          <PricingHighlights highlights={activeMeta.highlights} />

          <div className="mt-12" role="tabpanel">
            {active === "domains" ? (
              <DomainsPricingBlock />
            ) : panel.ecommerce ? (
              <PricingEcommercePanel
                plans={panel.plans ?? []}
                billing={billing}
                onBillingChange={setBilling}
              />
            ) : (
              <PricingPlanPanel
                hostingContent={panel.hostingContent}
                plans={panel.plans}
                columns={panel.columns}
                showBillingToggle={panel.showBilling}
                saveBadge={panel.saveBadge}
              />
            )}
          </div>

          <ul className="mt-12 grid gap-3 sm:grid-cols-3">
            {[
              "30-day money-back on eligible plans",
              "No hidden setup fees",
              "Upgrade anytime from your panel",
            ].map((line) => (
              <li
                key={line}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#e9e4ff] bg-white/80 px-4 py-3 text-[13px] font-semibold text-[#2f1c6a]"
              >
                <Check className="size-4 text-emerald-600" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PricingFaqsSection
        content={pricing}
        activeCategoryId={active}
        categories={categories}
      />

      <section className="hb-band-purple relative overflow-hidden py-14 sm:py-16">
        <div className="hb-shell relative z-10">
          <div className="rounded-[28px] border border-white/25 bg-white/10 p-6 backdrop-blur-md sm:p-8">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <p className="text-[13px] font-bold tracking-wide text-[#c7d7ff] uppercase">
                  {pricing.bottomEyebrow}
                </p>
                <h3 className="font-heading mt-2 text-[1.65rem] font-extrabold text-white sm:text-[1.85rem]">
                  {pricing.bottomTitle}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/85">
                  {pricing.bottomBody}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={pricing.bottomPrimaryHref}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[14px] font-bold text-[#2f1c6a] shadow-lg"
                >
                  {pricing.bottomPrimaryLabel}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href={pricing.bottomSecondaryHref}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-6 text-[14px] font-bold text-white hover:bg-white/10"
                >
                  {pricing.bottomSecondaryLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
