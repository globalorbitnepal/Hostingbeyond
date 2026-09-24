import { beyondAiPlansConfig } from "@/config/beyond-ai-product";
import { routes } from "@/config/routes";

export type CmsBeyondAiFaq = {
  id: string;
  question: string;
  answer: string;
  visible: boolean;
};

export type CmsBeyondAiPlanCard = {
  id: string;
  visible: boolean;
  badge: string;
  tagline: string;
  meterPct: number;
  cta: string;
  features: string[];
  support: string;
  priceMonthly: number;
  includedCreditUsd: number;
  popular?: boolean;
};

export type CmsBeyondAiPageContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroDescription: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  pricingEyebrow: string;
  pricingTitle: string;
  pricingTitleAccent: string;
  pricingDescription: string;
  saveBadge: string;
  videoVisible: boolean;
  videoEyebrow: string;
  videoTitle: string;
  videoDescription: string;
  videoUrl: string;
  videoCtaLabel: string;
  videoCtaHref: string;
  faqEyebrow: string;
  faqTitle: string;
  faqTitleAccent: string;
  faqDescription: string;
  faqs: CmsBeyondAiFaq[];
  plans: CmsBeyondAiPlanCard[];
};

const defaultFaqs: CmsBeyondAiFaq[] = [
  {
    id: "what",
    question: "What is Beyond AI?",
    answer:
      "Beyond AI is HostingBeyond’s AI workspace to generate websites, content, and code, then publish on included hosting with one account.",
    visible: true,
  },
  {
    id: "credit",
    question: "How does AI credit work?",
    answer:
      "Each plan includes a dollar balance for AI usage. Pay $20 on Pro and you get $20 of model usage per billing period. Estimates appear before you generate.",
    visible: true,
  },
  {
    id: "models",
    question: "Which AI models can I use?",
    answer:
      "Use ChatGPT-class, Gemini, Claude, Grok, and more from one balance — including models via OpenRouter — without switching platforms.",
    visible: true,
  },
  {
    id: "hosting",
    question: "Is hosting really included?",
    answer:
      "Yes. Every plan includes Free Deploy on HostingBeyond with SSL. Limits depend on your plan tier.",
    visible: true,
  },
  {
    id: "ondemand",
    question: "What happens when my credit runs out?",
    answer:
      "Enable on-demand usage. We show the estimated cost and ask you to confirm before any extra charge — never silent billing.",
    visible: true,
  },
  {
    id: "change",
    question: "Can I change plans later?",
    answer:
      "Yes. Upgrade or downgrade from your account when billing is active; credits reset according to your new plan terms.",
    visible: true,
  },
  {
    id: "free",
    question: "Is the Free plan really $0?",
    answer:
      "Yes. Start free with starter AI credit so you can try the full builder and deploy flow.",
    visible: true,
  },
  {
    id: "separate",
    question: "Do I need a separate hosting plan?",
    answer:
      "No separate hosting product is required for sites you publish through Beyond AI on an active plan.",
    visible: true,
  },
];

function defaultPlanCards(): CmsBeyondAiPlanCard[] {
  const display: Record<
    string,
    Omit<
      CmsBeyondAiPlanCard,
      "id" | "priceMonthly" | "includedCreditUsd" | "popular" | "visible"
    >
  > = {
    free: {
      badge: "GET STARTED",
      tagline: "Start building with AI",
      meterPct: 52,
      cta: "Start Free",
      features: [
        "AI website builder",
        "Selected AI models",
        "Website preview",
        "Basic SEO tools",
      ],
      support: "Community support",
    },
    pro: {
      badge: "MOST POPULAR",
      tagline: "For creators building real websites",
      meterPct: 82,
      cta: "Choose Pro",
      features: [
        "Advanced AI website generation",
        "Multiple AI models",
        "AI coding assistance",
        "AI content & SEO tools",
        "Custom domain support",
      ],
      support: "Priority support",
    },
    "pro-plus": {
      badge: "GROW FURTHER",
      tagline: "Serious projects, teams, and growing brands",
      meterPct: 74,
      cta: "Choose Pro+",
      features: [
        "Everything in Pro",
        "Larger AI projects",
        "Advanced coding & customization",
        "More model access",
        "Advanced SEO tools",
      ],
      support: "Priority support",
    },
    ultra: {
      badge: "PREMIUM",
      tagline: "Agencies and high-volume AI production",
      meterPct: 94,
      cta: "Choose Ultra",
      features: [
        "Everything in Pro+",
        "Highest AI usage allowance",
        "Advanced AI workspace",
        "Large project generation",
        "Multiple websites & domains",
      ],
      support: "Premium support",
    },
  };

  return beyondAiPlansConfig.map((p) => ({
    id: p.id,
    visible: true,
    popular: p.popular,
    priceMonthly: p.priceMonthly,
    includedCreditUsd: p.includedCreditUsd,
    ...display[p.id],
  }));
}

export function defaultBeyondAiPageContent(): CmsBeyondAiPageContent {
  return {
    heroEyebrow: "Beyond AI",
    heroTitle: "Build with AI.",
    heroTitleAccent: "Host it here.",
    heroDescription:
      "Create websites, write code, optimize content and launch your projects with leading AI models — all from one workspace on HostingBeyond.",
    heroPrimaryLabel: "Start building",
    heroPrimaryHref: `${routes.beyondAi}/workspace`,
    heroSecondaryLabel: "View plans",
    heroSecondaryHref: "#beyond-ai-plans",
    pricingEyebrow: "Beyond AI",
    pricingTitle: "Choose your",
    pricingTitleAccent: "AI workspace.",
    pricingDescription:
      "Every plan includes AI credit to build, create and launch with powerful AI models — plus Free Deploy.",
    saveBadge: "Save 20%",
    videoVisible: true,
    videoEyebrow: "See it in motion",
    videoTitle: "From prompt to live site — in one flow",
    videoDescription:
      "Watch how Beyond AI generates layouts, copy, and SEO-ready pages, then publishes to HostingBeyond with SSL and hosting included.",
    videoUrl: "",
    videoCtaLabel: "Open workspace",
    videoCtaHref: `${routes.beyondAi}/workspace`,
    faqEyebrow: "Beyond AI",
    faqTitle: "Beyond AI",
    faqTitleAccent: "FAQs",
    faqDescription:
      "Quick answers about credits, models, hosting, and on-demand usage.",
    faqs: defaultFaqs,
    plans: defaultPlanCards(),
  };
}

function mergeFaqs(
  defaults: CmsBeyondAiFaq[],
  stored?: CmsBeyondAiFaq[] | null,
): CmsBeyondAiFaq[] {
  if (!stored?.length) return defaults;
  const byId = new Map(stored.map((f) => [f.id, f]));
  return defaults.map((f) => ({ ...f, ...byId.get(f.id) }));
}

function mergePlans(
  defaults: CmsBeyondAiPlanCard[],
  stored?: CmsBeyondAiPlanCard[] | null,
): CmsBeyondAiPlanCard[] {
  if (!stored?.length) return defaults;
  const byId = new Map(stored.map((p) => [p.id, p]));
  return defaults.map((p) => ({ ...p, ...byId.get(p.id) }));
}

export function mergeBeyondAiPageContent(
  stored?: Partial<CmsBeyondAiPageContent> | null,
): CmsBeyondAiPageContent {
  const defaults = defaultBeyondAiPageContent();
  if (!stored) return defaults;
  return {
    ...defaults,
    ...stored,
    faqs: mergeFaqs(defaults.faqs, stored.faqs),
    plans: mergePlans(defaults.plans, stored.plans),
  };
}
