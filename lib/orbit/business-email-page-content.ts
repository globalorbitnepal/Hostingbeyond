import { routes } from "@/config/routes";

export type CmsBusinessEmailPlan = {
  id: string;
  visible: boolean;
  name: string;
  bestFor: string;
  original: string;
  price: string;
  price24: string;
  off: string;
  renew: string;
  popular?: boolean;
  mailboxes: string;
  storage: string;
  extras: string;
  features: string[];
};

export type CmsBusinessEmailImpressionTab = {
  id: string;
  visible: boolean;
  label: string;
  title: string;
  points: string[];
  image: string;
  imageAlt: string;
};

export type CmsBusinessEmailFaq = {
  id: string;
  visible: boolean;
  question: string;
  answer: string;
};

export type CmsBusinessEmailReview = {
  id: string;
  visible: boolean;
  quote: string;
  name: string;
  photo: string;
};

export type CmsBusinessEmailIntegration = {
  id: string;
  visible: boolean;
  eyebrow: string;
  title: string;
  description: string;
  linkLabel: string;
  linkHref: string;
};

export type CmsBusinessEmailAiFeature = {
  id: string;
  visible: boolean;
  title: string;
  description: string;
};

export type CmsBusinessEmailSupportTile = {
  id: string;
  visible: boolean;
  icon: "sparkles" | "zap" | "clock" | "lock";
  title: string;
  body: string;
  image: string;
};

export type CmsBusinessEmailPageContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroBullet1: string;
  heroBullet2: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  heroGuarantee: string;

  impressionHeading: string;
  impressionDescription: string;
  impressionTabs: CmsBusinessEmailImpressionTab[];

  pricingHeading: string;
  pricingTrust1: string;
  pricingTrust2: string;
  pricingTrust3: string;
  includedHeading: string;
  included: string[];
  includedFootnote: string;
  plans: CmsBusinessEmailPlan[];

  aiBandEyebrow: string;
  aiBandHeading: string;
  aiFeatures: CmsBusinessEmailAiFeature[];
  aiBandCtaLabel: string;
  aiBandCtaHref: string;

  integrationsHeading: string;
  integrations: CmsBusinessEmailIntegration[];

  migrateHeading: string;
  migrateDescription: string;
  migrateCtaLabel: string;
  migrateCtaHref: string;
  migrateImage: string;
  migrateImageAlt: string;

  marketingHeading: string;
  marketingDescription: string;
  marketingCtaLabel: string;
  marketingCtaHref: string;
  marketingImage: string;
  marketingImageAlt: string;

  reviewsHeading: string;
  reviews: CmsBusinessEmailReview[];

  supportTiles: CmsBusinessEmailSupportTile[];

  faqHeading: string;
  faqDescription: string;
  faqs: CmsBusinessEmailFaq[];

  closingHeading: string;
  closingDescription: string;
  closingCtaLabel: string;
  closingCtaHref: string;
};

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function mergeById<T extends { id: string }>(
  defaults: T[],
  stored: T[] | undefined | null,
  merge: (item: Partial<T>, base: T) => T,
): T[] {
  if (!stored?.length) return defaults;
  const byId = new Map(stored.map((item) => [item.id, item]));
  return defaults.map((base) => {
    const partial = byId.get(base.id) ?? {};
    return merge(partial, base);
  });
}

