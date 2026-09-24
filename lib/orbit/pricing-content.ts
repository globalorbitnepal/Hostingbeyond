import {
  aiAgentPlans,
  aiBuilderPlans,
  businessEmailCatalogPlans,
  vpsPlans,
} from "@/config/pricing-plans";
import { routes } from "@/config/routes";

import type { CmsFaqItem, CmsHostingPlan } from "./defaults";

export type PricingCategoryId =
  | "websites"
  | "ecommerce"
  | "domains"
  | "ai-builder"
  | "vps"
  | "ai-agents"
  | "business-email";

export type CmsPricingHighlight = {
  id: string;
  visible: boolean;
  order: number;
  title: string;
  description: string;
  icon:
    | "zap"
    | "shield"
    | "globe"
    | "sparkles"
    | "cart"
    | "mail"
    | "server"
    | "bot";
};

export type CmsPricingCategoryContent = {
  id: PricingCategoryId;
  visible: boolean;
  order: number;
  label: string;
  shortLabel: string;
  headline: string;
  description: string;
  showcaseTitle: string;
  showcaseBody: string;
  mediaSrc: string;
  mediaAlt: string;
  saveBadge: string;
  highlights: CmsPricingHighlight[];
  faqs: CmsFaqItem[];
};

export type CmsPricingTrustPill = {
  id: string;
  visible: boolean;
  label: string;
};

export type CmsPricingPageContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroDescription: string;
  heroMediaSrc: string;
  heroMediaAlt: string;
  trustPills: CmsPricingTrustPill[];
  categories: CmsPricingCategoryContent[];
  ecommercePlans: CmsHostingPlan[];
  vpsPlans: CmsHostingPlan[];
  aiBuilderPlans: CmsHostingPlan[];
  aiAgentPlans: CmsHostingPlan[];
  businessEmailPlans: CmsHostingPlan[];
  faqEyebrow: string;
  faqTitle: string;
  faqTitleAccent: string;
  faqDescription: string;
  faqPreviewCount: number;
  bottomEyebrow: string;
  bottomTitle: string;
  bottomBody: string;
  bottomPrimaryLabel: string;
  bottomPrimaryHref: string;
  bottomSecondaryLabel: string;
  bottomSecondaryHref: string;
};

function faqBlock(
  categoryId: string,
  pairs: readonly (readonly [string, string])[],
): CmsFaqItem[] {
  return pairs.map(([question, answer], order) => ({
    id: `${categoryId}-faq-${order + 1}`,
    visible: true,
    order,
    question,
    answer,
  }));
}

const websiteFaqs = faqBlock("websites", [
  [
    "What is included in HostingBeyond website hosting?",
    "Every Beyond plan includes NVMe storage, free SSL, managed WordPress, email accounts (tiered), backups, and 24/7 support. You also get Beyond AI credits on annual billing so you can publish pages faster without a separate builder subscription.",
  ],
  [
    "Can I host multiple websites on one plan?",
    "Yes. Beyond Essential supports one site; Plus supports five; Pro and Ultimate support unlimited websites on a single account with isolated domains and SSL.",
  ],
  [
    "Is WordPress included?",
    "Managed WordPress is included on all website plans with one-click installation, updates, and performance tuning on NVMe infrastructure.",
  ],
  [
    "Do I get a free domain?",
    "Annual website and ecommerce plans include a domain free for the first year on eligible TLDs. You can also connect a domain you already own.",
  ],
  [
    "How fast is HostingBeyond hosting?",
    "Plans use NVMe SSD storage, unmetered bandwidth on website tiers, and tuned PHP/MySQL stacks. Higher plans add more RAM for busier sites.",
  ],
  [
    "Can I upgrade my plan later?",
    "Yes. Upgrade anytime from the panel — resources scale without rebuilding your account or losing content.",
  ],
  [
    "Is there a money-back guarantee?",
    "Website plans include a 30-day money-back guarantee so you can test performance and support with real traffic.",
  ],
  [
    "Do you help with migration?",
    "Plus, Pro, Ultimate, and ecommerce tiers include free website migration assistance from most popular hosts.",
  ],
  [
    "Is SSL really free?",
    "Yes. Auto SSL is included so every site can serve HTTPS for SEO trust and secure logins.",
  ],
  [
    "Who is website hosting best for?",
    "Freelancers, local businesses, bloggers, and growing brands that want premium speed without juggling multiple vendors.",
  ],
]);

