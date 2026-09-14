import { mainNavigation } from "@/config/navigation";
import { productOffers } from "@/config/products";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";

export type CmsSiteSettings = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  locale: string;
  twitterHandle: string;
  logoPath: string;
  ogImagePath: string;
  loginLabel: string;
  getStartedLabel: string;
  getStartedHref: string;
  loginHref: string;
  contactEmail: string;
  contactPhone: string;
  social: {
    twitter: string;
    linkedin: string;
    facebook: string;
  };
};

export type CmsDomainTld = {
  tld: string;
  priceLabel: string;
  visible: boolean;
};

export type CmsTechPartner = {
  id: string;
  label: string;
  /** Optional uploaded logo; empty = built-in monochrome mark */
  imageUrl: string;
  visible: boolean;
  order: number;
};

export type CmsHeroContent = {
  visible: boolean;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  description: string;
  searchPlaceholder: string;
  searchButtonLabel: string;
  bulkSearchLabel: string;
  /** Soft atmosphere / scene plate behind the speaker */
  backgroundImage: string;
  /** Clear mid-body speaker cutout (transparent PNG preferred) */
  speakerImage: string;
  /** Left glass panel stacked lines (newline-separated) */
  glassPanelLeft: string;
  /** Right glass panel caption */
  glassPanelRight: string;
  trustItems: Array<{ title: string; subtitle: string; icon: string }>;
  stats: Array<{ value: string; label: string; icon: string }>;
  /** Editable domain TLD price teasers shown in hero search */
  domainPricing?: CmsDomainTld[];
  /** Technology / trust strip logos */
  technologyPartners?: CmsTechPartner[];
  /** Slim feature bar under the hero (offer + icons + CTA) */
  featureBar?: CmsHeroFeatureBar;
};

export type CmsHeroFeatureItem = {
  id: string;
  visible: boolean;
  order: number;
  title: string;
  subtitle: string;
  iconUrl: string;
};

export type CmsHeroFeatureBar = {
  offerEyebrow: string;
  offerTitle: string;
  offerHighlight: string;
  ctaLabel: string;
  ctaHref: string;
  items: CmsHeroFeatureItem[];
};

export type CmsProductOffer = {
  id: string;
  visible: boolean;
  order: number;
  title: string;
  subtitle: string;
  badge: string;
  accent: "blue" | "purple" | "cyan";
  /** Optional display override; empty = use localized pricing engine */
  priceOverride: string;
  priceSuffix: string;
  highlight: string;
  priceLabel: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  searchEnabled: boolean;
  searchPlaceholder: string;
  searchButtonLabel: string;
  iconUrl: string;
  illustrationUrl: string;
};

export type CmsProductsContent = {
  visible: boolean;
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  offers: CmsProductOffer[];
};

export type CmsHostingPlan = {
  id: string;
  visible: boolean;
  order: number;
  name: string;
  tagline: string;
  discountBadge: string;
  popular: boolean;
  popularLabel: string;
  accent: "blue" | "purple" | "gradient";
  /** Per-month price when Annually is selected */
  priceAnnually: string;
  /** Strikethrough when Annually is selected */
  originalAnnually: string;
  billedAnnually: string;
  saveAnnually: string;
  /** Per-month price when Monthly is selected */
  priceMonthly: string;
  originalMonthly: string;
  billedMonthly: string;
  saveMonthly: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
};

export type CmsHostingGuarantee = {
  id: string;
  title: string;
  description: string;
  icon: "shield" | "lock" | "rocket" | "globe" | "headphones";
};

export type CmsHostingPlansContent = {
  visible: boolean;
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  supportLabel: string;
  activationLabel: string;
  uptimeLabel: string;
  saveBadge: string;
  annualToggleLabel: string;
  monthlyToggleLabel: string;
  defaultBilling: "annually" | "monthly";
  plans: CmsHostingPlan[];
  guarantees: CmsHostingGuarantee[];
};

export type CmsBeyondAiSite = {
  id: string;
  visible: boolean;
  order: number;
  name: string;
  domain: string;
  imageUrl: string;
  imageAlt: string;
  status: string;
};

export type CmsBeyondAiHighlight = {
  id: string;
  title: string;
  subtitle: string;
  icon: "zap" | "cloud" | "globe" | "rocket";
};

export type CmsBeyondAiFeature = {
  id: string;
  title: string;
  description: string;
  icon: "wand" | "layers" | "users" | "gauge";
};

export type CmsBeyondAiContent = {
  visible: boolean;
  badge: string;
  badgeSecondary: string;
  title: string;
  titleAccent: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  trust1: string;
  trust2: string;
  trust3: string;
  dashboardTitle: string;
  toastTitle: string;
  toastSubtitle: string;
  statsLabel: string;
  statsValue: string;
  statsHint: string;
  saasTitle: string;
  saasItems: string[];
  highlights: CmsBeyondAiHighlight[];
  sites: CmsBeyondAiSite[];
  features: CmsBeyondAiFeature[];
};

export type CmsBusinessEmailHighlight = {
  id: string;
  title: string;
  subtitle: string;
  icon: "shield" | "lock" | "zap" | "users";
};

export type CmsBusinessEmailStat = {
  id: string;
  title: string;
  subtitle: string;
  icon: "chart" | "globe" | "shield";
};

export type CmsBusinessEmailFeature = {
  id: string;
  title: string;
  description: string;
  icon: "globe" | "layers" | "headphones" | "users";
};

export type CmsBusinessEmailMessage = {
  id: string;
  sender: string;
  preview: string;
  time: string;
  accent: string;
};

export type CmsBusinessEmailContent = {
  visible: boolean;
  badge: string;
  title: string;
  titleAccent: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  handwrittenNote: string;
  trust1: string;
  trust2: string;
  trust3: string;
  toastEmail: string;
  toastLabel: string;
  mailTitle: string;
  composeLabel: string;
  imageUrl: string;
  imageAlt: string;
  highlights: CmsBusinessEmailHighlight[];
  messages: CmsBusinessEmailMessage[];
  stats: CmsBusinessEmailStat[];
  features: CmsBusinessEmailFeature[];
};

export type CmsAiAssistantHighlight = {
  id: string;
  title: string;
  subtitle: string;
  icon: "zap" | "layers" | "shield" | "users";
};

export type CmsAiAssistantPrompt = {
  id: string;
  label: string;
  icon: "globe" | "layers" | "search" | "refresh";
};

export type CmsAiAssistantStat = {
  id: string;
  title: string;
  subtitle: string;
  icon: "globe" | "layers" | "users";
};

export type CmsAiAssistantPartner = {
  id: string;
  label: string;
};

export type CmsAiAssistantContent = {
  visible: boolean;
  badge: string;
  title: string;
  titleAccent: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  handwrittenNote: string;
  botName: string;
  botStatus: string;
  helloTitle: string;
  helloSubtitle: string;
  imageUrl: string;
  imageAlt: string;
  partners: CmsAiAssistantPartner[];
  highlights: CmsAiAssistantHighlight[];
  prompts: CmsAiAssistantPrompt[];
  stats: CmsAiAssistantStat[];
};

export type CmsHostingTypeCard = {
  id: string;
  visible: boolean;
  order: number;
  title: string;
  description: string;
  href: string;
  accent: "blue" | "purple";
  icon: "cloud" | "cart" | "wordpress" | "user";
  ctaLabel: string;
  imageUrl: string;
  imageAlt: string;
  /** Bottom visual chrome over the photo */
  overlayStyle: "cloud" | "shop" | "gallery" | "studio";
  overlayCaption: string;
  overlayStat: string;
  overlayPills: string[];
};

export type CmsHostingTypesContent = {
  visible: boolean;
  cards: CmsHostingTypeCard[];
};

export type CmsSolutionImage = {
  id: string;
  url: string;
  alt: string;
  visible: boolean;
  order: number;
};

export type CmsSolutionProduct = {
  id: string;
  visible: boolean;
  order: number;
  category: string;
  name: string;
  description: string;
  badge: string;
  icon:
    | "server"
    | "cloud"
    | "cart"
    | "wordpress"
    | "users"
    | "mail"
    | "cpu"
    | "globe";
  ctaLabel: string;
  ctaHref: string;
  images: CmsSolutionImage[];
};

export type CmsSolutionsContent = {
  visible: boolean;
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  products: CmsSolutionProduct[];
};

export type CmsWhyChooseIcon =
  | "zap"
  | "shield"
  | "database"
  | "globe"
  | "lock"
  | "mouse"
  | "wordpress"
  | "chart"
  | "mail"
  | "cloud"
  | "code"
  | "secure"
  | "layers"
  | "headphones"
  | "star";

export type CmsWhyChooseItem = {
  id: string;
  visible: boolean;
  order: number;
  title: string;
  description: string;
  icon: CmsWhyChooseIcon;
};

export type CmsWhyChooseContent = {
  visible: boolean;
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  handwrittenNote: string;
  items: CmsWhyChooseItem[];
};

export type CmsFaqItem = {
  id: string;
  visible: boolean;
  order: number;
  question: string;
  answer: string;
};

export type CmsFaqGroup = {
  id: string;
  visible: boolean;
  order: number;
  title: string;
  icon: "layers" | "chart";
  items: CmsFaqItem[];
};

export type CmsHomeFaqsContent = {
  visible: boolean;
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  handwrittenNote: string;
  ctaLabel: string;
  previewCount: number;
  groups: CmsFaqGroup[];
};

export type CmsFooterLink = {
  id: string;
  visible: boolean;
  order: number;
  label: string;
  href: string;
};

export type CmsFooterColumn = {
  id: string;
  visible: boolean;
  order: number;
  title: string;
  links: CmsFooterLink[];
};

export type CmsFooterSocial = {
  id: string;
  visible: boolean;
  order: number;
  network: "facebook" | "instagram" | "x" | "linkedin" | "youtube";
  href: string;
};

export type CmsFooterPerk = {
  id: string;
  visible: boolean;
  order: number;
  title: string;
  icon: "tag" | "list" | "bell";
};

export type CmsFooterTrustItem = {
  id: string;
  visible: boolean;
  order: number;
  title: string;
  subtitle: string;
  icon: "shield" | "globe" | "headphones";
};

export type CmsFooterPayment = {
  id: string;
  visible: boolean;
  order: number;
  brand:
    | "visa"
    | "mastercard"
    | "amex"
    | "discover"
    | "jcb"
    | "diners"
    | "unionpay"
    | "applepay"
    | "googlepay"
    | "stripe";
};

export type CmsFooterBenefit = {
  id: string;
  visible: boolean;
  order: number;
  label: string;
};

export type CmsFooterContent = {
  visible: boolean;
  newsletterEyebrow: string;
  newsletterTitle: string;
  newsletterTitleAccent: string;
  newsletterDescription: string;
  newsletterPlaceholder: string;
  newsletterCta: string;
  newsletterPrivacy: string;
  newsletterPerks: CmsFooterPerk[];
  brandTagline: string;
  brandDescription: string;
  social: CmsFooterSocial[];
  columns: CmsFooterColumn[];
  paymentsTitle: string;
  paymentsDescription: string;
  payments: CmsFooterPayment[];
  paymentBenefits: CmsFooterBenefit[];
  trustItems: CmsFooterTrustItem[];
  handwrittenNote: string;
  legalLinks: CmsFooterLink[];
  copyright: string;
};

export type CmsHomeSections = {
  hero: CmsHeroContent;
  solutions: CmsSolutionsContent;
  products: CmsProductsContent;
  hostingTypes: CmsHostingTypesContent;
  hostingPlans: CmsHostingPlansContent;
  beyondAi: CmsBeyondAiContent;
  businessEmail: CmsBusinessEmailContent;
  aiAssistant: CmsAiAssistantContent;
  whyChoose: CmsWhyChooseContent;
  homeFaqs: CmsHomeFaqsContent;
  footer: CmsFooterContent;
  navigation: typeof mainNavigation;
};

export type CmsLoginOAuthButton = {
  visible: boolean;
  label: string;
  href: string;
};

export type CmsLoginFeature = {
  id: string;
  title: string;
  description: string;
  icon: "shield" | "zap" | "headphones" | "lock";
};

export type CmsLoginPage = {
  logoPath: string;
  tagline: string;
  copyright: string;
  badge: string;
  headline: string;
  headlineAccent: string;
  description: string;
  features: CmsLoginFeature[];
  cardTitle: string;
  cardSubtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  rememberLabel: string;
  forgotLabel: string;
  forgotHref: string;
  loginCtaLabel: string;
  signupPrompt: string;
  signupLabel: string;
  signupHref: string;
  dividerLabel: string;
  google: CmsLoginOAuthButton;
  github: CmsLoginOAuthButton;
  facebook: CmsLoginOAuthButton;
  backgroundImage: string;
};

