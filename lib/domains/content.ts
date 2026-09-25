import { TLD_PRICES, type TldCategory } from "@/lib/domains/tlds";

/**
 * Editable content for /domain-name-search and /bulk-domain-search.
 * Everything the visitor reads — copy, prices, images, FAQs — lives here so
 * Orbit can edit it without a deploy.
 */

export type DomainStat = {
  id: string;
  visible: boolean;
  order: number;
  value: string;
  label: string;
};

export type DomainFaqItem = {
  id: string;
  visible: boolean;
  order: number;
  question: string;
  answer: string;
};

export type DomainPageCopy = {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  stats: DomainStat[];
  pricingHeading: string;
  pricingCopy: string;
  faqEyebrow: string;
  faqHeading: string;
  faqDescription: string;
  faqAccordionEyebrow: string;
  faqAccordionHeading: string;
  faqAccordionDescription: string;
  faqs: DomainFaqItem[];
  crossLinkLabel: string;
  crossLinkHelper: string;
};

export type DomainTldRow = {
  id: string;
  visible: boolean;
  order: number;
  tld: string;
  register: number;
  renew: number;
  transfer: number;
  categories: TldCategory[];
  note: string;
};

export type DomainIconCard = {
  id: string;
  visible: boolean;
  order: number;
  title: string;
  description: string;
  icon: string;
};

export type DomainShowcaseCard = {
  id: string;
  visible: boolean;
  order: number;
  layout: "registrar" | "privacy" | "support" | "setup";
  title: string;
  description: string;
  linkLabel: string;
  linkHref: string;
  image: string;
  video?: string;
  badge?: string;
};

export type DomainGuidePillar = {
  id: string;
  visible: boolean;
  order: number;
  pillar: "what" | "transfer" | "hosting";
  title: string;
  description: string;
  linkLabel: string;
  linkHref: string;
  image: string;
  video?: string;
};

export type DomainPopularPick = {
  id: string;
  visible: boolean;
  order: number;
  tld: string;
  tagline: string;
  /** Top banner / background inside the TLD card (see DOMAIN_FRAME_SPECS.popularTldCard). */
  image: string;
};

export type DomainSceneItem = {
  id: string;
  visible: boolean;
  order: number;
  label: string;
  caption: string;
  prompt: string;
  chips: string;
  image: string;
  /** Optional MP4/WebM loop for the preview player (replaces static scene art). */
  video?: string;
};

export type DomainSharedContent = {
  heroImage: string;
  heroImageAlt: string;
  brandImage: string;
  brandImageAlt: string;
  /** Optional MP4/WebM for the included-features preview (replaces brand image). */
  brandVideo?: string;
  transferImage: string;
  transferImageAlt: string;
  heroChips: string;
  trust: DomainIconCard[];
  pricing: DomainTldRow[];
  pricingFootnote: string;
  videoEyebrow: string;
  videoHeading: string;
  videoDescription: string;
  videoCtaLabel: string;
  scenes: DomainSceneItem[];
  whyBuyEyebrow: string;
  whyBuyHeading: string;
  whyBuyDescription: string;
  showcaseCards: DomainShowcaseCard[];
  popularHeading: string;
  popularLinkLabel: string;
  popularLinkHref: string;
  popularPicks: DomainPopularPick[];
  guidePillars: DomainGuidePillar[];
  includedEyebrow: string;
  includedHeading: string;
  includedDescription: string;
  included: DomainIconCard[];
  transferEyebrow: string;
  transferHeading: string;
  transferDescription: string;
  transferSteps: string;
  transferCtaLabel: string;
  ctaHeading: string;
  ctaEmailLabel: string;
};

export type DomainContent = {
  shared: DomainSharedContent;
  single: DomainPageCopy;
  bulk: DomainPageCopy;
};

