import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

export type CmsAboutFact = {
  id: string;
  visible?: boolean;
  label: string;
  value: string;
};

export type CmsAboutStat = {
  id: string;
  visible?: boolean;
  label: string;
  value: string;
  hint?: string;
};

export type CmsAboutValue = {
  id: string;
  title: string;
  description: string;
  icon?: "shield" | "scale" | "handshake" | "spark" | "gauge" | "compass";
  visible?: boolean;
};

export type CmsAboutProduct = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon?: "hosting" | "domains" | "email" | "cloud" | "migration" | "ai" | "ssl";
  visible?: boolean;
};

export type CmsAboutMilestone = {
  id: string;
  year: string;
  title: string;
  description: string;
  visible?: boolean;
};

export type CmsAboutTeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl?: string;
  visible?: boolean;
};

export type CmsAboutTrustItem = {
  id: string;
  title: string;
  description: string;
  visible?: boolean;
};

export type CmsAboutGovernanceItem = {
  id: string;
  title: string;
  description: string;
  visible?: boolean;
};

export type CmsAboutFaq = {
  id: string;
  question: string;
  answer: string;
  visible?: boolean;
};

export type CmsAboutPageContent = {
  seoTitle: string;
  seoDescription: string;

  /* Hero */
  heroEyebrow: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroDescription: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  heroBullets: string[];
  heroGuarantee: string;

  /* Company identity card */
  companyLegalName: string;
  companyEntityType: string;
  companyFoundedLine: string;
  headquartersLine: string;
  servingLine: string;
  heroCardTitle: string;
  heroCardNote: string;
  heroCardFacts: CmsAboutFact[];

  /* Stats */
  statsHeading: string;
  statsIntro: string;
  stats: CmsAboutStat[];

  /* Mission / vision */
  missionTitle: string;
  missionBody: string;
  missionPoints: string[];
  visionTitle: string;
  visionBody: string;
  visionPoints: string[];

  /* USA */
  usaEyebrow: string;
  usaTitle: string;
  usaBody: string;
  usaBodySecondary: string;
  usaFacts: CmsAboutFact[];
  usaBullets: string[];

  /* Story */
  storyTitle: string;
  storyIntro: string;
  storyParagraphs: string[];
  storyBody: string;
  storyBodySecondary: string;
  storyHighlights: string[];

  /* Principles / values */
  valuesEyebrow: string;
  valuesTitle: string;
  valuesIntro: string;
  values: CmsAboutValue[];

  /* Products */
  productsEyebrow: string;
  productsTitle: string;
  productsIntro: string;
  products: CmsAboutProduct[];

  /* Differentiators */
  trustEyebrow: string;
  trustTitle: string;
  trustIntro: string;
  trustItems: CmsAboutTrustItem[];

  /* Governance */
  governanceTitle: string;
  governanceIntro: string;
  governanceItems: CmsAboutGovernanceItem[];
  governanceFootnote: string;

  /* Milestones */
  milestonesTitle: string;
  milestonesIntro: string;
  milestones: CmsAboutMilestone[];

  /* Legal entity */
  legalEyebrow: string;
  legalTitle: string;
  legalIntro: string;
  legalEntityName: string;
  legalEntityType: string;
  legalRegisteredLine: string;
  legalAddressLines: string[];
  legalContactEmail: string;
  legalContactPhone: string;
  legalWebsite: string;
  legalNotes: string[];

  /* Support promise */
  supportTitle: string;
  supportBody: string;
  supportBullets: string[];
  supportCtaLabel: string;
  supportCtaHref: string;

  /* Team */
  teamSectionTitle: string;
  teamSectionIntro: string;
  team: CmsAboutTeamMember[];

  /* Commitment */
  commitmentEyebrow: string;
  commitmentTitle: string;
  commitmentBody: string;
  commitmentSignature: string;

  /* FAQ */
  faqEyebrow: string;
  faqTitle: string;
  faqIntro: string;
  faqs: CmsAboutFaq[];

  /* CTA */
  ctaEyebrow: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
};

function nid() {
  return Math.random().toString(36).slice(2, 10);
}

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function lines(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value
    .filter((row): row is string => typeof row === "string")
    .map((row) => row.trim())
    .filter(Boolean);
  return cleaned.length ? cleaned : fallback;
}

