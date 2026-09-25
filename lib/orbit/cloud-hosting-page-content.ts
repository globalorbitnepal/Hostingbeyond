import { routes } from "@/config/routes";
import type { CmsHostingPlan } from "@/lib/orbit/defaults";

export type CmsCloudPageFeature = {
  id: string;
  visible: boolean;
  title: string;
  description: string;
  icon: "cpu" | "shield" | "zap" | "scale" | "globe" | "database";
};

export type CmsCloudPageFaq = {
  id: string;
  visible: boolean;
  question: string;
  answer: string;
};

export type CmsCloudHostingPageContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroDescription: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  heroPromo: string;
  /** Background image for the hero panel card (right side on desktop). */
  heroImage: string;
  heroCardEyebrow: string;
  heroCardLine: string;

  pricingEyebrow: string;
  pricingTitle: string;
  pricingTitleAccent: string;
  pricingDescription: string;
  pricingNote: string;
  saveBadge: string;
  annualToggleLabel: string;
  monthlyToggleLabel: string;
  defaultBilling: "annually" | "monthly";
  plans: CmsHostingPlan[];

  featuresEyebrow: string;
  featuresHeading: string;
  featuresDescription: string;
  features: CmsCloudPageFeature[];

  performanceHeading: string;
  performanceDescription: string;
  performanceStats: string[];

  vsSharedHeading: string;
  vsSharedDescription: string;
  vsSharedBullets: string[];

  faqHeading: string;
  faqDescription: string;
  faqs: CmsCloudPageFaq[];

  closingHeading: string;
  closingDescription: string;
  closingCtaLabel: string;
  closingCtaHref: string;
};

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function mergeStoredList<T extends { id: string; visible?: boolean }>(
  defaults: T[],
  stored: T[] | undefined | null,
  merge: (item: Partial<T>, base: T) => T,
): T[] {
  if (!Array.isArray(stored) || stored.length === 0) return defaults;
  const defaultById = new Map(defaults.map((row) => [row.id, row]));
  return stored.map((row, index) => {
    const partial = (row ?? {}) as Partial<T>;
    const fallback =
      (partial.id ? defaultById.get(partial.id) : undefined) ??
      defaults[index % defaults.length];
    return {
      ...merge(partial, fallback),
      id:
        typeof partial.id === "string" && partial.id.trim()
          ? partial.id
          : fallback.id,
      visible: partial.visible !== false,
    };
  });
}

function defaultCloudPlans(): CmsHostingPlan[] {
  return [
    {
      id: "cloud-starter",
      visible: true,
      order: 0,
      name: "Cloud Starter",
      tagline: "Isolated resources for your first high-traffic site.",
      discountBadge: "60% OFF",
      popular: false,
      popularLabel: "",
      accent: "blue",
      priceAnnually: "$9.99",
      originalAnnually: "$24.99",
      billedAnnually: "Billed $119.88 annually",
      saveAnnually: "Save $180.00",
      priceMonthly: "$24.99",
      originalMonthly: "",
      billedMonthly: "Billed monthly",
      saveMonthly: "",
      domainPerk: "Domain — free for 1 year",
      annualCredit: "$5 Beyond AI Credit",
      features: [
        "1 Website",
        "50 GB NVMe Storage",
        "2 GB RAM · 2 vCPU",
        "Unmetered Bandwidth",
        "Free SSL",
        "Daily Backups",
        "Dedicated IP optional",
        "24/7 Expert Support",
      ],
      ctaLabel: "Get Cloud Starter",
      ctaHref: routes.getStarted,
    },
    {
      id: "cloud-business",
      visible: true,
      order: 1,
      name: "Cloud Business",
      tagline: "More power for stores, agencies, and growing brands.",
      discountBadge: "60% OFF",
      popular: true,
      popularLabel: "Most Popular",
      accent: "gradient",
      priceAnnually: "$14.99",
      originalAnnually: "$37.99",
      billedAnnually: "Billed $179.88 annually",
      saveAnnually: "Save $276.00",
      priceMonthly: "$37.99",
      originalMonthly: "",
      billedMonthly: "Billed monthly",
      saveMonthly: "",
      domainPerk: "Domain — free for 1 year",
      annualCredit: "$10 Beyond AI Credit",
      features: [
        "3 Websites",
        "100 GB NVMe Storage",
        "4 GB RAM · 3 vCPU",
        "Unmetered Bandwidth",
        "Free SSL",
        "Daily Backups",
        "Free Website Migration",
        "Priority Support",
      ],
      ctaLabel: "Get Cloud Business",
      ctaHref: routes.getStarted,
    },
    {
      id: "cloud-pro",
      visible: true,
      order: 2,
      name: "Cloud Pro",
      tagline: "Maximum isolation for demanding apps and traffic spikes.",
      discountBadge: "55% OFF",
      popular: false,
      popularLabel: "",
      accent: "purple",
      priceAnnually: "$24.99",
      originalAnnually: "$54.99",
      billedAnnually: "Billed $299.88 annually",
      saveAnnually: "Save $360.00",
      priceMonthly: "$54.99",
      originalMonthly: "",
      billedMonthly: "Billed monthly",
      saveMonthly: "",
      domainPerk: "Domain — free for 1 year",
      annualCredit: "$15 Beyond AI Credit",
      features: [
        "5 Websites",
        "150 GB NVMe Storage",
        "8 GB RAM · 4 vCPU",
        "Unmetered Bandwidth",
        "Free SSL",
        "Daily Backups + on-demand",
        "Free Website Migration",
        "Priority Support",
        "PHP, Python & Node.js",
      ],
      ctaLabel: "Get Cloud Pro",
      ctaHref: routes.getStarted,
    },
  ];
}