const ecommerceFaqs = faqBlock("ecommerce", [
  [
    "Is HostingBeyond good for WooCommerce?",
    "Yes. Ecommerce plans are optimized for WooCommerce with checkout SSL, daily backups on higher tiers, and resources sized for product catalogs and payment plugins.",
  ],
  [
    "Are transaction fees charged by HostingBeyond?",
    "HostingBeyond does not add platform transaction fees on your store — payment fees come from your gateway (Stripe, PayPal, etc.) only.",
  ],
  [
    "Can I sell internationally?",
    "Yes. Use WooCommerce currency, shipping, and tax extensions. Our global network and CDN-friendly stack help international buyers checkout smoothly.",
  ],
  [
    "How many products can I list?",
    "Commerce Essential supports growing catalogs; higher tiers add staging, priority support, and headroom for large SKU counts and traffic spikes.",
  ],
  [
    "Is PCI compliance included?",
    "We provide a PCI-friendly hosting environment and free SSL. Card data is handled by your payment provider when using standard WooCommerce gateways.",
  ],
  [
    "Can I migrate an existing store?",
    "Commerce Plus and above include migration help for files, database, and DNS cutover to minimize downtime.",
  ],
  [
    "Do ecommerce plans include email?",
    "Yes — branded mailboxes are included per tier so order notifications and support addresses match your domain.",
  ],
  [
    "What makes HostingBeyond cheaper than other ecommerce hosts?",
    "Our ecommerce list prices are set about 5% below comparable Hostinger-style promos while including NVMe, SSL, and AI credits on annual plans.",
  ],
  [
    "Can I use page builders with my store?",
    "Yes. WordPress page builders and WooCommerce work alongside Beyond AI for landing pages and campaign microsites.",
  ],
  [
    "Is there staging for my shop?",
    "Commerce Cloud and Enterprise include staging-friendly resources and priority support for testing updates before peak sales.",
  ],
]);

const domainFaqs = faqBlock("domains", [
  [
    "How much does a domain cost?",
    "Pricing starts from our localized domain rate shown on this page, with free privacy protection on eligible registrations.",
  ],
  [
    "Can I transfer my domain to HostingBeyond?",
    "Yes. Unlock your domain at the current registrar, request a transfer, and our team can guide DNS and email cutover.",
  ],
  [
    "Is WHOIS privacy included?",
    "Free domain privacy protection is included on supported TLDs to reduce spam and protect owner details.",
  ],
  [
    "Can I manage DNS here?",
    "Full DNS management, forwarding, and record templates are built into the HostingBeyond panel.",
  ],
  [
    "Do you offer bulk domain search?",
    "Yes. Use bulk search to check many names at once — ideal for agencies and brand campaigns.",
  ],
  [
    "Can I register multiple TLDs?",
    "Yes — .com, .net, .store, .io, and hundreds more are available from the domain search tools.",
  ],
  [
    "How long does registration take?",
    "Most domains activate within minutes after payment and registry confirmation.",
  ],
  [
    "Can I point a domain without buying hosting?",
    "Yes. Register or connect a domain and use DNS-only setup until you add hosting or email.",
  ],
  [
    "Will my domain work with Beyond AI sites?",
    "Yes. Connect any domain you control and publish Beyond AI or WordPress sites on the same account.",
  ],
  [
    "Do domains renew automatically?",
    "Auto-renew can be enabled so your brand never expires accidentally — manage it anytime in the panel.",
  ],
]);

const aiBuilderFaqs = faqBlock("ai-builder", [
  [
    "What is Beyond AI?",
    "Beyond AI is HostingBeyond’s website builder — describe your business and get layouts, copy, and publish-ready pages tied to your hosting.",
  ],
  [
    "Do I need separate hosting for AI sites?",
    "No on annual Beyond hosting plans — AI credits are included. Standalone Creator/Business tiers are available if you only need the builder.",
  ],
  [
    "Can I edit AI-generated pages?",
    "Yes. Regenerate sections, rewrite copy in your tone, and publish updates in one click.",
  ],
  [
    "Are templates included?",
    "Premium templates and industry starters are included on paid Beyond AI tiers.",
  ],
  [
    "Can agencies use Beyond AI?",
    "The Agency plan adds white-label handoff, unlimited sites, and API provisioning for client work.",
  ],
  [
    "Is SSL included on AI sites?",
    "Published sites receive free SSL when pointed to HostingBeyond hosting or builder hosting endpoints.",
  ],
  [
    "How do AI credits work?",
    "Annual website plans include monthly AI credits scaled to tier — shown on each hosting card.",
  ],
  [
    "Can I connect my own domain?",
    "Yes. Any domain in your account can be attached to a Beyond AI site.",
  ],
  [
    "Is there a free trial?",
    "You can start with included credits on hosting or try standalone tiers with transparent renewal pricing.",
  ],
  [
    "Does Beyond AI help SEO?",
    "AI drafts meta titles, descriptions, and structured sections — you stay in control of final publish.",
  ],
]);