export function defaultLoginPage(): CmsLoginPage {
  return {
    logoPath: "/logo/hostingbeyond-logo-v5.png",
    tagline: "",
    copyright: "© 2025 HostingBeyond. All rights reserved.",
    badge: "Everything You Need, All in One Place",
    headline: "Power Your Online Success with",
    headlineAccent: "HostingBeyond",
    description:
      "Premium hosting solutions, powerful tools, and 24/7 support to help your business grow online with confidence.",
    features: [
      {
        id: "secure",
        title: "Secure & Reliable",
        description: "Enterprise-grade security for your peace of mind.",
        icon: "shield",
      },
      {
        id: "performance",
        title: "High Performance",
        description: "Lightning-fast servers for optimal performance.",
        icon: "zap",
      },
      {
        id: "support",
        title: "24/7 Support",
        description: "Expert support whenever you need us.",
        icon: "headphones",
      },
      {
        id: "uptime",
        title: "99.99% Uptime",
        description: "Guaranteed uptime for your business reliability.",
        icon: "lock",
      },
    ],
    cardTitle: "Welcome Back",
    cardSubtitle:
      "Login to your account and continue managing your hosting services.",
    emailLabel: "Email address",
    emailPlaceholder: "Enter your email address",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    rememberLabel: "Remember me",
    forgotLabel: "Forgot password?",
    forgotHref: "/forgot-password",
    loginCtaLabel: "Login",
    signupPrompt: "Don't have an account?",
    signupLabel: "Sign up",
    signupHref: "/signup",
    dividerLabel: "OR",
    google: {
      visible: true,
      label: "Continue with Google",
      href: "/api/auth/oauth/google",
    },
    github: {
      visible: true,
      label: "Continue with GitHub",
      href: "/api/auth/oauth/github",
    },
    facebook: {
      visible: true,
      label: "Continue with Facebook",
      href: "/api/auth/oauth/facebook",
    },
    backgroundImage: "",
  };
}

export function mergeLoginPage(
  stored?: Partial<CmsLoginPage> | null,
): CmsLoginPage {
  const defaults = defaultLoginPage();
  if (!stored) return defaults;

  const storedFeatures = Array.isArray(stored.features) ? stored.features : [];
  const features: CmsLoginFeature[] =
    storedFeatures.length > 0
      ? storedFeatures.map((item, index) => {
          const fallback = defaults.features[index % defaults.features.length];
          const icon: CmsLoginFeature["icon"] =
            item.icon === "zap" ||
            item.icon === "headphones" ||
            item.icon === "lock"
              ? item.icon
              : "shield";
          return {
            ...fallback,
            ...item,
            id: item.id || `feature-${index}`,
            icon,
          };
        })
      : defaults.features;

  return {
    ...defaults,
    ...stored,
    features,
    backgroundImage:
      typeof stored.backgroundImage === "string"
        ? stored.backgroundImage === "/images/login-bg.jpg"
          ? ""
          : stored.backgroundImage
        : defaults.backgroundImage,
    tagline:
      !stored.tagline ||
      stored.tagline.includes("BEYOND HOSTING") ||
      stored.tagline.includes("BEYOND POSSIBILITIES")
        ? ""
        : stored.tagline,
    google: {
      ...defaults.google,
      ...stored.google,
      visible: stored.google?.visible ?? defaults.google.visible,
    },
    github: {
      ...defaults.github,
      ...stored.github,
      visible: stored.github?.visible ?? defaults.github.visible,
    },
    facebook: {
      ...defaults.facebook,
      ...stored.facebook,
      visible: stored.facebook?.visible ?? defaults.facebook.visible,
    },
    signupHref:
      !stored.signupHref ||
      stored.signupHref === "#" ||
      stored.signupHref === "/get-started"
        ? "/signup"
        : stored.signupHref,
    logoPath:
      stored.logoPath && stored.logoPath.includes("/uploads")
        ? stored.logoPath
        : "/logo/hostingbeyond-logo-v5.png",
  };
}

export function defaultSiteSettings(): CmsSiteSettings {
  return {
    name: siteConfig.name,
    tagline: siteConfig.tagline,
    description: siteConfig.description,
    url: siteConfig.url,
    locale: siteConfig.locale,
    twitterHandle: siteConfig.twitterHandle,
    logoPath: "/logo/hostingbeyond-logo-v5.png",
    ogImagePath: "/images/hero-speaker-light.png",
    loginLabel: "Login",
    getStartedLabel: "Get Started",
    getStartedHref: "/signup",
    loginHref: "/login",
    contactEmail: "hello@hostingbeyond.com",
    contactPhone: "",
    social: {
      twitter: "https://twitter.com/hostingbeyond",
      linkedin: "",
      facebook: "",
    },
  };
}

function defaultHostingPlans(): CmsHostingPlan[] {
  return [
    {
      id: "essential",
      visible: true,
      order: 0,
      name: "Beyond Essential",
      tagline: "Perfect for individuals and small businesses.",
      discountBadge: "70% OFF",
      popular: false,
      popularLabel: "",
      accent: "blue",
      priceAnnually: "$2.40",
      originalAnnually: "$7.99",
      billedAnnually: "Billed $28.80 annually",
      saveAnnually: "Save $67.09",
      priceMonthly: "$7.99",
      originalMonthly: "",
      billedMonthly: "Billed monthly",
      saveMonthly: "",
      features: [
        "1 Website",
        "10 GB NVMe SSD Storage",
        "Unmetered Bandwidth",
        "2 GB RAM",
        "1 Email Account",
        "Free SSL Certificate",
        "Weekly Backups",
        "Managed WordPress",
        "24/7 Expert Support",
      ],
      ctaLabel: "Get Started",
      ctaHref: routes.getStarted,
    },
    {
      id: "plus",
      visible: true,
      order: 1,
      name: "Beyond Plus",
      tagline: "Great for growing businesses and multiple websites.",
      discountBadge: "70% OFF",
      popular: false,
      popularLabel: "",
      accent: "blue",
      priceAnnually: "$4.80",
      originalAnnually: "$15.99",
      billedAnnually: "Billed $57.60 annually",
      saveAnnually: "Save $111.89",
      priceMonthly: "$15.99",
      originalMonthly: "",
      billedMonthly: "Billed monthly",
      saveMonthly: "",
      features: [
        "5 Websites",
        "20 GB NVMe SSD Storage",
        "Unmetered Bandwidth",
        "4 GB RAM",
        "10 Email Accounts",
        "Free SSL Certificate",
        "Daily Backups",
        "Managed WordPress",
        "Free Website Migration",
        "24/7 Expert Support",
      ],
      ctaLabel: "Get Started",
      ctaHref: routes.getStarted,
    },
    {
      id: "pro",
      visible: true,
      order: 2,
      name: "Beyond Pro",
      tagline: "Advanced tools for ambitious entrepreneurs.",
      discountBadge: "70% OFF",
      popular: true,
      popularLabel: "Most Popular",
      accent: "gradient",
      priceAnnually: "$7.50",
      originalAnnually: "$24.99",
      billedAnnually: "Billed $90.00 annually",
      saveAnnually: "Save $174.89",
      priceMonthly: "$24.99",
      originalMonthly: "",
      billedMonthly: "Billed monthly",
      saveMonthly: "",
      features: [
        "Unlimited Websites",
        "40 GB NVMe SSD Storage",
        "Unmetered Bandwidth",
        "6 GB RAM",
        "Unlimited Email Accounts",
        "Free SSL Certificate",
        "Daily Backups",
        "Managed WordPress",
        "Free Website Migration",
        "Priority Support",
        "PHP, Python & Node.js Support",
      ],
      ctaLabel: "Get Started",
      ctaHref: routes.getStarted,
    },
    {
      id: "ultimate",
      visible: true,
      order: 3,
      name: "Beyond Ultimate",
      tagline: "Maximum performance for high-traffic websites.",
      discountBadge: "70% OFF",
      popular: false,
      popularLabel: "",
      accent: "purple",
      priceAnnually: "$12.00",
      originalAnnually: "$39.99",
      billedAnnually: "Billed $144.00 annually",
      saveAnnually: "Save $279.89",
      priceMonthly: "$39.99",
      originalMonthly: "",
      billedMonthly: "Billed monthly",
      saveMonthly: "",
      features: [
        "Unlimited Websites",
        "60 GB NVMe SSD Storage",
        "Unmetered Bandwidth",
        "8 GB RAM",
        "Unlimited Email Accounts",
        "Free SSL Certificate",
        "Daily Backups",
        "Managed WordPress",
        "Advanced Performance (5× Faster)",
        "Priority Support",
        "PHP, Python & Node.js Support",
      ],
      ctaLabel: "Get Started",
      ctaHref: routes.getStarted,
    },
  ];
}

function defaultHostingPlansSection(): CmsHostingPlansContent {
  return {
    visible: true,
    eyebrow: "Web Hosting Plans",
    title: "Web Hosting",
    titleAccent: "Plans & Pricing",
    description:
      "Powerful hosting for individuals, businesses and growing brands. Choose the perfect plan and start building your online presence today.",
    supportLabel: "24/7 Expert Support",
    activationLabel: "Instant Activation",
    uptimeLabel: "99.9% Uptime",
    saveBadge: "Save 70%",
    annualToggleLabel: "Annually",
    monthlyToggleLabel: "Monthly",
    defaultBilling: "annually",
    plans: defaultHostingPlans(),
    guarantees: [
      {
        id: "moneyback",
        title: "30-Day Money-Back Guarantee",
        description:
          "Try risk-free. If you're not satisfied, get a full refund within 30 days.",
        icon: "shield",
      },
      {
        id: "secure",
        title: "Secure & Reliable Infrastructure",
        description:
          "Enterprise-grade security and daily backups keep your sites protected.",
        icon: "lock",
      },
      {
        id: "network",
        title: "Global Network",
        description:
          "High-performance servers for a faster, smoother experience.",
        icon: "globe",
      },
      {
        id: "support",
        title: "24/7 Expert Support",
        description: "Real people. Real help. Anytime, anywhere.",
        icon: "headphones",
      },
    ],
  };
}

export function defaultBeyondAiSection(): CmsBeyondAiContent {
  return {
    visible: true,
    badge: "Beyond AI",
    badgeSecondary: "Built for Everyone",
    title: "Create Stunning\nWebsites with",
    titleAccent: "Beyond AI",
    description:
      "All your sites, one place. Create, design and publish professional websites in minutes with AI — no extra hosting, no complex setup. Powered by our high-speed servers and modern SaaS platform.",
    primaryCtaLabel: "Start Building with Beyond AI",
    primaryCtaHref: routes.beyondAi,
    secondaryCtaLabel: "View Templates",
    secondaryCtaHref: routes.beyondAi,
    trust1: "No credit card required",
    trust2: "Free to try",
    trust3: "Launch in minutes",
    dashboardTitle: "My Websites",
    toastTitle: "Website Published!",
    toastSubtitle: "yourbrand.com is now live",
    statsLabel: "Total Websites",
    statsValue: "12",
    statsHint: "+4 this month",
    saasTitle: "Powered by SaaS",
    saasItems: [
      "Your sites, forever",
      "Built-in hosting & domain",
      "AI tools included",
      "Team collaboration",
      "Scalable for business",
    ],
    highlights: [
      {
        id: "publish",
        title: "One Click Publish",
        subtitle: "Go live instantly",
        icon: "zap",
      },
      {
        id: "hosting",
        title: "No Extra Hosting",
        subtitle: "Everything included",
        icon: "cloud",
      },
      {
        id: "sites",
        title: "All Sites One Place",
        subtitle: "Manage with ease",
        icon: "globe",
      },
      {
        id: "speed",
        title: "High Speed Servers",
        subtitle: "Built for performance",
        icon: "rocket",
      },
    ],
    sites: [
      {
        id: "hotel",
        visible: true,
        order: 0,
        name: "Hotel Website",
        domain: "hotel.com",
        imageUrl: "/images/beyond-ai/hotel.jpg",
        imageAlt: "Luxury hotel website preview",
        status: "Live",
      },
      {
        id: "trekking",
        visible: true,
        order: 1,
        name: "Trekking Adventure",
        domain: "trekking.com",
        imageUrl: "/images/beyond-ai/trekking.jpg",
        imageAlt: "Trekking adventure website preview",
        status: "Live",
      },
      {
        id: "business",
        visible: true,
        order: 2,
        name: "Business Site",
        domain: "business.com",
        imageUrl: "/images/beyond-ai/business.jpg",
        imageAlt: "Business website preview",
        status: "Live",
      },
    ],
    features: [
      {
        id: "create",
        title: "AI Website Creation",
        description:
          "Describe your idea and let AI build your website in seconds.",
        icon: "wand",
      },
      {
        id: "platform",
        title: "All-in-One Platform",
        description: "Hosting, domain, database and everything included.",
        icon: "layers",
      },
      {
        id: "saas",
        title: "SaaS Based System",
        description: "Manage multiple websites, clients and teams easily.",
        icon: "users",
      },
      {
        id: "performance",
        title: "High Performance",
        description: "Optimized servers for blazing fast speed and uptime.",
        icon: "gauge",
      },
    ],
  };
}

