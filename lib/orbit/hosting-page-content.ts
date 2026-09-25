import { routes } from "@/config/routes";

export type CmsHostingPageFeature = {
  id: string;
  visible: boolean;
  title: string;
  description: string;
  icon: "zap" | "shield" | "globe" | "server" | "mail" | "sparkles";
};

export type CmsHostingPageFaq = {
  id: string;
  visible: boolean;
  question: string;
  answer: string;
};

export type CmsHostingPageContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroDescription: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  heroPromo: string;

  pricingEyebrow: string;
  pricingTitle: string;
  pricingTitleAccent: string;
  pricingDescription: string;
  pricingNote: string;

  featuresEyebrow: string;
  featuresHeading: string;
  featuresDescription: string;
  features: CmsHostingPageFeature[];

  wordpressHeading: string;
  wordpressDescription: string;
  wordpressBullets: string[];
  wordpressCtaLabel: string;
  wordpressCtaHref: string;
  wordpressImage: string;

  compareHeading: string;
  compareDescription: string;
  compareBullets: string[];

  faqHeading: string;
  faqDescription: string;
  faqs: CmsHostingPageFaq[];

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

export function defaultHostingPageContent(): CmsHostingPageContent {
  return {
    heroEyebrow: "Web hosting",
    heroTitle: "Fast, secure hosting",
    heroTitleAccent: "for every idea.",
    heroDescription:
      "Launch WordPress, WooCommerce, or custom sites on NVMe infrastructure — free SSL, optional free domain, and real 24/7 support included on every plan.",
    heroPrimaryLabel: "View plans",
    heroPrimaryHref: "#plans",
    heroSecondaryLabel: "Talk to sales",
    heroSecondaryHref: routes.contact,
    heroPromo: "Save up to 70% on annual billing",

    pricingEyebrow: "Plans & pricing",
    pricingTitle: "Choose your",
    pricingTitleAccent: "web hosting plan",
    pricingDescription:
      "Transparent pricing with renewal rates shown upfront. Switch between monthly and annual billing anytime.",
    pricingNote:
      "Prices shown are promotional rates for the first term. Renewals use standard rates listed at checkout.",

    featuresEyebrow: "Why HostingBeyond",
    featuresHeading: "Everything you need to go live",
    featuresDescription:
      "From the first click to your first sale — speed, security, and support are included, not upsold.",
    features: [
      {
        id: "speed",
        visible: true,
        title: "NVMe speed",
        description:
          "SSD storage and tuned stacks so pages load fast on mobile and desktop.",
        icon: "zap",
      },
      {
        id: "ssl",
        visible: true,
        title: "Free SSL",
        description:
          "HTTPS on every site with automatic certificate issue and renewal.",
        icon: "shield",
      },
      {
        id: "domain",
        visible: true,
        title: "Free domain (1st year)",
        description:
          "Register a new domain on eligible annual plans — one brand, one bill.",
        icon: "globe",
      },
      {
        id: "wordpress",
        visible: true,
        title: "Managed WordPress",
        description:
          "One-click installs, updates, and staging-friendly tools built in.",
        icon: "server",
      },
      {
        id: "email",
        visible: true,
        title: "Professional email",
        description:
          "Add mailboxes on your domain or connect HostingBeyond Mail in one account.",
        icon: "mail",
      },
      {
        id: "ai",
        visible: true,
        title: "Beyond AI credit",
        description:
          "Annual plans include AI credit to draft pages, copy, and automations.",
        icon: "sparkles",
      },
    ],

    wordpressHeading: "Built for WordPress & WooCommerce",
    wordpressDescription:
      "Whether you publish a blog or run a store, our stack is optimized for WordPress — with caching, security hardening, and migration help when you switch hosts.",
    wordpressBullets: [
      "One-click WordPress install",
      "Automatic security patches",
      "Free migration on Plus plans and above",
      "WooCommerce-ready PHP & MariaDB",
    ],
    wordpressCtaLabel: "Start with WordPress hosting",
    wordpressCtaHref: routes.getStarted,
    wordpressImage: "",

    compareHeading: "Compare with typical shared hosting",
    compareDescription:
      "HostingBeyond bundles the essentials other hosts charge extra for.",
    compareBullets: [
      "Free SSL on every plan — not a paid add-on",
      "NVMe storage instead of legacy spinning disks",
      "Human support 24/7 — not chatbots only",
      "Single dashboard for sites, domains, mail, and AI",
    ],

    faqHeading: "Web hosting FAQs",
    faqDescription:
      "Quick answers about plans, WordPress, billing, and moving your site.",
    faqs: [
      {
        id: "what",
        visible: true,
        question: "What is web hosting?",
        answer:
          "Web hosting stores your website files on servers connected to the internet so visitors can reach your site 24/7. HostingBeyond offers shared hosting optimized for WordPress, PHP, and modern apps.",
      },
      {
        id: "wordpress",
        visible: true,
        question: "Do you support WordPress?",
        answer:
          "Yes. Every plan includes managed WordPress tools, one-click setup, and free SSL. Higher tiers add daily backups and free migration assistance.",
      },
      {
        id: "domain",
        visible: true,
        question: "Is a domain included?",
        answer:
          "Eligible annual plans include a free domain for the first year on new registrations. You can also connect a domain you already own.",
      },
      {
        id: "migrate",
        visible: true,
        question: "Can you migrate my existing website?",
        answer:
          "Yes. Plus, Pro, and Ultimate plans include free website migration. Our team helps move files and databases with minimal downtime.",
      },
      {
        id: "billing",
        visible: true,
        question: "Monthly vs annual billing?",
        answer:
          "Annual billing offers the lowest effective monthly rate. You can view both prices on this page and switch before checkout.",
      },
      {
        id: "refund",
        visible: true,
        question: "Is there a money-back guarantee?",
        answer:
          "Yes. We offer a 30-day money-back guarantee on hosting plans so you can try HostingBeyond risk-free.",
      },
    ],

    closingHeading: "Ready to launch?",
    closingDescription:
      "Pick a plan, register or connect your domain, and publish in minutes — with SSL and support included.",
    closingCtaLabel: "Get started",
    closingCtaHref: routes.getStarted,
  };
}

