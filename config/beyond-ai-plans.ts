import { routes } from "@/config/routes";

export type BeyondAiPlanId = "free" | "pro" | "pro-plus" | "ultra";

export type BeyondAiPlan = {
  id: BeyondAiPlanId;
  name: string;
  badge?: string;
  priceMonthly: number;
  compareAt?: number;
  creditBalance: number;
  creditNote: string;
  popular?: boolean;
  features: string[];
  hostingNote: string;
};

export const beyondAiPlans: BeyondAiPlan[] = [
  {
    id: "free",
    name: "Beyond AI Starter",
    badge: "Was $10 — free now",
    priceMonthly: 0,
    compareAt: 10,
    creditBalance: 10,
    creditNote: "$10 AI balance to try every model",
    features: [
      "100+ AI models in one workspace",
      "Publish sites on HostingBeyond — hosting included",
      "Choose GPT-class, Gemini, Claude, Grok & more",
      "On-demand top-up when balance runs low",
      "One active AI site project",
    ],
    hostingNote: "Free hosting on your Beyond AI subdomain",
  },
  {
    id: "pro",
    name: "Beyond AI Pro",
    badge: "Most popular",
    priceMonthly: 20,
    creditBalance: 20,
    creditNote: "Pay $20 → get $20 model balance each month",
    popular: true,
    features: [
      "Everything in Starter, plus higher limits",
      "Unlimited AI chat & site generation sessions",
      "5 active AI websites",
      "Priority model routing",
      "Free custom domain + SSL on annual billing",
    ],
    hostingNote: "Production hosting included — no extra host bill",
  },
  {
    id: "pro-plus",
    name: "Beyond AI Pro+",
    badge: "40% bonus balance",
    priceMonthly: 40,
    creditBalance: 56,
    creditNote: "Pay $40 → get $56 model balance (40% extra)",
    features: [
      "Everything in Pro",
      "15 active AI websites",
      "Team seats (up to 3)",
      "Brand kits & reusable sections",
      "Staging before go-live",
    ],
    hostingNote: "Free hosting for all published sites",
  },
  {
    id: "ultra",
    name: "Beyond AI Ultra",
    badge: "For agencies",
    priceMonthly: 100,
    creditBalance: 100,
    creditNote: "Pay $100 → get $100 model balance monthly",
    features: [
      "Everything in Pro+",
      "Unlimited AI websites",
      "API access & white-label handoff",
      "Dedicated success manager",
      "Highest priority queues",
    ],
    hostingNote: "Enterprise-grade hosting included",
  },
];

export const beyondAiModelShowcase = [
  {
    id: "gpt",
    label: "GPT",
    accent: "from-[#10a37f]/20 to-[#10a37f]/5 text-[#0d8a6a]",
  },
  {
    id: "gemini",
    label: "Gemini",
    accent: "from-[#4285f4]/20 to-[#ea4335]/10 text-[#1a56db]",
  },
  {
    id: "claude",
    label: "Claude",
    accent: "from-[#d97757]/20 to-[#d97757]/5 text-[#c45c3e]",
  },
  {
    id: "grok",
    label: "Grok",
    accent: "from-slate-200 to-slate-100 text-slate-800",
  },
  {
    id: "more",
    label: "+ more",
    accent: "from-[#673de6]/15 to-[#7c3aed]/10 text-[#673de6]",
  },
] as const;

export function getBeyondAiPlan(id: string | undefined): BeyondAiPlan {
  const found = beyondAiPlans.find((p) => p.id === id);
  return found ?? beyondAiPlans[1];
}

export function beyondAiCheckoutHref(planId: BeyondAiPlanId): string {
  return `${routes.beyondAi}/checkout?plan=${planId}`;
}