export function defaultBusinessEmailSection(): CmsBusinessEmailContent {
  return {
    visible: true,
    badge: "Business Email",
    title: "Professional Email",
    titleAccent: "for Your Business",
    description:
      "A secure, reliable and high-performance email solution at the world's lowest rates — without compromise.",
    primaryCtaLabel: "Get Your Business Email",
    primaryCtaHref: routes.businessEmail,
    secondaryCtaLabel: "See How It Works",
    secondaryCtaHref: routes.businessEmail,
    handwrittenNote: "Same professional you. A bigger tomorrow.",
    trust1: "Custom domain included",
    trust2: "Mailbox in minutes",
    trust3: "99.9% uptime SLA",
    toastEmail: "you@yourcompany.com",
    toastLabel: "Connected",
    mailTitle: "Global Mail",
    composeLabel: "Compose",
    imageUrl: "/images/business-email/woman.png",
    imageAlt: "Professional using HostingBeyond business email on a laptop",
    highlights: [
      {
        id: "domain",
        title: "Custom Domain",
        subtitle: "you@yourbrand.com",
        icon: "shield",
      },
      {
        id: "secure",
        title: "Secure & Private",
        subtitle: "Encrypted inbox",
        icon: "lock",
      },
      {
        id: "fast",
        title: "Fast Performance",
        subtitle: "Instant delivery",
        icon: "zap",
      },
      {
        id: "teams",
        title: "Built for Teams",
        subtitle: "Shared mailboxes",
        icon: "users",
      },
    ],
    messages: [
      {
        id: "client",
        sender: "Client Support",
        preview: "Re: Project Update",
        time: "10:24 AM",
        accent: "#2563eb",
      },
      {
        id: "marketing",
        sender: "Marketing Team",
        preview: "Campaign Results",
        time: "09:15 AM",
        accent: "#f59e0b",
      },
      {
        id: "sales",
        sender: "Sales",
        preview: "New Enquiry",
        time: "Yesterday",
        accent: "#10b981",
      },
      {
        id: "hr",
        sender: "HR Department",
        preview: "Welcome to the Team",
        time: "Yesterday",
        accent: "#8b5cf6",
      },
    ],
    stats: [
      {
        id: "reach",
        title: "Global Reach",
        subtitle: "Stay Connected Everywhere",
        icon: "chart",
      },
      {
        id: "cost",
        title: "Ultra Low Cost",
        subtitle: "World's Best Rates",
        icon: "globe",
      },
      {
        id: "uptime",
        title: "99.9% Uptime",
        subtitle: "Reliable & Secure",
        icon: "shield",
      },
    ],
    features: [
      {
        id: "infra",
        title: "Global Infrastructure",
        description: "Mail routed across worldwide points of presence.",
        icon: "globe",
      },
      {
        id: "servers",
        title: "High Performance Email Servers",
        description: "Fast, dedicated servers built for business inboxes.",
        icon: "layers",
      },
      {
        id: "support",
        title: "24/7 Expert Support",
        description: "Real people ready whenever your team needs help.",
        icon: "headphones",
      },
      {
        id: "trusted",
        title: "Trusted by Businesses Worldwide",
        description: "Professional email for growing teams and brands.",
        icon: "users",
      },
    ],
  };
}

export function defaultAiAssistantSection(): CmsAiAssistantContent {
  return {
    visible: true,
    badge: "AI-Powered Web Hosting",
    title: "Your AI Assistant",
    titleAccent: "for Web Hosting",
    description:
      "Launch, manage, and grow your online presence with the power of AI — only at HostingBeyond.",
    primaryCtaLabel: "Chat with Our AI Assistant",
    primaryCtaHref: routes.beyondAi,
    secondaryCtaLabel: "See How It Works",
    secondaryCtaHref: routes.beyondAi,
    handwrittenNote: "AI Tools\nReal Support\nGreater Possibilities",
    botName: "Hosting Beyond AI",
    botStatus: "Online",
    helloTitle: "Hello! 👋",
    helloSubtitle: "How can I help you today?",
    imageUrl: "/images/ai-assistant/man.png",
    imageAlt: "Customer chatting with HostingBeyond AI on a phone",
    partners: [
      { id: "claude", label: "Claude AI" },
      { id: "openai", label: "OpenAI" },
      { id: "gemini", label: "Gemini" },
      { id: "deepseek", label: "DeepSeek" },
      { id: "openrouter", label: "OpenRouter" },
      { id: "imunify", label: "imunify360" },
    ],
    highlights: [
      {
        id: "setup",
        title: "Instant Setup",
        subtitle: "Get online in minutes",
        icon: "zap",
      },
      {
        id: "manage",
        title: "All-in-One Management",
        subtitle: "Domains, hosting, email & more",
        icon: "layers",
      },
      {
        id: "security",
        title: "Advanced Security",
        subtitle: "Your data stays protected",
        icon: "shield",
      },
      {
        id: "support",
        title: "Expert Support",
        subtitle: "Real people, real solutions",
        icon: "users",
      },
    ],
    prompts: [
      { id: "website", label: "I want to create a website", icon: "globe" },
      { id: "plan", label: "Help me choose a hosting plan", icon: "layers" },
      { id: "domain", label: "Register a domain name", icon: "search" },
      { id: "migrate", label: "Migrate my website", icon: "refresh" },
    ],
    stats: [
      {
        id: "ideas",
        title: "Your Ideas",
        subtitle: "Our Infrastructure",
        icon: "globe",
      },
      {
        id: "performance",
        title: "High Performance",
        subtitle: "Global Network",
        icon: "layers",
      },
      {
        id: "business",
        title: "Built for",
        subtitle: "Growing Businesses",
        icon: "users",
      },
    ],
  };
}

export function defaultWhyChooseSection(): CmsWhyChooseContent {
  const items: Array<{
    id: string;
    title: string;
    description: string;
    icon: CmsWhyChooseIcon;
  }> = [
    {
      id: "speed",
      title: "High-Speed Infrastructure",
      description:
        "Optimized NVMe servers and a tuned network stack keep pages loading quickly so visitors stay, convert, and search engines see a fast HostingBeyond site.",
      icon: "zap",
    },
    {
      id: "uptime",
      title: "99.9% Uptime Target",
      description:
        "Redundant routing and proactive monitoring are built to keep your website online during traffic spikes, deployments, and everyday business hours.",
      icon: "shield",
    },
    {
      id: "nvme",
      title: "NVMe SSD Storage",
      description:
        "Faster storage than conventional SSDs means databases, WordPress, and stores on HostingBeyond respond with less wait and more reliability.",
      icon: "database",
    },
    {
      id: "global",
      title: "Global-Ready Hosting",
      description:
        "Serve customers worldwide with infrastructure designed for consistent performance, whether you are launching locally or expanding a brand.",
      icon: "globe",
    },
    {
      id: "ssl",
      title: "Free SSL Security",
      description:
        "Encrypted HTTPS ships with plans so browsers trust your site, checkout forms stay private, and Google can treat your pages as secure.",
      icon: "lock",
    },
    {
      id: "deploy",
      title: "One-Click Deployment",
      description:
        "Launch WordPress, apps, and starter sites in minutes from the panel — no ticket queue required to get a production-ready stack online.",
      icon: "mouse",
    },
    {
      id: "wordpress",
      title: "WordPress Optimized",
      description:
        "Caching, PHP, and storage choices are tuned for WordPress so editorial sites and WooCommerce stores stay snappy as content and traffic grow.",
      icon: "wordpress",
    },
    {
      id: "scale",
      title: "Scalable Resources",
      description:
        "Move from a first site to multiple properties without rebuilding. Upgrade RAM, storage, and plan limits when campaigns or catalogs expand.",
      icon: "chart",
    },
    {
      id: "email",
      title: "Business Email",
      description:
        "Professional inboxes on your domain keep client mail branded, searchable, and separate from free webmail — included alongside hosting.",
      icon: "mail",
    },
    {
      id: "backups",
      title: "Daily Backup Options",
      description:
        "Protect posts, products, and files with backup options you can restore from, so a plugin error or bad edit does not become a permanent outage.",
      icon: "cloud",
    },
    {
      id: "developers",
      title: "Developer Friendly",
      description:
        "Agencies and builders get SSH-ready workflows, modern stacks, and room to ship staging work without fighting a locked-down shared box.",
      icon: "code",
    },
    {
      id: "secure",
      title: "Secure Infrastructure",
      description:
        "Layered protection — SSL, isolation, and hardened defaults — reduces the chance of malware, defacement, and stolen customer data.",
      icon: "secure",
    },
    {
      id: "manage",
      title: "Easy Management",
      description:
        "Domains, hosting, email, and Beyond AI websites live in one modern panel so your team is not hopping between five vendor dashboards.",
      icon: "layers",
    },
    {
      id: "support",
      title: "24/7 Support",
      description:
        "Real people help with DNS, SSL, migrations, and downtime — whenever a launch, campaign, or client site needs a human, not a chatbot loop.",
      icon: "headphones",
    },
    {
      id: "value",
      title: "Performance Without Compromise",
      description:
        "Enterprise-style speed and security at transparent HostingBeyond pricing, so growing brands do not have to choose between quality and cost.",
      icon: "star",
    },
  ];

  return {
    visible: true,
    eyebrow: "Why Choose Us",
    title: "Why Choose",
    titleAccent: "Hosting Beyond?",
    description:
      "More than just hosting — a complete foundation for your online success.",
    handwrittenNote: "Built for a smarter tomorrow",
    items: items.map((item, order) => ({
      ...item,
      visible: true,
      order,
    })),
  };
}

