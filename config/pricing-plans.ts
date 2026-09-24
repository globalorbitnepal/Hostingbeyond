/**
 * Supplemental pricing rows for the /pricing hub (VPS, AI, domains highlights).
 * Web hosting tiers come from Orbit CMS (home hostingPlans).
 */

import { routes } from "@/config/routes";

export type PricingCategoryId =
  | "websites"
  | "ecommerce"
  | "domains"
  | "ai-builder"
  | "vps"
  | "ai-agents"
  | "business-email";

export type PricingCategory = {
  id: PricingCategoryId;
  label: string;
  shortLabel: string;
  headline: string;
  description: string;
};

export const pricingCategories: PricingCategory[] = [
  {
    id: "websites",
    label: "Websites",
    shortLabel: "Websites",
    headline: "Web hosting built for speed",
    description:
      "NVMe storage, free SSL, and managed WordPress on every Beyond plan — launch in minutes, scale when you are ready.",
  },
  {
    id: "ecommerce",
    label: "Ecommerce",
    shortLabel: "Stores",
    headline: "Sell online with confidence",
    description:
      "WooCommerce-ready hosting with checkout-grade SSL, daily backups, and room to grow your catalog without changing hosts.",
  },
  {
    id: "domains",
    label: "Domains",
    shortLabel: "Domains",
    headline: "Your name on the internet",
    description:
      "Register, transfer, and manage domains with privacy protection, DNS tools, and support that speaks human.",
  },
  {
    id: "ai-builder",
    label: "AI Builder",
    shortLabel: "AI Builder",
    headline: "Beyond AI website builder",
    description:
      "Describe your brand and publish a polished site — hosting, SSL, and AI credits work together in one account.",
  },
  {
    id: "vps",
    label: "VPS Hosting",
    shortLabel: "VPS",
    headline: "Root access, NVMe power",
    description:
      "Isolated KVM servers for apps, APIs, and custom stacks — full control with HostingBeyond performance and support.",
  },
  {
    id: "ai-agents",
    label: "AI Agents & Automation",
    shortLabel: "AI Agents",
    headline: "Automate work with AI agents",
    description:
      "Deploy agentic workflows for support, sales, and ops — connected to your sites, mail, and data on HostingBeyond.",
  },
  {
    id: "business-email",
    label: "Business Email",
    shortLabel: "Email",
    headline: "Professional mail on your domain",
    description:
      "Branded inboxes with AI writing, migration help, and enterprise-grade spam protection from day one.",
  },
];

export type CatalogPlan = {
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
  originalMonthly?: string;
  billedMonthly: string;
  saveMonthly?: string;
  domainPerk?: string;
  annualCredit?: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
};

export const ecommercePlanOverrides: Record<
  string,
  { tagline: string; extraFeatures: string[] }
> = {
  essential: {
    tagline: "Launch your first online store.",
    extraFeatures: [
      "WooCommerce pre-optimized stack",
      "Free SSL for secure checkout",
      "PCI-friendly hosting environment",
    ],
  },
  plus: {
    tagline: "Growing catalogs and multi-store brands.",
    extraFeatures: [
      "WooCommerce + staging-friendly resources",
      "Daily backups for orders & products",
      "Free migration for existing shops",
    ],
  },
  pro: {
    tagline: "High-volume stores and serious sellers.",
    extraFeatures: [
      "Priority support for peak sales events",
      "PHP, Python & Node.js for custom checkout",
      "Unlimited products & bandwidth headroom",
    ],
  },
  ultimate: {
    tagline: "Maximum throughput for busy storefronts.",
    extraFeatures: [
      "Advanced performance (5× faster)",
      "Dedicated resource headroom for flash sales",
      "Priority support & migration assistance",
    ],
  },
};

