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
  Code2,
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

import { PricingEcommercePanel } from "@/components/pricing/pricing-ecommerce-panel";
import { PricingFaqsSection } from "@/components/pricing/pricing-faqs-section";
import { PricingHighlights } from "@/components/pricing/pricing-highlights";
import { PricingMotionStage } from "@/components/pricing/pricing-motion-stage";
import { PricingPlanPanel } from "@/components/pricing/pricing-plan-panel";
import { BEYOND_AI_PUBLIC_ENABLED } from "@/config/beyond-ai-public";
import { rewriteDeadBookingCta } from "@/lib/hosting/checkout";
import { routes } from "@/config/routes";
import { CatalogPrice } from "@/components/i18n/localized-text";
import { domainHighlights } from "@/config/pricing-plans";
import type { PublicHostingCatalog } from "@/lib/hosting/public-hosting-plans";
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

/** Compact tab labels so all categories stay on one row */
const categoryTabLabel: Record<PricingCategoryId, string> = {
  websites: "Websites",
  ecommerce: "Ecommerce",
  domains: "Domains",
  "ai-builder": "AI Builder",
  vps: "VPS Hosting",
  "ai-agents": "AI Agents",
  "business-email": "Business Email",
};

const trustIcon = {
  refund: Shield,
  support: Headphones,
  ssl: Lock,
  ai: Sparkles,
} as const;

function visiblePricingCategoryIds(): PricingCategoryId[] {
  const ids: PricingCategoryId[] = [
    "websites",
    "ecommerce",
    "domains",
    "ai-builder",
    "ai-agents",
    "business-email",
  ];
  if (!BEYOND_AI_PUBLIC_ENABLED) {
    return ids.filter((id) => id !== "ai-builder");
  }
  return ids;
}