export function defaultHomeFaqsSection(): CmsHomeFaqsContent {
  const hosting: Array<{ question: string; answer: string }> = [
    {
      question: "What is HostingBeyond?",
      answer:
        "HostingBeyond is an all-in-one platform for domains, web hosting, business email, VPS, and Beyond AI websites. You can register a domain, publish a site, add branded mail, and grow on the same account instead of stitching together separate vendors. The homepage, plans, and Orbit-managed content are built so businesses get speed, SSL, and support in one place.",
    },
    {
      question: "Is HostingBeyond suitable for small business websites?",
      answer:
        "Yes. Starter plans are sized for brochure sites, local services, and first WooCommerce stores, while Plus, Pro, and Ultimate plans add sites, storage, RAM, and mailboxes as you grow. Small teams can launch with one-click WordPress, free SSL, and 24/7 support, then scale resources without migrating to a new host every time traffic or catalog size increases.",
    },
    {
      question: "Is HostingBeyond WordPress hosting fast?",
      answer:
        "WordPress on HostingBeyond runs on NVMe storage, tuned PHP, and caching-friendly infrastructure so admin screens, storefronts, and blog pages load with less wait. Speed also helps Core Web Vitals and search visibility. You can still add a CDN or a lightweight theme; the stack is designed so typical plugins and media libraries stay responsive under normal business traffic.",
    },
    {
      question: "Does HostingBeyond provide free SSL?",
      answer:
        "Free SSL is included with hosting plans so every site can load over HTTPS. That encrypts logins and checkout, avoids browser “Not secure” warnings, and is a baseline ranking signal. Certificates can be issued from the panel after DNS points to HostingBeyond. If a custom certificate is required later, support can help you install it without taking the site offline longer than needed.",
    },
    {
      question: "Can I host multiple websites with HostingBeyond?",
      answer:
        "Yes. Beyond Essential is built for a single site, while Plus, Pro, and Ultimate increase or remove site limits and add storage, RAM, and mailboxes. Agencies and founders who run client sites or brand microsites can keep them on one account, with separate domains and SSL, instead of buying a new hosting product for every launch.",
    },
    {
      question: "Do you offer a money-back guarantee?",
      answer:
        "HostingBeyond plans include a 30-day money-back guarantee so you can test speed, support, and the panel with real content. If the platform is not the right fit, you can request a refund within that window according to the plan terms. Instant activation and cancel-anytime billing are listed on the homepage so you are not locked into a surprise contract after a trial month.",
    },
    {
      question: "Can you migrate my existing website to HostingBeyond?",
      answer:
        "Most WordPress, static, and common CMS sites can be moved with files, databases, and DNS cutover planned so downtime stays short. Share your current host, domain, and whether email must move at the same time. Support can walk through backups, SSL, and nameservers. Complex shops or custom apps may need a staging copy first; we would rather migrate once, correctly, than rush a live store.",
    },
    {
      question: "What control panel and tools do I get?",
      answer:
        "Accounts are managed through a modern HostingBeyond panel for domains, hosting, email, and Beyond AI sites, with one-click paths for WordPress and common apps. Developers can work with familiar stacks (Linux, PHP, MySQL, and related tooling shown in our partner strip). You should not need a separate cPanel license for everyday site, mail, and SSL tasks, though advanced SSH or VPS workflows are available on higher products.",
    },
    {
      question: "How does 24/7 support work?",
      answer:
        "HostingBeyond support is staffed for real incidents — DNS not resolving, SSL failing to issue, mail not sending, or a site that went down after a plugin update. Open a ticket or use the published contact channels any time. We focus on clear steps and follow-through rather than canned replies. Priority support on Pro and Ultimate plans is for teams that cannot wait in a general queue during launches.",
    },
    {
      question: "Where do I start if I am brand new?",
      answer:
        "Search a domain on the homepage, pick a hosting plan (annual billing is the default savings path), then install WordPress or generate a Beyond AI site. Add business email on your domain when you are ready to look professional. SSL and the panel come with the plan. If you already own a domain, you can point DNS to HostingBeyond and skip registration. The AI assistant section on the home page can also walk you through the first decisions.",
    },
  ];

  const seo: Array<{ question: string; answer: string }> = [
    {
      question: "How long does it take to see SEO results?",
      answer:
        "Most sites see meaningful movement in 8–16 weeks after technical basics are healthy: HTTPS, fast hosting, crawlable URLs, and useful content. Local businesses can move faster with Google Business Profile and consistent NAP data. Competitive national keywords take longer. HostingBeyond does not “switch on” rankings overnight, but NVMe speed, SSL, and stable uptime remove common hosting blockers so SEO work you publish can actually be crawled and ranked.",
    },
    {
      question: "Do you guarantee #1 ranking on Google?",
      answer:
        "No ethical host or SEO partner can guarantee #1 on Google. Rankings depend on content quality, backlinks, competitors, and Google’s systems. Anyone promising guaranteed first place is either overselling or risking penalties. What HostingBeyond can stand behind is a fast, secure, crawlable foundation — SSL, uptime, Core Web Vitals-friendly infrastructure — plus Beyond AI pages that you can keep updating. That is the honest requirement for rankings; the rest is ongoing SEO work.",
    },
    {
      question: "What SEO services and on-site advantages do you provide?",
      answer:
        "HostingBeyond is primarily hosting, domains, email, and Beyond AI site building. SEO-relevant advantages include HTTPS by default, performance-oriented NVMe hosting, mobile-ready pages, and clean URLs you control on your domain. Beyond AI helps you publish structured pages quickly so you are not waiting on a developer to add location or service content. For campaigns, copy, and link building, pair the platform with your marketer — we keep the technical floor high so that work is not wasted on a slow or insecure host.",
    },
    {
      question: "Do you work with local SEO?",
      answer:
        "Yes in the sense that HostingBeyond is a strong base for local businesses: a real domain, Google-friendly HTTPS, fast mobile pages, and location content you can publish with WordPress or Beyond AI. Local SEO still needs a complete Google Business Profile, reviews, and consistent name-address-phone data. We do not replace a local SEO agency, but we remove hosting and SSL friction that often blocks Maps and organic visibility for clinics, hotels, shops, and service companies.",
    },
    {
      question: "Can you help improve my existing website’s SEO?",
      answer:
        "If you migrate to HostingBeyond we can improve the hosting layer: speed, SSL, uptime, and PHP/WordPress performance that influence Core Web Vitals. After cutover, keep 301 redirects from old URLs, resubmit sitemaps, and watch Search Console. Content, titles, and internal links stay your (or your SEO partner’s) work. A faster, more stable host often lifts pages that were already decent; it will not replace thin content or ignored mobile layouts.",
    },
    {
      question: "Does hosting speed affect SEO?",
      answer:
        "Yes. Google uses page experience signals, and users bounce from slow pages — both hurt visibility. TTFB, Largest Contentful Paint, and overall responsiveness improve when the origin is NVMe-backed and not overloaded. HostingBeyond plans advertise unmetered bandwidth and SSD/NVMe storage for that reason. Speed will not rank a page with no relevance, but slow hosting can cap a well-written site. Treat hosting as part of SEO, not a separate IT afterthought.",
    },
    {
      question: "Do Beyond AI websites help with SEO?",
      answer:
        "Beyond AI helps you publish complete, branded pages quickly — services, locations, and landing content that search engines can index on your HostingBeyond domain. AI does not replace keyword research or unique expertise, but it shortens the time from idea to crawlable URL. Pair generated pages with real photos, accurate business details, and internal links. Hosting, SSL, and DNS stay on the same platform so you are not exporting AI HTML to a random slow host.",
    },
    {
      question: "Should I use my own domain for SEO?",
      answer:
        "Always prefer a domain you own (for example yourbrand.com) over a free subdomain. Rankings, email trust, and branded search attach to that domain. HostingBeyond lets you register or connect a domain, add SSL, and host the site plus mail together. If you start on a temporary URL, plan a proper 301 migration to the live domain so link equity is not split. Domain + HTTPS + fast hosting is the default SEO setup we recommend.",
    },
    {
      question: "Do you help with Core Web Vitals?",
      answer:
        "We help from the hosting side: NVMe storage, enough RAM on higher plans, HTTP/HTTPS, and a stack that does not sit on overloaded spinning disks. Core Web Vitals also depend on your theme, images, and scripts. Compress images, limit heavy page builders, and use caching. If LCP is weak after a migration, support can review server-level caching and PHP versions while you slim the frontend. HostingBeyond will not magically fix a 4 MB homepage banner.",
    },
    {
      question: "Is SSL important for SEO and trust?",
      answer:
        "HTTPS is a confirmed ranking consideration and a user-trust requirement. Chrome flags HTTP pages, especially those with forms. HostingBeyond includes free SSL on plans so you can serve the whole site securely after DNS is pointed. Mixed-content (HTTP images on an HTTPS page) still needs a cleanup in WordPress or your theme. Once SSL is active, keep it renewed — expired certificates hurt both SEO and conversions overnight.",
    },
  ];

  return {
    visible: true,
    eyebrow: "Questions & Answers",
    title: "Frequently Asked",
    titleAccent: "Questions (FAQs)",
    description:
      "Get clear answers to common questions about our hosting and SEO services.",
    handwrittenNote: "Still have a question?\nWe're here to help!",
    ctaLabel: "View All FAQs",
    previewCount: 5,
    groups: [
      {
        id: "hosting",
        visible: true,
        order: 0,
        title: "Hosting FAQs",
        icon: "layers",
        items: hosting.map((item, order) => ({
          id: `hosting-${order + 1}`,
          visible: true,
          order,
          question: item.question,
          answer: item.answer,
        })),
      },
      {
        id: "seo",
        visible: true,
        order: 1,
        title: "SEO FAQs",
        icon: "chart",
        items: seo.map((item, order) => ({
          id: `seo-${order + 1}`,
          visible: true,
          order,
          question: item.question,
          answer: item.answer,
        })),
      },
    ],
  };
}

function footerLinks(
  items: Array<{ id: string; label: string; href: string }>,
): CmsFooterLink[] {
  return items.map((item, order) => ({
    ...item,
    visible: true,
    order,
  }));
}

export function defaultFooterSection(): CmsFooterContent {
  return {
    visible: true,
    newsletterEyebrow: "Stay ahead with Hosting Beyond",
    newsletterTitle: "Get the Latest",
    newsletterTitleAccent: "Updates",
    newsletterDescription:
      "Subscribe to our newsletter for product updates, tips, offers and insights to help you grow online.",
    newsletterPlaceholder: "Enter your email address",
    newsletterCta: "Subscribe",
    newsletterPrivacy: "No spam. Unsubscribe anytime.",
    newsletterPerks: [
      {
        id: "offers",
        visible: true,
        order: 0,
        title: "Exclusive Offers",
        icon: "tag",
      },
      {
        id: "updates",
        visible: true,
        order: 1,
        title: "Product Updates",
        icon: "list",
      },
      {
        id: "tips",
        visible: true,
        order: 2,
        title: "Tips & Insights",
        icon: "bell",
      },
    ],
    brandTagline: "HOST TODAY. GROW TOMORROW.",
    brandDescription:
      "Reliable web hosting, domains, business email and online infrastructure for individuals, businesses and growing brands worldwide.",
    social: [
      {
        id: "facebook",
        visible: true,
        order: 0,
        network: "facebook",
        href: "https://www.facebook.com/",
      },
      {
        id: "instagram",
        visible: true,
        order: 1,
        network: "instagram",
        href: "https://www.instagram.com/",
      },
      {
        id: "x",
        visible: true,
        order: 2,
        network: "x",
        href: "https://x.com/",
      },
      {
        id: "linkedin",
        visible: true,
        order: 3,
        network: "linkedin",
        href: "https://www.linkedin.com/",
      },
      {
        id: "youtube",
        visible: true,
        order: 4,
        network: "youtube",
        href: "https://www.youtube.com/",
      },
    ],
    columns: [
      {
        id: "products",
        visible: true,
        order: 0,
        title: "Products",
        links: footerLinks([
          { id: "web-hosting", label: "Web Hosting", href: routes.hosting },
          {
            id: "wordpress",
            label: "WordPress Hosting",
            href: `${routes.hosting}/wordpress`,
          },
          { id: "vps", label: "VPS Hosting", href: routes.vps },
          { id: "email", label: "Business Email", href: routes.businessEmail },
          { id: "domains", label: "Domain Names", href: routes.domains },
          {
            id: "ssl",
            label: "SSL Certificates",
            href: `${routes.hosting}/ssl`,
          },
          { id: "builder", label: "Website Builder", href: routes.beyondAi },
          { id: "addons", label: "Add-ons", href: routes.pricing },
        ]),
      },
      {
        id: "company",
        visible: true,
        order: 1,
        title: "Company",
        links: footerLinks([
          { id: "about", label: "About Us", href: routes.about },
          { id: "blog", label: "Our Blog", href: `${routes.resources}/blog` },
          { id: "careers", label: "Careers", href: `${routes.about}/careers` },
          {
            id: "affiliate",
            label: "Affiliate Program",
            href: `${routes.about}/affiliates`,
          },
          {
            id: "partner",
            label: "Partner with Us",
            href: `${routes.about}/partners`,
          },
          {
            id: "infra",
            label: "Our Infrastructure",
            href: `${routes.about}/infrastructure`,
          },
          { id: "contact", label: "Contact Us", href: routes.contact },
        ]),
      },
      {
        id: "support",
        visible: true,
        order: 2,
        title: "Support",
        links: footerLinks([
          {
            id: "help",
            label: "Help Center",
            href: `${routes.resources}/help`,
          },
          { id: "ticket", label: "Submit a Ticket", href: routes.contact },
          { id: "chat", label: "Live Chat", href: routes.contact },
          {
            id: "status",
            label: "System Status",
            href: `${routes.resources}/status`,
          },
          {
            id: "kb",
            label: "Knowledge Base",
            href: `${routes.resources}/knowledge-base`,
          },
          {
            id: "migrate",
            label: "Migration Support",
            href: `${routes.resources}/migrate`,
          },
          { id: "abuse", label: "Report Abuse", href: routes.contact },
        ]),
      },
      {
        id: "resources",
        visible: true,
        order: 3,
        title: "Resources",
        links: footerLinks([
          {
            id: "guides",
            label: "Hosting Guides",
            href: `${routes.resources}/guides`,
          },
          { id: "seo", label: "SEO Tips", href: `${routes.resources}/seo` },
          {
            id: "security",
            label: "Website Security",
            href: `${routes.resources}/security`,
          },
          {
            id: "wp",
            label: "WordPress Tutorials",
            href: `${routes.resources}/wordpress`,
          },
          {
            id: "docs",
            label: "Developer Docs",
            href: `${routes.resources}/docs`,
          },
          {
            id: "growth",
            label: "Business Growth",
            href: `${routes.resources}/growth`,
          },
          {
            id: "updates",
            label: "Product Updates",
            href: `${routes.resources}/updates`,
          },
          {
            id: "cases",
            label: "Case Studies",
            href: `${routes.resources}/case-studies`,
          },
        ]),
      },
    ],
    paymentsTitle: "Secure Payments via Stripe",
    paymentsDescription: "Your payments are secure and processed by Stripe.",
    payments: [
      { id: "visa", visible: true, order: 0, brand: "visa" },
      { id: "mastercard", visible: true, order: 1, brand: "mastercard" },
      { id: "amex", visible: true, order: 2, brand: "amex" },
      { id: "discover", visible: true, order: 3, brand: "discover" },
      { id: "jcb", visible: true, order: 4, brand: "jcb" },
      { id: "diners", visible: true, order: 5, brand: "diners" },
      { id: "unionpay", visible: true, order: 6, brand: "unionpay" },
      { id: "applepay", visible: true, order: 7, brand: "applepay" },
      { id: "googlepay", visible: true, order: 8, brand: "googlepay" },
      { id: "stripe", visible: true, order: 9, brand: "stripe" },
    ],
    paymentBenefits: [
      {
        id: "encrypted",
        visible: true,
        order: 0,
        label: "Secure & encrypted transactions",
      },
      {
        id: "methods",
        visible: true,
        order: 1,
        label: "Multiple payment methods",
      },
      { id: "global", visible: true, order: 2, label: "Global support" },
      {
        id: "stripe",
        visible: true,
        order: 3,
        label: "Safe and reliable with Stripe",
      },
    ],
    trustItems: [
      {
        id: "infra",
        visible: true,
        order: 0,
        title: "Secure Infrastructure",
        subtitle: "Your data, our priority",
        icon: "shield",
      },
      {
        id: "network",
        visible: true,
        order: 1,
        title: "Global Network",
        subtitle: "Built for performance",
        icon: "globe",
      },
      {
        id: "support",
        visible: true,
        order: 2,
        title: "Expert Support",
        subtitle: "Real people, real help",
        icon: "headphones",
      },
    ],
    handwrittenNote: "Build Beyond\nTogether",
    legalLinks: footerLinks([
      { id: "terms", label: "Terms of Service", href: "/legal/terms" },
      { id: "privacy", label: "Privacy Policy", href: "/legal/privacy" },
      { id: "refund", label: "Refund Policy", href: "/legal/refund" },
      { id: "legal", label: "Legal", href: "/legal" },
      { id: "sitemap", label: "Sitemap", href: "/sitemap.xml" },
    ]),
    copyright: "© 2026 Hosting Beyond. All rights reserved.",
  };
}