export function defaultDomainContent(): DomainContent {
  return {
    shared: {
      heroImage: "/images/domains/hero.jpg",
      heroImageAlt: "Glowing globe of connected domain names",
      brandImage: "/images/domains/brand-kit.jpg",
      brandImageAlt:
        "Website, business email and security included with a HostingBeyond domain",
      transferImage: "/images/domains/transfer.jpg",
      transferImageAlt: "Domain transfer moving DNS records between registrars",
      heroChips: ".com, .org, .net, .io, .dev, .store",
      trust: [
        {
          id: "privacy",
          visible: true,
          order: 0,
          title: "Free WHOIS privacy",
          description: "Your details stay private",
          icon: "shield",
        },
        {
          id: "dns",
          visible: true,
          order: 1,
          title: "Free DNS management",
          description: "Unlimited records",
          icon: "server",
        },
        {
          id: "activation",
          visible: true,
          order: 2,
          title: "Instant activation",
          description: "Live in about 60 seconds",
          icon: "clock",
        },
        {
          id: "support",
          visible: true,
          order: 3,
          title: "24/7 human support",
          description: "Real people, any time zone",
          icon: "headphones",
        },
      ],
      pricing: TLD_PRICES.map((price, index) => ({
        id: price.tld.replace(".", ""),
        visible: true,
        order: index,
        tld: price.tld,
        register: price.register,
        renew: price.renew,
        transfer: price.transfer,
        categories: price.categories,
        note: price.note ?? "",
      })),
      pricingFootnote:
        "Prices are per year in USD and exclude local taxes and the $0.20 ICANN fee. First-year rates apply to new registrations; renewals use the standard rate shown above. WHOIS privacy and DNS are always free.",
      videoEyebrow: "Domain to live site",
      videoHeading: "Watch a name become a business",
      videoDescription:
        "Search, compare and launch in one place. No vendor hopping, no DNS guesswork — every step below happens inside your HostingBeyond panel.",
      videoCtaLabel: "Start with your domain",
      whyBuyEyebrow: "Why HostingBeyond",
      whyBuyHeading: "Why buy domain names at HostingBeyond?",
      whyBuyDescription:
        "Transparent pricing, free privacy and DNS, and one dashboard to point your name at a site, mailboxes and AI pages — without juggling registrars.",
      showcaseCards: [
        {
          id: "registrar",
          visible: true,
          order: 0,
          layout: "registrar",
          title: "Trusted domain registrar",
          description:
            "ICANN-accredited registration with 300+ extensions, renewal rates published before checkout, and free WHOIS privacy on eligible names.",
          linkLabel: "Compare TLD prices",
          linkHref: "#pricing",
          image: "/images/domains/frames/bento-registrar.svg",
        },
        {
          id: "privacy",
          visible: true,
          order: 1,
          layout: "privacy",
          title: "Privacy & security included",
          description:
            "WHOIS privacy keeps your contact details out of public records. Point the name at HostingBeyond and SSL is issued and renewed for you.",
          linkLabel: "Learn about privacy",
          linkHref: "#domain-guide",
          image: "/images/domains/frames/bento-privacy.svg",
        },
        {
          id: "support",
          visible: true,
          order: 2,
          layout: "support",
          title: "24/7 human support",
          description:
            "Real agents on live chat and email — whether you are buying your first .com or moving a portfolio over.",
          linkLabel: "Talk to support",
          linkHref: "/contact",
          image: "/images/domains/frames/bento-support.svg",
          badge:
            "Hello — I would like help connecting my domain to HostingBeyond hosting.",
        },
        {
          id: "setup",
          visible: true,
          order: 3,
          layout: "setup",
          title: "Quick setup, easy management",
          description:
            "Register in minutes, manage DNS in one panel, and add hosting or mailboxes without copying records by hand.",
          linkLabel: "Open domain search",
          linkHref: "/domain-name-search",
          image: "/images/domains/frames/bento-setup.svg",
        },
      ],
      popularHeading: "Choose from the most popular domains",
      popularLinkLabel: "Compare all TLD prices",
      popularLinkHref: "#pricing",
      popularPicks: [
        {
          id: "com",
          visible: true,
          order: 0,
          tld: ".com",
          tagline: "Build trust with the best-known extension",
          image: "/images/domains/frames/popular-tld.svg",
        },
        {
          id: "io",
          visible: true,
          order: 1,
          tld: ".io",
          tagline: "A favourite for startups and SaaS brands",
          image: "/images/domains/frames/popular-tld.svg",
        },
        {
          id: "shop",
          visible: true,
          order: 2,
          tld: ".shop",
          tagline: "Purpose-built for online stores",
          image: "/images/domains/frames/popular-tld.svg",
        },
        {
          id: "ai",
          visible: true,
          order: 3,
          tld: ".ai",
          tagline: "Signal an AI-native product from day one",
          image: "/images/domains/frames/popular-tld.svg",
        },
        {
          id: "online",
          visible: true,
          order: 4,
          tld: ".online",
          tagline: "Affordable and memorable for new projects",
          image: "/images/domains/frames/popular-tld.svg",
        },
      ],
      guidePillars: [
        {
          id: "what",
          visible: true,
          order: 0,
          pillar: "what",
          title: "What is a domain?",
          description:
            "A domain is the memorable address people type to reach your site — easier to share than a numeric server IP.",
          linkLabel: "",
          linkHref: "",
          image: "/images/domains/frames/pillar-what.svg",
        },
        {
          id: "transfer",
          visible: true,
          order: 1,
          pillar: "transfer",
          title: "How do I transfer my domain?",
          description:
            "Unlock the name at your current registrar, paste the auth code here, and we copy DNS so email and traffic stay online.",
          linkLabel: "Domain transfer",
          linkHref: "#transfer",
          image: "/images/domains/frames/pillar-transfer.svg",
        },
        {
          id: "hosting",
          visible: true,
          order: 2,
          pillar: "hosting",
          title: "Hosting + domain",
          description:
            "A domain is the address; hosting keeps the site online. Bundle both in one HostingBeyond account when you are ready to launch.",
          linkLabel: "View hosting plans",
          linkHref: "/hosting",
          image: "/images/domains/frames/pillar-hosting.svg",
        },
      ],
      scenes: [
        {
          id: "search",
          visible: true,
          order: 0,
          label: "Search",
          caption:
            "Type one idea — ten extensions are checked in the same second.",
          prompt: "northpeak.coffee",
          chips: "Checking 10 extensions | Instant results",
          image: "/images/domains/stage-1.jpg",
        },
        {
          id: "compare",
          visible: true,
          order: 1,
          label: "Compare",
          caption:
            "See availability, first-year price and renewal side by side.",
          prompt: "northpeak.com · $0.01 first year",
          chips: "3 names available | Renewal shown upfront",
          image: "/images/domains/stage-2.jpg",
        },
        {
          id: "launch",
          visible: true,
          order: 2,
          label: "Launch",
          caption:
            "Add hosting, mailboxes and SSL on the same domain in minutes.",
          prompt: "northpeak.com is live",
          chips: "SSL issued | hello@northpeak.com ready",
          image: "/images/domains/stage-3.jpg",
        },
      ],
      includedEyebrow: "Included with every domain",
      includedHeading: "A name is the start — this is the rest",
      includedDescription:
        "Other registrars charge extra for privacy, DNS and SSL. We bundle them, then keep your site, mailboxes and AI pages on the same account.",
      included: [
        {
          id: "mail",
          visible: true,
          order: 0,
          title: "Branded email on your name",
          description:
            "Add hello@yourbrand.com mailboxes with SPF, DKIM and DMARC configured for you.",
          icon: "mail",
        },
        {
          id: "ssl",
          visible: true,
          order: 1,
          title: "Free SSL when you host with us",
          description:
            "Point the domain at HostingBeyond and HTTPS is issued and renewed automatically.",
          icon: "badge",
        },
        {
          id: "panel",
          visible: true,
          order: 2,
          title: "One panel for everything",
          description:
            "Domains, DNS, mail, hosting and Beyond AI sites live in the same dashboard.",
          icon: "layers",
        },
        {
          id: "renewal",
          visible: true,
          order: 3,
          title: "Renewal shown before you buy",
          description:
            "First-year and renewal rates sit side by side — no surprise invoice next year.",
          icon: "wallet",
        },
        {
          id: "lock",
          visible: true,
          order: 4,
          title: "Auto-renew and registry lock",
          description:
            "Protect the name your brand runs on against expiry and unauthorised moves.",
          icon: "refresh",
        },
        {
          id: "extensions",
          visible: true,
          order: 5,
          title: "300+ extensions",
          description:
            "From classic .com to niche .studio, .agency and AI-ready .ai — all in one search.",
          icon: "globe",
        },
      ],
      transferEyebrow: "Transfer in",
      transferHeading: "Already own the name? Bring it over",
      transferDescription:
        "Transfers add a full extra year of registration and keep your site and email online while DNS is copied first.",
      transferSteps: [
        "Unlock the domain at your current registrar and request the EPP code.",
        "Start the transfer here and paste the code — we copy your DNS records.",
        "Approve the email from the registry; the name lands in your panel.",
      ].join("\n"),
      transferCtaLabel: "Start a transfer",
      ctaHeading: "Your name is probably still free",
      ctaEmailLabel: "Add business email",
    },
    single: {
      seoTitle:
        "Domain Name Search — Check Availability, Buy & Register Domains",
      seoDescription:
        "Free domain name search with instant availability across .com, .net, .io, .ai and 300+ extensions. Compare first-year and renewal prices, register a domain from $0.01, free WHOIS privacy and DNS included.",
      seoKeywords:
        "domain name search, check domain availability, buy domain name, register domain, domain lookup, cheap domain registration, .com domain, bulk domain search, domain transfer, WHOIS privacy",
      ogTitle: "Domain Name Search — Check Availability & Register from $0.01",
      ogDescription:
        "Search and register your domain in seconds. See renewal pricing upfront, free privacy and DNS on every name.",
      ogImage: "/images/domains/hero.jpg",
      eyebrow: "Registration & lookup",
      title: "Domain name search",
      titleAccent: "that finds the perfect name",
      description:
        "Check availability across 300+ extensions in one search. Free WHOIS privacy, free DNS and renewal pricing published before you buy.",
      stats: [
        {
          id: "managed",
          visible: true,
          order: 0,
          value: "2.7M+",
          label: "Domains managed",
        },
        {
          id: "extensions",
          visible: true,
          order: 1,
          value: "300+",
          label: "Extensions",
        },
        {
          id: "setup",
          visible: true,
          order: 2,
          value: "60s",
          label: "Average setup",
        },
      ],
      pricingHeading: "Domain prices with the renewal in plain sight",
      pricingCopy:
        "Filter by what you are building. Every row shows the first-year promo, the standard renewal and the transfer-in price, so you can plan the real cost of your brand.",
      faqEyebrow: "Domain basics",
      faqHeading: "Lost? Here's what you need to know about domains",
      faqDescription:
        "Three concepts every founder should understand before registering a name.",
      faqAccordionEyebrow: "Domain search FAQs",
      faqAccordionHeading: "Everything people ask before buying",
      faqAccordionDescription:
        "Straight answers on pricing, privacy, transfers and renewals.",
      faqs: [
        {
          id: "how",
          visible: true,
          order: 0,
          question: "How does the domain name search work?",
          answer:
            "Type any idea — with or without an extension — and HostingBeyond checks availability across ten popular extensions at once. Each result shows the first-year price, the renewal price and whether the name is free, premium or already registered, so you can decide on one screen.",
        },
        {
          id: "cost",
          visible: true,
          order: 1,
          question: "How much does a domain name cost?",
          answer:
            "Prices depend on the extension. A .com is $0.01 for the first year and renews at $19.99/yr. Extensions like .online, .shop, .store and .site start under $1 for year one, while .io, .ai and .tech sit higher. Every renewal rate is published in the pricing table on this page.",
        },
        {
          id: "renewal",
          visible: true,
          order: 2,
          question: "Why is the renewal price higher than the first year?",
          answer:
            "First-year rates are promotional, so registries and registrars can offer a low entry price. We show the standard renewal next to it for every extension, because the honest number is the one you pay from year two onward.",
        },
        {
          id: "whois",
          visible: true,
          order: 3,
          question: "Is WHOIS privacy really free?",
          answer:
            "Yes, on every eligible extension. WHOIS privacy replaces your name, address, email and phone number in the public registry record at no extra cost, which cuts spam and protects your personal data.",
        },
        {
          id: "hosting",
          visible: true,
          order: 4,
          question: "Do I need hosting to register a domain?",
          answer:
            "No. You can register a name and park it, then add hosting, business email or a Beyond AI website whenever you are ready. Everything stays in one HostingBeyond account, so there is nothing to migrate later.",
        },
        {
          id: "taken",
          visible: true,
          order: 5,
          question: "What happens if the name I want is taken?",
          answer:
            "The results list shows the same name on other extensions that are still free, and marks premium names separately. If the exact match matters, you can transfer it in once you own it, or start a broader shortlist with our bulk domain search.",
        },
        {
          id: "seo",
          visible: true,
          order: 6,
          question: "Does my domain name affect SEO?",
          answer:
            "The extension itself is not a ranking factor. A short, memorable, brandable name earns more clicks, links and direct traffic, and those do influence rankings. Keep it easy to spell, skip hyphens and numbers, and secure the matching social handles.",
        },
        {
          id: "expiry",
          visible: true,
          order: 7,
          question: "What happens when my domain expires?",
          answer:
            "We email reminders before expiry and keep auto-renew available in the panel. After expiry there is a redemption window where the name can still be restored, but leaving auto-renew on is the safest way to keep your site and mailboxes online.",
        },
      ],
      crossLinkLabel: "Try bulk domain search",
      crossLinkHelper:
        "Check it now, lock it for a year, and add hosting or email whenever you are ready. Need a whole shortlist? Run 50 names at once.",
    },
    bulk: {
      seoTitle: "Bulk Domain Search — Check 50 Domain Names at Once",
      seoDescription:
        "Check up to 50 domain names at once with our bulk domain search. Paste your shortlist and see availability, first-year pricing and renewal rates for every name in one table.",
      seoKeywords:
        "bulk domain search, check multiple domains, domain availability list, agency domain search, domain shortlist",
      ogTitle: "Bulk Domain Search — 50 Names in One Table",
      ogDescription:
        "Paste up to fifty domains and get availability, promo pricing and renewals in a shareable table.",
      ogImage: "/images/domains/hero.jpg",
      eyebrow: "Bulk lookup for teams",
      title: "Bulk domain search",
      titleAccent: "for 50 names at a time",
      description:
        "Paste your whole shortlist and get availability, first-year pricing and renewal rates for every line — built for agencies clearing a naming round.",
      stats: [
        {
          id: "names",
          visible: true,
          order: 0,
          value: "50",
          label: "Names per run",
        },
        {
          id: "extensions",
          visible: true,
          order: 1,
          value: "300+",
          label: "Extensions",
        },
        {
          id: "table",
          visible: true,
          order: 2,
          value: "1 table",
          label: "Shareable result",
        },
      ],
      pricingHeading: "One price list for every name on your list",
      pricingCopy:
        "Filter by what the client is building. Each row shows the first-year promo, the standard renewal and the transfer-in price, so a multi-domain quote takes minutes.",
      faqEyebrow: "Bulk search FAQs",
      faqHeading: "Questions teams ask about bulk checks",
      faqDescription:
        "Straight answers on limits, mixed extensions and multi-domain orders.",
      faqAccordionEyebrow: "Bulk search FAQs",
      faqAccordionHeading: "Common questions",
      faqAccordionDescription:
        "Limits, mixed extensions and registering multiple names in one order.",
      faqs: [
        {
          id: "limit",
          visible: true,
          order: 0,
          question: "How many domains can I check at once?",
          answer:
            "Up to 50 names per run. Paste one domain per line — commas and spaces work too — and every line comes back with its availability, first-year price and renewal rate in a single table.",
        },
        {
          id: "who",
          visible: true,
          order: 1,
          question: "Who is bulk domain search for?",
          answer:
            "Agencies, brand teams and developers who need to clear a shortlist before a launch. Instead of checking names one at a time, you validate a whole naming round in one pass and share the result with your client.",
        },
        {
          id: "mixed",
          visible: true,
          order: 2,
          question: "Can I mix different extensions in one list?",
          answer:
            "Yes. Each line is treated on its own, so you can compare yourbrand.com, yourbrand.io and yourbrand.store together, or check fifty completely different names in the same run.",
        },
        {
          id: "noext",
          visible: true,
          order: 3,
          question: "What if a line has no extension?",
          answer:
            "Lines without an extension default to .com so the list still returns a usable answer. Add the extension you actually want to compare — for example brand.ai — and the result reflects that registry's pricing.",
        },
        {
          id: "renewals",
          visible: true,
          order: 4,
          question: "Do bulk results show renewal prices too?",
          answer:
            "Yes. Every row shows the promotional first-year price and the standard renewal, the same way single search does. A .com is $0.01 for year one and $19.99/yr after that.",
        },
        {
          id: "order",
          visible: true,
          order: 5,
          question: "Can I register several names together?",
          answer:
            "You can add each available name to the cart from the results list and check out in one order. WHOIS privacy, DNS and renewal reminders come with every registration.",
        },
        {
          id: "limits",
          visible: true,
          order: 6,
          question: "Is there a limit on how often I can search?",
          answer:
            "Normal use is unrestricted. Very large automated runs are rate limited to protect registry lookups — if you need programmatic access for thousands of names, contact us about API access.",
        },
      ],
      crossLinkLabel: "Search a single domain",
      crossLinkHelper:
        "Clear the whole shortlist now, then register the winners in one order. Checking just one idea? Use the single domain search.",
    },
  };
}

