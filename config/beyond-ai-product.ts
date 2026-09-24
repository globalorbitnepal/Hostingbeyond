/**
 * Beyond AI product configuration — server source of truth.
 * Orbit admin can override via PageContent slug `beyond-ai-product` (future).
 */

import { routes } from "@/config/routes";

export type BeyondAiPlanId = "free" | "pro" | "pro-plus" | "ultra";

export type BeyondAiPlanConfig = {
  id: BeyondAiPlanId;
  name: string;
  shortName: string;
  description: string;
  badge?: string;
  priceMonthly: number;
  priceYearly: number;
  compareAtMonthly?: number;
  includedCreditUsd: number;
  popular?: boolean;
  hosting: {
    included: boolean;
    sites: number | "unlimited";
    ssl: boolean;
    customDomain: boolean;
    subdomain: boolean;
  };
  features: string[];
};

export type BeyondAiModelConfig = {
  id: string;
  provider: string;
  name: string;
  shortLabel: string;
  description: string;
  capability: string;
  /** Estimated USD per typical site-generation request */
  estimatedRequestUsd: number;
  featured: boolean;
  status: "active" | "coming_soon";
};

export const beyondAiPlansConfig: BeyondAiPlanConfig[] = [
  {
    id: "free",
    name: "Beyond AI Free",
    shortName: "Free",
    description: "Start building with AI — hosting included.",
    badge: "GET STARTED",
    priceMonthly: 0,
    priceYearly: 0,
    compareAtMonthly: 10,
    includedCreditUsd: 10,
    hosting: {
      included: true,
      sites: 1,
      ssl: true,
      customDomain: false,
      subdomain: true,
    },
    features: [
      "AI workspace & website builder",
      "Starter AI usage balance",
      "Wide range of leading models",
      "Preview & publish to HostingBeyond",
      "Basic SEO tools",
      "Free HostingBeyond hosting",
    ],
  },
  {
    id: "pro",
    name: "Beyond AI Pro",
    shortName: "Pro",
    description: "For creators shipping real sites every month.",
    badge: "MOST POPULAR",
    priceMonthly: 20,
    priceYearly: 192,
    includedCreditUsd: 20,
    popular: true,
    hosting: {
      included: true,
      sites: 5,
      ssl: true,
      customDomain: true,
      subdomain: true,
    },
    features: [
      "$20 included AI credit each month",
      "Advanced website generation & coding",
      "AI content & SEO tools",
      "Custom domain support",
      "Free HostingBeyond hosting",
      "Higher generation limits",
    ],
  },
  {
    id: "pro-plus",
    name: "Beyond AI Pro+",
    shortName: "Pro+",
    description: "Serious projects, teams, and growing brands.",
    badge: "GROW FURTHER",
    priceMonthly: 40,
    priceYearly: 384,
    includedCreditUsd: 40,
    hosting: {
      included: true,
      sites: 15,
      ssl: true,
      customDomain: true,
      subdomain: true,
    },
    features: [
      "$40 included AI credit each month",
      "Extended model access & priority queue",
      "Larger sites & advanced SEO",
      "Team-ready workspace",
      "On-demand usage support",
      "Free hosting for all published sites",
    ],
  },
  {
    id: "ultra",
    name: "Beyond AI Ultra",
    shortName: "Ultra",
    description: "Agencies and high-volume AI production.",
    badge: "PREMIUM",
    priceMonthly: 100,
    priceYearly: 960,
    includedCreditUsd: 100,
    hosting: {
      included: true,
      sites: "unlimited",
      ssl: true,
      customDomain: true,
      subdomain: true,
    },
    features: [
      "$100 included AI credit each month",
      "Highest usage & priority processing",
      "Multiple projects & premium support",
      "Advanced AI workspace tools",
      "On-demand usage at transparent rates",
      "Free HostingBeyond hosting",
    ],
  },
];

export const beyondAiModelsConfig: BeyondAiModelConfig[] = [
  {
    id: "openai",
    provider: "OpenAI",
    name: "OpenAI",
    shortLabel: "OpenAI",
    description: "Advanced reasoning and structured output.",
    capability: "Advanced reasoning",
    estimatedRequestUsd: 0.45,
    featured: true,
    status: "active",
  },
  {
    id: "gemini",
    provider: "Google",
    name: "Gemini",
    shortLabel: "Gemini",
    description: "Multimodal intelligence for rich layouts.",
    capability: "Multimodal intelligence",
    estimatedRequestUsd: 0.38,
    featured: true,
    status: "active",
  },
  {
    id: "claude",
    provider: "Anthropic",
    name: "Claude",
    shortLabel: "Claude",
    description: "Long-form copy and production code.",
    capability: "Long-form & coding",
    estimatedRequestUsd: 0.42,
    featured: true,
    status: "active",
  },
  {
    id: "grok",
    provider: "xAI",
    name: "Grok",
    shortLabel: "Grok",
    description: "Fast iteration on prompts and edits.",
    capability: "Fast AI assistance",
    estimatedRequestUsd: 0.35,
    featured: true,
    status: "active",
  },
];

export const beyondAiOnDemandConfig = {
  enabledByDefault: false,
  minTopUpUsd: 5,
  defaultEstimateUsd: 0.42,
};

export function getPlanConfig(id: string | undefined): BeyondAiPlanConfig {
  return beyondAiPlansConfig.find((p) => p.id === id) ?? beyondAiPlansConfig[1];
}

export function beyondAiCheckoutPath(planId: BeyondAiPlanId): string {
  return `${routes.beyondAi}/checkout?plan=${planId}`;
}

export function beyondAiWorkspacePath(): string {
  return `${routes.beyondAi}/workspace`;
}