function defaultHostingTypesSection(): CmsHostingTypesContent {
  return {
    visible: true,
    cards: [
      {
        id: "cloud",
        visible: true,
        order: 0,
        title: "Cloud Hosting",
        description:
          "Run your heavy sites on a highly stable, multi-server network architecture.",
        href: routes.cloud,
        accent: "blue",
        icon: "cloud",
        ctaLabel: "View Plans",
        imageUrl: "/images/hosting/cloud.jpg",
        imageAlt: "Earth from space — cloud hosting network",
        overlayStyle: "cloud",
        overlayCaption: "www",
        overlayStat: "↑ 85.2%",
        overlayPills: ["UPTIME", "RELIABILITY", "SECURITY"],
      },
      {
        id: "ecommerce",
        visible: true,
        order: 1,
        title: "eCommerce Hosting",
        description:
          "Get high-speed performance and top security for your e-commerce operations.",
        href: `${routes.hosting}/ecommerce`,
        accent: "purple",
        icon: "cart",
        ctaLabel: "View Plans",
        imageUrl: "/images/hosting/ecommerce.jpg",
        imageAlt: "Ceramic product photography for online store",
        overlayStyle: "shop",
        overlayCaption: "",
        overlayStat: "109.00",
        overlayPills: [],
      },
      {
        id: "wordpress",
        visible: true,
        order: 2,
        title: "WordPress Hosting",
        description:
          "Experience high speeds with specialized staging tools and smart optimization.",
        href: `${routes.hosting}/wordpress`,
        accent: "blue",
        icon: "wordpress",
        ctaLabel: "View Plans",
        imageUrl: "/images/hosting/wordpress.jpg",
        imageAlt: "Mountain landscape in WordPress editor",
        overlayStyle: "gallery",
        overlayCaption: "",
        overlayStat: "",
        overlayPills: [],
      },
      {
        id: "reseller",
        visible: true,
        order: 3,
        title: "Reseller Hosting",
        description:
          "Create custom packages to sell hosting directly under your white-label brand.",
        href: `${routes.hosting}/reseller`,
        accent: "purple",
        icon: "user",
        ctaLabel: "View Plans",
        imageUrl: "/images/hosting/reseller.jpg",
        imageAlt: "Botanical studio plant photography",
        overlayStyle: "studio",
        overlayCaption: "Sage. Botanical Studio",
        overlayStat: "",
        overlayPills: ["Aa", "Aa", "Aa"],
      },
    ],
  };
}

function solutionImages(
  items: Array<{ id: string; url: string; alt: string }>,
): CmsSolutionImage[] {
  return items.map((item, order) => ({
    ...item,
    visible: true,
    order,
  }));
}

function defaultSolutionsSection(): CmsSolutionsContent {
  const atmosphere = "/images/hero-atmosphere.jpg";
  const cloud = "/images/hosting/cloud.jpg";
  const ecommerce = "/images/hosting/ecommerce.jpg";
  const wordpress = "/images/hosting/wordpress.jpg";
  const reseller = "/images/hosting/reseller.jpg";

  return {
    visible: true,
    eyebrow: "Our solutions",
    title: "Everything You Need",
    titleAccent: "to Build Beyond",
    description:
      "Powerful hosting, domains, email and infrastructure designed for modern businesses.",
    ctaLabel: "View all services",
    ctaHref: routes.hosting,
    products: [
      {
        id: "web-hosting",
        visible: true,
        order: 0,
        category: "Web Hosting",
        name: "Web Hosting",
        description:
          "Fast, secure hosting for websites, applications and growing online businesses.",
        badge: "",
        icon: "server",
        ctaLabel: "Explore Web Hosting",
        ctaHref: routes.hosting,
        images: solutionImages([
          {
            id: "web-1",
            url: atmosphere,
            alt: "HostingBeyond data-center lobby and server infrastructure",
          },
          {
            id: "web-2",
            url: cloud,
            alt: "Global cloud network for HostingBeyond web hosting",
          },
          {
            id: "web-3",
            url: wordpress,
            alt: "Published website environment on HostingBeyond hosting",
          },
        ]),
      },
      {
        id: "cloud-hosting",
        visible: true,
        order: 1,
        category: "Cloud Hosting",
        name: "Cloud Hosting",
        description:
          "Multi-server cloud architecture built for demanding sites that need room to scale.",
        badge: "",
        icon: "cloud",
        ctaLabel: "Explore Cloud Hosting",
        ctaHref: routes.cloud,
        images: solutionImages([
          {
            id: "cloud-1",
            url: cloud,
            alt: "Global infrastructure visual for HostingBeyond cloud hosting",
          },
          {
            id: "cloud-2",
            url: atmosphere,
            alt: "Server infrastructure supporting HostingBeyond cloud platforms",
          },
          {
            id: "cloud-3",
            url: reseller,
            alt: "Managed workspace running on HostingBeyond cloud hosting",
          },
        ]),
      },
      {
        id: "ecommerce-hosting",
        visible: true,
        order: 2,
        category: "eCommerce Hosting",
        name: "eCommerce Hosting",
        description:
          "Hosting tuned for online stores that need speed, security and a reliable checkout path.",
        badge: "Popular",
        icon: "cart",
        ctaLabel: "Explore eCommerce",
        ctaHref: `${routes.hosting}/ecommerce`,
        images: solutionImages([
          {
            id: "ecom-1",
            url: ecommerce,
            alt: "Product photography for a HostingBeyond eCommerce storefront",
          },
          {
            id: "ecom-2",
            url: cloud,
            alt: "Infrastructure behind HostingBeyond eCommerce hosting",
          },
          {
            id: "ecom-3",
            url: atmosphere,
            alt: "Secure hosting environment for online stores",
          },
        ]),
      },
      {
        id: "wordpress-hosting",
        visible: true,
        order: 3,
        category: "WordPress Hosting",
        name: "WordPress Hosting",
        description:
          "Optimized WordPress hosting with the performance and tools sites need to stay fast.",
        badge: "",
        icon: "wordpress",
        ctaLabel: "Explore WordPress",
        ctaHref: `${routes.hosting}/wordpress`,
        images: solutionImages([
          {
            id: "wp-1",
            url: wordpress,
            alt: "Website visual for HostingBeyond WordPress hosting",
          },
          {
            id: "wp-2",
            url: atmosphere,
            alt: "Infrastructure supporting HostingBeyond WordPress sites",
          },
          {
            id: "wp-3",
            url: cloud,
            alt: "Cloud-backed WordPress hosting on HostingBeyond",
          },
        ]),
      },
      {
        id: "reseller-hosting",
        visible: true,
        order: 4,
        category: "Reseller Hosting",
        name: "Reseller Hosting",
        description:
          "White-label hosting packages you can offer under your own brand.",
        badge: "",
        icon: "users",
        ctaLabel: "Explore Reseller",
        ctaHref: `${routes.hosting}/reseller`,
        images: solutionImages([
          {
            id: "res-1",
            url: reseller,
            alt: "Studio brand visual for HostingBeyond reseller hosting",
          },
          {
            id: "res-2",
            url: cloud,
            alt: "Network capacity for HostingBeyond reseller plans",
          },
          {
            id: "res-3",
            url: atmosphere,
            alt: "Infrastructure available to HostingBeyond resellers",
          },
        ]),
      },
      {
        id: "business-email",
        visible: true,
        order: 5,
        category: "Business Email",
        name: "Business Email",
        description:
          "Professional email for your domain, ready for teams that need a trusted inbox.",
        badge: "",
        icon: "mail",
        ctaLabel: "Explore Business Email",
        ctaHref: routes.businessEmail,
        images: solutionImages([
          {
            id: "mail-1",
            url: atmosphere,
            alt: "Professional environment for HostingBeyond business email",
          },
          {
            id: "mail-2",
            url: cloud,
            alt: "Connected infrastructure for HostingBeyond email",
          },
          {
            id: "mail-3",
            url: wordpress,
            alt: "Branded online presence paired with HostingBeyond email",
          },
        ]),
      },
      {
        id: "vps",
        visible: true,
        order: 6,
        category: "VPS / Servers",
        name: "VPS Hosting",
        description:
          "Dedicated virtual servers for workloads that need more control and isolation.",
        badge: "",
        icon: "cpu",
        ctaLabel: "Explore VPS",
        ctaHref: routes.vps,
        images: solutionImages([
          {
            id: "vps-1",
            url: atmosphere,
            alt: "Server racks for HostingBeyond VPS hosting",
          },
          {
            id: "vps-2",
            url: cloud,
            alt: "Isolated compute capacity on HostingBeyond VPS",
          },
          {
            id: "vps-3",
            url: reseller,
            alt: "Managed server workspace on HostingBeyond VPS",
          },
        ]),
      },
      {
        id: "domains",
        visible: true,
        order: 7,
        category: "Domain Services",
        name: "Domain Services",
        description:
          "Register and manage domains as the starting point of your HostingBeyond presence.",
        badge: "",
        icon: "globe",
        ctaLabel: "Explore Domains",
        ctaHref: routes.domains,
        images: solutionImages([
          {
            id: "dom-1",
            url: cloud,
            alt: "Global network visual for HostingBeyond domain services",
          },
          {
            id: "dom-2",
            url: wordpress,
            alt: "Website identity connected to a HostingBeyond domain",
          },
          {
            id: "dom-3",
            url: atmosphere,
            alt: "Infrastructure behind HostingBeyond domain services",
          },
        ]),
      },
    ],
  };
}

function defaultOffers(): CmsProductOffer[] {
  return [
    {
      id: "domain",
      visible: true,
      order: 0,
      title: "Domain Site",
      subtitle: "",
      badge: "Best Value",
      accent: "blue",
      priceOverride: "",
      priceSuffix: "/ 1 Year",
      highlight: "+ Free 2 Business Mail 1 Year",
      priceLabel: "",
      features: [...productOffers[0].features],
      ctaLabel: "Find Your Domain",
      ctaHref: routes.domains,
      searchEnabled: true,
      searchPlaceholder: "Enter your domain name",
      searchButtonLabel: "Search",
      iconUrl: "",
      illustrationUrl: "",
    },
    {
      id: "email",
      visible: true,
      order: 1,
      title: "Business Email",
      subtitle: "Professional Email for Your Business",
      badge: "Professional",
      accent: "purple",
      priceOverride: "",
      priceSuffix: "/ Month",
      highlight: "",
      priceLabel: "Per Mailbox",
      features: [...productOffers[1].features],
      ctaLabel: "Get Business Email",
      ctaHref: routes.businessEmail,
      searchEnabled: false,
      searchPlaceholder: "",
      searchButtonLabel: "Search",
      iconUrl: "",
      illustrationUrl: "",
    },
    {
      id: "hosting",
      visible: true,
      order: 2,
      title: "Web Hosting",
      subtitle: "Blazing-Fast Hosting Plans",
      badge: "Fast & Reliable",
      accent: "cyan",
      priceOverride: "",
      priceSuffix: "/ Per Month",
      highlight: "",
      priceLabel: "Starting Plan",
      features: [...productOffers[2].features],
      ctaLabel: "View Hosting Plans",
      ctaHref: routes.hosting,
      searchEnabled: false,
      searchPlaceholder: "",
      searchButtonLabel: "Search",
      iconUrl: "",
      illustrationUrl: "",
    },
  ];
}

export function defaultTechnologyPartners(): CmsTechPartner[] {
  return [
    {
      id: "wordpress",
      label: "WordPress",
      imageUrl: "",
      visible: true,
      order: 0,
    },
    { id: "cpanel", label: "cPanel", imageUrl: "", visible: true, order: 1 },
    { id: "plesk", label: "plesk", imageUrl: "", visible: true, order: 2 },
    { id: "intel", label: "intel", imageUrl: "", visible: true, order: 3 },
    { id: "amd", label: "AMD", imageUrl: "", visible: true, order: 4 },
    {
      id: "nvme",
      label: "nvme EXPRESS",
      imageUrl: "",
      visible: true,
      order: 5,
    },
    { id: "linux", label: "Linux", imageUrl: "", visible: true, order: 6 },
    { id: "python", label: "Python", imageUrl: "", visible: true, order: 7 },
    { id: "php", label: "PHP", imageUrl: "", visible: true, order: 8 },
    { id: "mysql", label: "MySQL", imageUrl: "", visible: true, order: 9 },
    { id: "docker", label: "Docker", imageUrl: "", visible: true, order: 10 },
  ];
}