export function defaultBusinessEmailPageContent(): CmsBusinessEmailPageContent {
  return {
    heroEyebrow: "HostingBeyond Mail",
    heroTitle: "Business email that builds trust",
    heroBullet1: "Work faster with built-in AI",
    heroBullet2: "Look professional with a personal domain",
    heroCtaLabel: "Choose plan",
    heroCtaHref: "#pricing",
    heroGuarantee: "30-day money-back guarantee",

    impressionHeading: "Make the right impression",
    impressionDescription:
      "Every email you send says something about your business. Stand out with your own domain and a signature that reflects your brand.",
    impressionTabs: [
      {
        id: "setup",
        visible: true,
        label: "Set-up",
        title: "Easy setup and migration",
        points: [
          "Connect to email apps like Outlook, Gmail, and more",
          "Bring your old and current emails with you",
          "Ready in minutes — no specialist required",
        ],
        image: "/images/business-email/people/be-team.webp",
        imageAlt: "Team setting up business email on their laptops",
      },
      {
        id: "time",
        visible: true,
        label: "Save time",
        title: "Write in your voice, not a template",
        points: [
          "Set tone once — Friendly, Professional, or Concise",
          "Drafts, replies, and summaries in a few seconds",
          "Search the inbox the way you speak",
        ],
        image: "/images/business-email/people/be-inbox.webp",
        imageAlt: "Customer reading a branded inbox on her phone",
      },
      {
        id: "scale",
        visible: true,
        label: "Scale",
        title: "The inbox that scales with you",
        points: [
          "Up to 50 GB inbox space (or more if you need it)",
          "Send up to 3,000 emails per day",
          "Add and share extra storage across mailboxes",
        ],
        image: "/images/business-email/people/be-highfive.webp",
        imageAlt: "Founders celebrating a growing mailbox plan",
      },
      {
        id: "agents",
        visible: true,
        label: "Agents",
        title: "Mail that works with your agents",
        points: [
          "Dedicated addresses for automations",
          "Webhooks when a message lands",
          "Allow and block lists for sender control",
        ],
        image: "/images/business-email/people/be-team.webp",
        imageAlt: "Team reviewing a branded mailbox together",
      },
    ],

    pricingHeading: "Purchase your AI-powered business email plan",
    pricingTrust1: "30-day money-back guarantee",
    pricingTrust2: "Cancel anytime",
    pricingTrust3: "24/7 support",
    includedHeading: "Every plan has everything you need and more",
    included: [
      "Spam, virus, phishing protection",
      "Access email on any app or device",
      "Track mailbox activity with audit logs",
      "Keep data safe with encryption in transit",
      "Easily migrate your emails",
      "Set auto-replies when you are away",
      "Forward emails to any other address",
      "Catch emails sent to mistyped addresses",
      "Fast, clean, easy-to-use webmail",
    ],
    includedFootnote:
      "All plans are paid upfront. The monthly rate reflects the total plan price divided by the number of months in your plan.",
    plans: [
      {
        id: "starter",
        visible: true,
        name: "Starter",
        bestFor: "solo entrepreneurs",
        original: "$2.99",
        price: "$0.37",
        price24: "$0.67",
        off: "88% off",
        renew: "$1.57",
        mailboxes: "1 mailbox included",
        storage: "5 GB storage per mailbox",
        extras: "5 forwarding rules · 5 email aliases",
        features: ["Agentic Mail", "Spam, virus & phishing protection"],
      },
      {
        id: "standard",
        visible: true,
        name: "Standard",
        bestFor: "small businesses ready to scale",
        original: "$3.99",
        price: "$0.97",
        price24: "$1.47",
        off: "76% off",
        renew: "$2.77",
        popular: true,
        mailboxes: "1 mailbox included",
        storage: "20 GB storage per mailbox",
        extras: "20 forwarding rules · 10 email aliases",
        features: [
          "Search, reply, summarize, and write with AI — unlimited",
          "See who opened your emails",
          "Smart AI-driven replies",
          "Agentic Mail",
        ],
      },
      {
        id: "premium",
        visible: true,
        name: "Premium",
        bestFor: "teams that scale",
        original: "$5.99",
        price: "$1.97",
        price24: "$2.47",
        off: "67% off",
        renew: "$3.97",
        mailboxes: "1 mailbox included",
        storage: "50 GB storage per mailbox",
        extras: "50 forwarding rules · 30 email aliases",
        features: [
          "Free domain for 1 year",
          "Track link clicks and file opens",
          "Search, reply, summarize, and write with AI — unlimited",
          "See who opened your emails",
          "Agentic Mail",
        ],
      },
    ],

    aiBandEyebrow: "Save time",
    aiBandHeading: "Work smarter with AI",
    aiFeatures: [
      {
        id: "tone",
        visible: true,
        title: "Personalized AI",
        description:
          "Describe your tone and style — just once. It remembers and writes like you every time.",
      },
      {
        id: "reply",
        visible: true,
        title: "Write & reply in seconds",
        description:
          "AI writes, replies, and summarizes so you spend less time in the inbox.",
      },
      {
        id: "search",
        visible: true,
        title: "Search like you speak",
        description: "Find any email instantly. No scrolling, no getting lost.",
      },
    ],
    aiBandCtaLabel: "Choose plan",
    aiBandCtaHref: "#pricing",

    integrationsHeading: "Bring your favorite AI assistant into your inbox",
    integrations: [
      {
        id: "chatgpt",
        visible: true,
        eyebrow: "ChatGPT",
        title: "HostingBeyond Mail for ChatGPT",
        description:
          "Add the Mail app in ChatGPT and manage the inbox without leaving the chat. Summarize unread mail, find last week’s thread, or send a reply from the conversation.",
        linkLabel: "Install app",
        linkHref: routes.beyondAi,
      },
      {
        id: "claude",
        visible: true,
        eyebrow: "Claude",
        title: "HostingBeyond Mail for Claude",
        description:
          "Link the mailbox through the official connector and let Claude read, send, and manage mail from the conversation.",
        linkLabel: "Connect to Claude",
        linkHref: routes.beyondAi,
      },
    ],

    migrateHeading: "Bring your inbox with you",
    migrateDescription:
      "Moving from another provider? Import emails, folders, and contacts almost instantly with Beyond Agent — your mailbox assistant.",
    migrateCtaLabel: "Migrate mailbox",
    migrateCtaHref: routes.signup,
    migrateImage: "/images/business-email/people/be-inbox.webp",
    migrateImageAlt: "Mailbox imported and ready to read on a phone",

    marketingHeading: "Go even further with email marketing",
    marketingDescription:
      "Already have the inbox? Send campaigns, grow the list, and track performance with Beyond Reach — the marketing tool that sits next to HostingBeyond Mail.",
    marketingCtaLabel: "Explore Reach",
    marketingCtaHref: routes.beyondAi,
    marketingImage: "/images/business-email/people/be-highfive.webp",
    marketingImageAlt: "Marketers celebrating campaign results",

    reviewsHeading: "Join founders who switched their inbox",
    reviews: [
      {
        id: "1",
        visible: true,
        quote:
          "Domains, WordPress, and mail in one place — the rate is the reason we moved, the inbox is why we stayed.",
        name: "Amina Koirala",
        photo: "/images/business-email/people/p-woman.jpg",
      },
      {
        id: "2",
        visible: true,
        quote:
          "I need mail that just works: no outages, easy renewals, and a branded address clients actually trust.",
        name: "Daniel Mercer",
        photo: "/images/business-email/people/p-man.jpg",
      },
      {
        id: "3",
        visible: true,
        quote:
          "Setup took minutes. We imported years of Gmail history without hiring anyone.",
        name: "Sofia Alvarez",
        photo: "/images/business-email/people/p-woman2.jpg",
      },
    ],

    supportTiles: [
      {
        id: "setup",
        visible: true,
        icon: "sparkles",
        title: "Set up services",
        body: "Connect domains and configure DNS without a ticket.",
        image: "/images/business-email/frames/support-tile.svg",
      },
      {
        id: "fix",
        visible: true,
        icon: "zap",
        title: "Fix common issues",
        body: "Beyond Agent walks technical steps in the panel.",
        image: "/images/business-email/frames/support-tile.svg",
      },
      {
        id: "launch",
        visible: true,
        icon: "clock",
        title: "Launch faster",
        body: "Mailbox and site in the same account, same login.",
        image: "/images/business-email/frames/support-tile.svg",
      },
      {
        id: "human",
        visible: true,
        icon: "lock",
        title: "Human backup",
        body: "24/7 support when the agent should hand off.",
        image: "/images/business-email/frames/support-tile.svg",
      },
    ],

    faqHeading: "Business email FAQs",
    faqDescription:
      "Answers about creating and managing a professional mailbox.",
    faqs: [
      {
        id: "what",
        visible: true,
        question: "What is a business email address?",
        answer:
          "A custom business email uses your own domain — you@yourbrand.com — instead of a free provider. It helps you look professional and keep every send on-brand.",
      },
      {
        id: "hosting",
        visible: true,
        question: "What is email hosting?",
        answer:
          "Email hosting stores, sends, and receives mail on dedicated servers. HostingBeyond Mail works with or without a website on the same account. Hosting plans can also include mailboxes.",
      },
      {
        id: "why",
        visible: true,
        question:
          "Why do I need a business email instead of a free email account?",
        answer:
          "Clients are more likely to trust and reply to a branded address than a free inbox. You also keep work separate from personal mail and improve how messages land.",
      },
      {
        id: "cost",
        visible: true,
        question: "How much does HostingBeyond Mail cost?",
        answer:
          "Plans start at $0.37 per mailbox per month on a 48-month term. Standard is $0.97/mo and Premium is $1.97/mo. You can add storage or change plans as you grow.",
      },
      {
        id: "create",
        visible: true,
        question: "How do I create a business email address?",
        answer:
          "Choose a plan, connect a domain you already own (or register one here), then pick a mailbox name and password. Webmail is ready as soon as DNS is in place.",
      },
      {
        id: "migrate",
        visible: true,
        question: "Can I migrate my existing emails?",
        answer:
          "Yes. After you create a mailbox, import mail, folders, and contacts from Gmail, Outlook, and most IMAP providers in a few clicks.",
      },
      {
        id: "mobile",
        visible: true,
        question:
          "Will my business email work on mobile and with Gmail or Outlook?",
        answer:
          "Use webmail in the browser, or add the mailbox to Gmail, Outlook, Apple Mail, and Android. Setup guides cover the common clients.",
      },
      {
        id: "backup",
        visible: true,
        question: "Does HostingBeyond Mail provide backup and recovery?",
        answer:
          "We recommend regular mailbox backups. Deleted items can be restored from trash within the retention window, and you can export mail anytime.",
      },
      {
        id: "secure",
        visible: true,
        question: "Is business email hosting secure?",
        answer:
          "Plans include spam and virus filters, encrypted transport, and optional two-factor sign-in.",
      },
      {
        id: "ai-off",
        visible: true,
        question: "Can AI be disabled?",
        answer:
          "Yes. Writing, replies, summaries, search assistance, and agents can be turned off per mailbox.",
      },
      {
        id: "agents",
        visible: true,
        question:
          "Can I use HostingBeyond Mail with AI agents and automation tools?",
        answer:
          "Yes. Agentic Mail gives automations a dedicated address, webhook triggers, and allow/block controls. It plugs into n8n, Make, Zapier, and similar tools.",
      },
    ],

    closingHeading: "Start today",
    closingDescription:
      "Get branded business email running now. Grow with AI tools and 24/7 support — from $0.37/mo.",
    closingCtaLabel: "Choose plan",
    closingCtaHref: "#pricing",
  };
}

