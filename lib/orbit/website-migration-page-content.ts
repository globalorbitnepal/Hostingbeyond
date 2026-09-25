import { routes } from "@/config/routes";

export type CmsMigrationStep = {
  id: string;
  visible: boolean;
  title: string;
  description: string;
};

export type CmsMigrationFeature = {
  id: string;
  visible: boolean;
  title: string;
  description: string;
  icon: "zap" | "shield" | "clock" | "users" | "bot" | "globe";
};

export type CmsMigrationFaq = {
  id: string;
  visible: boolean;
  question: string;
  answer: string;
};

export type CmsWebsiteMigrationPageContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroBullets: string[];
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroGuarantee: string;
  /** Center portrait in the hero collage (right column). */
  heroImage: string;
  heroOverlayLine1: string;
  heroOverlayLine2: string;
  heroChipWebsite: string;
  heroChipForm: string;
  heroProgressTitle: string;
  heroProgressValue: string;
  /** Display width scale for right-column hero art (100 = base, 130 = +30%). */
  heroVisualScalePercent: number;

  pricingEyebrow: string;
  pricingTitle: string;
  pricingTitleAccent: string;
  pricingDescription: string;
  pricingNote: string;
  saveBadge: string;
  annualToggleLabel: string;
  monthlyToggleLabel: string;
  defaultBilling: "annually" | "monthly";

  stepsHeading: string;
  stepsDescription: string;
  steps: CmsMigrationStep[];

  whyHeading: string;
  whyDescription: string;
  features: CmsMigrationFeature[];

  aiHeading: string;
  aiDescription: string;
  aiBullets: string[];
  aiImage: string;
  /** Right-column AI band artwork width scale (120 = +20% vs 600px base). */
  aiVisualScalePercent: number;

  supportHeading: string;
  supportDescription: string;
  supportCtaLabel: string;
  supportCtaHref: string;

  faqHeading: string;
  faqDescription: string;
  faqs: CmsMigrationFaq[];

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