export const vpsPlans: CatalogPlan[] = [
  {
    id: "vps-1",
    name: "VPS 1",
    tagline: "Side projects & lightweight APIs.",
    discountBadge: "Launch offer",
    priceAnnually: "$4.99",
    originalAnnually: "$9.99",
    billedAnnually: "Billed $59.88 annually",
    saveAnnually: "Save $60",
    priceMonthly: "$9.99",
    billedMonthly: "Billed monthly",
    features: [
      "1 vCPU core",
      "4 GB RAM",
      "50 GB NVMe storage",
      "4 TB bandwidth",
      "Full root access (KVM)",
      "Free weekly snapshots",
      "IPv4 + IPv6",
      "24/7 expert support",
    ],
    ctaLabel: "Get VPS 1",
    ctaHref: routes.getStarted,
  },
  {
    id: "vps-2",
    name: "VPS 2",
    tagline: "Production apps & growing teams.",
    discountBadge: "Launch offer",
    popular: true,
    popularLabel: "Best value",
    priceAnnually: "$8.99",
    originalAnnually: "$17.99",
    billedAnnually: "Billed $107.88 annually",
    saveAnnually: "Save $108",
    priceMonthly: "$17.99",
    billedMonthly: "Billed monthly",
    features: [
      "2 vCPU cores",
      "8 GB RAM",
      "100 GB NVMe storage",
      "8 TB bandwidth",
      "Full root access (KVM)",
      "Free weekly snapshots",
      "DDoS protection",
      "24/7 expert support",
    ],
    ctaLabel: "Get VPS 2",
    ctaHref: routes.getStarted,
  },
  {
    id: "vps-3",
    name: "VPS 3",
    tagline: "Heavy workloads & multi-service stacks.",
    discountBadge: "Launch offer",
    priceAnnually: "$12.99",
    originalAnnually: "$25.99",
    billedAnnually: "Billed $155.88 annually",
    saveAnnually: "Save $156",
    priceMonthly: "$25.99",
    billedMonthly: "Billed monthly",
    features: [
      "4 vCPU cores",
      "16 GB RAM",
      "200 GB NVMe storage",
      "16 TB bandwidth",
      "Full root access (KVM)",
      "Daily snapshots",
      "DDoS protection",
      "Priority support",
    ],
    ctaLabel: "Get VPS 3",
    ctaHref: routes.getStarted,
  },
  {
    id: "vps-4",
    name: "VPS 4",
    tagline: "High-traffic apps & agency workloads.",
    discountBadge: "Launch offer",
    priceAnnually: "$19.99",
    originalAnnually: "$39.99",
    billedAnnually: "Billed $239.88 annually",
    saveAnnually: "Save $240",
    priceMonthly: "$39.99",
    billedMonthly: "Billed monthly",
    features: [
      "8 vCPU cores",
      "32 GB RAM",
      "400 GB NVMe storage",
      "32 TB bandwidth",
      "Full root access (KVM)",
      "Daily snapshots",
      "DDoS protection",
      "Priority support",
    ],
    ctaLabel: "Get VPS 4",
    ctaHref: routes.getStarted,
  },
];

export const aiBuilderPlans: CatalogPlan[] = [
  {
    id: "ai-included",
    name: "Included with hosting",
    tagline: "AI credits on every annual Beyond plan.",
    priceAnnually: "$0",
    billedAnnually: "With Beyond Essential–Ultimate",
    priceMonthly: "—",
    billedMonthly: "Credits on annual billing",
    features: [
      "AI site generation from a short brief",
      "Section & copy rewrites in your tone",
      "One-click publish to your domain",
      "Credits scale with your hosting tier",
      "No separate builder subscription",
    ],
    ctaLabel: "View website plans",
    ctaHref: "#websites",
  },
  {
    id: "ai-creator",
    name: "Beyond AI Creator",
    tagline: "Standalone builder for makers & freelancers.",
    discountBadge: "50% OFF",
    popular: true,
    popularLabel: "Popular",
    priceAnnually: "$4.99",
    originalAnnually: "$9.99",
    billedAnnually: "Billed $59.88 annually",
    saveAnnually: "Save $60",
    priceMonthly: "$9.99",
    billedMonthly: "Billed monthly",
    features: [
      "3 active AI websites",
      "Unlimited AI copy & layout edits",
      "Premium templates library",
      "Free SSL on published sites",
      "Connect any domain",
      "Email support",
    ],
    ctaLabel: "Start building",
    ctaHref: routes.beyondAi,
  },
  {
    id: "ai-business",
    name: "Beyond AI Business",
    tagline: "Teams shipping client sites at speed.",
    discountBadge: "50% OFF",
    priceAnnually: "$9.99",
    originalAnnually: "$19.99",
    billedAnnually: "Billed $119.88 annually",
    saveAnnually: "Save $120",
    priceMonthly: "$19.99",
    billedMonthly: "Billed monthly",
    features: [
      "15 active AI websites",
      "Team seats & shared workspaces",
      "Brand kits & reusable sections",
      "Priority AI generation queue",
      "Staging before publish",
      "Priority support",
    ],
    ctaLabel: "Start building",
    ctaHref: routes.beyondAi,
  },
  {
    id: "ai-agency",
    name: "Beyond AI Agency",
    tagline: "Scale delivery for agencies & studios.",
    discountBadge: "50% OFF",
    priceAnnually: "$19.99",
    originalAnnually: "$39.99",
    billedAnnually: "Billed $239.88 annually",
    saveAnnually: "Save $240",
    priceMonthly: "$39.99",
    billedMonthly: "Billed monthly",
    features: [
      "Unlimited AI websites",
      "White-label client handoff",
      "API access for provisioning",
      "Dedicated success manager",
      "SLA-backed uptime",
      "Migration & onboarding help",
    ],
    ctaLabel: "Talk to sales",
    ctaHref: routes.contact,
  },
];