const vpsFaqs = faqBlock("vps", [
  [
    "What virtualization do you use?",
    "KVM-based VPS with full root access, isolated resources, and NVMe storage.",
  ],
  [
    "Can I install Docker or custom stacks?",
    "Yes. Root access lets you run containers, Node, Python, or any Linux workload you need.",
  ],
  [
    "Where are servers located?",
    "Deploy in performance-focused regions with low-latency routing — choose during provisioning.",
  ],
  [
    "Are snapshots included?",
    "Weekly snapshots on entry tiers; daily snapshots on higher VPS plans.",
  ],
  [
    "Is DDoS protection available?",
    "Network-level DDoS mitigation is included on VPS 2 and above.",
  ],
  [
    "Can I upgrade VPS resources?",
    "Scale CPU, RAM, and disk as your app grows without migrating to a new provider.",
  ],
  [
    "Do I get IPv6?",
    "Yes — IPv4 and IPv6 are included on all listed VPS tiers.",
  ],
  [
    "Is managed support available?",
    "We provide 24/7 infrastructure support; server administration remains in your control unless you add managed services.",
  ],
  [
    "Can I host ecommerce on VPS?",
    "Yes — many merchants run WooCommerce or headless storefronts on VPS when they need custom middleware.",
  ],
  [
    "How is billing handled?",
    "Monthly or annual billing with clear renewal rates shown before checkout.",
  ],
]);

const aiAgentFaqs = faqBlock("ai-agents", [
  [
    "What are HostingBeyond AI agents?",
    "Configurable agents that automate inbox replies, lead qualification, and internal workflows using your site and mail context.",
  ],
  [
    "How many actions are included?",
    "Starter includes 5,000 agent actions per month; Pro 50,000; Business 250,000 — with dashboards to track usage.",
  ],
  [
    "Can agents hand off to humans?",
    "Yes. Escalation rules route complex threads to your support team with full conversation history.",
  ],
  [
    "Do agents work with business email?",
    "Native integration with HostingBeyond mail is included; webhooks connect CRMs and chat tools.",
  ],
  [
    "Is customer data secure?",
    "Business tier adds audit logs, SSO, and configurable retention for compliance-focused teams.",
  ],
  [
    "Can I train agents on my docs?",
    "Point agents at your public site, help center, or uploaded knowledge to ground answers.",
  ],
  [
    "What channels are supported?",
    "Email and web forms on Starter; Pro adds chat and SMS connectors where enabled.",
  ],
  [
    "Are there guardrails?",
    "Pro and Business plans include playbook templates and policy guardrails for tone and compliance.",
  ],
  [
    "Can I try agents on a small plan?",
    "Agents Starter is sized for solo businesses automating FAQs before scaling to Pro.",
  ],
  [
    "Who should use AI agents?",
    "Support-heavy businesses, SaaS teams, and agencies that want 24/7 first response without hiring overnight staff.",
  ],
]);