export function defaultWebsiteMigrationPageContent(): CmsWebsiteMigrationPageContent {
  return {
    heroEyebrow: "",
    heroTitle: "The last website migration you'll ever need",
    heroTitleAccent: "",
    heroBullets: [
      "Migrate an unlimited number of websites for free",
      "AI automates your site migration without hassle or downtime",
      "24/7 customer support",
    ],
    heroPrimaryLabel: "Migrate for free",
    heroPrimaryHref: "#plans",
    heroGuarantee: "30-day money-back guarantee",
    heroImage: "/images/migration/hero-custom.webp",
    heroVisualScalePercent: 130,
    heroOverlayLine1: "MOVE",
    heroOverlayLine2: "FORWARD",
    heroChipWebsite: "Website link",
    heroChipForm: "Migration form",
    heroProgressTitle: "Migration in progress",
    heroProgressValue: "2.3GB out of 3GB",

    pricingEyebrow: "Hosting plans",
    pricingTitle: "Pick a plan with",
    pricingTitleAccent: "free migration included",
    pricingDescription:
      "Same HostingBeyond plans you know — Plus, Pro, and Ultimate include free website migration assistance.",
    pricingNote:
      "Migration is included on eligible annual plans. Promotional rates apply to the first term; renewal pricing shown at checkout.",
    saveBadge: "Save up to 70%",
    annualToggleLabel: "Annually",
    monthlyToggleLabel: "Monthly",
    defaultBilling: "annually",

    stepsHeading: "How website migration works",
    stepsDescription:
      "Share your current host details — we copy files, databases, and email where included, then cut over with checks.",
    steps: [
      {
        id: "step-1",
        visible: true,
        title: "Submit your site link",
        description:
          "Tell us your live URL and hosting login (or a backup). We confirm what will move and estimate timing.",
      },
      {
        id: "step-2",
        visible: true,
        title: "We migrate in the background",
        description:
          "Our specialists clone your site to HostingBeyond, run SSL, and test pages before switching DNS.",
      },
      {
        id: "step-3",
        visible: true,
        title: "Go live with support on standby",
        description:
          "Update DNS when you are ready. Support stays online if caches or redirects need a quick tweak.",
      },
    ],

    whyHeading: "Why migrate with HostingBeyond?",
    whyDescription:
      "Faster NVMe storage, free SSL, and a panel built for agencies and founders — not ticket roulette.",
    features: [
      {
        id: "free",
        visible: true,
        title: "Free on eligible plans",
        description:
          "No surprise migration invoices on Plus, Pro, and Ultimate.",
        icon: "zap",
      },
      {
        id: "secure",
        visible: true,
        title: "Secure handoff",
        description:
          "Encrypted credentials and verified backups before DNS changes.",
        icon: "shield",
      },
      {
        id: "fast",
        visible: true,
        title: "Minimal downtime",
        description:
          "Staging first, then a controlled cutover when traffic is lowest.",
        icon: "clock",
      },
      {
        id: "humans",
        visible: true,
        title: "Real specialists",
        description:
          "WordPress, WooCommerce, and custom PHP — handled by people, not bots alone.",
        icon: "users",
      },
      {
        id: "ai",
        visible: true,
        title: "Beyond AI assist",
        description:
          "AI helps map redirects and spot broken links after the move.",
        icon: "bot",
      },
      {
        id: "global",
        visible: true,
        title: "Domains & mail together",
        description:
          "Keep DNS, hosting, and business email in one HostingBeyond account.",
        icon: "globe",
      },
    ],

    aiHeading: "Smarter migrations with Beyond AI",
    aiDescription:
      "Our AI tooling scans your sitemap, suggests redirect rules, and flags mixed-content issues before you flip DNS.",
    aiBullets: [
      "Automatic redirect map from old URLs to new paths",
      "Post-migration health check for SSL and core pages",
      "Optional staging URL to preview before going live",
    ],
    aiImage: "/images/migration/hero-custom.webp",
    aiVisualScalePercent: 120,

    supportHeading: "Talk to migration support",
    supportDescription:
      "Not sure if your stack qualifies? Chat with us — we will tell you exactly what moves for free and what needs a custom quote.",
    supportCtaLabel: "Contact migration team",
    supportCtaHref: routes.contact,

    faqHeading: "Website migration FAQs",
    faqDescription:
      "Common questions about timing, eligibility, WordPress, and email.",
    faqs: [
      {
        id: "eligibility",
        visible: true,
        question: "Which plans include free website migration?",
        answer:
          "Plus, Pro, Ultimate, and comparable ecommerce tiers include free migration from most popular hosts. Starter plans can add migration as a paid service — ask support for a quote.",
      },
      {
        id: "time",
        visible: true,
        question: "How long does migration take?",
        answer:
          "Simple WordPress sites often move within 24–48 hours after we receive access. Larger stores or multisite setups may take longer; we give you a window before DNS changes.",
      },
      {
        id: "email",
        visible: true,
        question: "Do you migrate email too?",
        answer:
          "We focus on website files and databases. Business email can be set up on HostingBeyond separately; we guide MX updates so mail keeps flowing.",
      },
      {
        id: "downtime",
        visible: true,
        question: "Will my site go offline?",
        answer:
          "We build on staging first. Downtime is usually limited to DNS propagation — often under an hour when scheduled off-peak.",
      },
      {
        id: "wordpress",
        visible: true,
        question: "Can you migrate WordPress and WooCommerce?",
        answer:
          "Yes. We move themes, plugins, uploads, and WooCommerce data, then test checkout and permalinks on NVMe before cutover.",
      },
    ],

    closingHeading: "Ready to move your site?",
    closingDescription:
      "Choose a plan with free migration, submit your link, and let HostingBeyond handle the switch.",
    closingCtaLabel: "Get started",
    closingCtaHref: routes.getStarted,
  };
}