export function defaultHeroFeatureBar(): CmsHeroFeatureBar {
  return {
    offerEyebrow: "Special Offer",
    offerTitle: "Save Up to",
    offerHighlight: "70%",
    ctaLabel: "View Plans",
    ctaHref: routes.hosting,
    items: [
      {
        id: "cpanel",
        visible: true,
        order: 0,
        title: "One Click",
        subtitle: "cPanel Access",
        iconUrl: "/images/feature-marks/cpanel-user.png",
      },
      {
        id: "wordpress",
        visible: true,
        order: 1,
        title: "One Click",
        subtitle: "WordPress Install",
        iconUrl: "/images/feature-marks/wordpress-w.svg",
      },
      {
        id: "builder",
        visible: true,
        order: 2,
        title: "One Click",
        subtitle: "Website Create",
        iconUrl: "/images/feature-marks/website-create.svg",
      },
      {
        id: "email",
        visible: true,
        order: 3,
        title: "Business Email",
        subtitle: "Professional Mail",
        iconUrl: "",
      },
      {
        id: "ssl",
        visible: true,
        order: 4,
        title: "Free SSL",
        subtitle: "With All Plans",
        iconUrl: "",
      },
    ],
  };
}

export function defaultHomeSections(): CmsHomeSections {
  return {
    hero: {
      visible: true,
      eyebrow: "SIMPLE • SECURE • SCALABLE",
      headline: "Host Your Ideas",
      headlineAccent: "Beyond Limits",
      description:
        "Reliable hosting, powerful infrastructure and the freedom to build what's next.",
      searchPlaceholder: "Find your perfect domain name...",
      searchButtonLabel: "Search",
      bulkSearchLabel: "Bulk Search",
      backgroundImage: "/images/hero-speaker-scene.png",
      speakerImage: "/images/hero-speaker-scene.png",
      glassPanelLeft: "Ideas\nHost\nGrow\nBeyond",
      glassPanelRight: "Global Infrastructure for a Brighter Tomorrow",
      domainPricing: [
        { tld: ".com", priceLabel: "$7.99/yr", visible: true },
        { tld: ".net", priceLabel: "$6.99/yr", visible: true },
        { tld: ".org", priceLabel: "$5.99/yr", visible: true },
        { tld: ".dev", priceLabel: "$3.99/yr", visible: true },
      ],
      technologyPartners: defaultTechnologyPartners(),
      featureBar: defaultHeroFeatureBar(),
      trustItems: [
        {
          title: "99.99% Uptime",
          subtitle: "Network Guarantee",
          icon: "shield",
        },
        {
          title: "NVMe Performance",
          subtitle: "Ultra-fast storage",
          icon: "lock",
        },
        {
          title: "24/7 Expert Support",
          subtitle: "We're here for you",
          icon: "support",
        },
      ],
      stats: [
        {
          value: "2.7M+",
          label: "Domains Under Management",
          icon: "globe",
        },
        { value: "600+", label: "Domain Extensions", icon: "server" },
        { value: "24/7", label: "Expert Support Always Here", icon: "shield" },
        { value: "10,000+", label: "Businesses Trust Us", icon: "users" },
      ],
    },
    solutions: defaultSolutionsSection(),
    products: {
      visible: true,
      eyebrow: "Everything You Need",
      title: "Power Your Online Success",
      titleAccent: "Everything in One Place",
      description:
        "Get premium domains, professional email, and blazing-fast hosting at unbeatable prices.",
      offers: defaultOffers(),
    },
    hostingTypes: defaultHostingTypesSection(),
    hostingPlans: defaultHostingPlansSection(),
    beyondAi: defaultBeyondAiSection(),
    businessEmail: defaultBusinessEmailSection(),
    aiAssistant: defaultAiAssistantSection(),
    whyChoose: defaultWhyChooseSection(),
    homeFaqs: defaultHomeFaqsSection(),
    footer: defaultFooterSection(),
    navigation: mainNavigation.map((item) => ({
      ...item,
      children: item.children?.map((child) => ({ ...child })),
    })),
  };
}

function mergeBeyondAiSection(
  stored?: Partial<CmsBeyondAiContent> | null,
): CmsBeyondAiContent {
  const defaults = defaultBeyondAiSection();
  if (!stored) return defaults;

  const highlightIcon = (
    value: unknown,
    fallback: CmsBeyondAiHighlight["icon"],
  ): CmsBeyondAiHighlight["icon"] =>
    value === "zap" ||
    value === "cloud" ||
    value === "globe" ||
    value === "rocket"
      ? value
      : fallback;

  const featureIcon = (
    value: unknown,
    fallback: CmsBeyondAiFeature["icon"],
  ): CmsBeyondAiFeature["icon"] =>
    value === "wand" ||
    value === "layers" ||
    value === "users" ||
    value === "gauge"
      ? value
      : fallback;

  const highlights =
    Array.isArray(stored.highlights) && stored.highlights.length > 0
      ? stored.highlights.map((item, index) => {
          const fallback =
            defaults.highlights[index % defaults.highlights.length];
          return {
            ...fallback,
            ...item,
            id: item.id || fallback.id || `highlight-${index}`,
            icon: highlightIcon(item.icon, fallback.icon),
            title: item.title || fallback.title,
            subtitle: item.subtitle || fallback.subtitle,
          } satisfies CmsBeyondAiHighlight;
        })
      : defaults.highlights;

  const sites =
    Array.isArray(stored.sites) && stored.sites.length > 0
      ? stored.sites
          .map((item, index) => {
            const fallback = defaults.sites[index % defaults.sites.length];
            return {
              ...fallback,
              ...item,
              id: item.id || fallback.id || `site-${index}`,
              visible: item.visible !== false,
              order: typeof item.order === "number" ? item.order : index,
              name: item.name || fallback.name,
              domain: item.domain || fallback.domain,
              imageUrl:
                typeof item.imageUrl === "string" && item.imageUrl.trim()
                  ? item.imageUrl
                  : fallback.imageUrl,
              imageAlt: item.imageAlt || fallback.imageAlt,
              status: item.status || fallback.status,
            } satisfies CmsBeyondAiSite;
          })
          .sort((a, b) => a.order - b.order)
      : defaults.sites;

  const features =
    Array.isArray(stored.features) && stored.features.length > 0
      ? stored.features.map((item, index) => {
          const fallback = defaults.features[index % defaults.features.length];
          return {
            ...fallback,
            ...item,
            id: item.id || fallback.id || `feature-${index}`,
            icon: featureIcon(item.icon, fallback.icon),
            title: item.title || fallback.title,
            description: item.description || fallback.description,
          } satisfies CmsBeyondAiFeature;
        })
      : defaults.features;

  const saasItems = Array.isArray(stored.saasItems)
    ? stored.saasItems.map((item) => item.trim()).filter(Boolean)
    : defaults.saasItems;

  return {
    ...defaults,
    ...stored,
    visible: stored.visible !== false,
    saasItems: saasItems.length ? saasItems : defaults.saasItems,
    highlights,
    sites,
    features,
  };
}

function mergeBusinessEmailSection(
  stored?: Partial<CmsBusinessEmailContent> | null,
): CmsBusinessEmailContent {
  const defaults = defaultBusinessEmailSection();
  if (!stored) return defaults;

  const highlightIcon = (
    value: unknown,
    fallback: CmsBusinessEmailHighlight["icon"],
  ): CmsBusinessEmailHighlight["icon"] =>
    value === "shield" ||
    value === "lock" ||
    value === "zap" ||
    value === "users"
      ? value
      : fallback;

  const statIcon = (
    value: unknown,
    fallback: CmsBusinessEmailStat["icon"],
  ): CmsBusinessEmailStat["icon"] =>
    value === "chart" || value === "globe" || value === "shield"
      ? value
      : fallback;

  const featureIcon = (
    value: unknown,
    fallback: CmsBusinessEmailFeature["icon"],
  ): CmsBusinessEmailFeature["icon"] =>
    value === "globe" ||
    value === "layers" ||
    value === "headphones" ||
    value === "users"
      ? value
      : fallback;

  const highlights =
    Array.isArray(stored.highlights) && stored.highlights.length > 0
      ? stored.highlights.map((item, index) => {
          const fallback =
            defaults.highlights[index % defaults.highlights.length];
          return {
            ...fallback,
            ...item,
            id: item.id || fallback.id || `email-highlight-${index}`,
            icon: highlightIcon(item.icon, fallback.icon),
            title:
              item.title === "Custom Domain Email" ||
              item.title === "Fast & Reliable Performance"
                ? fallback.title
                : item.title || fallback.title,
            subtitle:
              typeof item.subtitle === "string" && item.subtitle.trim()
                ? item.subtitle
                : fallback.subtitle,
          } satisfies CmsBusinessEmailHighlight;
        })
      : defaults.highlights;

  const messages =
    Array.isArray(stored.messages) && stored.messages.length > 0
      ? stored.messages.map((item, index) => {
          const fallback = defaults.messages[index % defaults.messages.length];
          return {
            ...fallback,
            ...item,
            id: item.id || fallback.id || `email-msg-${index}`,
          } satisfies CmsBusinessEmailMessage;
        })
      : defaults.messages;

  const stats =
    Array.isArray(stored.stats) && stored.stats.length > 0
      ? stored.stats.map((item, index) => {
          const fallback = defaults.stats[index % defaults.stats.length];
          return {
            ...fallback,
            ...item,
            id: item.id || fallback.id || `email-stat-${index}`,
            icon: statIcon(item.icon, fallback.icon),
          } satisfies CmsBusinessEmailStat;
        })
      : defaults.stats;

  const features =
    Array.isArray(stored.features) && stored.features.length > 0
      ? stored.features.map((item, index) => {
          const fallback = defaults.features[index % defaults.features.length];
          return {
            ...fallback,
            ...item,
            id: item.id || fallback.id || `email-feature-${index}`,
            icon: featureIcon(item.icon, fallback.icon),
            description:
              typeof item.description === "string" && item.description.trim()
                ? item.description
                : fallback.description,
          } satisfies CmsBusinessEmailFeature;
        })
      : defaults.features;

  return {
    ...defaults,
    ...stored,
    visible: stored.visible !== false,
    trust1:
      typeof stored.trust1 === "string" && stored.trust1.trim()
        ? stored.trust1
        : defaults.trust1,
    trust2:
      typeof stored.trust2 === "string" && stored.trust2.trim()
        ? stored.trust2
        : defaults.trust2,
    trust3:
      typeof stored.trust3 === "string" && stored.trust3.trim()
        ? stored.trust3
        : defaults.trust3,
    imageUrl: (() => {
      const url =
        typeof stored.imageUrl === "string" ? stored.imageUrl.trim() : "";
      if (
        !url ||
        url.includes("/images/business-email/woman.jpg") ||
        url.includes("/images/business-email/stage.png")
      ) {
        return defaults.imageUrl;
      }
      return url;
    })(),
    highlights,
    messages,
    stats,
    features,
  };
}

function whyChooseIcon(
  value: unknown,
  fallback: CmsWhyChooseIcon,
): CmsWhyChooseIcon {
  const allowed: CmsWhyChooseIcon[] = [
    "zap",
    "shield",
    "database",
    "globe",
    "lock",
    "mouse",
    "wordpress",
    "chart",
    "mail",
    "cloud",
    "code",
    "secure",
    "layers",
    "headphones",
    "star",
  ];
  return allowed.includes(value as CmsWhyChooseIcon)
    ? (value as CmsWhyChooseIcon)
    : fallback;
}

function mergeWhyChooseSection(
  stored?: Partial<CmsWhyChooseContent> | null,
): CmsWhyChooseContent {
  const defaults = defaultWhyChooseSection();
  if (!stored) return defaults;
  const storedItems = Array.isArray(stored.items) ? stored.items : [];
  const items =
    storedItems.length > 0
      ? storedItems.map((item, index) => {
          const fallback = defaults.items[index % defaults.items.length];
          return {
            id: item.id || fallback.id || `why-${index}`,
            visible: item.visible !== false,
            order: typeof item.order === "number" ? item.order : index,
            title: item.title || fallback.title,
            description: item.description || fallback.description,
            icon: whyChooseIcon(item.icon, fallback.icon),
          } satisfies CmsWhyChooseItem;
        })
      : defaults.items;
  return {
    ...defaults,
    ...stored,
    visible: stored.visible !== false,
    items: items.sort((a, b) => a.order - b.order),
  };
}

