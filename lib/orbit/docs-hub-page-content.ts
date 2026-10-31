import { routes } from "@/config/routes";
import { TIPS_BASE } from "@/lib/blog/paths";
import { siteConfig } from "@/config/site";

export const DOCS_BASE = "/resources/docs";

export const DOCS_HUB_REVISION = 1;

export type CmsDocArticleKind = "OVERVIEW" | "REFERENCE" | "GUIDE";

export type CmsDocBullet = {
  id: string;
  text: string;
};

export type CmsDocArticle = {
  id: string;
  visible?: boolean;
  featured?: boolean;
  title: string;
  excerpt: string;
  body: string;
  bullets: CmsDocBullet[];
  category: string;
  kind: CmsDocArticleKind;
  href?: string;
};

export type CmsDocsCategory = {
  id: string;
  label: string;
  slug: string;
  visible?: boolean;
};

export type CmsDocsHubStat = {
  id: string;
  label: string;
  value: string;
};

export type CmsDocsScopeArea = {
  id: string;
  step: string;
  title: string;
  description: string;
  visible?: boolean;
};

export type CmsDocsHubFaq = {
  id: string;
  question: string;
  answer: string;
  visible?: boolean;
};

export type CmsDocsHubPillar = {
  id: string;
  title: string;
  description: string;
  visible?: boolean;
};