function mergeList<T extends { id: string; visible?: boolean }>(
  defaults: T[],
  stored: T[] | undefined | null,
  merge: (item: Partial<T>, base: T) => T,
): T[] {
  if (!Array.isArray(stored) || stored.length === 0) return defaults;
  const byId = new Map(defaults.map((row) => [row.id, row]));
  return stored.map((row, index) => {
    const partial = (row ?? {}) as Partial<T>;
    const fallback =
      (partial.id ? byId.get(partial.id) : undefined) ??
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

export function defaultAboutPageContent(): CmsAboutPageContent {
  return {
    seoTitle:
      "About HostingBeyond LLC | USA-Based Hosting, Domains & Cloud Company",
    seoDescription:
      "HostingBeyond LLC is a United States–based technology company building premium web hosting, domain registration, business email, SSL and cloud infrastructure for businesses worldwide.",

    heroEyebrow: "ABOUT HOSTING BEYOND LLC",
    heroTitle: "A United States company behind",
    heroTitleAccent: "your entire online presence",
    heroDescription:
      "HostingBeyond LLC is an American technology company delivering premium web hosting, domain registration, business email, SSL certificates and cloud infrastructure to founders, agencies and growing businesses in more than 40 countries — with transparent pricing, security-first engineering and support from real engineers.",
    heroPrimaryLabel: "Explore our platform",
    heroPrimaryHref: routes.hosting,
    heroSecondaryLabel: "Talk to our team",
    heroSecondaryHref: routes.contact,
    heroBullets: [
      "Registered United States limited liability company (LLC)",
      "One account for hosting, domains, email, SSL and cloud",
      "Security-first infrastructure with automated backups and patching",
      "Human support on every plan — no ticket black holes",
    ],
    heroGuarantee:
      "Transparent billing · Documented renewals · 30-day money-back guarantee on eligible plans",

    companyLegalName: "HOSTING BEYOND LLC",
    companyEntityType: "Limited Liability Company (LLC)",
    companyFoundedLine: "Serving customers since 2024",
    headquartersLine: "Headquartered in the United States",
    servingLine: "Serving customers in 40+ countries",
    heroCardTitle: "Company at a glance",
    heroCardNote:
      "HOSTING BEYOND LLC operates the HostingBeyond platform and all related hosting, domain and cloud services.",
    heroCardFacts: [
      {
        id: "entity",
        visible: true,
        label: "Legal entity",
        value: "HOSTING BEYOND LLC",
      },
      {
        id: "country",
        visible: true,
        label: "Country of registration",
        value: "United States",
      },
      {
        id: "business",
        visible: true,
        label: "Business focus",
        value: "Web hosting, domains, email, cloud",
      },
      {
        id: "support",
        visible: true,
        label: "Customer support",
        value: "24/7 ticket coverage",
      },
    ],

    statsHeading: "The company in numbers",
    statsIntro:
      "We build for longevity: stable infrastructure, predictable billing and a platform that keeps improving.",
    stats: [
      {
        id: "s1",
        visible: true,
        label: "Headquarters",
        value: "USA",
        hint: "United States–registered LLC",
      },
      {
        id: "s2",
        visible: true,
        label: "Products",
        value: "7",
        hint: "Hosting, domains, email, SSL, cloud and more",
      },
      {
        id: "s3",
        visible: true,
        label: "Support",
        value: "24/7",
        hint: "Coverage every day of the year",
      },
      {
        id: "s4",
        visible: true,
        label: "Uptime target",
        value: "99.99%",
        hint: "Monitored infrastructure",
      },
    ],

    missionTitle: "Our mission",
    missionBody:
      "Make professional-grade infrastructure accessible to every business — from a first-time site owner publishing a portfolio to an agency running dozens of client environments. We build products that are fast to launch, simple to operate and dependable under real production traffic.",
    missionPoints: [
      "Remove the operational complexity that keeps good ideas offline",
      "Price every product so the total cost is knowable before checkout",
      "Keep humans in the support loop instead of hiding behind automation",
    ],
    visionTitle: "Our vision",
    visionBody:
      "A web where any organization — regardless of size or geography — can compete online with infrastructure it genuinely trusts. HostingBeyond exists to be the long-term partner behind that growth: one platform for the domain, the site, the inbox and the certificate.",
    visionPoints: [
      "One account, one invoice, one place to manage everything online",
      "Engineering decisions that prioritize uptime over feature noise",
      "A platform that stays fast and accurate as it grows",
    ],

    usaEyebrow: "UNITED STATES COMPANY",
    usaTitle: "Built on American business standards, serving the world",
    usaBody:
      "HostingBeyond LLC operates as a United States–based company with a global customer base. Our commercial practices, documentation and security posture follow U.S. expectations for transparency, data handling and customer care — while our infrastructure is distributed so your visitors get fast responses wherever they are.",
    usaBodySecondary:
      "Customers in North America, Europe, Asia, Africa and Latin America receive the same commitments: clear product communication, stable billing, documented renewals and support that treats your uptime as seriously as you do.",
    usaFacts: [
      {
        id: "usa-entity",
        visible: true,
        label: "Entity",
        value: "HOSTING BEYOND LLC",
      },
      {
        id: "usa-type",
        visible: true,
        label: "Structure",
        value: "Limited Liability Company",
      },
      {
        id: "usa-jurisdiction",
        visible: true,
        label: "Jurisdiction",
        value: "United States",
      },
      {
        id: "usa-reach",
        visible: true,
        label: "Customer reach",
        value: "40+ countries",
      },
    ],
    usaBullets: [
      "U.S. contract terms and transparent renewal disclosure",
      "Data handling practices documented for procurement reviews",
      "Support coverage across U.S., European and Asia-Pacific hours",
      "Invoices and receipts suitable for business accounting",
    ],

    storyTitle: "Why we built HostingBeyond",
    storyIntro:
      "The hosting industry trained customers to expect confusion: teaser pricing, hidden renewal jumps, support queues and dashboards that never quite explain what you are paying for.",
    storyParagraphs: [
      "HostingBeyond started from a simple observation: growing businesses do not need ten vendors, they need one accountable partner. Domains bought in one place, hosting in another, email somewhere else and certificates bolted on months later — every handoff was a chance for something to break quietly.",
      "So we built the opposite. A single platform where a domain, its hosting, its inbox and its certificate are managed together, with billing that matches what the website actually advertises. When a plan renews, the price on your invoice is the price you read on the page.",
      "As a United States limited liability company, we hold ourselves to the standards our customers are audited against: documented processes, security-conscious engineering, clear terms and support that can explain a decision rather than deflect it.",
      "Today the platform spans web hosting, WordPress and ecommerce hosting, cloud and VPS infrastructure, domain registration and transfer, business email, SSL certificates and website migration tooling — all operated by the same team, in the same account, under the same support promise.",
      "We are still early in that mission. Every release is measured against one question: does this make it easier for a real business to stay online and grow?",
    ],
    storyBody: "",
    storyBodySecondary: "",
    storyHighlights: [
      "One accountable vendor for domain, hosting, email and SSL",
      "Renewal pricing disclosed before purchase, not after",
      "Security and backups treated as baseline, never as an upsell",
    ],

    valuesEyebrow: "HOW WE OPERATE",
    valuesTitle: "Principles we do not trade away",
    valuesIntro:
      "These are the operating rules behind every product decision, support reply and pricing page on HostingBeyond.",
    values: [
      {
        id: "v1",
        visible: true,
        title: "Reliability before features",
        description:
          "Uptime, backups, monitoring and patching are not premium add-ons. If a feature threatens stability, it waits until stability is proven.",
        icon: "shield",
      },
      {
        id: "v2",
        visible: true,
        title: "Clarity over hype",
        description:
          "Readable pricing, documented renewals and honest release notes. If a number is not on the page, it does not belong on the invoice.",
        icon: "scale",
      },
      {
        id: "v3",
        visible: true,
        title: "Real partnership",
        description:
          "We succeed when your sites stay fast, your domains stay yours and your team stays focused on growth instead of infrastructure.",
        icon: "handshake",
      },
      {
        id: "v4",
        visible: true,
        title: "Security by default",
        description:
          "Encrypted traffic, least-privilege access and hardened defaults on every plan — because breaches do not care about plan tiers.",
        icon: "compass",
      },
      {
        id: "v5",
        visible: true,
        title: "Continuous improvement",
        description:
          "Performance work, platform upgrades and customer feedback shape the roadmap every single month.",
        icon: "gauge",
      },
      {
        id: "v6",
        visible: true,
        title: "Human accountability",
        description:
          "Every ticket has a person behind it who can explain what happened, what changed and what happens next.",
        icon: "spark",
      },
    ],

    productsEyebrow: "THE PLATFORM",
    productsTitle: "Everything your business needs to be online",
    productsIntro:
      "One brand, one account, one support team — across the full stack of products a growing business actually uses.",
    products: [
      {
        id: "p1",
        visible: true,
        title: "Web hosting",
        description:
          "NVMe-powered hosting for WordPress, custom PHP apps and content sites, with free SSL and daily backups.",
        href: routes.hosting,
        icon: "hosting",
      },
      {
        id: "p2",
        visible: true,
        title: "Domain registration",
        description:
          "Search, register, transfer and manage domains with transparent renewal pricing and free WHOIS privacy where available.",
        href: routes.domains,
        icon: "domains",
      },
      {
        id: "p3",
        visible: true,
        title: "Business email",
        description:
          "Professional mailboxes on your own domain with spam protection, sync across devices and migration help.",
        href: routes.businessEmail,
        icon: "email",
      },
      {
        id: "p4",
        visible: true,
        title: "Cloud & VPS",
        description:
          "Dedicated vCPU and RAM when shared hosting is no longer enough, with full root access on VPS plans.",
        href: routes.cloud,
        icon: "cloud",
      },
      {
        id: "p5",
        visible: true,
        title: "SSL certificates",
        description:
          "Free automated SSL on every plan, plus premium DV, wildcard and multi-domain certificates with warranties.",
        href: "/web-hosting/ssl",
        icon: "ssl",
      },
      {
        id: "p6",
        visible: true,
        title: "Website migration",
        description:
          "Guided moves from other hosts — files, databases and email — with checks before DNS is switched.",
        href: routes.websiteMigration,
        icon: "migration",
      },
      {
        id: "p7",
        visible: true,
        title: "Beyond AI",
        description:
          "AI-assisted site building and content tooling for teams that want to ship faster without losing quality.",
        href: routes.beyondAi,
        icon: "ai",
      },
    ],

    trustEyebrow: "WHY CUSTOMERS STAY",
    trustTitle: "Enterprise habits at a small-business scale",
    trustIntro:
      "We are not the cheapest host and we do not pretend to be. We are the one that answers, documents and stays stable.",
    trustItems: [
      {
        id: "t1",
        visible: true,
        title: "Security-conscious platform",
        description:
          "Encrypted traffic, hardened defaults, isolated accounts and ongoing patching across hosting, billing and admin surfaces.",
      },
      {
        id: "t2",
        visible: true,
        title: "Performance engineering",
        description:
          "NVMe storage, modern runtimes, caching-friendly configuration and monitoring-minded operations instead of marketing benchmarks.",
      },
      {
        id: "t3",
        visible: true,
        title: "Support with context",
        description:
          "Your ticket reaches someone who can read the logs, explain the cause and tell you what was changed.",
      },
      {
        id: "t4",
        visible: true,
        title: "Transparent billing",
        description:
          "Renewal rates are published next to introductory rates, and upgrades never silently change your term.",
      },
      {
        id: "t5",
        visible: true,
        title: "Migration without drama",
        description:
          "Guided moves with staging checks so DNS cutovers do not become all-night debugging sessions.",
      },
      {
        id: "t6",
        visible: true,
        title: "Products that fit together",
        description:
          "Domain, hosting, email and SSL in one account — one invoice, one place to ask for help.",
      },
    ],

    governanceTitle: "Security, privacy and compliance posture",
    governanceIntro:
      "We treat customer data as a liability we are trusted with, not an asset we monetize. These are the controls that shape how the platform is built and operated.",
    governanceItems: [
      {
        id: "g1",
        visible: true,
        title: "Encryption everywhere",
        description:
          "TLS on every public endpoint, encrypted credential storage and no plaintext secrets in logs or dashboards.",
      },
      {
        id: "g2",
        visible: true,
        title: "Least-privilege access",
        description:
          "Administrative interfaces require strong authentication and are separated from customer-facing surfaces.",
      },
      {
        id: "g3",
        visible: true,
        title: "Backups and recovery",
        description:
          "Scheduled backups with documented restore paths, so a bad deployment or deletion is recoverable rather than fatal.",
      },
      {
        id: "g4",
        visible: true,
        title: "Data minimization",
        description:
          "We collect what is needed to deliver and support the service, and we do not sell customer data.",
      },
    ],
    governanceFootnote:
      "Specific contractual, data-processing or procurement documentation can be requested from our team before you purchase.",

    milestonesTitle: "How the platform grew",
    milestonesIntro:
      "A short history of what we shipped, in the order customers asked for it.",
    milestones: [
      {
        id: "m1",
        visible: true,
        year: "2024",
        title: "HostingBeyond LLC founded",
        description:
          "The company is established in the United States with a clear mandate: one accountable platform for domains, hosting and email.",
      },
      {
        id: "m2",
        visible: true,
        year: "2024",
        title: "Hosting and domain platform launched",
        description:
          "NVMe web hosting, WordPress and ecommerce plans ship alongside domain search, registration and transfer.",
      },
      {
        id: "m3",
        visible: true,
        year: "2025",
        title: "Business email and wallet billing",
        description:
          "Professional mailboxes on customer domains, plus wallet-based billing and invoice history for business accounting.",
      },
      {
        id: "m4",
        visible: true,
        year: "2025",
        title: "SSL, migration and cloud expansion",
        description:
          "Premium SSL certificates, guided website migration and dedicated cloud/VPS infrastructure join the platform.",
      },
      {
        id: "m5",
        visible: true,
        year: "2026",
        title: "Orbit platform and Beyond AI",
        description:
          "An in-house content and operations platform powers the public site, while Beyond AI adds assisted building and copy tooling.",
      },
    ],

    legalEyebrow: "COMPANY INFORMATION",
    legalTitle: "Who you are doing business with",
    legalIntro:
      "HostingBeyond is operated by HOSTING BEYOND LLC, a United States limited liability company. These details identify the contracting entity for orders, invoices and support.",
    legalEntityName: "HOSTING BEYOND LLC",
    legalEntityType: "Limited Liability Company",
    legalRegisteredLine: "Registered in the United States",
    legalAddressLines: ["HOSTING BEYOND LLC", "United States"],
    legalContactEmail: "support@theglobalorbit.com",
    legalContactPhone: "Available through your account support area",
    legalWebsite: "hosting.theglobalorbit.com",
    legalNotes: [
      "Invoices are issued by HOSTING BEYOND LLC and include the registered entity name.",
      "Contract terms, renewals and cancellations follow the published service agreement.",
      "Requests for tax, procurement or vendor documentation can be sent to our support team.",
    ],

    supportTitle: "Support is part of the product",
    supportBody:
      "Infrastructure problems rarely happen at convenient times. Our support model is built around that reality: predictable response windows, engineers who can act, and follow-through instead of deflection.",
    supportBullets: [
      "Coverage every day, including weekends and public holidays",
      "Documented escalation path for outages and billing disputes",
      "Migration and DNS guidance included on eligible plans",
      "Status communication when an incident affects your service",
    ],
    supportCtaLabel: "Contact support",
    supportCtaHref: routes.contact,

    teamSectionTitle: "The people behind the platform",
    teamSectionIntro:
      "We publish real team profiles only when people have agreed to be listed. HostingBeyond does not display placeholder faces or invented biographies.",
    team: [],

    commitmentEyebrow: "OUR COMMITMENT",
    commitmentTitle: "A long-term relationship, not a one-time checkout",
    commitmentBody:
      "We treat every account as a relationship we intend to keep. That means documenting changes before they ship, improving self-service resources, publishing renewals clearly and investing continuously in the products you depend on every day.",
    commitmentSignature: "— The HostingBeyond team",

    faqEyebrow: "QUESTIONS WE GET OFTEN",
    faqTitle: "About the company",
    faqIntro:
      "Straight answers about who we are, how we bill and how to reach us.",
    faqs: [
      {
        id: "f1",
        visible: true,
        question: "Where is HostingBeyond based?",
        answer:
          "HostingBeyond is operated by HOSTING BEYOND LLC, a limited liability company registered in the United States. Our platform serves customers worldwide, and our contractual and billing practices follow U.S. business standards.",
      },
      {
        id: "f2",
        visible: true,
        question: "What exactly does HostingBeyond sell?",
        answer:
          "Web hosting (including WordPress and ecommerce plans), domain registration and transfer, business email, SSL certificates, cloud and VPS infrastructure, website migration services and Beyond AI tooling — all managed from one customer account.",
      },
      {
        id: "f3",
        visible: true,
        question: "How does billing and renewal work?",
        answer:
          "Prices are shown before purchase, including renewal rates after any introductory term. Renewals are invoiced at the published rate for the term you selected, and invoices are available in your account for accounting purposes.",
      },
      {
        id: "f4",
        visible: true,
        question: "Do you own my domain if I register it with you?",
        answer:
          "No. Domains registered through HostingBeyond are registered in your name, and you retain control of the registration. You can transfer away at any time using the standard authorization code process.",
      },
      {
        id: "f5",
        visible: true,
        question: "How do I reach support?",
        answer:
          "Use the contact page or the support area inside your customer account. Support requests are handled by people who can access the relevant systems, investigate and explain what happened.",
      },
      {
        id: "f6",
        visible: true,
        question: "Can you provide vendor or procurement documentation?",
        answer:
          "Yes. Requests for company details, tax information, security questionnaires or vendor forms can be sent to our team before or after purchase and are handled case by case.",
      },
    ],

    ctaEyebrow: "WORK WITH HOSTING BEYOND LLC",
    ctaTitle: "Start with a domain or a hosting plan",
    ctaDescription:
      "Join the businesses and agencies that trust HostingBeyond for the foundation of their online presence — with clear pricing and real support from day one.",
    ctaPrimaryLabel: "View hosting plans",
    ctaPrimaryHref: routes.hosting,
    ctaSecondaryLabel: "Search domains",
    ctaSecondaryHref: routes.domains,
  };
}

export function mergeAboutPageContent(
  stored?: Partial<CmsAboutPageContent> | null,
): CmsAboutPageContent {
  const d = defaultAboutPageContent();
  if (!stored) return d;

  return {
    ...d,
    seoTitle: text(stored.seoTitle, d.seoTitle),
    seoDescription: text(stored.seoDescription, d.seoDescription),

    heroEyebrow: text(stored.heroEyebrow, d.heroEyebrow),
    heroTitle: text(stored.heroTitle, d.heroTitle),
    heroTitleAccent: text(stored.heroTitleAccent, d.heroTitleAccent),
    heroDescription: text(stored.heroDescription, d.heroDescription),
    heroPrimaryLabel: text(stored.heroPrimaryLabel, d.heroPrimaryLabel),
    heroPrimaryHref: text(stored.heroPrimaryHref, d.heroPrimaryHref),
    heroSecondaryLabel: text(stored.heroSecondaryLabel, d.heroSecondaryLabel),
    heroSecondaryHref: text(stored.heroSecondaryHref, d.heroSecondaryHref),
    heroBullets: lines(stored.heroBullets, d.heroBullets),
    heroGuarantee: text(stored.heroGuarantee, d.heroGuarantee),

    companyLegalName: text(stored.companyLegalName, d.companyLegalName),
    companyEntityType: text(stored.companyEntityType, d.companyEntityType),
    companyFoundedLine: text(stored.companyFoundedLine, d.companyFoundedLine),
    headquartersLine: text(stored.headquartersLine, d.headquartersLine),
    servingLine: text(stored.servingLine, d.servingLine),
    heroCardTitle: text(stored.heroCardTitle, d.heroCardTitle),
    heroCardNote: text(stored.heroCardNote, d.heroCardNote),
    heroCardFacts: mergeList(
      d.heroCardFacts,
      stored.heroCardFacts,
      (item, base) => ({
        ...base,
        label: text(item.label, base.label),
        value: text(item.value, base.value),
      }),
    ),

    statsHeading: text(stored.statsHeading, d.statsHeading),
    statsIntro: text(stored.statsIntro, d.statsIntro),
    stats: mergeList(d.stats, stored.stats, (item, base) => ({
      ...base,
      label: text(item.label, base.label),
      value: text(item.value, base.value),
      hint: text(item.hint, base.hint ?? ""),
    })),

    missionTitle: text(stored.missionTitle, d.missionTitle),
    missionBody: text(stored.missionBody, d.missionBody),
    missionPoints: lines(stored.missionPoints, d.missionPoints),
    visionTitle: text(stored.visionTitle, d.visionTitle),
    visionBody: text(stored.visionBody, d.visionBody),
    visionPoints: lines(stored.visionPoints, d.visionPoints),

    usaEyebrow: text(stored.usaEyebrow, d.usaEyebrow),
    usaTitle: text(stored.usaTitle, d.usaTitle),
    usaBody: text(stored.usaBody, d.usaBody),
    usaBodySecondary: text(stored.usaBodySecondary, d.usaBodySecondary),
    usaFacts: mergeList(d.usaFacts, stored.usaFacts, (item, base) => ({
      ...base,
      label: text(item.label, base.label),
      value: text(item.value, base.value),
    })),
    usaBullets: lines(stored.usaBullets, d.usaBullets),

    storyTitle: text(stored.storyTitle, d.storyTitle),
    storyIntro: text(stored.storyIntro, d.storyIntro),
    storyParagraphs: lines(stored.storyParagraphs, d.storyParagraphs),
    storyBody: text(stored.storyBody, d.storyBody),
    storyBodySecondary: text(stored.storyBodySecondary, d.storyBodySecondary),
    storyHighlights: lines(stored.storyHighlights, d.storyHighlights),

    valuesEyebrow: text(stored.valuesEyebrow, d.valuesEyebrow),
    valuesTitle: text(stored.valuesTitle, d.valuesTitle),
    valuesIntro: text(stored.valuesIntro, d.valuesIntro),
    values: mergeList(d.values, stored.values, (item, base) => ({
      ...base,
      title: text(item.title, base.title),
      description: text(item.description, base.description),
      icon: (item.icon ?? base.icon) as CmsAboutValue["icon"],
    })),

    productsEyebrow: text(stored.productsEyebrow, d.productsEyebrow),
    productsTitle: text(stored.productsTitle, d.productsTitle),
    productsIntro: text(stored.productsIntro, d.productsIntro),
    products: mergeList(d.products, stored.products, (item, base) => ({
      ...base,
      title: text(item.title, base.title),
      description: text(item.description, base.description),
      href: text(item.href, base.href),
      icon: (item.icon ?? base.icon) as CmsAboutProduct["icon"],
    })),

    trustEyebrow: text(stored.trustEyebrow, d.trustEyebrow),
    trustTitle: text(stored.trustTitle, d.trustTitle),
    trustIntro: text(stored.trustIntro, d.trustIntro),
    trustItems: mergeList(d.trustItems, stored.trustItems, (item, base) => ({
      ...base,
      title: text(item.title, base.title),
      description: text(item.description, base.description),
    })),

    governanceTitle: text(stored.governanceTitle, d.governanceTitle),
    governanceIntro: text(stored.governanceIntro, d.governanceIntro),
    governanceItems: mergeList(
      d.governanceItems,
      stored.governanceItems,
      (item, base) => ({
        ...base,
        title: text(item.title, base.title),
        description: text(item.description, base.description),
      }),
    ),
    governanceFootnote: text(stored.governanceFootnote, d.governanceFootnote),

    milestonesTitle: text(stored.milestonesTitle, d.milestonesTitle),
    milestonesIntro: text(stored.milestonesIntro, d.milestonesIntro),
    milestones: mergeList(d.milestones, stored.milestones, (item, base) => ({
      ...base,
      year: text(item.year, base.year),
      title: text(item.title, base.title),
      description: text(item.description, base.description),
    })),

    legalEyebrow: text(stored.legalEyebrow, d.legalEyebrow),
    legalTitle: text(stored.legalTitle, d.legalTitle),
    legalIntro: text(stored.legalIntro, d.legalIntro),
    legalEntityName: text(stored.legalEntityName, d.legalEntityName),
    legalEntityType: text(stored.legalEntityType, d.legalEntityType),
    legalRegisteredLine: text(
      stored.legalRegisteredLine,
      d.legalRegisteredLine,
    ),
    legalAddressLines: lines(stored.legalAddressLines, d.legalAddressLines),
    legalContactEmail: text(stored.legalContactEmail, d.legalContactEmail),
    legalContactPhone: text(stored.legalContactPhone, d.legalContactPhone),
    legalWebsite: text(stored.legalWebsite, d.legalWebsite),
    legalNotes: lines(stored.legalNotes, d.legalNotes),

    supportTitle: text(stored.supportTitle, d.supportTitle),
    supportBody: text(stored.supportBody, d.supportBody),
    supportBullets: lines(stored.supportBullets, d.supportBullets),
    supportCtaLabel: text(stored.supportCtaLabel, d.supportCtaLabel),
    supportCtaHref: text(stored.supportCtaHref, d.supportCtaHref),

    teamSectionTitle: text(stored.teamSectionTitle, d.teamSectionTitle),
    teamSectionIntro: text(stored.teamSectionIntro, d.teamSectionIntro),
    team: Array.isArray(stored.team) ? stored.team : d.team,

    commitmentEyebrow: text(stored.commitmentEyebrow, d.commitmentEyebrow),
    commitmentTitle: text(stored.commitmentTitle, d.commitmentTitle),
    commitmentBody: text(stored.commitmentBody, d.commitmentBody),
    commitmentSignature: text(
      stored.commitmentSignature,
      d.commitmentSignature,
    ),

    faqEyebrow: text(stored.faqEyebrow, d.faqEyebrow),
    faqTitle: text(stored.faqTitle, d.faqTitle),
    faqIntro: text(stored.faqIntro, d.faqIntro),
    faqs: mergeList(d.faqs, stored.faqs, (item, base) => ({
      ...base,
      question: text(item.question, base.question),
      answer: text(item.answer, base.answer),
    })),

    ctaEyebrow: text(stored.ctaEyebrow, d.ctaEyebrow),
    ctaTitle: text(stored.ctaTitle, d.ctaTitle),
    ctaDescription: text(stored.ctaDescription, d.ctaDescription),
    ctaPrimaryLabel: text(stored.ctaPrimaryLabel, d.ctaPrimaryLabel),
    ctaPrimaryHref: text(stored.ctaPrimaryHref, d.ctaPrimaryHref),
    ctaSecondaryLabel: text(stored.ctaSecondaryLabel, d.ctaSecondaryLabel),
    ctaSecondaryHref: text(stored.ctaSecondaryHref, d.ctaSecondaryHref),
  };
}

export const ABOUT_LEGAL_FALLBACK = {
  name: "HOSTING BEYOND LLC",
  country: "United States",
  site: siteConfig.name,
};

export function newAboutValue(): CmsAboutValue {
  return { id: nid(), title: "", description: "", visible: true };
}

export function newAboutMilestone(): CmsAboutMilestone {
  return { id: nid(), year: "", title: "", description: "", visible: true };
}

export function newAboutTeamMember(): CmsAboutTeamMember {
  return { id: nid(), name: "", role: "", bio: "", visible: true };
}

export function newAboutFaq(): CmsAboutFaq {
  return { id: nid(), question: "", answer: "", visible: true };
}

export function newAboutFact(): CmsAboutFact {
  return { id: nid(), label: "", value: "", visible: true };
}

export function newAboutProduct(): CmsAboutProduct {
  return {
    id: nid(),
    title: "",
    description: "",
    href: routes.hosting,
    visible: true,
  };
}

export function newAboutTrustItem(): CmsAboutTrustItem {
  return { id: nid(), title: "", description: "", visible: true };
}

export function newAboutGovernanceItem(): CmsAboutGovernanceItem {
  return { id: nid(), title: "", description: "", visible: true };
}
