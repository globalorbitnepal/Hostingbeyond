import { routes } from "@/config/routes";
import { TIPS_BASE, tipsHubPath } from "@/lib/blog/paths";

export type CmsTipsHubPath = {
  id: string;
  title: string;
  description: string;
  href: string;
  visible?: boolean;
};

export type CmsTipsHubFaq = {
  id: string;
  question: string;
  answer: string;
  visible?: boolean;
};

export type CmsTipsHubPillar = {
  id: string;
  title: string;
  description: string;
  categorySlug: string;
  visible?: boolean;
};

export type CmsTipsHubStat = {
  id: string;
  label: string;
  value: string;
};

export type CmsTipsHubPageContent = {
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
  stats: CmsTipsHubStat[];
  learningPaths: CmsTipsHubPath[];
  pillars: CmsTipsHubPillar[];
  faqs: CmsTipsHubFaq[];
  ctaEyebrow: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
};

function id() {
  return Math.random().toString(36).slice(2, 10);
}

export function defaultTipsHubPageContent(): CmsTipsHubPageContent {
  return {
    seoTitle:
      "HostingBeyond Tips & Guides | Hosting, Domains, WordPress & More",
    seoDescription:
      "Practical HostingBeyond tips and guides for web hosting, domains, WordPress, website security, performance, business email, VPS, cloud and SEO. Learn, fix issues and grow with confidence.",
    heroEyebrow: "HOSTINGBEYOND LEARNING HUB",
    heroTitle: "Tips, guides &",
    heroTitleAccent: "how-to resources",
    heroDescription:
      "Practical tutorials for hosting, domains, WordPress, security and performance — written for builders, founders and growing teams.",
    heroPrimaryLabel: "Explore guides",
    heroPrimaryHref: `${TIPS_BASE}#latest-guides`,
    heroSecondaryLabel: "Browse categories",
    heroSecondaryHref: `${TIPS_BASE}#categories`,
    introTitle: "Your knowledge center for a faster, safer website",
    introBody:
      "HostingBeyond Tips is not a generic blog archive. It is a structured learning hub for solving real problems: connecting domains, improving WordPress performance, securing SSL, configuring DNS, choosing hosting and scaling with VPS or cloud. Every guide is designed to help you learn quickly, apply confidently and discover the right HostingBeyond products when you are ready.",
    introBodySecondary:
      "Whether you are launching your first site, migrating from another host or troubleshooting email delivery, bookmark this page and search by topic. New guides are published from Orbit when our team marks content as Tip / Guide.",
    stats: [
      { id: "s1", label: "Topics covered", value: "15+" },
      { id: "s2", label: "Focus", value: "How-to & fixes" },
      { id: "s3", label: "Built for", value: "Real workflows" },
      { id: "s4", label: "Updated", value: "Regularly" },
    ],
    learningPaths: [
      {
        id: "lp1",
        title: "Launch a website",
        description: "Hosting, domains and first-time setup.",
        href: tipsHubPath({ category: "hosting" }),
      },
      {
        id: "lp2",
        title: "WordPress mastery",
        description: "Setup, security, speed and maintenance.",
        href: tipsHubPath({ category: "wordpress" }),
      },
      {
        id: "lp3",
        title: "Domains & DNS",
        description: "Transfers, records and renewals.",
        href: tipsHubPath({ category: "domains" }),
      },
      {
        id: "lp4",
        title: "Security & SSL",
        description: "Protect accounts, sites and visitors.",
        href: tipsHubPath({ category: "security" }),
      },
    ],
    pillars: [
      {
        id: "p1",
        title: "Web hosting",
        description:
          "Understand plans, performance, uptime and when to upgrade.",
        categorySlug: "hosting",
      },
      {
        id: "p2",
        title: "Domains",
        description: "Registration, DNS, transfers and renewal best practices.",
        categorySlug: "domains",
      },
      {
        id: "p3",
        title: "WordPress",
        description: "Install, optimize, secure and troubleshoot WordPress.",
        categorySlug: "wordpress",
      },
      {
        id: "p4",
        title: "Website performance",
        description: "Speed, caching, images and Core Web Vitals basics.",
        categorySlug: "performance",
      },
      {
        id: "p5",
        title: "Business email",
        description: "Professional email, deliverability and DNS records.",
        categorySlug: "business-email",
      },
      {
        id: "p6",
        title: "VPS & cloud",
        description: "When to scale beyond shared hosting.",
        categorySlug: "vps",
      },
    ],
    faqs: [
      {
        id: "f1",
        question:
          "What is the difference between Tips and the HostingBeyond Blog?",
        answer:
          "The blog shares editorial news and insights. Tips are practical how-to guides, troubleshooting articles and step-by-step tutorials focused on helping you solve problems.",
      },
      {
        id: "f2",
        question: "How often are new guides published?",
        answer:
          "We add guides when topics are ready in Orbit. Bookmark this hub or subscribe to the newsletter for updates.",
      },
      {
        id: "f3",
        question: "Can I request a topic?",
        answer:
          "Yes — contact our team or explore hosting and domain pages to see which products match your goal.",
      },
    ],
    ctaEyebrow: "Ready to build something better?",
    ctaTitle: "Reliable hosting, domains & business tools",
    ctaDescription:
      "Put what you learn into action with HostingBeyond — fast hosting, domain search and business email in one place.",
    ctaPrimaryLabel: "View hosting plans",
    ctaPrimaryHref: routes.hosting,
    ctaSecondaryLabel: "Search your domain",
    ctaSecondaryHref: routes.domains,
  };
}

export function mergeTipsHubPageContent(
  stored?: Partial<CmsTipsHubPageContent> | null,
): CmsTipsHubPageContent {
  const d = defaultTipsHubPageContent();
  if (!stored) return d;
  return {
    ...d,
    ...stored,
    stats: stored.stats?.length ? stored.stats : d.stats,
    learningPaths: stored.learningPaths?.length
      ? stored.learningPaths
      : d.learningPaths,
    pillars: stored.pillars?.length ? stored.pillars : d.pillars,
    faqs: stored.faqs?.length ? stored.faqs : d.faqs,
  };
}

export function newTipsHubPath(): CmsTipsHubPath {
  return { id: id(), title: "", description: "", href: TIPS_BASE };
}

export function newTipsHubPillar(): CmsTipsHubPillar {
  return { id: id(), title: "", description: "", categorySlug: "hosting" };
}

export function newTipsHubFaq(): CmsTipsHubFaq {
  return { id: id(), question: "", answer: "" };
}