export function defaultCloudHostingPageContent(): CmsCloudHostingPageContent {
  return {
    heroEyebrow: "Cloud hosting",
    heroTitle: "Cloud hosting with",
    heroTitleAccent: "dedicated resources.",
    heroDescription:
      "Get isolated CPU, RAM, and NVMe storage that scale with your traffic — faster than shared hosting, simpler than managing your own server.",
    heroPrimaryLabel: "See cloud plans",
    heroPrimaryHref: "#plans",
    heroSecondaryLabel: "Compare with web hosting",
    heroSecondaryHref: routes.hosting,
    heroPromo: "Save up to 60% on your first term",
    heroImage: "/images/cloud/frames/hero-cloud.svg",
    heroCardEyebrow: "Isolated resources",
    heroCardLine: "Up to 8 GB RAM · 4 vCPU on Cloud Pro",

    pricingEyebrow: "Cloud plans",
    pricingTitle: "Pick your",
    pricingTitleAccent: "cloud package",
    pricingDescription:
      "Dedicated resources, transparent renewal pricing, and the same HostingBeyond panel you already know.",
    pricingNote:
      "Promotional rates apply to the first billing term. Standard renewal rates are shown at checkout.",
    saveBadge: "Save up to 60%",
    annualToggleLabel: "Annually",
    monthlyToggleLabel: "Monthly",
    defaultBilling: "annually",
    plans: defaultCloudPlans(),

    featuresEyebrow: "Built for performance",
    featuresHeading: "Why upgrade to cloud hosting?",
    featuresDescription:
      "Cloud plans reserve resources for your account so neighbours cannot slow you down during traffic spikes.",
    features: [
      {
        id: "cpu",
        visible: true,
        title: "Dedicated CPU & RAM",
        description:
          "Your workloads run on reserved vCPU and memory — not a noisy shared pool.",
        icon: "cpu",
      },
      {
        id: "nvme",
        visible: true,
        title: "NVMe storage",
        description:
          "Ultra-fast disks for databases, WooCommerce, and media-heavy sites.",
        icon: "database",
      },
      {
        id: "scale",
        visible: true,
        title: "Scale on demand",
        description:
          "Upgrade plans in one click when campaigns or product launches take off.",
        icon: "scale",
      },
      {
        id: "ssl",
        visible: true,
        title: "Security included",
        description:
          "Free SSL, malware scanning, and optional dedicated IP for sensitive apps.",
        icon: "shield",
      },
      {
        id: "speed",
        visible: true,
        title: "Faster page loads",
        description:
          "Optimized stack with caching and HTTP/3 ready infrastructure.",
        icon: "zap",
      },
      {
        id: "global",
        visible: true,
        title: "Global edge ready",
        description:
          "Pair with CDN and DNS tools in the same HostingBeyond account.",
        icon: "globe",
      },
    ],

    performanceHeading: "Handle traffic spikes with confidence",
    performanceDescription:
      "Cloud hosting is built for stores, agencies, and SaaS landing pages that outgrow shared hosting.",
    performanceStats: [
      "Up to 4 vCPU on Cloud Pro",
      "8 GB RAM for heavy WordPress + WooCommerce",
      "150 GB NVMe for catalogs and media",
      "99.9% uptime commitment",
    ],

    vsSharedHeading: "Cloud vs shared hosting",
    vsSharedDescription:
      "Shared hosting is perfect for getting started. Cloud is the next step when you need guaranteed resources.",
    vsSharedBullets: [
      "Shared: best price for blogs and brochure sites",
      "Cloud: reserved RAM/CPU for stores and apps",
      "Both include free SSL, backups, and 24/7 support",
      "Upgrade anytime without rebuilding your site",
    ],

    faqHeading: "Cloud hosting FAQs",
    faqDescription:
      "Answers about resources, billing, migrations, and when to choose cloud.",
    faqs: [
      {
        id: "what",
        visible: true,
        question: "What is cloud hosting?",
        answer:
          "Cloud hosting allocates dedicated CPU, RAM, and storage to your account on our cloud infrastructure — giving you more consistency than traditional shared hosting.",
      },
      {
        id: "when",
        visible: true,
        question: "When should I choose cloud over shared?",
        answer:
          "Choose cloud when you run WooCommerce, membership sites, or campaigns that spike traffic and you need guaranteed resources.",
      },
      {
        id: "migrate",
        visible: true,
        question: "Can you migrate my site to cloud?",
        answer:
          "Yes. Cloud Business and Cloud Pro include free migration from your current host or from HostingBeyond shared plans.",
      },
      {
        id: "vps",
        visible: true,
        question: "How is this different from VPS?",
        answer:
          "Cloud hosting is managed — we handle the stack, security patches, and panel. VPS gives you full root access for custom servers.",
      },
      {
        id: "billing",
        visible: true,
        question: "Monthly or annual billing?",
        answer:
          "Annual billing offers the lowest effective rate. Toggle monthly pricing on this page before checkout.",
      },
    ],

    closingHeading: "Ready for dedicated cloud power?",
    closingDescription:
      "Launch on cloud hosting with SSL, backups, and expert support included from day one.",
    closingCtaLabel: "Get started",
    closingCtaHref: routes.getStarted,
  };
}

