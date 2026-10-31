import { routes } from "@/config/routes";
import { BLOG_BASE, TIPS_BASE } from "@/lib/blog/paths";
import { CASE_STUDIES_BASE } from "@/lib/case-studies/paths";

export const GROWTH_BASE = "/resources/growth";

export const GROWTH_HUB_REVISION = 1;

export type CmsGrowthPlaybookKind = "PLAYBOOK" | "CHECKLIST" | "FRAMEWORK";

export type CmsGrowthPlaybook = {
  id: string;
  visible?: boolean;
  featured?: boolean;
  title: string;
  excerpt: string;
  body?: string;
  category: string;
  kind: CmsGrowthPlaybookKind;
  href?: string;
};

export type CmsGrowthCategory = {
  id: string;
  label: string;
  slug: string;
  visible?: boolean;
};

export type CmsGrowthHubStat = {
  id: string;
  label: string;
  value: string;
};

export type CmsGrowthStage = {
  id: string;
  step: string;
  title: string;
  description: string;
  visible?: boolean;
};

export type CmsGrowthHubFaq = {
  id: string;
  question: string;
  answer: string;
  visible?: boolean;
};

export type CmsGrowthHubPillar = {
  id: string;
  title: string;
  description: string;
  visible?: boolean;
};

export type CmsGrowthHubPageContent = {
  hubRevision?: number;
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
  stats: CmsGrowthHubStat[];
  stagesTitle: string;
  stagesSubtitle: string;
  stages: CmsGrowthStage[];
  categories: CmsGrowthCategory[];
  playbooks: CmsGrowthPlaybook[];
  principlesTitle: string;
  principlesBody: string;
  principlesBodySecondary: string;
  pillars: CmsGrowthHubPillar[];
  faqs: CmsGrowthHubFaq[];
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

export function defaultGrowthHubPageContent(): CmsGrowthHubPageContent {
  return {
    hubRevision: GROWTH_HUB_REVISION,
    seoTitle:
      "HostingBeyond Growth Hub | Scale Your Website, Brand & Revenue Online",
    seoDescription:
      "Actionable growth playbooks for founders and agencies: launch faster on HostingBeyond hosting, domains and business email, improve performance, SEO foundations, conversion and multi-site scale — no fluff, premium guidance in one hub.",
    heroEyebrow: "GROWTH & SCALE PLAYBOOKS",
    heroTitle: "Grow online with",
    heroTitleAccent: "infrastructure that scales",
    heroDescription:
      "Structured playbooks for launching, converting and expanding — built around HostingBeyond hosting, domain registration, professional email, migration and cloud-ready upgrades. No stock photos, just clear steps you can execute this week.",
    heroPrimaryLabel: "Browse playbooks",
    heroPrimaryHref: `${GROWTH_BASE}#playbooks`,
    heroSecondaryLabel: "Read case studies",
    heroSecondaryHref: CASE_STUDIES_BASE,
    introTitle: "From first domain to multi-brand scale — on one platform",
    introBody:
      "The HostingBeyond Growth hub connects strategy to the services you already run here: register and protect domains, host WordPress and ecommerce workloads on NVMe, provision business email that builds trust, and plan cloud upgrades without a rip-and-replace. Each playbook below is written for operators who want measurable progress — faster pages, cleaner DNS, inboxes that deliver, and hosting bills that stay predictable as traffic climbs.",
    introBodySecondary:
      "Use this page alongside Tips & Guides for tactical how-tos, Product Updates for what shipped recently, and Case Studies for proof. Everything here is editable in Orbit so your marketing team can localize copy, add vertical playbooks, or highlight seasonal campaigns without waiting on engineering.",
    stats: [
      { id: "g1", label: "Playbooks", value: "6+" },
      { id: "g2", label: "Focus", value: "Launch → scale" },
      { id: "g3", label: "Stack", value: "Host · domain · mail" },
      { id: "g4", label: "Managed in", value: "Orbit CMS" },
    ],
    stagesTitle: "The four stages of online growth",
    stagesSubtitle:
      "Most teams move through these phases — match playbooks to where you are today.",
    stages: [
      {
        id: "st1",
        step: "01",
        title: "Launch",
        description:
          "Secure your domain, publish a fast site with SSL, and look professional from day one.",
        visible: true,
      },
      {
        id: "st2",
        step: "02",
        title: "Convert",
        description:
          "Tune performance, forms and email so visitors trust you enough to buy or book.",
        visible: true,
      },
      {
        id: "st3",
        step: "03",
        title: "Optimize",
        description:
          "Reduce TTFB, harden security, automate renewals and document runbooks for your team.",
        visible: true,
      },
      {
        id: "st4",
        step: "04",
        title: "Expand",
        description:
          "Add brands, client sites, cloud headroom and agency workflows without tool sprawl.",
        visible: true,
      },
    ],
    categories: [
      { id: "c0", label: "All", slug: "" },
      { id: "c1", label: "Launch", slug: "launch" },
      { id: "c2", label: "Performance", slug: "performance" },
      { id: "c3", label: "Email & trust", slug: "email" },
      { id: "c4", label: "Agency", slug: "agency" },
      { id: "c5", label: "Scale", slug: "scale" },
    ],
    playbooks: [
      {
        id: "pb1",
        visible: true,
        featured: true,
        title: "Launch checklist: domain, hosting and SSL in 48 hours",
        excerpt:
          "Register your name, point DNS, deploy WordPress or a static site, and verify HTTPS before you announce.",
        body: "Start with domain search and privacy where it fits your brand. Pick a hosting plan with NVMe and included SSL. Publish a minimal credible site — about, offer, contact — then add analytics. Document nameservers and renewal dates in one place so launch week is not a DNS fire drill.",
        category: "launch",
        kind: "CHECKLIST",
        href: routes.getStarted,
      },
      {
        id: "pb2",
        visible: true,
        featured: true,
        title: "Core Web Vitals playbook for WordPress stores",
        excerpt:
          "Caching, image discipline, plugin hygiene and hosting tier choices that move LCP and INP in the right direction.",
        body: "Audit plugins and cron load on your current host. Move to NVMe hosting, enable object caching where supported, and strip render-blocking assets on checkout paths. Re-test mobile product pages after DNS settles — performance is a conversion lever, not a vanity metric.",
        category: "performance",
        kind: "PLAYBOOK",
        href: `${routes.hosting}/wordpress`,
      },
      {
        id: "pb3",
        visible: true,
        featured: true,
        title: "Professional email as a growth lever",
        excerpt:
          "Branded mailboxes, SPF/DKIM, and migration patterns that raise reply rates and reduce spam folder risk.",
        body: "Provision mail on your registered domain, migrate founders and support inboxes first, then roll out departments. Pair with Tips articles on DNS records. Customers trust @yourbrand more than free addresses — especially for invoices and support threads.",
        category: "email",
        kind: "FRAMEWORK",
        href: routes.businessEmail,
      },
      {
        id: "pb4",
        visible: true,
        featured: false,
        title: "Agency stack: many sites, one panel",
        excerpt:
          "Standardize WordPress hosting, DNS and renewals so client growth does not multiply logins.",
        body: "Define a single HostingBeyond hosting SKU for new builds, transfer stray domains into one wallet, and use consistent business email for @agency accounts. Document a launch template in Orbit-visible pricing so producers quote hosting with SSL included.",
        category: "agency",
        kind: "PLAYBOOK",
        href: CASE_STUDIES_BASE,
      },
      {
        id: "pb5",
        visible: true,
        featured: false,
        title: "When to step up from shared hosting to cloud",
        excerpt:
          "Signals — traffic spikes, API neighbors, staging needs — and how to plan an on-platform upgrade.",
        body: "Watch sustained CPU, database size and checkout timeouts. Staging on a higher tier before peak season beats emergency migrations. Cloud paths on HostingBeyond keep DNS and mail aligned while you add compute.",
        category: "scale",
        kind: "FRAMEWORK",
        href: routes.cloud,
      },
      {
        id: "pb6",
        visible: true,
        featured: false,
        title: "SEO foundations without an agency retainer",
        excerpt:
          "Technical basics on HostingBeyond: HTTPS, sitemap hygiene, structured pages and fast TTFB.",
        body: "Fix crawl errors, ensure every public route resolves with TLS, and publish helpful Resources content on a schedule. Pair blog and Tips hubs with internal links to product pages — search rewards clarity and speed more than keyword stuffing.",
        category: "launch",
        kind: "CHECKLIST",
        href: TIPS_BASE,
      },
    ],
    principlesTitle: "How we think about growth on HostingBeyond",
    principlesBody:
      "Growth is not a separate product — it is the outcome when domain, hosting, email and support work together. Our playbooks avoid generic motivational copy. They tie each step to services you can buy and manage here, with Orbit-controlled marketing pages when you need to refresh messaging.",
    principlesBodySecondary:
      "We prioritize measurable levers: time-to-first-publish, inbox placement, checkout latency, renewal transparency and support response when campaigns spike. If a playbook references migration or Beyond AI, it is because those capabilities exist in your account today or on a documented upgrade path.",
    pillars: [
      {
        id: "p1",
        title: "Speed is trust",
        description:
          "NVMe hosting and sensible WordPress stacks keep landing pages and checkout snappy on mobile.",
      },
      {
        id: "p2",
        title: "Brand starts at DNS",
        description:
          "Domains, SSL and email on one vendor reduce the gaps where customers lose confidence.",
      },
      {
        id: "p3",
        title: "Operate with clarity",
        description:
          "Renewals, wallets and release notes you can read — no surprise bills when you scale.",
      },
      {
        id: "p4",
        title: "Humans when it breaks",
        description:
          "24/7 support that understands hosting and mail, not ticket ping-pong during your launch.",
      },
    ],
    faqs: [
      {
        id: "f1",
        question: "Is the Growth hub the same as Tips & Guides?",
        answer:
          "Tips are step-by-step tutorials. Growth playbooks are strategic sequences — what to do in which order as you scale — with links into products and Tips where depth is needed.",
      },
      {
        id: "f2",
        question: "Can I edit playbooks and FAQs in Orbit?",
        answer:
          "Yes. Open Orbit → Blog → Growth hub to edit SEO, hero, stages, every playbook, pillars and FAQ. Save to publish instantly on /resources/growth.",
      },
      {
        id: "f3",
        question: "Do I need a developer to use these playbooks?",
        answer:
          "Most launch and email playbooks are designed for founders and marketers with basic DNS access. Technical steps link to Tips articles; support can help on account-specific DNS.",
      },
      {
        id: "f4",
        question: "Are there images on this page?",
        answer:
          "This hub uses a premium typography-and-layout design without stock photos — faster loads and clearer focus on the playbooks themselves.",
      },
      {
        id: "f5",
        question: "Where do I see customer proof?",
        answer:
          "Visit Case Studies for outcomes stories, and Product Updates for platform improvements referenced in scale playbooks.",
      },
    ],
    ctaEyebrow: "Ready to grow",
    ctaTitle: "Put the next playbook into motion",
    ctaDescription:
      "Register your domain, choose hosting, add business email, or talk to us about migration — all on HostingBeyond.",
    ctaPrimaryLabel: "Get started",
    ctaPrimaryHref: routes.getStarted,
    ctaSecondaryLabel: "View pricing",
    ctaSecondaryHref: routes.pricing,
  };
}

export function mergeGrowthHubPageContent(
  stored?: Partial<CmsGrowthHubPageContent> | null,
): CmsGrowthHubPageContent {
  const d = defaultGrowthHubPageContent();
  if (!stored) return d;
  return {
    ...d,
    ...stored,
    stats: stored.stats?.length ? stored.stats : d.stats,
    stages: stored.stages?.length ? stored.stages : d.stages,
    categories: stored.categories?.length ? stored.categories : d.categories,
    playbooks: stored.playbooks?.length ? stored.playbooks : d.playbooks,
    pillars: stored.pillars?.length ? stored.pillars : d.pillars,
    faqs: stored.faqs?.length ? stored.faqs : d.faqs,
  };
}

export function newGrowthPlaybook(): CmsGrowthPlaybook {
  return {
    id: nid(),
    visible: true,
    featured: false,
    title: "",
    excerpt: "",
    body: "",
    category: "launch",
    kind: "PLAYBOOK",
    href: "",
  };
}

export function newGrowthCategory(): CmsGrowthCategory {
  return { id: nid(), label: "Category", slug: "category" };
}

export function newGrowthStat(): CmsGrowthHubStat {
  return { id: nid(), label: "Label", value: "Value" };
}

export function newGrowthStage(): CmsGrowthStage {
  return { id: nid(), step: "00", title: "", description: "" };
}

export function newGrowthFaq(): CmsGrowthHubFaq {
  return { id: nid(), question: "", answer: "" };
}

export function newGrowthPillar(): CmsGrowthHubPillar {
  return { id: nid(), title: "", description: "" };
}

export function growthPlaybookKindLabel(kind: CmsGrowthPlaybookKind) {
  const map: Record<CmsGrowthPlaybookKind, string> = {
    PLAYBOOK: "Playbook",
    CHECKLIST: "Checklist",
    FRAMEWORK: "Framework",
  };
  return map[kind];
}