export function mergeBusinessEmailPageContent(
  stored?: Partial<CmsBusinessEmailPageContent> | null,
): CmsBusinessEmailPageContent {
  const defaults = defaultBusinessEmailPageContent();
  if (!stored) return defaults;

  return {
    ...defaults,
    heroEyebrow: text(stored.heroEyebrow, defaults.heroEyebrow),
    heroTitle: text(stored.heroTitle, defaults.heroTitle),
    heroBullet1: text(stored.heroBullet1, defaults.heroBullet1),
    heroBullet2: text(stored.heroBullet2, defaults.heroBullet2),
    heroCtaLabel: text(stored.heroCtaLabel, defaults.heroCtaLabel),
    heroCtaHref: text(stored.heroCtaHref, defaults.heroCtaHref),
    heroGuarantee: text(stored.heroGuarantee, defaults.heroGuarantee),
    impressionHeading: text(
      stored.impressionHeading,
      defaults.impressionHeading,
    ),
    impressionDescription: text(
      stored.impressionDescription,
      defaults.impressionDescription,
    ),
    pricingHeading: text(stored.pricingHeading, defaults.pricingHeading),
    pricingTrust1: text(stored.pricingTrust1, defaults.pricingTrust1),
    pricingTrust2: text(stored.pricingTrust2, defaults.pricingTrust2),
    pricingTrust3: text(stored.pricingTrust3, defaults.pricingTrust3),
    includedHeading: text(stored.includedHeading, defaults.includedHeading),
    included:
      stored.included?.length && stored.included.some((l) => l.trim())
        ? stored.included
        : defaults.included,
    includedFootnote: text(stored.includedFootnote, defaults.includedFootnote),
    aiBandEyebrow: text(stored.aiBandEyebrow, defaults.aiBandEyebrow),
    aiBandHeading: text(stored.aiBandHeading, defaults.aiBandHeading),
    aiBandCtaLabel: text(stored.aiBandCtaLabel, defaults.aiBandCtaLabel),
    aiBandCtaHref: text(stored.aiBandCtaHref, defaults.aiBandCtaHref),
    integrationsHeading: text(
      stored.integrationsHeading,
      defaults.integrationsHeading,
    ),
    migrateHeading: text(stored.migrateHeading, defaults.migrateHeading),
    migrateDescription: text(
      stored.migrateDescription,
      defaults.migrateDescription,
    ),
    migrateCtaLabel: text(stored.migrateCtaLabel, defaults.migrateCtaLabel),
    migrateCtaHref: text(stored.migrateCtaHref, defaults.migrateCtaHref),
    migrateImage: text(stored.migrateImage, defaults.migrateImage),
    migrateImageAlt: text(stored.migrateImageAlt, defaults.migrateImageAlt),
    marketingHeading: text(stored.marketingHeading, defaults.marketingHeading),
    marketingDescription: text(
      stored.marketingDescription,
      defaults.marketingDescription,
    ),
    marketingCtaLabel: text(
      stored.marketingCtaLabel,
      defaults.marketingCtaLabel,
    ),
    marketingCtaHref: text(stored.marketingCtaHref, defaults.marketingCtaHref),
    marketingImage: text(stored.marketingImage, defaults.marketingImage),
    marketingImageAlt: text(
      stored.marketingImageAlt,
      defaults.marketingImageAlt,
    ),
    reviewsHeading: text(stored.reviewsHeading, defaults.reviewsHeading),
    faqHeading: text(stored.faqHeading, defaults.faqHeading),
    faqDescription: text(stored.faqDescription, defaults.faqDescription),
    closingHeading: text(stored.closingHeading, defaults.closingHeading),
    closingDescription: text(
      stored.closingDescription,
      defaults.closingDescription,
    ),
    closingCtaLabel: text(stored.closingCtaLabel, defaults.closingCtaLabel),
    closingCtaHref: text(stored.closingCtaHref, defaults.closingCtaHref),
    impressionTabs: mergeById(
      defaults.impressionTabs,
      stored.impressionTabs,
      (item, base) => ({
        ...base,
        ...item,
        label: text(item.label, base.label),
        title: text(item.title, base.title),
        points:
          item.points?.length && item.points.some((p) => p.trim())
            ? item.points
            : base.points,
        image: text(item.image, base.image),
        imageAlt: text(item.imageAlt, base.imageAlt),
        visible: item.visible !== false,
      }),
    ),
    plans: mergeById(defaults.plans, stored.plans, (item, base) => ({
      ...base,
      ...item,
      name: text(item.name, base.name),
      bestFor: text(item.bestFor, base.bestFor),
      original: text(item.original, base.original),
      price: text(item.price, base.price),
      price24: text(item.price24, base.price24),
      off: text(item.off, base.off),
      renew: text(item.renew, base.renew),
      mailboxes: text(item.mailboxes, base.mailboxes),
      storage: text(item.storage, base.storage),
      extras: text(item.extras, base.extras),
      features:
        item.features?.length && item.features.some((f) => f.trim())
          ? item.features
          : base.features,
      visible: item.visible !== false,
      popular: item.popular ?? base.popular,
    })),
    aiFeatures: mergeById(
      defaults.aiFeatures,
      stored.aiFeatures,
      (item, base) => ({
        ...base,
        title: text(item.title, base.title),
        description: text(item.description, base.description),
        visible: item.visible !== false,
      }),
    ),
    integrations: mergeById(
      defaults.integrations,
      stored.integrations,
      (item, base) => ({
        ...base,
        eyebrow: text(item.eyebrow, base.eyebrow),
        title: text(item.title, base.title),
        description: text(item.description, base.description),
        linkLabel: text(item.linkLabel, base.linkLabel),
        linkHref: text(item.linkHref, base.linkHref),
        visible: item.visible !== false,
      }),
    ),
    reviews: mergeById(defaults.reviews, stored.reviews, (item, base) => ({
      ...base,
      quote: text(item.quote, base.quote),
      name: text(item.name, base.name),
      photo: text(item.photo, base.photo),
      visible: item.visible !== false,
    })),
    supportTiles: mergeById(
      defaults.supportTiles,
      stored.supportTiles,
      (item, base) => ({
        ...base,
        icon: (item.icon ?? base.icon) as CmsBusinessEmailSupportTile["icon"],
        title: text(item.title, base.title),
        body: text(item.body, base.body),
        image: text(item.image, base.image),
        visible: item.visible !== false,
      }),
    ),
    faqs: mergeById(defaults.faqs, stored.faqs, (item, base) => ({
      ...base,
      question: text(item.question, base.question),
      answer: text(item.answer, base.answer),
      visible: item.visible !== false,
    })),
  };
}