const emailFaqs = faqBlock("business-email", [
  [
    "What is Agentic Mail?",
    "AI-assisted drafting, summarization, and smart replies inside your branded inbox — included on Standard and Premium.",
  ],
  [
    "How much storage do I get?",
    "Starter 5 GB, Standard 20 GB, Premium 50 GB per mailbox — scale with additional mailboxes anytime.",
  ],
  [
    "Can I migrate from Gmail or Outlook?",
    "Yes. Guided migration imports folders and messages with minimal downtime.",
  ],
  [
    "Is spam protection included?",
    "All tiers include spam, virus, and phishing filtering with high deliverability standards.",
  ],
  [
    "Can I use mobile apps?",
    "Sync with Outlook, Apple Mail, Gmail app, and any IMAP/SMTP client.",
  ],
  [
    "Do you offer open tracking?",
    "Standard and Premium include open tracking; Premium adds link and attachment insights.",
  ],
  [
    "Is there a free domain with email?",
    "Premium includes a free domain for one year when purchased on eligible annual terms.",
  ],
  [
    "How is pricing calculated?",
    "Per mailbox per month — add mailboxes as your team grows without changing plans.",
  ],
  [
    "Is encryption supported?",
    "TLS in transit and modern authentication protect messages between clients and our servers.",
  ],
  [
    "Can I set auto-replies?",
    "Vacation responders and forwarding rules are included across tiers with higher limits on Premium.",
  ],
]);

function defaultHighlights(id: PricingCategoryId): CmsPricingHighlight[] {
  const map: Record<PricingCategoryId, CmsPricingHighlight[]> = {
    websites: [
      {
        id: "speed",
        visible: true,
        order: 0,
        title: "NVMe speed",
        description: "Fast storage and tuned stacks for Core Web Vitals.",
        icon: "zap",
      },
      {
        id: "ssl",
        visible: true,
        order: 1,
        title: "Free SSL",
        description: "HTTPS on every site — no manual certificate hunts.",
        icon: "shield",
      },
      {
        id: "wp",
        visible: true,
        order: 2,
        title: "Managed WordPress",
        description: "One-click installs and guided updates.",
        icon: "globe",
      },
      {
        id: "ai",
        visible: true,
        order: 3,
        title: "Beyond AI credits",
        description: "Publish faster with AI on annual plans.",
        icon: "sparkles",
      },
    ],
    ecommerce: [
      {
        id: "woo",
        visible: true,
        order: 0,
        title: "WooCommerce ready",
        description: "Optimized cart, checkout, and catalog performance.",
        icon: "cart",
      },
      {
        id: "pay",
        visible: true,
        order: 1,
        title: "Gateway freedom",
        description: "Stripe, PayPal, and major Woo gateways supported.",
        icon: "shield",
      },
      {
        id: "ssl",
        visible: true,
        order: 2,
        title: "Secure checkout",
        description: "Free SSL on every storefront plan.",
        icon: "shield",
      },
      {
        id: "scale",
        visible: true,
        order: 3,
        title: "Scale on demand",
        description: "Upgrade resources before Black Friday traffic.",
        icon: "zap",
      },
    ],
    domains: [
      {
        id: "privacy",
        visible: true,
        order: 0,
        title: "Free privacy",
        description: "WHOIS protection on eligible TLDs.",
        icon: "shield",
      },
      {
        id: "dns",
        visible: true,
        order: 1,
        title: "Pro DNS",
        description: "Records, forwarding, and templates.",
        icon: "globe",
      },
      {
        id: "bulk",
        visible: true,
        order: 2,
        title: "Bulk search",
        description: "Check dozens of names in one pass.",
        icon: "zap",
      },
      {
        id: "support",
        visible: true,
        order: 3,
        title: "24/7 specialists",
        description: "Real humans for DNS and transfers.",
        icon: "sparkles",
      },
    ],
    "ai-builder": [
      {
        id: "gen",
        visible: true,
        order: 0,
        title: "AI generation",
        description: "Layouts and copy from a short brief.",
        icon: "sparkles",
      },
      {
        id: "pub",
        visible: true,
        order: 1,
        title: "One-click publish",
        description: "Go live on your domain instantly.",
        icon: "zap",
      },
      {
        id: "brand",
        visible: true,
        order: 2,
        title: "Brand kits",
        description: "Reusable colors, fonts, and sections.",
        icon: "globe",
      },
      {
        id: "team",
        visible: true,
        order: 3,
        title: "Team workspaces",
        description: "Collaborate on client sites.",
        icon: "sparkles",
      },
    ],
    vps: [
      {
        id: "kvm",
        visible: true,
        order: 0,
        title: "KVM isolation",
        description: "Dedicated resources, full root.",
        icon: "server",
      },
      {
        id: "nvme",
        visible: true,
        order: 1,
        title: "NVMe disks",
        description: "Low latency for databases and APIs.",
        icon: "zap",
      },
      {
        id: "snap",
        visible: true,
        order: 2,
        title: "Snapshots",
        description: "Rollback-friendly backups.",
        icon: "shield",
      },
      {
        id: "net",
        visible: true,
        order: 3,
        title: "Modern network",
        description: "IPv4/IPv6 and DDoS mitigation.",
        icon: "globe",
      },
    ],
    "ai-agents": [
      {
        id: "auto",
        visible: true,
        order: 0,
        title: "Workflow automation",
        description: "Agents for mail, forms, and CRM hooks.",
        icon: "bot",
      },
      {
        id: "ground",
        visible: true,
        order: 1,
        title: "Grounded answers",
        description: "Use your site and docs as context.",
        icon: "sparkles",
      },
      {
        id: "handoff",
        visible: true,
        order: 2,
        title: "Human handoff",
        description: "Escalate when confidence is low.",
        icon: "shield",
      },
      {
        id: "dash",
        visible: true,
        order: 3,
        title: "Usage dashboard",
        description: "Track actions and ROI.",
        icon: "zap",
      },
    ],
    "business-email": [
      {
        id: "brand",
        visible: true,
        order: 0,
        title: "Branded addresses",
        description: "you@yourcompany.com on every plan.",
        icon: "mail",
      },
      {
        id: "ai",
        visible: true,
        order: 1,
        title: "AI writing",
        description: "Drafts and summaries in your voice.",
        icon: "sparkles",
      },
      {
        id: "sec",
        visible: true,
        order: 2,
        title: "Advanced security",
        description: "Spam, virus, and phishing filters.",
        icon: "shield",
      },
      {
        id: "sync",
        visible: true,
        order: 3,
        title: "Any device",
        description: "Webmail plus mobile/desktop sync.",
        icon: "globe",
      },
    ],
  };
  return map[id];
}