function mergeHomeFaqsSection(
  stored?: Partial<CmsHomeFaqsContent> | null,
): CmsHomeFaqsContent {
  const defaults = defaultHomeFaqsSection();
  if (!stored) return defaults;
  const storedGroups = Array.isArray(stored.groups) ? stored.groups : [];
  const groups =
    storedGroups.length > 0
      ? storedGroups.map((group, groupIndex) => {
          const fallbackGroup =
            defaults.groups[groupIndex % defaults.groups.length];
          const storedItems = Array.isArray(group.items) ? group.items : [];
          const items =
            storedItems.length > 0
              ? storedItems.map((item, index) => {
                  const fallbackItem =
                    fallbackGroup.items[index % fallbackGroup.items.length];
                  return {
                    id: item.id || fallbackItem.id || `faq-${index}`,
                    visible: item.visible !== false,
                    order: typeof item.order === "number" ? item.order : index,
                    question: item.question || fallbackItem.question,
                    answer: item.answer || fallbackItem.answer,
                  } satisfies CmsFaqItem;
                })
              : fallbackGroup.items;
          return {
            id: group.id || fallbackGroup.id || `faq-group-${groupIndex}`,
            visible: group.visible !== false,
            order: typeof group.order === "number" ? group.order : groupIndex,
            title: group.title || fallbackGroup.title,
            icon: group.icon === "chart" ? "chart" : "layers",
            items: items.sort((a, b) => a.order - b.order),
          } satisfies CmsFaqGroup;
        })
      : defaults.groups;
  const preview =
    typeof stored.previewCount === "number" && stored.previewCount > 0
      ? Math.min(20, Math.floor(stored.previewCount))
      : defaults.previewCount;
  return {
    ...defaults,
    ...stored,
    visible: stored.visible !== false,
    previewCount: preview,
    groups: groups.sort((a, b) => a.order - b.order),
  };
}

function mergeAiAssistantSection(
  stored?: Partial<CmsAiAssistantContent> | null,
): CmsAiAssistantContent {
  const defaults = defaultAiAssistantSection();
  if (!stored) return defaults;

  const highlightIcon = (
    value: unknown,
    fallback: CmsAiAssistantHighlight["icon"],
  ): CmsAiAssistantHighlight["icon"] =>
    value === "zap" ||
    value === "layers" ||
    value === "shield" ||
    value === "users"
      ? value
      : fallback;

  const promptIcon = (
    value: unknown,
    fallback: CmsAiAssistantPrompt["icon"],
  ): CmsAiAssistantPrompt["icon"] =>
    value === "globe" ||
    value === "layers" ||
    value === "search" ||
    value === "refresh"
      ? value
      : fallback;

  const statIcon = (
    value: unknown,
    fallback: CmsAiAssistantStat["icon"],
  ): CmsAiAssistantStat["icon"] =>
    value === "globe" || value === "layers" || value === "users"
      ? value
      : fallback;

  return {
    ...defaults,
    ...stored,
    visible: stored.visible !== false,
    imageUrl:
      typeof stored.imageUrl === "string" && stored.imageUrl.trim()
        ? stored.imageUrl
        : defaults.imageUrl,
    partners:
      Array.isArray(stored.partners) && stored.partners.length > 0
        ? stored.partners.map((item, index) => {
            const fallback =
              defaults.partners[index % defaults.partners.length];
            return {
              ...fallback,
              ...item,
              id: item.id || fallback.id || `ai-partner-${index}`,
            };
          })
        : defaults.partners,
    highlights:
      Array.isArray(stored.highlights) && stored.highlights.length > 0
        ? stored.highlights.map((item, index) => {
            const fallback =
              defaults.highlights[index % defaults.highlights.length];
            return {
              ...fallback,
              ...item,
              id: item.id || fallback.id || `ai-highlight-${index}`,
              icon: highlightIcon(item.icon, fallback.icon),
            };
          })
        : defaults.highlights,
    prompts:
      Array.isArray(stored.prompts) && stored.prompts.length > 0
        ? stored.prompts.map((item, index) => {
            const fallback = defaults.prompts[index % defaults.prompts.length];
            return {
              ...fallback,
              ...item,
              id: item.id || fallback.id || `ai-prompt-${index}`,
              icon: promptIcon(item.icon, fallback.icon),
            };
          })
        : defaults.prompts,
    stats:
      Array.isArray(stored.stats) && stored.stats.length > 0
        ? stored.stats.map((item, index) => {
            const fallback = defaults.stats[index % defaults.stats.length];
            return {
              ...fallback,
              ...item,
              id: item.id || fallback.id || `ai-stat-${index}`,
              icon: statIcon(item.icon, fallback.icon),
            };
          })
        : defaults.stats,
  };
}

function mergeFooterLinks(
  stored: CmsFooterLink[] | undefined,
  fallback: CmsFooterLink[],
): CmsFooterLink[] {
  if (!Array.isArray(stored) || stored.length === 0) return fallback;
  return stored.map((item, index) => {
    const base = fallback[index % fallback.length];
    return {
      id: item.id || base.id || `link-${index}`,
      visible: item.visible !== false,
      order: typeof item.order === "number" ? item.order : index,
      label: item.label || base.label,
      href: item.href || base.href,
    };
  });
}

function mergeFooterSection(
  stored?: Partial<CmsFooterContent> | null,
): CmsFooterContent {
  const defaults = defaultFooterSection();
  if (!stored) return defaults;

  const perkIcon = (value: unknown, fallback: CmsFooterPerk["icon"]) =>
    value === "tag" || value === "list" || value === "bell" ? value : fallback;
  const trustIcon = (value: unknown, fallback: CmsFooterTrustItem["icon"]) =>
    value === "shield" || value === "globe" || value === "headphones"
      ? value
      : fallback;
  const socialNet = (value: unknown, fallback: CmsFooterSocial["network"]) =>
    value === "facebook" ||
    value === "instagram" ||
    value === "x" ||
    value === "linkedin" ||
    value === "youtube"
      ? value
      : fallback;
  const brands: CmsFooterPayment["brand"][] = [
    "visa",
    "mastercard",
    "amex",
    "discover",
    "jcb",
    "diners",
    "unionpay",
    "applepay",
    "googlepay",
    "stripe",
  ];
  const paymentBrand = (value: unknown, fallback: CmsFooterPayment["brand"]) =>
    brands.includes(value as CmsFooterPayment["brand"])
      ? (value as CmsFooterPayment["brand"])
      : fallback;

  const columns =
    Array.isArray(stored.columns) && stored.columns.length > 0
      ? stored.columns.map((column, index) => {
          const fallback = defaults.columns[index % defaults.columns.length];
          return {
            id: column.id || fallback.id || `col-${index}`,
            visible: column.visible !== false,
            order: typeof column.order === "number" ? column.order : index,
            title: column.title || fallback.title,
            links: mergeFooterLinks(column.links, fallback.links),
          };
        })
      : defaults.columns;

  return {
    ...defaults,
    ...stored,
    visible: stored.visible !== false,
    newsletterPerks:
      Array.isArray(stored.newsletterPerks) && stored.newsletterPerks.length > 0
        ? stored.newsletterPerks.map((item, index) => {
            const fallback =
              defaults.newsletterPerks[index % defaults.newsletterPerks.length];
            return {
              id: item.id || fallback.id || `perk-${index}`,
              visible: item.visible !== false,
              order: typeof item.order === "number" ? item.order : index,
              title: item.title || fallback.title,
              icon: perkIcon(item.icon, fallback.icon),
            };
          })
        : defaults.newsletterPerks,
    social:
      Array.isArray(stored.social) && stored.social.length > 0
        ? stored.social.map((item, index) => {
            const fallback = defaults.social[index % defaults.social.length];
            return {
              id: item.id || fallback.id || `social-${index}`,
              visible: item.visible !== false,
              order: typeof item.order === "number" ? item.order : index,
              network: socialNet(item.network, fallback.network),
              href: item.href || fallback.href,
            };
          })
        : defaults.social,
    columns: columns.sort((a, b) => a.order - b.order),
    payments:
      Array.isArray(stored.payments) && stored.payments.length > 0
        ? stored.payments.map((item, index) => {
            const fallback =
              defaults.payments[index % defaults.payments.length];
            return {
              id: item.id || fallback.id || `pay-${index}`,
              visible: item.visible !== false,
              order: typeof item.order === "number" ? item.order : index,
              brand: paymentBrand(item.brand, fallback.brand),
            };
          })
        : defaults.payments,
    paymentBenefits:
      Array.isArray(stored.paymentBenefits) && stored.paymentBenefits.length > 0
        ? stored.paymentBenefits.map((item, index) => {
            const fallback =
              defaults.paymentBenefits[index % defaults.paymentBenefits.length];
            return {
              id: item.id || fallback.id || `benefit-${index}`,
              visible: item.visible !== false,
              order: typeof item.order === "number" ? item.order : index,
              label: item.label || fallback.label,
            };
          })
        : defaults.paymentBenefits,
    trustItems:
      Array.isArray(stored.trustItems) && stored.trustItems.length > 0
        ? stored.trustItems.map((item, index) => {
            const fallback =
              defaults.trustItems[index % defaults.trustItems.length];
            return {
              id: item.id || fallback.id || `trust-${index}`,
              visible: item.visible !== false,
              order: typeof item.order === "number" ? item.order : index,
              title: item.title || fallback.title,
              subtitle: item.subtitle || fallback.subtitle,
              icon: trustIcon(item.icon, fallback.icon),
            };
          })
        : defaults.trustItems,
    legalLinks: mergeFooterLinks(stored.legalLinks, defaults.legalLinks),
  };
}