export function mergeHostingPageContent(
  stored?: Partial<CmsHostingPageContent> | null,
): CmsHostingPageContent {
  const defaults = defaultHostingPageContent();
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
    featuresEyebrow: text(stored.featuresEyebrow, defaults.featuresEyebrow),
    featuresHeading: text(stored.featuresHeading, defaults.featuresHeading),
    featuresDescription: text(
      stored.featuresDescription,
      defaults.featuresDescription,
    ),
    wordpressHeading: text(stored.wordpressHeading, defaults.wordpressHeading),
    wordpressDescription: text(
      stored.wordpressDescription,
      defaults.wordpressDescription,
    ),
    wordpressBullets:
      stored.wordpressBullets?.length &&
      stored.wordpressBullets.some((b) => b.trim())
        ? stored.wordpressBullets
        : defaults.wordpressBullets,
    wordpressCtaLabel: text(
      stored.wordpressCtaLabel,
      defaults.wordpressCtaLabel,
    ),
    wordpressCtaHref: text(stored.wordpressCtaHref, defaults.wordpressCtaHref),
    wordpressImage: text(stored.wordpressImage, defaults.wordpressImage),
    compareHeading: text(stored.compareHeading, defaults.compareHeading),
    compareDescription: text(
      stored.compareDescription,
      defaults.compareDescription,
    ),
    compareBullets:
      stored.compareBullets?.length &&
      stored.compareBullets.some((b) => b.trim())
        ? stored.compareBullets
        : defaults.compareBullets,
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
        icon: (item.icon ?? base.icon) as CmsHostingPageFeature["icon"],
      }),
    ),
    faqs: mergeStoredList(defaults.faqs, stored.faqs, (item, base) => ({
      ...base,
      question: text(item.question, base.question),
      answer: text(item.answer, base.answer),
    })),
  };
}