function defaultCategories(): CmsPricingCategoryContent[] {
  const defs: Array<Omit<CmsPricingCategoryContent, "highlights" | "faqs">> = [
    {
      id: "websites",
      visible: true,
      order: 0,
      label: "Websites",
      shortLabel: "Websites",
      headline: "Web hosting built for speed",
      description:
        "NVMe storage, free SSL, and managed WordPress on every Beyond plan — launch in minutes, scale when you are ready.",
      showcaseTitle: "See your site load in milliseconds",
      showcaseBody:
        "Watch how HostingBeyond serves pages from NVMe with free SSL and managed WordPress — the same stack powering our homepage plans.",
      mediaSrc: "/images/home/wordpress.webp",
      mediaAlt: "WordPress website performance on HostingBeyond",
      saveBadge: "Save 70%",
    },
    {
      id: "ecommerce",
      visible: true,
      order: 1,
      label: "Ecommerce",
      shortLabel: "Stores",
      headline: "Online stores that convert",
      description:
        "Hostinger-style ecommerce tiers, priced about 5% lower — WooCommerce, secure checkout, and room to grow.",
      showcaseTitle: "Checkout-ready WooCommerce hosting",
      showcaseBody:
        "From first product to flash-sale traffic — commerce plans bundle SSL, backups, and AI credits without platform transaction fees.",
      mediaSrc: "/images/hosting/ecommerce.jpg",
      mediaAlt: "Ecommerce dashboard and storefront",
      saveBadge: "5% below typical promos",
    },
    {
      id: "domains",
      visible: true,
      order: 2,
      label: "Domains",
      shortLabel: "Domains",
      headline: "Your name on the internet",
      description:
        "Register, transfer, and manage domains with privacy protection, DNS tools, and support that speaks human.",
      showcaseTitle: "Claim your brand URL",
      showcaseBody:
        "Search hundreds of TLDs, enable privacy protection, and point DNS to hosting or Beyond AI in one panel.",
      mediaSrc: "/images/home/domains.webp",
      mediaAlt: "Domain search on HostingBeyond",
      saveBadge: "Privacy included",
    },
    {
      id: "ai-builder",
      visible: true,
      order: 3,
      label: "AI Builder",
      shortLabel: "AI Builder",
      headline: "Beyond AI website builder",
      description:
        "Describe your brand and publish a polished site — hosting, SSL, and AI credits work together in one account.",
      showcaseTitle: "Build with Beyond AI",
      showcaseBody:
        "Generate layouts, refine copy, and publish to your domain — included with hosting or as standalone Creator plans.",
      mediaSrc: "/images/home/beyond-ai-stage.png",
      mediaAlt: "Beyond AI website builder workspace",
      saveBadge: "50% off annual",
    },
    {
      id: "vps",
      visible: true,
      order: 4,
      label: "VPS Hosting",
      shortLabel: "VPS",
      headline: "Root access, NVMe power",
      description:
        "Isolated KVM servers for apps, APIs, and custom stacks — full control with HostingBeyond performance and support.",
      showcaseTitle: "Your server, your rules",
      showcaseBody:
        "Deploy APIs, Docker, or custom commerce middleware on KVM VPS with snapshots and modern networking.",
      mediaSrc: "/images/home/vps.webp",
      mediaAlt: "VPS server infrastructure",
      saveBadge: "Launch pricing",
    },
    {
      id: "ai-agents",
      visible: true,
      order: 5,
      label: "AI Agents & Automation",
      shortLabel: "AI Agents",
      headline: "Automate work with AI agents",
      description:
        "Deploy agentic workflows for support, sales, and ops — connected to your sites, mail, and data on HostingBeyond.",
      showcaseTitle: "Agents that know your business",
      showcaseBody:
        "Ground agents on your site and inbox, automate first responses, and escalate to humans when it matters.",
      mediaSrc: "/images/home/ai-hosting-stage.png",
      mediaAlt: "AI agents automation dashboard",
      saveBadge: "Intro pricing",
    },
    {
      id: "business-email",
      visible: true,
      order: 6,
      label: "Business Email",
      shortLabel: "Email",
      headline: "Professional mail on your domain",
      description:
        "Branded inboxes with AI writing, migration help, and enterprise-grade spam protection from day one.",
      showcaseTitle: "Inbox your customers trust",
      showcaseBody:
        "Agentic Mail, open tracking, and migration tools — priced per mailbox so you only pay for what you use.",
      mediaSrc: "/images/home/business-email-stage.png",
      mediaAlt: "Business email on custom domain",
      saveBadge: "Up to 88% off",
    },
  ];

  const faqMap: Record<PricingCategoryId, CmsFaqItem[]> = {
    websites: websiteFaqs,
    ecommerce: ecommerceFaqs,
    domains: domainFaqs,
    "ai-builder": aiBuilderFaqs,
    vps: vpsFaqs,
    "ai-agents": aiAgentFaqs,
    "business-email": emailFaqs,
  };

  return defs.map((def) => ({
    ...def,
    highlights: defaultHighlights(def.id),
    faqs: faqMap[def.id],
  }));
}