export function mergeWebsiteMigrationPageContent(
  stored?: Partial<CmsWebsiteMigrationPageContent> | null,
): CmsWebsiteMigrationPageContent {
  const defaults = defaultWebsiteMigrationPageContent();
  if (!stored) return defaults;

  return {
    ...defaults,
    heroEyebrow: text(stored.heroEyebrow, defaults.heroEyebrow),
    heroTitle: text(stored.heroTitle, defaults.heroTitle),
    heroTitleAccent: text(stored.heroTitleAccent, defaults.heroTitleAccent),
    heroBullets:
      stored.heroBullets?.length && stored.heroBullets.some((b) => b.trim())
        ? stored.heroBullets
        : defaults.heroBullets,
    heroPrimaryLabel: text(stored.heroPrimaryLabel, defaults.heroPrimaryLabel),
    heroPrimaryHref: text(stored.heroPrimaryHref, defaults.heroPrimaryHref),
    heroGuarantee: text(stored.heroGuarantee, defaults.heroGuarantee),
    heroImage: (() => {
      const raw = text(stored.heroImage, defaults.heroImage);
      const legacy = [
        "/images/business-email/people/p-woman.jpg",
        "/images/migration/frames/hero-migration.svg",
        "/images/migration/hero-composite.png",
      ];
      return legacy.includes(raw) ? defaults.heroImage : raw;
    })(),
    heroVisualScalePercent:
      typeof stored.heroVisualScalePercent === "number" &&
      stored.heroVisualScalePercent >= 80 &&
      stored.heroVisualScalePercent <= 160
        ? Math.round(stored.heroVisualScalePercent)
        : defaults.heroVisualScalePercent,
    heroOverlayLine1: text(stored.heroOverlayLine1, defaults.heroOverlayLine1),
    heroOverlayLine2: text(stored.heroOverlayLine2, defaults.heroOverlayLine2),
    heroChipWebsite: text(stored.heroChipWebsite, defaults.heroChipWebsite),
    heroChipForm: text(stored.heroChipForm, defaults.heroChipForm),
    heroProgressTitle: text(
      stored.heroProgressTitle,
      defaults.heroProgressTitle,
    ),
    heroProgressValue: text(
      stored.heroProgressValue,
      defaults.heroProgressValue,
    ),
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
    stepsHeading: text(stored.stepsHeading, defaults.stepsHeading),
    stepsDescription: text(stored.stepsDescription, defaults.stepsDescription),
    whyHeading: text(stored.whyHeading, defaults.whyHeading),
    whyDescription: text(stored.whyDescription, defaults.whyDescription),
    aiHeading: text(stored.aiHeading, defaults.aiHeading),
    aiDescription: text(stored.aiDescription, defaults.aiDescription),
    aiBullets:
      stored.aiBullets?.length && stored.aiBullets.some((b) => b.trim())
        ? stored.aiBullets
        : defaults.aiBullets,
    aiImage: (() => {
      const raw = text(stored.aiImage, defaults.aiImage);
      const legacy = [
        "/images/migration/frames/hero-migration.svg",
        "/images/migration/hero-composite.png",
        "/images/migration/ai-band.webp",
      ];
      return legacy.includes(raw) || raw.endsWith("hero-migration.svg")
        ? defaults.aiImage
        : raw;
    })(),
    aiVisualScalePercent:
      typeof stored.aiVisualScalePercent === "number" &&
      stored.aiVisualScalePercent >= 80 &&
      stored.aiVisualScalePercent <= 160
        ? Math.round(stored.aiVisualScalePercent)
        : defaults.aiVisualScalePercent,
    supportHeading: text(stored.supportHeading, defaults.supportHeading),
    supportDescription: text(
      stored.supportDescription,
      defaults.supportDescription,
    ),
    supportCtaLabel: text(stored.supportCtaLabel, defaults.supportCtaLabel),
    supportCtaHref: text(stored.supportCtaHref, defaults.supportCtaHref),
    faqHeading: text(stored.faqHeading, defaults.faqHeading),
    faqDescription: text(stored.faqDescription, defaults.faqDescription),
    closingHeading: text(stored.closingHeading, defaults.closingHeading),
    closingDescription: text(
      stored.closingDescription,
      defaults.closingDescription,
    ),
    closingCtaLabel: text(stored.closingCtaLabel, defaults.closingCtaLabel),
    closingCtaHref: text(stored.closingCtaHref, defaults.closingCtaHref),
    steps: mergeStoredList(defaults.steps, stored.steps, (item, base) => ({
      ...base,
      title: text(item.title, base.title),
      description: text(item.description, base.description),
    })),
    features: mergeStoredList(
      defaults.features,
      stored.features,
      (item, base) => ({
        ...base,
        title: text(item.title, base.title),
        description: text(item.description, base.description),
        icon: (item.icon ?? base.icon) as CmsMigrationFeature["icon"],
      }),
    ),
    faqs: mergeStoredList(defaults.faqs, stored.faqs, (item, base) => ({
      ...base,
      question: text(item.question, base.question),
      answer: text(item.answer, base.answer),
    })),
  };
}