export function mergeCloudHostingPageContent(
  stored?: Partial<CmsCloudHostingPageContent> | null,
): CmsCloudHostingPageContent {
  const defaults = defaultCloudHostingPageContent();
  if (!stored) return defaults;

  return {
    ...defaults,
    heroEyebrow: text(stored.heroEyebrow, defaults.heroEyebrow),
    heroTitle: text(stored.heroTitle, defaults.heroTitle),
    heroTitleAccent: text(stored.heroTitleAccent, defaults.heroTitleAccent),
    heroDescription: text(stored.heroDescription, defaults.heroDescription),
    heroPrimaryLabel: text(stored.heroPrimaryLabel, defaults.heroPrimaryLabel),
    heroPrimaryHref: text(stored.heroPrimaryHref, defaults.heroPrimaryHref),
    heroSecondaryLabel: text(
      stored.heroSecondaryLabel,
      defaults.heroSecondaryLabel,
    ),
    heroSecondaryHref: text(
      stored.heroSecondaryHref,
      defaults.heroSecondaryHref,
    ),
    heroPromo: text(stored.heroPromo, defaults.heroPromo),
    heroImage: text(stored.heroImage, defaults.heroImage),
    heroCardEyebrow: text(stored.heroCardEyebrow, defaults.heroCardEyebrow),
    heroCardLine: text(stored.heroCardLine, defaults.heroCardLine),
    pricingEyebrow: text(stored.pricingEyebrow, defaults.pricingEyebrow),
    pricingTitle: text(stored.pricingTitle, defaults.pricingTitle),
    pricingTitleAccent: text(
      stored.pricingTitleAccent,
      defaults.pricingTitleAccent,
    ),
    pricingDescription: text(
      stored.pricingDescription,
      defaults.pricingDescription,
    ),
    pricingNote: text(stored.pricingNote, defaults.pricingNote),
    saveBadge: text(stored.saveBadge, defaults.saveBadge),
    annualToggleLabel: text(
      stored.annualToggleLabel,
      defaults.annualToggleLabel,
    ),
    monthlyToggleLabel: text(
      stored.monthlyToggleLabel,
      defaults.monthlyToggleLabel,
    ),
    defaultBilling:
      stored.defaultBilling === "monthly" ? "monthly" : defaults.defaultBilling,
    featuresEyebrow: text(stored.featuresEyebrow, defaults.featuresEyebrow),
    featuresHeading: text(stored.featuresHeading, defaults.featuresHeading),
    featuresDescription: text(
      stored.featuresDescription,
      defaults.featuresDescription,
    ),
    performanceHeading: text(
      stored.performanceHeading,
      defaults.performanceHeading,
    ),
    performanceDescription: text(
      stored.performanceDescription,
      defaults.performanceDescription,
    ),
    performanceStats:
      stored.performanceStats?.length &&
      stored.performanceStats.some((s) => s.trim())
        ? stored.performanceStats
        : defaults.performanceStats,
    vsSharedHeading: text(stored.vsSharedHeading, defaults.vsSharedHeading),
    vsSharedDescription: text(
      stored.vsSharedDescription,
      defaults.vsSharedDescription,
    ),
    vsSharedBullets:
      stored.vsSharedBullets?.length &&
      stored.vsSharedBullets.some((b) => b.trim())
        ? stored.vsSharedBullets
        : defaults.vsSharedBullets,
    faqHeading: text(stored.faqHeading, defaults.faqHeading),
    faqDescription: text(stored.faqDescription, defaults.faqDescription),
    closingHeading: text(stored.closingHeading, defaults.closingHeading),
    closingDescription: text(
      stored.closingDescription,
      defaults.closingDescription,
    ),
    closingCtaLabel: text(stored.closingCtaLabel, defaults.closingCtaLabel),
    closingCtaHref: text(stored.closingCtaHref, defaults.closingCtaHref),
    features: mergeStoredList(
      defaults.features,
      stored.features,
      (item, base) => ({
        ...base,
        title: text(item.title, base.title),
        description: text(item.description, base.description),
        icon: (item.icon ?? base.icon) as CmsCloudPageFeature["icon"],
      }),
    ),
    faqs: mergeStoredList(defaults.faqs, stored.faqs, (item, base) => ({
      ...base,
      question: text(item.question, base.question),
      answer: text(item.answer, base.answer),
    })),
    plans: mergeStoredList(defaults.plans, stored.plans, (item, base) => ({
      ...base,
      name: text(item.name, base.name),
      tagline: text(item.tagline, base.tagline),
      priceAnnually: text(item.priceAnnually, base.priceAnnually),
      priceMonthly: text(item.priceMonthly, base.priceMonthly),
      originalAnnually: text(item.originalAnnually, base.originalAnnually),
      billedAnnually: text(item.billedAnnually, base.billedAnnually),
      saveAnnually: text(item.saveAnnually, base.saveAnnually),
      discountBadge: text(item.discountBadge, base.discountBadge),
      domainPerk: text(item.domainPerk, base.domainPerk),
      annualCredit: text(item.annualCredit, base.annualCredit),
      ctaLabel: text(item.ctaLabel, base.ctaLabel),
      ctaHref: text(item.ctaHref, base.ctaHref),
      features:
        item.features?.length && item.features.some((f) => f.trim())
          ? item.features
          : base.features,
      popular: item.popular ?? base.popular,
      popularLabel: text(item.popularLabel, base.popularLabel ?? ""),
      order: typeof item.order === "number" ? item.order : base.order,
    })),
  };
}