/** Ecommerce tiers modeled on Hostinger ecommerce promos at ~5% lower list prices. */
export function defaultEcommercePlans(): CmsHostingPlan[] {
  return [
    {
      id: "commerce-essential",
      visible: true,
      order: 0,
      name: "Commerce Essential",
      tagline: "Launch your first WooCommerce store.",
      discountBadge: "5% BELOW MARKET",
      popular: false,
      popularLabel: "",
      accent: "blue",
      priceAnnually: "$3.79",
      originalAnnually: "$7.99",
      billedAnnually: "Billed $45.48 annually",
      saveAnnually: "Save $50.40",
      priceMonthly: "$7.99",
      originalMonthly: "",
      billedMonthly: "Billed monthly",
      saveMonthly: "",
      domainPerk: "Domain — free for 1 year",
      annualCredit: "$3 Beyond AI Credit",
      features: [
        "1 Online store",
        "100 products",
        "WooCommerce optimized",
        "Free SSL for checkout",
        "10 GB NVMe storage",
        "2 GB RAM",
        "5 mailboxes",
        "Weekly backups",
        "24/7 support",
      ],
      ctaLabel: "Start store",
      ctaHref: routes.getStarted,
    },
    {
      id: "commerce-plus",
      visible: true,
      order: 1,
      name: "Commerce Plus",
      tagline: "Growing catalogs & paid campaigns.",
      discountBadge: "5% BELOW MARKET",
      popular: false,
      popularLabel: "",
      accent: "blue",
      priceAnnually: "$6.64",
      originalAnnually: "$13.99",
      billedAnnually: "Billed $79.68 annually",
      saveAnnually: "Save $88.20",
      priceMonthly: "$13.99",
      originalMonthly: "",
      billedMonthly: "Billed monthly",
      saveMonthly: "",
      domainPerk: "Domain — free for 1 year",
      annualCredit: "$5 Beyond AI Credit",
      features: [
        "3 Online stores",
        "500 products",
        "Abandoned cart emails",
        "Free migration",
        "20 GB NVMe storage",
        "4 GB RAM",
        "20 mailboxes",
        "Daily backups",
        "24/7 support",
      ],
      ctaLabel: "Start store",
      ctaHref: routes.getStarted,
    },
    {
      id: "commerce-cloud",
      visible: true,
      order: 2,
      name: "Commerce Cloud",
      tagline: "High-traffic shops & subscriptions.",
      discountBadge: "5% BELOW MARKET",
      popular: true,
      popularLabel: "Most popular",
      accent: "gradient",
      priceAnnually: "$12.34",
      originalAnnually: "$25.99",
      billedAnnually: "Billed $148.08 annually",
      saveAnnually: "Save $163.80",
      priceMonthly: "$25.99",
      originalMonthly: "",
      billedMonthly: "Billed monthly",
      saveMonthly: "",
      domainPerk: "Domain — free for 1 year",
      annualCredit: "$8 Beyond AI Credit",
      features: [
        "5 Online stores",
        "Unlimited products",
        "Priority support",
        "Staging-friendly resources",
        "40 GB NVMe storage",
        "6 GB RAM",
        "Unlimited mailboxes",
        "Daily backups",
        "PHP, Python & Node.js",
      ],
      ctaLabel: "Start store",
      ctaHref: routes.getStarted,
    },
    {
      id: "commerce-enterprise",
      visible: true,
      order: 3,
      name: "Commerce Enterprise",
      tagline: "Enterprise-grade commerce performance.",
      discountBadge: "5% BELOW MARKET",
      popular: false,
      popularLabel: "",
      accent: "purple",
      priceAnnually: "$22.79",
      originalAnnually: "$47.99",
      billedAnnually: "Billed $273.48 annually",
      saveAnnually: "Save $302.40",
      priceMonthly: "$47.99",
      originalMonthly: "",
      billedMonthly: "Billed monthly",
      saveMonthly: "",
      domainPerk: "Domain — free for 1 year",
      annualCredit: "$15 Beyond AI Credit",
      features: [
        "Unlimited stores",
        "Unlimited products",
        "Advanced performance (5×)",
        "Dedicated resource headroom",
        "60 GB NVMe storage",
        "8 GB RAM",
        "Unlimited mailboxes",
        "Daily backups + snapshots",
        "Priority support",
      ],
      ctaLabel: "Start store",
      ctaHref: routes.getStarted,
    },
  ];
}