export type CmsDocsHubPageContent = {
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
  stats: CmsDocsHubStat[];
  scopeTitle: string;
  scopeSubtitle: string;
  scopeAreas: CmsDocsScopeArea[];
  categories: CmsDocsCategory[];
  articles: CmsDocArticle[];
  standardsTitle: string;
  standardsBody: string;
  standardsBodySecondary: string;
  pillars: CmsDocsHubPillar[];
  faqs: CmsDocsHubFaq[];
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

function bullet(text: string): CmsDocBullet {
  return { id: nid(), text };
}

export function defaultDocsHubPageContent(): CmsDocsHubPageContent {
  const site = siteConfig.url.replace(/\/$/, "");
  return {
    hubRevision: DOCS_HUB_REVISION,
    seoTitle:
      "HostingBeyond Documentation | Platform, Domains, Hosting, Email & Account Guide",
    seoDescription:
      "Official HostingBeyond product documentation: domain search and DNS, web hosting and cloud, business email checkout, customer account portal, Orbit CMS, billing and resources — audited reference for teams and customers.",
    heroEyebrow: "OFFICIAL PRODUCT DOCUMENTATION",
    heroTitle: "HostingBeyond",
    heroTitleAccent: "platform docs",
    heroDescription:
      "Professional reference for everything on hosting.theglobalorbit.com — marketing pages, checkout flows, account tools, Orbit CMS and resources. Written for founders, agencies and support staff who need accurate, long-form detail in one place.",
    heroPrimaryLabel: "Browse documentation",
    heroPrimaryHref: `${DOCS_BASE}#documentation`,
    heroSecondaryLabel: "Contact support",
    heroSecondaryHref: routes.contact,
    introTitle: "What this documentation covers",
    introBody:
      "HostingBeyond is a unified hosting and domains platform: search and register domains (including bulk search and transfers), purchase shared and specialized web hosting (WordPress, ecommerce, Python, reseller, cloud and VPS entry points), provision business email with premium checkout, migrate websites, and manage subscriptions from a signed-in customer account with wallet, invoices and domain DNS tools. Public marketing content is editable in Orbit; this docs hub describes how those pieces fit together on the current product surface.",
    introBodySecondary:
      "These articles are maintained in Orbit under Documentation hub. They are not a substitute for legal terms — see Privacy, Terms and Refund under /legal — but they explain routes, capabilities and expected customer journeys. For tutorials, use Tips & Guides; for release notes, use Product Updates.",
    stats: [
      { id: "d1", label: "Doc sections", value: "12+" },
      { id: "d2", label: "Site areas", value: "4" },
      { id: "d3", label: "Primary URL", value: "hosting.theglobalorbit.com" },
      { id: "d4", label: "CMS", value: "Orbit" },
    ],
    scopeTitle: "Site map at a glance",
    scopeSubtitle:
      "Four zones customers and staff navigate on the live property.",
    scopeAreas: [
      {
        id: "sc1",
        step: "01",
        title: "Marketing & catalog",
        description:
          "Home, pricing, product pages (hosting, domains, email, cloud, migration, Beyond AI), about and contact.",
        visible: true,
      },
      {
        id: "sc2",
        step: "02",
        title: "Checkout & cart",
        description:
          "Domain get-started flow, cart, hosting checkout, business email checkout — Stripe-backed billing shell.",
        visible: true,
      },
      {
        id: "sc3",
        step: "03",
        title: "Customer account",
        description:
          "Dashboard, orders, hosting orders, invoices, wallet, my domains, DNS and security settings.",
        visible: true,
      },
      {
        id: "sc4",
        step: "04",
        title: "Orbit & resources",
        description:
          "Orbit admin CMS, blog, tips, updates, case studies, growth and this documentation hub.",
        visible: true,
      },
    ],
    categories: [
      { id: "c0", label: "All", slug: "" },
      { id: "c1", label: "Platform", slug: "platform" },
      { id: "c2", label: "Domains", slug: "domains" },
      { id: "c3", label: "Hosting", slug: "hosting" },
      { id: "c4", label: "Email", slug: "email" },
      { id: "c5", label: "Account", slug: "account" },
      { id: "c6", label: "Orbit", slug: "orbit" },
    ],
    articles: [
      {
        id: "doc-platform",
        visible: true,
        featured: true,
        title: "Platform overview and primary routes",
        excerpt:
          "HostingBeyond public site structure, brand positioning and canonical URLs for navigation and SEO.",
        body: `HostingBeyond (${site}) is a premium domains, hosting and business email provider with NVMe infrastructure, transparent pricing and 24/7 support. Core routes include home (/), domain search (/domain-name-search), bulk search, domain transfer, web hosting (/web-hosting) with WordPress, ecommerce, Python and reseller variants, cloud hosting, VPS landing pages, business email, website migration, Beyond AI, pricing, signup/login and the resources cluster. Customer authentication gates /account and sub-routes for wallet, orders, hosting orders, invoices, billing, my-domains and security. Orbit under /orbit lets administrators edit page content, products, domains pricing, blog and resource hubs.`,
        bullets: [
          bullet(
            "Single brand HostingBeyond — tagline Beyond Hosting, Beyond Possibilities",
          ),
          bullet(
            "Public canonical host hosting.theglobalorbit.com behind Nginx to the Node app",
          ),
          bullet(
            "Marketing pages load CMS sections from Orbit pageContent with revalidation tags",
          ),
        ],
        category: "platform",
        kind: "OVERVIEW",
        href: routes.home,
      },
      {
        id: "doc-domains",
        visible: true,
        featured: true,
        title: "Domains: search, registration, transfer and DNS",
        excerpt:
          "Domain discovery, premium checkout, wallet balances and account DNS management.",
        body: "Domain Name Search and Bulk Domain Search query availability across supported TLDs with retail pricing from Orbit catalogues and supplier sync. Get Started (/get-started) and the cart (/cart) implement premium checkout for registration. Domain Transfer (/domain-transfer) covers inbound moves. Signed-in users manage domains under Account → My Domains with DNS editing, nameserver updates and renewals via wallet or card where enabled.",
        bullets: [
          bullet(
            "Orbit: Domains, Domain pricing, Domain orders, reconciliation, services",
          ),
          bullet("Account: /account/my-domains and per-domain detail"),
          bullet("Wallet: /account/wallet for eligible checkout balance"),
        ],
        category: "domains",
        kind: "GUIDE",
        href: routes.domains,
      },
      {
        id: "doc-hosting",
        visible: true,
        featured: true,
        title: "Web hosting, cloud and specialized stacks",
        excerpt:
          "Shared hosting through WordPress, ecommerce, Python, reseller, cloud and VPS pages.",
        body: "Web Hosting (/web-hosting) is the primary catalog with plans in Orbit → Hosting products. Specialized URLs include WordPress, ecommerce, Python, reseller, cloud (/cloud-hosting) and VPS marketing routes. Hosting checkout (/checkout/hosting) uses stepped plan, add-on and payment flows aligned with domain checkout styling. Provisioning connects orders to hosting product records; status appears in account hosting orders.",
        bullets: [
          bullet("Checkout: /checkout/hosting"),
          bullet("Account: /account/hosting-orders"),
          bullet("Orbit: Hosting products, add-ons, migration requests"),
        ],
        category: "hosting",
        kind: "REFERENCE",
        href: routes.hosting,
      },
      {
        id: "doc-email",
        visible: true,
        featured: false,
        title: "Business Email (HostingBeyond Mail)",
        excerpt:
          "Marketing, plan comparison, premium checkout and Orbit-editable reviews.",
        body: "Business Email (/business-email) presents mailbox plans and migration value. Checkout lives at /checkout/business-email (plan term, domain, add-ons, payment). Orbit → Business Email controls copy and customer reviews (?tab=reviews). Tips supplement SPF, DKIM and mailbox setup.",
        bullets: [
          bullet("Checkout: /checkout/business-email"),
          bullet("Orbit: /orbit/business-email"),
        ],
        category: "email",
        kind: "GUIDE",
        href: routes.businessEmail,
      },
      {
        id: "doc-account",
        visible: true,
        featured: false,
        title: "Customer account portal",
        excerpt: "Orders, billing, domains, wallet and security after login.",
        body: "Login (/login) and signup (/signup) access /account with orders, hosting orders, invoices (PDF APIs), billing, wallet, my-domains and security settings. Public order IDs support safe support references.",
        bullets: [
          bullet("Invoices: /account/invoices"),
          bullet("Security: /account/security"),
        ],
        category: "account",
        kind: "REFERENCE",
        href: routes.account,
      },
      {
        id: "doc-checkout",
        visible: true,
        featured: false,
        title: "Checkout and payments (customer view)",
        excerpt:
          "Cart, get-started, hosting and email checkouts with Stripe and wallets.",
        body: "Domain flows use search → get-started or cart → payment. Hosting and email use dedicated checkout URLs with step UI and coupon fields where present. Stripe webhooks reconcile payments server-side; customers see outcomes in account orders. Secrets stay in server .env only.",
        bullets: [
          bullet("Cart: /cart"),
          bullet("Orbit: Invoices and wallet adjust for admins"),
        ],
        category: "platform",
        kind: "GUIDE",
        href: routes.domainCheckout,
      },
      {
        id: "doc-orbit",
        visible: true,
        featured: false,
        title: "Orbit CMS — content and operations",
        excerpt: "Admin console for pages, products, blog, hubs and settings.",
        body: "Orbit (/orbit) requires admin auth. Modules cover Content, SEO, Pricing, Domains, Hosting, Email, Beyond AI, Migration, About, Contact, Blog, resource hub editors, Media, Languages, Navigation, Orders, Invoices, Wallets and Settings. Saves revalidate orbit-content for fast public updates.",
        bullets: [
          bullet("Resource hubs: Tips, Updates, Case studies, Growth, Docs"),
          bullet(
            "Deploy production via GitHub Actions — not manual file edits",
          ),
        ],
        category: "orbit",
        kind: "REFERENCE",
        href: "/orbit",
      },
      {
        id: "doc-resources",
        visible: true,
        featured: false,
        title: "Resources: blog, tips, updates, case studies, growth, docs",
        excerpt: "Editorial and reference content under /resources/*.",
        body: "Resources index links Updates, Tips, Blog (RSS), Case studies, Growth playbooks and Documentation. Each hub is Orbit-editable with SEO and FAQ schema where applicable.",
        bullets: [
          bullet("Tips: /resources/tips"),
          bullet("Blog RSS: /resources/blog/rss.xml"),
        ],
        category: "platform",
        kind: "OVERVIEW",
        href: routes.resources,
      },
      {
        id: "doc-beyond-ai",
        visible: true,
        featured: false,
        title: "Beyond AI product surface",
        excerpt: "AI workspace marketing and checkout routes.",
        body: "Beyond AI (/beyond-ai) with Orbit copy and checkout under /beyond-ai/checkout when billing features are enabled.",
        bullets: [bullet("Orbit: /orbit/beyond-ai")],
        category: "platform",
        kind: "GUIDE",
        href: routes.beyondAi,
      },
      {
        id: "doc-migration",
        visible: true,
        featured: false,
        title: "Website migration service",
        excerpt: "Assisted migration marketing and Orbit requests queue.",
        body: "Website Migration (/website-migration) explains assistance tiers; Orbit → Migration requests tracks operational follow-up.",
        bullets: [bullet("Orbit: /orbit/website-migration")],
        category: "hosting",
        kind: "GUIDE",
        href: routes.websiteMigration,
      },
      {
        id: "doc-legal",
        visible: true,
        featured: false,
        title: "Legal and policies",
        excerpt: "Privacy, terms, refund and contact.",
        body: "Legal at /legal/privacy, /legal/terms, /legal/refund. Contact at /contact. Documentation is informational; contracts are in legal pages only.",
        bullets: [bullet("About: /about")],
        category: "platform",
        kind: "REFERENCE",
        href: "/legal/terms",
      },
      {
        id: "doc-support",
        visible: true,
        featured: false,
        title: "Support and self-service",
        excerpt: "When to use account tools, Tips, updates or contact.",
        body: "Check Product Updates for changes, Tips for how-tos, account for order IDs, Contact for human help. Orbit supports admin investigation of orders and invoices.",
        bullets: [
          bullet("Contact: /contact"),
          bullet("Updates: /resources/updates"),
        ],
        category: "account",
        kind: "GUIDE",
        href: routes.contact,
      },
    ],
    standardsTitle: "Documentation standards on HostingBeyond",
    standardsBody:
      "Articles prioritize accurate routes and customer-visible behavior. When product changes ship, update the matching doc article and note it on Product Updates.",
    standardsBodySecondary:
      "Do not publish secrets or API keys in Orbit docs. Increment hubRevision in code when defaults should resync to production CMS.",
    pillars: [
      {
        id: "p1",
        title: "Route accuracy",
        description:
          "Paths align with config/routes.ts and the live Next.js app.",
      },
      {
        id: "p2",
        title: "Orbit as copy source",
        description:
          "Marketing text lives in Orbit; docs explain structure and flows.",
      },
      {
        id: "p3",
        title: "Plain language",
        description:
          "Describe what visitors and signed-in users can accomplish.",
      },
      {
        id: "p4",
        title: "Safe operations",
        description: "Production updates via approved deploy pipeline only.",
      },
    ],
    faqs: [
      {
        id: "f1",
        question: "Is this the same as Tips & Guides?",
        answer:
          "No. Tips are step-by-step tutorials. This hub is a structured product reference audited against the live site.",
      },
      {
        id: "f2",
        question: "Can I edit documentation in Orbit?",
        answer:
          "Yes. Orbit → Blog → Documentation hub — full edit of SEO, articles, scope map, FAQ and CTA. Save to publish on /resources/docs.",
      },
      {
        id: "f3",
        question: "How often should docs be updated?",
        answer:
          "After customer-visible route, checkout or account changes; add a Product Update entry for major revisions.",
      },
      {
        id: "f4",
        question: "Where are legal policies?",
        answer: "Under /legal/privacy, /legal/terms and /legal/refund.",
      },
      {
        id: "f5",
        question: "Are API keys documented here?",
        answer: "No. Configure secrets only in server environment variables.",
      },
    ],
    ctaEyebrow: "Need human help?",
    ctaTitle: "Talk to HostingBeyond support or sales",
    ctaDescription:
      "Contact for account questions. Tips for how-tos. This hub for the full platform picture.",
    ctaPrimaryLabel: "Contact us",
    ctaPrimaryHref: routes.contact,
    ctaSecondaryLabel: "Open Tips hub",
    ctaSecondaryHref: TIPS_BASE,
  };
}

export function mergeDocsHubPageContent(
  stored?: Partial<CmsDocsHubPageContent> | null,
): CmsDocsHubPageContent {
  const d = defaultDocsHubPageContent();
  if (!stored) return d;
  return {
    ...d,
    ...stored,
    stats: stored.stats?.length ? stored.stats : d.stats,
    scopeAreas: stored.scopeAreas?.length ? stored.scopeAreas : d.scopeAreas,
    categories: stored.categories?.length ? stored.categories : d.categories,
    articles: stored.articles?.length ? stored.articles : d.articles,
    pillars: stored.pillars?.length ? stored.pillars : d.pillars,
    faqs: stored.faqs?.length ? stored.faqs : d.faqs,
  };
}

export function newDocArticle(): CmsDocArticle {
  return {
    id: nid(),
    visible: true,
    featured: false,
    title: "",
    excerpt: "",
    body: "",
    bullets: [],
    category: "platform",
    kind: "GUIDE",
    href: "",
  };
}

export function newDocBullet(): CmsDocBullet {
  return { id: nid(), text: "" };
}

export function newDocsCategory(): CmsDocsCategory {
  return { id: nid(), label: "Category", slug: "category" };
}

export function newDocsStat(): CmsDocsHubStat {
  return { id: nid(), label: "Label", value: "Value" };
}

export function newDocsScopeArea(): CmsDocsScopeArea {
  return { id: nid(), step: "00", title: "", description: "" };
}

export function newDocsFaq(): CmsDocsHubFaq {
  return { id: nid(), question: "", answer: "" };
}

export function newDocsPillar(): CmsDocsHubPillar {
  return { id: nid(), title: "", description: "" };
}

export function docArticleKindLabel(kind: CmsDocArticleKind) {
  const map: Record<CmsDocArticleKind, string> = {
    OVERVIEW: "Overview",
    REFERENCE: "Reference",
    GUIDE: "Guide",
  };
  return map[kind];
}