/** Deep-merge stored CMS JSON onto defaults (backwards-compatible). */
export function mergeHomeSections(
  stored?: Partial<CmsHomeSections> | null,
): CmsHomeSections {
  const defaults = defaultHomeSections();
  if (!stored) return defaults;

  const storedOffers = Array.isArray(stored.products?.offers)
    ? stored.products!.offers
    : [];

  const offers = defaults.products.offers
    .map((fallback) => {
      const match =
        storedOffers.find((item) => item.id === fallback.id) ??
        storedOffers.find(
          (item) =>
            typeof item.title === "string" &&
            item.title.toLowerCase().includes(fallback.id),
        );
      if (!match) return fallback;
      return {
        ...fallback,
        ...match,
        features: Array.isArray(match.features)
          ? match.features.filter(Boolean)
          : fallback.features,
        visible: match.visible ?? true,
        order: typeof match.order === "number" ? match.order : fallback.order,
        accent: match.accent ?? fallback.accent,
        priceOverride:
          typeof match.priceOverride === "string"
            ? match.priceOverride
            : typeof (match as { price?: string }).price === "string" &&
                (match as { price?: string }).price !==
                  "Managed in pricing config"
              ? ((match as { price?: string }).price ?? "")
              : fallback.priceOverride,
      } satisfies CmsProductOffer;
    })
    .sort((a, b) => a.order - b.order);

  // Preserve any extra custom cards from CMS
  for (const extra of storedOffers) {
    if (!offers.some((o) => o.id === extra.id)) {
      offers.push({
        ...defaults.products.offers[0],
        ...extra,
        id: extra.id || `offer-${offers.length}`,
        features: Array.isArray(extra.features) ? extra.features : [],
        visible: extra.visible ?? true,
        order: typeof extra.order === "number" ? extra.order : offers.length,
      });
    }
  }

  const storedPlans = Array.isArray(stored.hostingPlans?.plans)
    ? stored.hostingPlans!.plans
    : [];

  const plans = defaults.hostingPlans.plans
    .map((fallback) => {
      const match = storedPlans.find((item) => item.id === fallback.id);
      if (!match) return fallback;
      const stale =
        /^web\s/i.test(match.name || "") ||
        /50%\s*off/i.test(match.discountBadge || "");
      if (stale) {
        return {
          ...fallback,
          visible: match.visible ?? true,
          order: typeof match.order === "number" ? match.order : fallback.order,
        };
      }
      return {
        ...fallback,
        ...match,
        tagline:
          typeof match.tagline === "string" && match.tagline.trim()
            ? match.tagline
            : fallback.tagline,
        saveAnnually:
          typeof match.saveAnnually === "string"
            ? match.saveAnnually
            : fallback.saveAnnually,
        saveMonthly:
          typeof match.saveMonthly === "string"
            ? match.saveMonthly
            : fallback.saveMonthly,
        features: Array.isArray(match.features)
          ? match.features.filter(Boolean)
          : fallback.features,
        visible: match.visible ?? true,
        order: typeof match.order === "number" ? match.order : fallback.order,
        accent: match.accent ?? fallback.accent,
        popular: Boolean(match.popular),
      } satisfies CmsHostingPlan;
    })
    .sort((a, b) => a.order - b.order);

  for (const extra of storedPlans) {
    if (!plans.some((p) => p.id === extra.id)) {
      plans.push({
        ...defaults.hostingPlans.plans[0],
        ...extra,
        id: extra.id || `plan-${plans.length}`,
        tagline: typeof extra.tagline === "string" ? extra.tagline : "",
        saveAnnually:
          typeof extra.saveAnnually === "string" ? extra.saveAnnually : "",
        saveMonthly:
          typeof extra.saveMonthly === "string" ? extra.saveMonthly : "",
        features: Array.isArray(extra.features) ? extra.features : [],
        visible: extra.visible ?? true,
        order: typeof extra.order === "number" ? extra.order : plans.length,
      });
    }
  }

  const storedGuarantees = Array.isArray(stored.hostingPlans?.guarantees)
    ? stored.hostingPlans!.guarantees
    : [];

  const guaranteeIcon = (
    value: unknown,
    fallback: CmsHostingGuarantee["icon"],
  ): CmsHostingGuarantee["icon"] =>
    value === "lock" ||
    value === "rocket" ||
    value === "globe" ||
    value === "headphones" ||
    value === "shield"
      ? value
      : fallback;

  const guarantees: CmsHostingGuarantee[] = defaults.hostingPlans.guarantees
    .map((fallback) => {
      const match = storedGuarantees.find((item) => item.id === fallback.id);
      if (!match) return fallback;
      return {
        ...fallback,
        ...match,
        id: match.id || fallback.id,
        icon: guaranteeIcon(match.icon, fallback.icon),
      };
    })
    .concat(
      storedGuarantees
        .filter(
          (item) =>
            !defaults.hostingPlans.guarantees.some((fb) => fb.id === item.id),
        )
        .map((item, index) => ({
          ...defaults.hostingPlans.guarantees[0],
          ...item,
          id: item.id || `guarantee-extra-${index}`,
          icon: guaranteeIcon(item.icon, "shield"),
        })),
    );

  const storedTypeCards = Array.isArray(stored.hostingTypes?.cards)
    ? stored.hostingTypes!.cards
    : [];

  const hostingTypeCards = defaults.hostingTypes.cards
    .map((fallback) => {
      const match = storedTypeCards.find((item) => item.id === fallback.id);
      if (!match) return fallback;
      const accent: CmsHostingTypeCard["accent"] =
        match.accent === "purple" ? "purple" : "blue";
      const icon: CmsHostingTypeCard["icon"] =
        match.icon === "cart" ||
        match.icon === "wordpress" ||
        match.icon === "user"
          ? match.icon
          : "cloud";
      const overlayStyle: CmsHostingTypeCard["overlayStyle"] =
        match.overlayStyle === "shop" ||
        match.overlayStyle === "gallery" ||
        match.overlayStyle === "studio"
          ? match.overlayStyle
          : "cloud";
      return {
        ...fallback,
        ...match,
        accent,
        icon,
        overlayStyle,
        overlayPills: Array.isArray(match.overlayPills)
          ? match.overlayPills.filter(Boolean)
          : fallback.overlayPills,
        visible: match.visible ?? true,
        order: typeof match.order === "number" ? match.order : fallback.order,
      } satisfies CmsHostingTypeCard;
    })
    .sort((a, b) => a.order - b.order);

  for (const extra of storedTypeCards) {
    if (!hostingTypeCards.some((c) => c.id === extra.id)) {
      hostingTypeCards.push({
        ...defaults.hostingTypes.cards[0],
        ...extra,
        id: extra.id || `hosting-type-${hostingTypeCards.length}`,
        overlayPills: Array.isArray(extra.overlayPills)
          ? extra.overlayPills
          : [],
        visible: extra.visible ?? true,
        order:
          typeof extra.order === "number"
            ? extra.order
            : hostingTypeCards.length,
      });
    }
  }

  const solutionIcon = (
    value: CmsSolutionProduct["icon"] | string | undefined,
    fallback: CmsSolutionProduct["icon"],
  ): CmsSolutionProduct["icon"] =>
    value === "server" ||
    value === "cloud" ||
    value === "cart" ||
    value === "wordpress" ||
    value === "users" ||
    value === "mail" ||
    value === "cpu" ||
    value === "globe"
      ? value
      : fallback;

  const mergeSolutionImages = (
    storedImages: CmsSolutionImage[] | undefined,
    fallbackImages: CmsSolutionImage[],
  ): CmsSolutionImage[] => {
    if (!Array.isArray(storedImages) || storedImages.length === 0) {
      return fallbackImages;
    }
    return storedImages.map((image, index) => {
      const fallback = fallbackImages[index] ?? fallbackImages[0];
      return {
        id: image.id || fallback?.id || `image-${index}`,
        url: typeof image.url === "string" ? image.url : (fallback?.url ?? ""),
        alt: typeof image.alt === "string" ? image.alt : (fallback?.alt ?? ""),
        visible: image.visible !== false,
        order: typeof image.order === "number" ? image.order : index,
      };
    });
  };

  const storedSolutions = stored.solutions;
  const storedSolutionProducts = Array.isArray(storedSolutions?.products)
    ? storedSolutions.products
    : [];
  const defaultSolutionProducts = defaults.solutions.products;
  const solutionProducts =
    storedSolutionProducts.length > 0
      ? storedSolutionProducts.map((item, index) => {
          const fallback =
            defaultSolutionProducts.find((product) => product.id === item.id) ??
            defaultSolutionProducts[index % defaultSolutionProducts.length];
          return {
            ...fallback,
            ...item,
            id: item.id || fallback.id || `solution-${index}`,
            icon: solutionIcon(item.icon, fallback.icon),
            visible: item.visible !== false,
            order: typeof item.order === "number" ? item.order : index,
            images: mergeSolutionImages(item.images, fallback.images),
          } satisfies CmsSolutionProduct;
        })
      : defaultSolutionProducts;

  const storedHero: Partial<CmsHeroContent> = stored.hero ?? {};
  const storedPartners = Array.isArray(storedHero.technologyPartners)
    ? storedHero.technologyPartners
    : [];
  const technologyPartners = [
    ...defaults.hero.technologyPartners!.map((fallback) => {
      const match = storedPartners.find((item) => item.id === fallback.id);
      if (!match) return fallback;
      return {
        ...fallback,
        ...match,
        imageUrl: typeof match.imageUrl === "string" ? match.imageUrl : "",
        visible: match.visible !== false,
        order: typeof match.order === "number" ? match.order : fallback.order,
      };
    }),
    ...storedPartners
      .filter(
        (item) =>
          !defaults.hero.technologyPartners!.some((d) => d.id === item.id),
      )
      .map((partner, index) => ({
        id: partner.id || `partner-extra-${index}`,
        label: partner.label || `Partner ${index + 1}`,
        imageUrl: typeof partner.imageUrl === "string" ? partner.imageUrl : "",
        visible: partner.visible !== false,
        order:
          typeof partner.order === "number"
            ? partner.order
            : defaults.hero.technologyPartners!.length + index,
      })),
  ].sort((a, b) => a.order - b.order);

  const storedFeatureBar = storedHero.featureBar;
  const defaultBar = defaultHeroFeatureBar();
  const storedFeatureItems = Array.isArray(storedFeatureBar?.items)
    ? storedFeatureBar.items
    : [];
  const featureBar: CmsHeroFeatureBar = {
    ...defaultBar,
    ...storedFeatureBar,
    items: [
      ...defaultBar.items.map((fallback) => {
        const match = storedFeatureItems.find(
          (item) => item.id === fallback.id,
        );
        return match
          ? {
              ...fallback,
              ...match,
              iconUrl: typeof match.iconUrl === "string" ? match.iconUrl : "",
              visible: match.visible !== false,
            }
          : fallback;
      }),
      ...storedFeatureItems.filter(
        (item) => !defaultBar.items.some((d) => d.id === item.id),
      ),
    ].sort((a, b) => a.order - b.order),
  };

  const storedPricing = Array.isArray(storedHero.domainPricing)
    ? storedHero.domainPricing.filter(
        (item) => typeof item?.tld === "string" && item.tld.trim(),
      )
    : [];

  const hero: CmsHeroContent = {
    ...defaults.hero,
    ...storedHero,
    visible: storedHero.visible !== false,
    eyebrow: storedHero.eyebrow ?? defaults.hero.eyebrow,
    headline: storedHero.headline ?? defaults.hero.headline,
    headlineAccent: storedHero.headlineAccent ?? defaults.hero.headlineAccent,
    description: storedHero.description ?? defaults.hero.description,
    searchPlaceholder:
      storedHero.searchPlaceholder ?? defaults.hero.searchPlaceholder,
    searchButtonLabel:
      storedHero.searchButtonLabel ?? defaults.hero.searchButtonLabel,
    bulkSearchLabel:
      storedHero.bulkSearchLabel ?? defaults.hero.bulkSearchLabel,
    backgroundImage:
      storedHero.backgroundImage?.trim() || defaults.hero.backgroundImage,
    speakerImage: storedHero.speakerImage?.trim() || defaults.hero.speakerImage,
    glassPanelLeft:
      storedHero.glassPanelLeft?.trim() || defaults.hero.glassPanelLeft,
    glassPanelRight:
      storedHero.glassPanelRight?.trim() || defaults.hero.glassPanelRight,
    trustItems: storedHero.trustItems ?? defaults.hero.trustItems,
    stats: storedHero.stats ?? defaults.hero.stats,
    domainPricing: storedPricing.length
      ? storedPricing.map((item) => ({
          tld: item.tld.startsWith(".") ? item.tld : `.${item.tld}`,
          priceLabel: item.priceLabel || "",
          visible: item.visible !== false,
        }))
      : defaults.hero.domainPricing,
    technologyPartners,
    featureBar,
  };

  const storedNav = stored.navigation;
  const hasLegacyCloudTopNav =
    Array.isArray(storedNav) &&
    storedNav.some(
      (item) =>
        typeof item?.label === "string" &&
        (item.label === "Cloud & VPS" ||
          /^cloud\s*&\s*vps$/i.test(item.label.trim())),
    );

  return {
    ...defaults,
    ...stored,
    hero,
    solutions: {
      ...defaults.solutions,
      ...stored.solutions,
      visible: stored.solutions?.visible !== false,
      products: solutionProducts.sort((a, b) => a.order - b.order),
    },
    products: {
      ...defaults.products,
      ...stored.products,
      offers: offers.sort((a, b) => a.order - b.order),
    },
    hostingTypes: {
      ...defaults.hostingTypes,
      ...stored.hostingTypes,
      visible: stored.hostingTypes?.visible !== false,
      cards: hostingTypeCards.sort((a, b) => a.order - b.order),
    },
    hostingPlans: {
      ...defaults.hostingPlans,
      ...stored.hostingPlans,
      eyebrow:
        stored.hostingPlans?.eyebrow?.trim() || defaults.hostingPlans.eyebrow,
      title:
        !stored.hostingPlans?.title?.trim() ||
        stored.hostingPlans.title === "Web Hosting Plans"
          ? defaults.hostingPlans.title
          : stored.hostingPlans.title,
      titleAccent:
        stored.hostingPlans?.titleAccent === "Plans & Price"
          ? defaults.hostingPlans.titleAccent
          : stored.hostingPlans?.titleAccent ||
            defaults.hostingPlans.titleAccent,
      description: (() => {
        const value = stored.hostingPlans?.description;
        if (
          typeof value === "string" &&
          value.trim() &&
          !/nepal/i.test(value) &&
          !/affordable web hosting prices/i.test(value)
        ) {
          return value;
        }
        return defaults.hostingPlans.description;
      })(),
      supportLabel: /local support/i.test(
        stored.hostingPlans?.supportLabel || "",
      )
        ? defaults.hostingPlans.supportLabel
        : stored.hostingPlans?.supportLabel ||
          defaults.hostingPlans.supportLabel,
      uptimeLabel:
        stored.hostingPlans?.uptimeLabel?.trim() ||
        defaults.hostingPlans.uptimeLabel,
      saveBadge:
        stored.hostingPlans?.saveBadge?.trim() ||
        defaults.hostingPlans.saveBadge,
      defaultBilling:
        stored.hostingPlans?.defaultBilling === "monthly"
          ? "monthly"
          : "annually",
      plans: plans.sort((a, b) => a.order - b.order),
      guarantees,
    },
    beyondAi: mergeBeyondAiSection(stored.beyondAi),
    businessEmail: mergeBusinessEmailSection(stored.businessEmail),
    aiAssistant: mergeAiAssistantSection(stored.aiAssistant),
    whyChoose: mergeWhyChooseSection(stored.whyChoose),
    homeFaqs: mergeHomeFaqsSection(stored.homeFaqs),
    footer: mergeFooterSection(stored.footer),
    // Drop legacy top-level Cloud & VPS — those live under Hosting now.
    // Also normalize stored "Web Hosting" label → "Hosting".
    navigation: (() => {
      const source =
        hasLegacyCloudTopNav || !Array.isArray(storedNav)
          ? defaults.navigation
          : storedNav.map((item) =>
              item.label === "Web Hosting"
                ? { ...item, label: "Hosting" }
                : item,
            );
      const next = [...source];
      if (!next.some((item) => item.label === "Pricing")) {
        next.push({ label: "Pricing", href: "/pricing" });
      }
      if (!next.some((item) => item.label === "Beyond AI")) {
        next.push({ label: "Beyond AI", href: "/beyond-ai" });
      }
      return next;
    })(),
  };
}