const CATEGORY_VALUES: TldCategory[] = [
  "popular",
  "business",
  "technology",
  "ecommerce",
  "creative",
];

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function num(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function mergeList<T extends { id: string; visible: boolean; order: number }>(
  stored: unknown,
  defaults: T[],
  mergeItem: (item: Partial<T>, fallback: T, index: number) => T,
): T[] {
  if (!Array.isArray(stored) || stored.length === 0) return defaults;
  return stored
    .map((item, index) => {
      const fallback = defaults[index % defaults.length];
      const partial = (item ?? {}) as Partial<T>;
      return {
        ...mergeItem(partial, fallback, index),
        id: text(partial.id, fallback?.id ?? `item-${index}`),
        visible: partial.visible !== false,
        order: typeof partial.order === "number" ? partial.order : index,
      };
    })
    .sort((a, b) => a.order - b.order);
}

function mergePageCopy(
  stored: Partial<DomainPageCopy> | undefined,
  defaults: DomainPageCopy,
): DomainPageCopy {
  if (!stored) return defaults;
  return {
    ...defaults,
    ...stored,
    seoTitle: text(stored.seoTitle, defaults.seoTitle),
    seoDescription: text(stored.seoDescription, defaults.seoDescription),
    seoKeywords: text(stored.seoKeywords, defaults.seoKeywords),
    ogTitle: text(stored.ogTitle, defaults.ogTitle),
    ogDescription: text(stored.ogDescription, defaults.ogDescription),
    ogImage: text(stored.ogImage, defaults.ogImage),
    eyebrow: text(stored.eyebrow, defaults.eyebrow),
    title: text(stored.title, defaults.title),
    titleAccent: text(stored.titleAccent, defaults.titleAccent),
    description: text(stored.description, defaults.description),
    pricingHeading: text(stored.pricingHeading, defaults.pricingHeading),
    pricingCopy: text(stored.pricingCopy, defaults.pricingCopy),
    faqEyebrow: text(stored.faqEyebrow, defaults.faqEyebrow),
    faqHeading: text(stored.faqHeading, defaults.faqHeading),
    faqDescription: text(stored.faqDescription, defaults.faqDescription),
    faqAccordionEyebrow: text(
      stored.faqAccordionEyebrow,
      defaults.faqAccordionEyebrow,
    ),
    faqAccordionHeading: text(
      stored.faqAccordionHeading,
      defaults.faqAccordionHeading,
    ),
    faqAccordionDescription: text(
      stored.faqAccordionDescription,
      defaults.faqAccordionDescription,
    ),
    crossLinkLabel: text(stored.crossLinkLabel, defaults.crossLinkLabel),
    crossLinkHelper: text(stored.crossLinkHelper, defaults.crossLinkHelper),
    stats: mergeList(stored.stats, defaults.stats, (item, fallback) => ({
      ...fallback,
      value: text(item.value, fallback.value),
      label: text(item.label, fallback.label),
    })),
    faqs: mergeList(stored.faqs, defaults.faqs, (item, fallback) => ({
      ...fallback,
      question: text(item.question, fallback.question),
      answer: text(item.answer, fallback.answer),
    })),
  };
}

export function mergeDomainContent(
  stored?: Partial<DomainContent> | null,
): DomainContent {
  const defaults = defaultDomainContent();
  if (!stored) return defaults;

  const shared: Partial<DomainSharedContent> = stored.shared ?? {};
  const fallback = defaults.shared;

  return {
    shared: {
      ...fallback,
      ...shared,
      heroImage: text(shared.heroImage, fallback.heroImage),
      heroImageAlt: text(shared.heroImageAlt, fallback.heroImageAlt),
      brandImage: text(shared.brandImage, fallback.brandImage),
      brandImageAlt: text(shared.brandImageAlt, fallback.brandImageAlt),
      brandVideo: text(shared.brandVideo, fallback.brandVideo ?? ""),
      transferImage: text(shared.transferImage, fallback.transferImage),
      transferImageAlt: text(
        shared.transferImageAlt,
        fallback.transferImageAlt,
      ),
      heroChips: text(shared.heroChips, fallback.heroChips),
      pricingFootnote: text(shared.pricingFootnote, fallback.pricingFootnote),
      videoEyebrow: text(shared.videoEyebrow, fallback.videoEyebrow),
      videoHeading: text(shared.videoHeading, fallback.videoHeading),
      videoDescription: text(
        shared.videoDescription,
        fallback.videoDescription,
      ),
      videoCtaLabel: text(shared.videoCtaLabel, fallback.videoCtaLabel),
      whyBuyEyebrow: text(shared.whyBuyEyebrow, fallback.whyBuyEyebrow),
      whyBuyHeading: text(shared.whyBuyHeading, fallback.whyBuyHeading),
      whyBuyDescription: text(
        shared.whyBuyDescription,
        fallback.whyBuyDescription,
      ),
      popularHeading: text(shared.popularHeading, fallback.popularHeading),
      popularLinkLabel: text(
        shared.popularLinkLabel,
        fallback.popularLinkLabel,
      ),
      popularLinkHref: text(shared.popularLinkHref, fallback.popularLinkHref),
      showcaseCards: mergeList(
        shared.showcaseCards,
        fallback.showcaseCards,
        (item, base) => ({
          ...base,
          layout: text(
            item.layout,
            base.layout,
          ) as DomainShowcaseCard["layout"],
          title: text(item.title, base.title),
          description: text(item.description, base.description),
          linkLabel: text(item.linkLabel, base.linkLabel),
          linkHref: text(item.linkHref, base.linkHref),
          image: text(item.image, base.image),
          video: text(item.video, base.video ?? ""),
          badge: text(item.badge, base.badge ?? ""),
        }),
      ),
      popularPicks: mergeList(
        shared.popularPicks,
        fallback.popularPicks,
        (item, base) => ({
          ...base,
          tld: text(item.tld, base.tld).startsWith(".")
            ? text(item.tld, base.tld)
            : `.${text(item.tld, base.tld)}`,
          tagline: text(item.tagline, base.tagline),
          image: text(item.image, base.image),
        }),
      ),
      guidePillars: mergeList(
        shared.guidePillars,
        fallback.guidePillars,
        (item, base) => ({
          ...base,
          pillar: text(item.pillar, base.pillar) as DomainGuidePillar["pillar"],
          title: text(item.title, base.title),
          description: text(item.description, base.description),
          linkLabel: text(item.linkLabel, base.linkLabel),
          linkHref: text(item.linkHref, base.linkHref),
          image: text(item.image, base.image),
          video: text(item.video, base.video ?? ""),
        }),
      ),
      includedEyebrow: text(shared.includedEyebrow, fallback.includedEyebrow),
      includedHeading: text(shared.includedHeading, fallback.includedHeading),
      includedDescription: text(
        shared.includedDescription,
        fallback.includedDescription,
      ),
      transferEyebrow: text(shared.transferEyebrow, fallback.transferEyebrow),
      transferHeading: text(shared.transferHeading, fallback.transferHeading),
      transferDescription: text(
        shared.transferDescription,
        fallback.transferDescription,
      ),
      transferSteps: text(shared.transferSteps, fallback.transferSteps),
      transferCtaLabel: text(
        shared.transferCtaLabel,
        fallback.transferCtaLabel,
      ),
      ctaHeading: text(shared.ctaHeading, fallback.ctaHeading),
      ctaEmailLabel: text(shared.ctaEmailLabel, fallback.ctaEmailLabel),
      trust: mergeList(shared.trust, fallback.trust, (item, base) => ({
        ...base,
        title: text(item.title, base.title),
        description: text(item.description, base.description),
        icon: text(item.icon, base.icon),
      })),
      included: mergeList(shared.included, fallback.included, (item, base) => ({
        ...base,
        title: text(item.title, base.title),
        description: text(item.description, base.description),
        icon: text(item.icon, base.icon),
      })),
      scenes: mergeList(shared.scenes, fallback.scenes, (item, base) => ({
        ...base,
        label: text(item.label, base.label),
        caption: text(item.caption, base.caption),
        prompt: text(item.prompt, base.prompt),
        chips: text(item.chips, base.chips),
        image: text(item.image, base.image),
        video: text(item.video, base.video ?? ""),
      })),
      pricing: mergeList(shared.pricing, fallback.pricing, (item, base) => ({
        ...base,
        tld: text(item.tld, base.tld).startsWith(".")
          ? text(item.tld, base.tld)
          : `.${text(item.tld, base.tld)}`,
        register: num(item.register, base.register),
        renew: num(item.renew, base.renew),
        transfer: num(item.transfer, base.transfer),
        note: typeof item.note === "string" ? item.note : base.note,
        categories: Array.isArray(item.categories)
          ? (item.categories.filter((value) =>
              CATEGORY_VALUES.includes(value as TldCategory),
            ) as TldCategory[])
          : base.categories,
      })),
    },
    single: mergePageCopy(stored.single, defaults.single),
    bulk: mergePageCopy(stored.bulk, defaults.bulk),
  };
}

/** Rows ready for the public price table. */
export function visiblePricing(content: DomainContent) {
  return content.shared.pricing
    .filter((row) => row.visible !== false)
    .sort((a, b) => a.order - b.order);
}

export function priceByTld(content: DomainContent, tld: string) {
  return content.shared.pricing.find((row) => row.tld === tld);
}

export function parseLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseChips(value: string) {
  return value
    .split("|")
    .map((chip) => chip.trim())
    .filter(Boolean);
}
