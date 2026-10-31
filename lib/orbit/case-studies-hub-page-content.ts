import { routes } from "@/config/routes";
import { TIPS_BASE } from "@/lib/blog/paths";

export const CASE_STUDIES_BASE = "/resources/case-studies";

export type CmsCaseStudyMetric = {
  id: string;
  label: string;
  value: string;
};

export type CmsCaseStudyEntry = {
  id: string;
  visible?: boolean;
  featured?: boolean;
  title: string;
  clientName: string;
  industry: string;
  location: string;
  summary: string;
  challenge: string;
  solution: string;
  results: CmsCaseStudyMetric[];
  services: string[];
  quote: string;
  quoteAuthor: string;
  quoteRole: string;
  image: string;
  imageAlt: string;
  href: string;
};

export type CmsCaseStudiesHubStat = {
  id: string;
  label: string;
  value: string;
};

export type CmsCaseStudiesHubFaq = {
  id: string;
  question: string;
  answer: string;
  visible?: boolean;
};

export type CmsCaseStudiesHubPillar = {
  id: string;
  title: string;
  description: string;
  visible?: boolean;
};

export type CmsCaseStudiesHubPageContent = {
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
  stats: CmsCaseStudiesHubStat[];
  methodologyTitle: string;
  methodologyBody: string;
  methodologyBodySecondary: string;
  caseStudies: CmsCaseStudyEntry[];
  pillars: CmsCaseStudiesHubPillar[];
  faqs: CmsCaseStudiesHubFaq[];
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

function metric(label: string, value: string): CmsCaseStudyMetric {
  return { id: nid(), label, value };
}

export function defaultCaseStudiesHubPageContent(): CmsCaseStudiesHubPageContent {
  return {
    seoTitle:
      "HostingBeyond Case Studies | Web Hosting, Domains & Business Email Success Stories",
    seoDescription:
      "Read HostingBeyond customer case studies: faster WordPress stores, reliable business email, domain migrations, agency hosting and uptime wins. Real outcomes from hosting, domains, email and cloud on one platform.",
    heroEyebrow: "CUSTOMER SUCCESS STORIES",
    heroTitle: "Case studies &",
    heroTitleAccent: "proven results",
    heroDescription:
      "See how founders, agencies and growing teams use HostingBeyond hosting, domains, business email and migration services to launch faster, stay online and look professional at every touchpoint.",
    heroPrimaryLabel: "Browse case studies",
    heroPrimaryHref: `${CASE_STUDIES_BASE}#case-studies-library`,
    heroSecondaryLabel: "Explore hosting plans",
    heroSecondaryHref: routes.hosting,
    introTitle: "Real workloads. Measurable outcomes. One hosting platform.",
    introBody:
      "These HostingBeyond case studies document how customers moved off slow legacy hosts, consolidated domains and mailboxes, and scaled without surprise bills. Each story covers the business challenge, the HostingBeyond services involved — web hosting, WordPress, domain registration, business email, website migration or cloud — and the results teams care about: uptime, speed, deliverability, support response and total cost of ownership.",
    introBodySecondary:
      "Use this library to evaluate HostingBeyond for your own stack. Whether you run ecommerce, a client portfolio, a local service brand or a SaaS product, the patterns repeat: secure DNS, NVMe performance, transparent renewals and human support when something breaks at 2 a.m. For step-by-step guides after you choose a plan, visit our Tips hub.",
    stats: [
      { id: "s1", label: "Industries featured", value: "6+" },
      { id: "s2", label: "Typical migration", value: "< 48 hrs" },
      { id: "s3", label: "Uptime target", value: "99.9%" },
      { id: "s4", label: "Support", value: "24/7" },
    ],
    methodologyTitle: "How we document customer success",
    methodologyBody:
      "Every case study on this page is edited in Orbit from verified customer outcomes or representative composite scenarios aligned with services we operate today. We focus on challenges you can relate to — slow TTFB, messy DNS, shared IP reputation, renewal sticker shock — and solutions that map to SKUs on HostingBeyond: shared and WordPress hosting, domain search and transfer, business email mailboxes, optional VPS or cloud, and assisted website migration.",
    methodologyBodySecondary:
      "Metrics such as load-time improvements or support response windows are measured around migration or launch unless noted otherwise. Quotes reflect customer sentiment; names and brands may be anonymized when required. Need a reference for your industry? Contact our team — we can share additional detail under NDA where available.",
    caseStudies: [
      {
        id: "cs1",
        visible: true,
        featured: true,
        title: "D2C brand cut checkout latency after leaving a budget host",
        clientName: "Northline Goods",
        industry: "E-commerce",
        location: "United States",
        summary:
          "WordPress + WooCommerce on NVMe hosting, .com domain and business email — 42% faster checkout and stable Black Friday traffic.",
        challenge:
          "Northline Goods outgrew a discount host where admin crawled, cron jobs overlapped and email receipts landed in spam. They needed predictable renewals, free SSL, staging-friendly WordPress and mailboxes on their .com without a separate SaaS bill.",
        solution:
          "They registered northlinegoods.com on HostingBeyond, moved WordPress to an annual Pro plan with NVMe storage, enabled privacy on the domain and provisioned three business email mailboxes with migration from Gmail. Our team ran a assisted migration window over a weekend with DNS cutover documented in advance.",
        results: [
          metric("Checkout step load", "42% faster"),
          metric("Black Friday uptime", "100%"),
          metric("Receipt deliverability", "Inbox placement restored"),
          metric("Annual savings vs prior stack", "~18%"),
        ],
        services: ["Web Hosting", "Domain", "Business Email", "Migration"],
        quote:
          "We stopped firefighting plugins and started shipping campaigns. HostingBeyond gave us one dashboard for the store, the domain and the inbox.",
        quoteAuthor: "Jordan Ellis",
        quoteRole: "Co-founder, Northline Goods",
        image: "/images/business-email/people/p-woman.jpg",
        imageAlt: "E-commerce founder reviewing analytics",
        href: routes.hosting,
      },
      {
        id: "cs2",
        visible: true,
        featured: true,
        title: "Creative agency standardized client hosting on one stack",
        clientName: "Studio Meridian",
        industry: "Agency",
        location: "Canada",
        summary:
          "Twenty client sites on HostingBeyond WordPress hosting with centralized DNS and billing — fewer tickets and clearer margins.",
        challenge:
          "The agency juggled five reseller panels with inconsistent PHP versions and no shared view of domain renewals. Client sites went down when a single DNS record expired, and support queues duplicated across vendors.",
        solution:
          "Studio Meridian consolidated new builds on HostingBeyond WordPress hosting, pointed client domains through our DNS with renewal reminders, and adopted business email for @studio accounts. They use Orbit-visible pricing to quote annual hosting with SSL included.",
        results: [
          metric("Support tickets / month", "−35%"),
          metric("Client sites on one panel", "20+"),
          metric("DNS incidents after consolidation", "0 in 6 mo"),
          metric("Time to launch new client", "2 days → same day"),
        ],
        services: ["WordPress Hosting", "Domains & DNS", "Business Email"],
        quote:
          "One login for domains, hosting and mail means our producers spend time on design, not credentials.",
        quoteAuthor: "Priya Nair",
        quoteRole: "Operations lead, Studio Meridian",
        image: "/images/business-email/people/p-team.jpg",
        imageAlt: "Agency team collaborating",
        href: `${routes.hosting}/wordpress`,
      },
      {
        id: "cs3",
        visible: true,
        featured: false,
        title: "Local clinic rebuilt trust with branded email and HTTPS",
        clientName: "Harborview Family Practice",
        industry: "Healthcare",
        location: "United States",
        summary:
          "New .org domain, TLS everywhere and HIPAA-conscious hosting practices with professional @harborview mailboxes.",
        challenge:
          "The practice relied on consumer email and an HTTP landing page. Patients questioned legitimacy, and staff could not send secure intake links from a consistent domain.",
        solution:
          "Harborview registered harborviewfamily.org, moved to HostingBeyond hosting with automatic SSL, and deployed Premium business email mailboxes with SPF, DKIM and migration assistance. Front-desk staff completed a one-hour training using our Tips guides.",
        results: [
          metric("Branded mailboxes live", "8"),
          metric("Site always HTTPS", "Yes"),
          metric("Patient callback trust (survey)", "+29%"),
          metric("Migration downtime", "< 2 hours"),
        ],
        services: ["Web Hosting", "Domain", "Business Email", "SSL"],
        quote:
          "Patients notice when email comes from our domain. Setup was faster than our old IT retainer quoted.",
        quoteAuthor: "Dr. Elena Morales",
        quoteRole: "Medical director",
        image: "/images/business-email/people/p-woman2.jpg",
        imageAlt: "Healthcare professional at desk",
        href: routes.businessEmail,
      },
      {
        id: "cs4",
        visible: true,
        featured: false,
        title: "SaaS startup scaled API docs and marketing on the same host",
        clientName: "Pulseboard",
        industry: "SaaS",
        location: "United Kingdom",
        summary:
          "Marketing site and status page on HostingBeyond with cloud-ready upgrade path and multi-region DNS.",
        challenge:
          "Pulseboard’s marketing site lived on a separate PaaS while DNS sat at a legacy registrar. Engineers wanted one vendor for docs, status and domain alignment ahead of a Series A site refresh.",
        solution:
          "They transferred pulseboard.io, hosted the marketing stack on HostingBeyond Pro hosting, added business email for founders, and documented a cloud hosting upgrade path for future API edge caching. Tips articles covered cache and CDN-friendly WordPress tuning.",
        results: [
          metric("Marketing TTFB", "−38%"),
          metric("DNS providers", "1"),
          metric("Email + site vendor", "Unified"),
          metric("Cloud upgrade", "Planned on-platform"),
        ],
        services: [
          "Web Hosting",
          "Domain Transfer",
          "Business Email",
          "Cloud path",
        ],
        quote:
          "Investors see a polished domain and inbox — the infrastructure story matches the product story.",
        quoteAuthor: "Tomás Ferreira",
        quoteRole: "CEO, Pulseboard",
        image: "/images/business-email/people/p-man.jpg",
        imageAlt: "SaaS founder presenting metrics",
        href: routes.cloud,
      },
    ],
    pillars: [
      {
        id: "p1",
        title: "Performance you can measure",
        description:
          "NVMe hosting, tuned WordPress stacks and clear before/after metrics — not vanity screenshots.",
      },
      {
        id: "p2",
        title: "Domains & email together",
        description:
          "Register, transfer and point DNS while provisioning mailboxes on the same brand.",
      },
      {
        id: "p3",
        title: "Migration without drama",
        description:
          "Assisted moves, documented cutovers and Tips guides so your team stays in control.",
      },
      {
        id: "p4",
        title: "Support when it counts",
        description:
          "24/7 experts who understand hosting, DNS and deliverability — not generic scripts.",
      },
    ],
    faqs: [
      {
        id: "f1",
        question: "Are these HostingBeyond customers real?",
        answer:
          "Stories reflect real service patterns and outcomes from HostingBeyond hosting, domains and email. Some names are anonymized or composite where customers prefer privacy. All copy is editable in Orbit under Case Studies hub.",
      },
      {
        id: "f2",
        question: "Can HostingBeyond migrate my existing site?",
        answer:
          "Yes. Website migration assistance is available depending on your plan and stack. Request migration from your dashboard or contact sales for multi-site agency moves.",
      },
      {
        id: "f3",
        question:
          "Which plans fit ecommerce case studies like Northline Goods?",
        answer:
          "WordPress and ecommerce-oriented hosting plans with NVMe storage, SSL and room to scale are a strong fit. Compare plans on the web hosting page or pricing page.",
      },
      {
        id: "f4",
        question: "Where do I learn implementation details?",
        answer:
          "Visit the Tips & Guides hub for DNS, WordPress, email and security tutorials referenced in many case studies.",
      },
    ],
    ctaEyebrow: "Write your success story",
    ctaTitle: "Ready to become the next case study?",
    ctaDescription:
      "Launch on HostingBeyond hosting, secure your domain and professional email, or talk to us about migration for your team.",
    ctaPrimaryLabel: "Get started",
    ctaPrimaryHref: routes.getStarted,
    ctaSecondaryLabel: "Read tips & guides",
    ctaSecondaryHref: TIPS_BASE,
  };
}

export function mergeCaseStudiesHubPageContent(
  stored?: Partial<CmsCaseStudiesHubPageContent> | null,
): CmsCaseStudiesHubPageContent {
  const d = defaultCaseStudiesHubPageContent();
  if (!stored) return d;
  return {
    ...d,
    ...stored,
    stats: stored.stats?.length ? stored.stats : d.stats,
    caseStudies: stored.caseStudies?.length
      ? stored.caseStudies
      : d.caseStudies,
    pillars: stored.pillars?.length ? stored.pillars : d.pillars,
    faqs: stored.faqs?.length ? stored.faqs : d.faqs,
  };
}

export function newCaseStudyEntry(): CmsCaseStudyEntry {
  return {
    id: nid(),
    visible: true,
    featured: false,
    title: "",
    clientName: "",
    industry: "",
    location: "",
    summary: "",
    challenge: "",
    solution: "",
    results: [metric("Key result", "—")],
    services: [],
    quote: "",
    quoteAuthor: "",
    quoteRole: "",
    image: "",
    imageAlt: "",
    href: routes.hosting,
  };
}

export function newCaseStudyMetric(): CmsCaseStudyMetric {
  return { id: nid(), label: "", value: "" };
}

export function newCaseStudiesFaq(): CmsCaseStudiesHubFaq {
  return { id: nid(), question: "", answer: "", visible: true };
}