function catalogFromConfig(): {
  vps: CmsHostingPlan[];
  aiBuilder: CmsHostingPlan[];
  aiAgents: CmsHostingPlan[];
  email: CmsHostingPlan[];
} {
  const toCms = (
    plan: {
      id: string;
      name: string;
      tagline: string;
      discountBadge?: string;
      popular?: boolean;
      popularLabel?: string;
      priceAnnually: string;
      originalAnnually?: string;
      billedAnnually: string;
      saveAnnually?: string;
      priceMonthly: string;
      billedMonthly: string;
      domainPerk?: string;
      annualCredit?: string;
      features: string[];
      ctaLabel: string;
      ctaHref: string;
    },
    order: number,
    accent: CmsHostingPlan["accent"],
  ): CmsHostingPlan => ({
    id: plan.id,
    visible: true,
    order,
    name: plan.name,
    tagline: plan.tagline,
    discountBadge: plan.discountBadge ?? "",
    popular: plan.popular ?? false,
    popularLabel: plan.popularLabel ?? "",
    accent,
    priceAnnually: plan.priceAnnually,
    originalAnnually: plan.originalAnnually ?? "",
    billedAnnually: plan.billedAnnually,
    saveAnnually: plan.saveAnnually ?? "",
    priceMonthly: plan.priceMonthly,
    originalMonthly: "",
    billedMonthly: plan.billedMonthly,
    saveMonthly: "",
    domainPerk: plan.domainPerk ?? "",
    annualCredit: plan.annualCredit ?? "",
    features: plan.features,
    ctaLabel: plan.ctaLabel,
    ctaHref: plan.ctaHref,
  });

  return {
    vps: vpsPlans.map((p, i) => toCms(p, i, p.popular ? "gradient" : "blue")),
    aiBuilder: aiBuilderPlans.map((p, i) =>
      toCms(p, i, p.popular ? "gradient" : "purple"),
    ),
    aiAgents: aiAgentPlans.map((p, i) =>
      toCms(p, i, p.popular ? "gradient" : "blue"),
    ),
    email: businessEmailCatalogPlans.map((p, i) =>
      toCms(p, i, p.popular ? "gradient" : "purple"),
    ),
  };
}