export const aiAgentPlans: CatalogPlan[] = [
  {
    id: "agents-starter",
    name: "Agents Starter",
    tagline: "Inbox & FAQ automation for small teams.",
    discountBadge: "Intro pricing",
    priceAnnually: "$7.99",
    originalAnnually: "$14.99",
    billedAnnually: "Billed $95.88 annually",
    saveAnnually: "Save $84",
    priceMonthly: "$14.99",
    billedMonthly: "Billed monthly",
    features: [
      "2 active AI agents",
      "5,000 agent actions / month",
      "Connect business email & web forms",
      "Knowledge base from your site",
      "Human handoff to support",
      "Usage dashboard",
    ],
    ctaLabel: "Get started",
    ctaHref: routes.getStarted,
  },
  {
    id: "agents-pro",
    name: "Agents Pro",
    tagline: "Sales, support & ops in one workflow.",
    discountBadge: "Intro pricing",
    popular: true,
    popularLabel: "Most popular",
    priceAnnually: "$14.99",
    originalAnnually: "$29.99",
    billedAnnually: "Billed $179.88 annually",
    saveAnnually: "Save $180",
    priceMonthly: "$29.99",
    billedMonthly: "Billed monthly",
    features: [
      "10 active AI agents",
      "50,000 agent actions / month",
      "CRM & webhook integrations",
      "Multi-channel (mail, chat, SMS*)",
      "Custom playbooks & guardrails",
      "Priority support",
    ],
    ctaLabel: "Get started",
    ctaHref: routes.getStarted,
  },
  {
    id: "agents-business",
    name: "Agents Business",
    tagline: "Compliance-ready automation at scale.",
    discountBadge: "Intro pricing",
    priceAnnually: "$29.99",
    originalAnnually: "$59.99",
    billedAnnually: "Billed $359.88 annually",
    saveAnnually: "Save $360",
    priceMonthly: "$59.99",
    billedMonthly: "Billed monthly",
    features: [
      "Unlimited AI agents",
      "250,000 agent actions / month",
      "SSO & audit logs",
      "Dedicated model routing",
      "Custom data retention policies",
      "24/7 priority support",
    ],
    ctaLabel: "Get started",
    ctaHref: routes.getStarted,
  },
];

export const businessEmailCatalogPlans: CatalogPlan[] = [
  {
    id: "mail-starter",
    name: "Starter",
    tagline: "Solo entrepreneurs & side projects.",
    discountBadge: "88% OFF",
    priceAnnually: "$0.37",
    originalAnnually: "$2.99",
    billedAnnually: "Per mailbox / month (annual)",
    priceMonthly: "$0.37",
    billedMonthly: "Per mailbox / month",
    features: [
      "1 mailbox included",
      "5 GB storage per mailbox",
      "Agentic Mail",
      "Spam, virus & phishing protection",
      "Webmail & mobile sync",
    ],
    ctaLabel: "Get Starter",
    ctaHref: routes.businessEmail,
  },
  {
    id: "mail-standard",
    name: "Standard",
    tagline: "Small businesses ready to scale.",
    discountBadge: "76% OFF",
    popular: true,
    popularLabel: "Most popular",
    priceAnnually: "$0.97",
    originalAnnually: "$3.99",
    billedAnnually: "Per mailbox / month (annual)",
    priceMonthly: "$0.97",
    billedMonthly: "Per mailbox / month",
    features: [
      "1 mailbox included",
      "20 GB storage per mailbox",
      "Unlimited AI writing & summaries",
      "Open tracking & smart replies",
      "Agentic Mail",
    ],
    ctaLabel: "Get Standard",
    ctaHref: routes.businessEmail,
  },
  {
    id: "mail-premium",
    name: "Premium",
    tagline: "Teams that need advanced insight.",
    discountBadge: "67% OFF",
    priceAnnually: "$1.97",
    originalAnnually: "$5.99",
    billedAnnually: "Per mailbox / month (annual)",
    priceMonthly: "$1.97",
    billedMonthly: "Per mailbox / month",
    features: [
      "1 mailbox included",
      "50 GB storage per mailbox",
      "Free domain for 1 year",
      "Link & attachment tracking",
      "Unlimited AI writing",
    ],
    ctaLabel: "Get Premium",
    ctaHref: routes.businessEmail,
  },
];

export const domainHighlights = [
  {
    tld: ".com",
    note: "The classic for brands worldwide",
    badge: "Popular",
  },
  {
    tld: ".net",
    note: "Trusted for tech & networks",
    badge: "Tech",
  },
  {
    tld: ".store",
    note: "Built for ecommerce storefronts",
    badge: "Commerce",
  },
  {
    tld: ".io",
    note: "Startups & SaaS favorites",
    badge: "Startup",
  },
] as const;