function DomainsPricingBlock() {
  const [query, setQuery] = useState("");

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
            <p className="text-[14px] font-extrabold tracking-wide text-[#673de6] uppercase">
              .com first year
            </p>
            <p className="mt-2 text-[15px] font-semibold text-[#94a3b8] line-through">
              <CatalogPrice usd={17.99} />
            </p>
            <p className="font-heading mt-0.5 flex items-end gap-2 text-[clamp(2.2rem,4vw,3rem)] font-extrabold tracking-tight text-[#2f1c6a]">
              <CatalogPrice usd={9.99} />
              <span className="pb-1 text-[1.1rem] font-bold text-[#64748b]">
                /year
              </span>
              <span className="mb-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                Save 44%
              </span>
            </p>
            <p className="mt-2 text-[16.5px] leading-relaxed text-[#475569]">
              Free privacy protection, DNS management, and 24/7 support on every
              domain you register with HostingBeyond. Renewal is shown at
              checkout.
            </p>
          </div>
          <form
            onSubmit={onSearch}
            className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:items-stretch"
          >
            <label className="sr-only" htmlFor="pricing-domain-search">
              Search domain
            </label>
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[#673de6]"
                aria-hidden
              />
              <input
                id="pricing-domain-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. yourbrand.com or mystore"
                autoComplete="off"
                spellCheck={false}
                className="h-14 w-full rounded-2xl border-2 border-[#e9e4ff] bg-white pr-5 pl-12 text-[16px] text-[#1e1b4b] shadow-[0_8px_24px_-12px_rgba(47,28,106,0.15)] ring-[#673de6]/25 outline-none placeholder:text-[#94a3b8] focus:border-[#c4b5fd] focus:ring-4"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-8 text-[15px] font-extrabold text-white shadow-[0_12px_28px_rgba(103,61,230,0.4)] hover:brightness-105 sm:min-w-[140px]"
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
            <p className="mt-2 text-[13px] font-semibold text-[#94a3b8] line-through">
              <CatalogPrice usd={item.originalUsd} />
              /yr
            </p>
            <p className="text-[1.45rem] font-extrabold tracking-tight text-[#673de6]">
              <CatalogPrice usd={item.usd} />
              <span className="text-[13px] font-bold text-[#64748b]"> /yr</span>
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

type PricingTabId = PricingCategoryId | "wordpress" | "nodejs" | "laravel";

const HOSTING_TAB_META: Array<{
  id: PricingTabId;
  label: string;
  icon: typeof Globe2;
  slug?: string;
  headline: string;
  description: string;
}> = [
  {
    id: "websites",
    label: "Web Hosting",
    icon: Globe2,
    slug: "web-hosting",
    headline: "Web hosting built for speed",
    description:
      "NVMe storage, free SSL, and four plans from Starter to Professional. Annual billing is 10% off.",
  },
  {
    id: "wordpress",
    label: "WordPress",
    icon: Globe2,
    slug: "wordpress-hosting",
    headline: "WordPress hosting, managed",
    description:
      "One-click WordPress, free SSL, and four plans. Annual billing is 10% off the monthly price.",
  },
  {
    id: "ecommerce",
    label: "eCommerce",
    icon: ShoppingBag,
    slug: "ecommerce-hosting",
    headline: "Online stores that convert",
    description:
      "WooCommerce hosting with secure checkout. Four plans. Annual billing is 10% off.",
  },
  {
    id: "nodejs",
    label: "Node.js",
    icon: Code2,
    slug: "nodejs-hosting",
    headline: "Node.js hosting on NVMe",
    description:
      "Node.js, Next.js, and Express with SSH and Git on every plan. Annual billing is 10% off.",
  },
  {
    id: "laravel",
    label: "Laravel",
    icon: Code2,
    slug: "laravel-hosting",
    headline: "Laravel hosting for PHP apps",
    description:
      "Composer, cron, queues, and NVMe. Four plans. Annual billing is 10% off.",
  },
];

function parseTabFromHash(): PricingTabId {
  if (typeof window === "undefined") return "websites";
  const raw = window.location.hash.replace(/^#/, "");
  if (HOSTING_TAB_META.some((tab) => tab.id === raw)) {
    return raw as PricingTabId;
  }
  const ids = visiblePricingCategoryIds();
  return ids.includes(raw as PricingCategoryId)
    ? (raw as PricingCategoryId)
    : "websites";
}

export function PricingPageView({
  pricing,
  hostingPlans,
  launchCatalog = [],
}: {
  pricing: CmsPricingPageContent;
  hostingPlans: CmsHostingPlansContent;
  launchCatalog?: PublicHostingCatalog[];
}) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<PricingTabId>(parseTabFromHash);
  const [billing, setBilling] = useState<"annually" | "monthly">("annually");

  const catalogBySlug = useMemo(() => {
    const map = new Map(launchCatalog.map((row) => [row.slug, row]));
    return map;
  }, [launchCatalog]);

  const extraCategories = useMemo(
    () =>
      [...pricing.categories]
        .filter((c) => c.visible !== false && c.id !== "vps")
        .filter((c) => BEYOND_AI_PUBLIC_ENABLED || c.id !== "ai-builder")
        .filter(
          (c) =>
            c.id === "domains" ||
            c.id === "ai-agents" ||
            c.id === "business-email" ||
            c.id === "ai-builder",
        )
        .sort((a, b) => a.order - b.order),
    [pricing.categories],
  );

  const tabs = useMemo(
    () => [
      ...HOSTING_TAB_META.filter(
        (tab) => !tab.slug || catalogBySlug.has(tab.slug),
      ),
      ...extraCategories.map((cat) => ({
        id: cat.id as PricingTabId,
        label: categoryTabLabel[cat.id],
        icon: categoryIcons[cat.id],
        headline: cat.headline,
        description: cat.description,
      })),
    ],
    [catalogBySlug, extraCategories],
  );

  const syncFromHash = useCallback(() => {
    setActive(parseTabFromHash());
  }, []);

  useEffect(() => {
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [syncFromHash]);

  const selectCategory = (id: PricingTabId) => {
    setActive(id);
    window.history.replaceState(null, "", `#${id}`);
    document.getElementById("pricing-offers")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const hostingTab = HOSTING_TAB_META.find((tab) => tab.id === active);
  const cmsCategory =
    active === "wordpress" || active === "nodejs" || active === "laravel"
      ? null
      : getCategoryById(pricing, active as PricingCategoryId);
  const activeHeadline = hostingTab?.headline ?? cmsCategory?.headline ?? "";
  const activeDescription =
    hostingTab?.description ?? cmsCategory?.description ?? "";
  const activeHighlights = cmsCategory?.highlights ?? [];

  const plansForSlug = (slug: string) => {
    const row = catalogBySlug.get(slug);
    const source = row?.plans ?? (slug === "web-hosting" ? hostingPlans : null);
    return [...(source?.plans ?? [])]
      .filter((p) => p.visible !== false)
      .sort((a, b) => a.order - b.order);
  };

  const planPanelForCategory = (): {
    plans?: CmsHostingPlan[];
    hostingContent?: CmsHostingPlansContent;
    columns: 3 | 4;
    showBilling: boolean;
    saveBadge?: string;
    ecommerce?: boolean;
    productCheckoutSlug?: string;
  } => {
    if (hostingTab?.slug) {
      const row = catalogBySlug.get(hostingTab.slug);
      return {
        hostingContent: row?.plans ?? hostingPlans,
        plans: plansForSlug(hostingTab.slug),
        columns: 4,
        showBilling: true,
        saveBadge: hostingPlans.saveBadge,
        productCheckoutSlug: hostingTab.slug,
      };
    }
    switch (active) {
      case "vps":
        return {
          plans: pricing.vpsPlans,
          columns: 4,
          showBilling: true,
          saveBadge: cmsCategory?.saveBadge,
          productCheckoutSlug: "kvm-vps",
        };
      case "ai-builder":
        return {
          plans: pricing.aiBuilderPlans,
          columns: 4,
          showBilling: true,
          saveBadge: cmsCategory?.saveBadge,
        };
      case "ai-agents":
        return {
          plans: pricing.aiAgentPlans,
          columns: 3,
          showBilling: true,
          saveBadge: cmsCategory?.saveBadge,
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
      <section className="hb-band-purple relative overflow-hidden pt-4 pb-5 sm:pt-6 sm:pb-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.2),transparent_65%)] blur-2xl"
        />
        <div className="hb-shell relative z-10">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/12 px-3.5 py-1 text-[12px] font-extrabold tracking-[0.18em] text-white uppercase">
              {pricing.heroEyebrow}
            </p>
            <h1 className="font-heading mt-4 text-[clamp(2.15rem,4.8vw,3.55rem)] leading-[1.06] font-extrabold tracking-[-0.045em] text-white">
              {pricing.heroTitle}{" "}
              <span className="text-[#c7d7ff]">{pricing.heroTitleAccent}</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-[16.5px] leading-relaxed font-medium text-white/92 sm:text-[17.6px]">
              {pricing.heroDescription}
            </p>
            <ul className="mt-6 flex flex-wrap justify-center gap-2">
              {pricing.trustPills
                .filter((p) => p.visible)
                .map((pill) => {
                  const Icon =
                    trustIcon[pill.id as keyof typeof trustIcon] ?? Shield;
                  return (
                    <li
                      key={pill.id}
                      className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[13px] font-bold text-white backdrop-blur-md"
                    >
                      <Icon className="size-3.5" aria-hidden />
                      {pill.label}
                    </li>
                  );
                })}
            </ul>
          </motion.div>

          <div className="mt-8 flex justify-center pb-1">
            <div
              className="sticky top-[4.25rem] z-30 w-full max-w-[min(100%,72rem)] rounded-[22px] border border-white/25 bg-[#3b1d8f]/92 px-2 py-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)] sm:px-3"
              role="tablist"
              aria-label="Pricing categories"
            >
              <div className="flex [scrollbar-width:none] flex-nowrap items-center justify-center gap-1 overflow-x-auto [-ms-overflow-style:none] sm:gap-1.5 [&::-webkit-scrollbar]:hidden">
                {tabs.map((cat) => {
                  const Icon = cat.icon;
                  const selected = active === cat.id;
                  const tabLabel = cat.label;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      title={cat.label}
                      onClick={() => selectCategory(cat.id)}
                      className={cn(
                        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-2.5 py-2.5 text-[14.3px] font-extrabold tracking-[-0.02em] whitespace-nowrap transition sm:px-3.5",
                        selected
                          ? "bg-white text-[#2f1c6a] shadow-[0_10px_24px_-8px_rgba(0,0,0,0.35)]"
                          : "text-white hover:bg-white/15",
                      )}
                    >
                      <Icon className="size-[17px] shrink-0" aria-hidden />
                      {tabLabel}
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
            <h2 className="font-heading text-[clamp(1.9rem,3.6vw,2.75rem)] font-extrabold tracking-[-0.04em] text-[#2f1c6a]">
              {activeHeadline}
            </h2>
            <p className="mt-3 text-[16.5px] leading-relaxed font-medium text-slate-600 sm:text-[17px]">
              {activeDescription}
            </p>
          </div>

          {activeHighlights.length ? (
            <PricingHighlights highlights={activeHighlights} />
          ) : null}

          <div className="mt-12" role="tabpanel">
            {active === "domains" ? (
              <DomainsPricingBlock />
            ) : panel.ecommerce ? (
              <PricingEcommercePanel
                plans={panel.plans ?? []}
                billing={billing}
                onBillingChange={setBilling}
                productCheckoutSlug={panel.productCheckoutSlug}
              />
            ) : (
              <PricingPlanPanel
                hostingContent={panel.hostingContent}
                plans={panel.plans}
                columns={panel.columns}
                showBillingToggle={panel.showBilling}
                saveBadge={panel.saveBadge}
                productCheckoutSlug={panel.productCheckoutSlug}
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
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#e9e4ff] bg-white/80 px-4 py-3 text-[14px] font-bold text-[#2f1c6a]"
              >
                <Check className="size-4 text-emerald-600" aria-hidden />
                {line}
              </li>
            ))}
          </ul>

          {cmsCategory ? <PricingMotionStage category={cmsCategory} /> : null}
        </div>
      </section>

      <PricingFaqsSection
        content={pricing}
        activeCategoryId={(cmsCategory?.id ?? "websites") as PricingCategoryId}
        categories={pricing.categories.filter(
          (category) => category.visible !== false && category.id !== "vps",
        )}
      />

      <section className="hb-band-purple relative overflow-hidden py-14 sm:py-16">
        <div className="hb-shell relative z-10">
          <div className="rounded-[28px] border border-white/25 bg-white/10 p-6 backdrop-blur-md sm:p-8">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <p className="text-[14px] font-extrabold tracking-wide text-[#c7d7ff] uppercase">
                  {pricing.bottomEyebrow}
                </p>
                <h3 className="font-heading mt-2 text-[1.8rem] font-extrabold text-white sm:text-[2rem]">
                  {pricing.bottomTitle}
                </h3>
                <p className="mt-2 text-[15.4px] leading-relaxed text-white/85">
                  {pricing.bottomBody}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={rewriteDeadBookingCta(
                    pricing.bottomPrimaryHref,
                    `${routes.hosting}#plans`,
                  )}
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
