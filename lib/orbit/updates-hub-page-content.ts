import { routes } from "@/config/routes";
import { BLOG_BASE, TIPS_BASE } from "@/lib/blog/paths";

export const UPDATES_BASE = "/resources/updates";

export type CmsUpdateKind = "NEW" | "IMPROVEMENT" | "FIX" | "ANNOUNCEMENT";

export type CmsUpdateEntry = {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  body?: string;
  category: string;
  kind: CmsUpdateKind;
  href?: string;
  featured?: boolean;
  visible?: boolean;
};

export type CmsUpdatesCategory = {
  id: string;
  label: string;
  slug: string;
  visible?: boolean;
};

export type CmsUpdatesHubStat = {
  id: string;
  label: string;
  value: string;
};

export type CmsUpdatesHubFaq = {
  id: string;
  question: string;
  answer: string;
  visible?: boolean;
};

export type CmsUpdatesHubPillar = {
  id: string;
  title: string;
  description: string;
  visible?: boolean;
};

export type CmsUpdatesHubPageContent = {
  seoTitle: string;
  seoDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroDescription: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  introTitle: string;
  introBody: string;
  introBodySecondary: string;
  stats: CmsUpdatesHubStat[];
  categories: CmsUpdatesCategory[];
  updates: CmsUpdateEntry[];
  pillars: CmsUpdatesHubPillar[];
  roadmapTitle: string;
  roadmapBody: string;
  faqs: CmsUpdatesHubFaq[];
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

export function defaultUpdatesHubPageContent(): CmsUpdatesHubPageContent {
  return {
    seoTitle: "HostingBeyond Product Updates | Platform, Hosting & Domain News",
    seoDescription:
      "Official HostingBeyond product updates, platform improvements, hosting enhancements, domain tools, security patches and release notes. Stay current with what is new and what changed.",
    heroEyebrow: "PRODUCT & PLATFORM UPDATES",
    heroTitle: "What’s new at",
    heroTitleAccent: "HostingBeyond",
    heroDescription:
      "Release notes, improvements and announcements for hosting, domains, email, billing and the HostingBeyond platform — transparent and easy to follow.",
    heroPrimaryLabel: "View latest updates",
    heroPrimaryHref: `${UPDATES_BASE}#timeline`,
    heroSecondaryLabel: "Read tips & guides",
    heroSecondaryHref: TIPS_BASE,
    introTitle: "Clear release notes for a platform you can trust",
    introBody:
      "The HostingBeyond Updates hub is your official source for product changes. We document meaningful improvements to web hosting, domain services, business email, checkout, Orbit CMS, performance and security so you always know what shipped and why it matters for your websites and workflows.",
    introBodySecondary:
      "Major launches and deep tutorials may also appear on the HostingBeyond blog or Tips hub. This page focuses on concise, factual product updates you can scan in minutes — ideal for agencies, IT teams and founders who want confidence without noise.",
    stats: [
      { id: "u1", label: "Coverage", value: "Platform-wide" },
      { id: "u2", label: "Focus", value: "Shipped changes" },
      { id: "u3", label: "Format", value: "Release notes" },
      { id: "u4", label: "Managed in", value: "Orbit CMS" },
    ],
    categories: [
      { id: "c1", label: "All", slug: "" },
      { id: "c2", label: "Hosting", slug: "hosting" },
      { id: "c3", label: "Domains", slug: "domains" },
      { id: "c4", label: "Platform", slug: "platform" },
      { id: "c5", label: "Security", slug: "security" },
      { id: "c6", label: "Email", slug: "email" },
    ],
    updates: [],
    pillars: [
      {
        id: "p1",
        title: "Hosting & infrastructure",
        description:
          "Performance, uptime, control panel and plan-related improvements.",
      },
      {
        id: "p2",
        title: "Domains & DNS",
        description:
          "Search, registration, transfers, DNS and wallet enhancements.",
      },
      {
        id: "p3",
        title: "Checkout & billing",
        description: "Cart, payments, invoices and account experience updates.",
      },
      {
        id: "p4",
        title: "Security & compliance",
        description: "SSL, auth, abuse prevention and platform hardening.",
      },
    ],
    roadmapTitle: "What to expect next",
    roadmapBody:
      "We publish updates here as features and fixes go live. For how-to guidance after a release, visit Tips & Guides. For broader company news, see the blog.",
    faqs: [
      {
        id: "f1",
        question: "How often is this page updated?",
        answer:
          "Whenever meaningful product changes ship. Entries are added from Orbit so the public page stays accurate.",
      },
      {
        id: "f2",
        question: "Is this the same as the blog?",
        answer:
          "No. Updates are factual release notes. The blog covers editorial stories and longer insights.",
      },
      {
        id: "f3",
        question: "Where can I learn how to use new features?",
        answer:
          "Check the Tips & Guides hub for tutorials, or contact support for account-specific questions.",
      },
    ],
    ctaEyebrow: "Stay ahead",
    ctaTitle: "Build on a platform that keeps improving",
    ctaDescription:
      "Explore hosting plans, register domains and manage your stack with HostingBeyond.",
    ctaPrimaryLabel: "View hosting plans",
    ctaPrimaryHref: routes.hosting,
    ctaSecondaryLabel: "Search domains",
    ctaSecondaryHref: routes.domains,
  };
}

export function mergeUpdatesHubPageContent(
  stored?: Partial<CmsUpdatesHubPageContent> | null,
): CmsUpdatesHubPageContent {
  const d = defaultUpdatesHubPageContent();
  if (!stored) return d;
  return {
    ...d,
    ...stored,
    stats: stored.stats?.length ? stored.stats : d.stats,
    categories: stored.categories?.length ? stored.categories : d.categories,
    updates: stored.updates ?? d.updates,
    pillars: stored.pillars?.length ? stored.pillars : d.pillars,
    faqs: stored.faqs?.length ? stored.faqs : d.faqs,
  };
}

export function newUpdateEntry(): CmsUpdateEntry {
  return {
    id: nid(),
    date: new Date().toISOString().slice(0, 10),
    title: "",
    excerpt: "",
    body: "",
    category: "platform",
    kind: "IMPROVEMENT",
    href: "",
    featured: false,
    visible: true,
  };
}

export function newUpdatesFaq(): CmsUpdatesHubFaq {
  return { id: nid(), question: "", answer: "" };
}

export function updateKindLabel(kind: CmsUpdateKind) {
  const map: Record<CmsUpdateKind, string> = {
    NEW: "New",
    IMPROVEMENT: "Improved",
    FIX: "Fix",
    ANNOUNCEMENT: "Announcement",
  };
  return map[kind];
}