export function defaultPricingPageContent(): CmsPricingPageContent {
  const catalog = catalogFromConfig();
  return {
    heroEyebrow: "Plans & pricing",
    heroTitle: "Everything you need to",
    heroTitleAccent: "grow online",
    heroDescription:
      "Premium HostingBeyond pricing for websites, stores, domains, AI, VPS, agents, and mail — transparent, annual savings, and 24/7 humans behind the panel.",
    heroMediaSrc: "/images/home/ai-hosting-stage.png",
    heroMediaAlt: "HostingBeyond premium hosting platform",
    trustPills: [
      { id: "refund", visible: true, label: "30-day money-back" },
      { id: "support", visible: true, label: "24/7 expert support" },
      { id: "ssl", visible: true, label: "Free SSL on hosting" },
      { id: "ai", visible: true, label: "Beyond AI included" },
    ],
    categories: defaultCategories(),
    ecommercePlans: defaultEcommercePlans(),
    vpsPlans: catalog.vps,
    aiBuilderPlans: catalog.aiBuilder,
    aiAgentPlans: catalog.aiAgents,
    businessEmailPlans: catalog.email,
    faqEyebrow: "Pricing FAQs",
    faqTitle: "Answers for your",
    faqTitleAccent: "chosen product",
    faqDescription:
      "Pick a category above — each product line has ten detailed answers about billing, features, and migration.",
    faqPreviewCount: 5,
    bottomEyebrow: "Not sure yet?",
    bottomTitle: "We will help you pick the right stack",
    bottomBody:
      "Tell us about your project — migration, domains, WooCommerce, or AI — and our team will recommend a plan in minutes.",
    bottomPrimaryLabel: "Get started",
    bottomPrimaryHref: routes.getStarted,
    bottomSecondaryLabel: "Contact sales",
    bottomSecondaryHref: routes.contact,
  };
}

function mergeFaqs(
  defaults: CmsFaqItem[],
  stored?: CmsFaqItem[] | null,
): CmsFaqItem[] {
  if (!stored?.length) return defaults;
  const byId = new Map(stored.map((item) => [item.id, item]));
  return defaults.map((item) => ({ ...item, ...byId.get(item.id) }));
}

export function mergePricingPageContent(
  stored?: Partial<CmsPricingPageContent> | null,
): CmsPricingPageContent {
  const defaults = defaultPricingPageContent();
  if (!stored) return defaults;

  const categories = defaults.categories.map((cat) => {
    const patch = stored.categories?.find((c) => c.id === cat.id);
    if (!patch) return cat;
    return {
      ...cat,
      ...patch,
      highlights: patch.highlights?.length ? patch.highlights : cat.highlights,
      faqs: mergeFaqs(cat.faqs, patch.faqs),
    };
  });

  return {
    ...defaults,
    ...stored,
    trustPills: stored.trustPills?.length
      ? stored.trustPills
      : defaults.trustPills,
    categories,
    ecommercePlans: stored.ecommercePlans?.length
      ? stored.ecommercePlans
      : defaults.ecommercePlans,
    vpsPlans: stored.vpsPlans?.length ? stored.vpsPlans : defaults.vpsPlans,
    aiBuilderPlans: stored.aiBuilderPlans?.length
      ? stored.aiBuilderPlans
      : defaults.aiBuilderPlans,
    aiAgentPlans: stored.aiAgentPlans?.length
      ? stored.aiAgentPlans
      : defaults.aiAgentPlans,
    businessEmailPlans: stored.businessEmailPlans?.length
      ? stored.businessEmailPlans
      : defaults.businessEmailPlans,
  };
}

export function getCategoryById(
  content: CmsPricingPageContent,
  id: PricingCategoryId,
): CmsPricingCategoryContent {
  return (
    content.categories.find((c) => c.id === id) ??
    content.categories[0] ??
    defaultCategories()[0]
  );
}
