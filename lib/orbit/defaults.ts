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
  discountBadge: string;
  popular: boolean;
  popularLabel: string;
  accent: "blue" | "purple" | "gradient";
  /** Per-month price when Annually is selected */
  priceAnnually: string;
  /** Strikethrough when Annually is selected */
  originalAnnually: string;
  billedAnnually: string;
  /** Per-month price when Monthly is selected */
  priceMonthly: string;
  originalMonthly: string;
  billedMonthly: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
};

export type CmsHostingGuarantee = {
  id: string;
  title: string;
  description: string;
  icon: "shield" | "lock" | "rocket";
};

export type CmsHostingPlansContent = {
  visible: boolean;
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  supportLabel: string;
  activationLabel: string;
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

export type CmsBeyondAiCreatorContent = {
  visible: boolean;
  eyebrow: string;
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
  imageUrl: string;
  imageAlt: string;
  highlights: CmsBeyondAiHighlight[];
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

export type CmsHomeSections = {
  hero: CmsHeroContent;
  solutions: CmsSolutionsContent;
  products: CmsProductsContent;
  hostingTypes: CmsHostingTypesContent;
  hostingPlans: CmsHostingPlansContent;
  beyondAi: CmsBeyondAiContent;
  beyondAiCreator: CmsBeyondAiCreatorContent;
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
      name: "Web Essential",
      discountBadge: "50% OFF",
      popular: false,
      popularLabel: "",
      accent: "blue",
      priceAnnually: "$5.00",
      originalAnnually: "$10.00",
      billedAnnually: "Billed $60.00 Annually",
      priceMonthly: "$10.00",
      originalMonthly: "",
      billedMonthly: "Billed monthly",
      features: [
        "1 Website",
        "10 GB SSD Storage",
        "Unmetered Bandwidth",
        "2 GB RAM",
        "1 Email Account",
        "Free SSL Certificate",
        "24/7 Support",
      ],
      ctaLabel: "Get Started",
      ctaHref: routes.getStarted,
    },
    {
      id: "plus",
      visible: true,
      order: 1,
      name: "Web Plus",
      discountBadge: "50% OFF",
      popular: false,
      popularLabel: "",
      accent: "blue",
      priceAnnually: "$10.00",
      originalAnnually: "$20.00",
      billedAnnually: "Billed $120.00 Annually",
      priceMonthly: "$20.00",
      originalMonthly: "",
      billedMonthly: "Billed monthly",
      features: [
        "5 Websites",
        "20 GB SSD Storage",
        "Unmetered Bandwidth",
        "4 GB RAM",
        "10 Email Accounts",
        "Free SSL Certificate",
        "24/7 Support",
      ],
      ctaLabel: "Get Started",
      ctaHref: routes.getStarted,
    },
    {
      id: "pro",
      visible: true,
      order: 2,
      name: "Web Pro",
      discountBadge: "50% OFF",
      popular: true,
      popularLabel: "Most Popular",
      accent: "gradient",
      priceAnnually: "$15.00",
      originalAnnually: "$30.00",
      billedAnnually: "Billed $180.00 Annually",
      priceMonthly: "$30.00",
      originalMonthly: "",
      billedMonthly: "Billed monthly",
      features: [
        "Unlimited Websites",
        "40 GB SSD Storage",
        "Unmetered Bandwidth",
        "6 GB RAM",
        "Unlimited Email Accounts",
        "Free SSL Certificate",
        "Priority Support",
      ],
      ctaLabel: "Get Started",
      ctaHref: routes.getStarted,
    },
    {
      id: "ultimate",
      visible: true,
      order: 3,
      name: "Web Ultimate",
      discountBadge: "50% OFF",
      popular: false,
      popularLabel: "",
      accent: "purple",
      priceAnnually: "$20.00",
      originalAnnually: "$40.00",
      billedAnnually: "Billed $240.00 Annually",
      priceMonthly: "$40.00",
      originalMonthly: "",
      billedMonthly: "Billed monthly",
      features: [
        "Unlimited Websites",
        "60 GB SSD Storage",
        "Unmetered Bandwidth",
        "8 GB RAM",
        "Unlimited Email Accounts",
        "Free SSL Certificate",
        "Priority Support",
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
    titleAccent: "Plans & Price",
    description:
      "Compare our affordable web hosting prices and choose the perfect hosting plan for your website.",
    supportLabel: "24/7 Local Support",
    activationLabel: "Instant Activation",
    annualToggleLabel: "Annually (Save 50%)",
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
        id: "uptime",
        title: "99.99% Uptime Guarantee",
        description:
          "High-availability network designed for always-on performance.",
        icon: "rocket",
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

export function defaultBeyondAiCreatorSection(): CmsBeyondAiCreatorContent {
  return {
    visible: true,
    eyebrow: "Beyond AI · Built for Everyone",
    title: "Create a website",
    titleAccent: "with Beyond AI",
    description:
      "No design skills. No extra hosting. Describe your idea and publish a professional site in minutes — powered by the same high-speed platform behind HostingBeyond.",
    primaryCtaLabel: "Start Building with Beyond AI",
    primaryCtaHref: routes.beyondAi,
    secondaryCtaLabel: "View Templates",
    secondaryCtaHref: routes.beyondAi,
    trust1: "No credit card required",
    trust2: "Free to try",
    trust3: "Launch in minutes",
    imageUrl: "/images/beyond-ai/creator.jpg",
    imageAlt:
      "A young woman creating a professional website with Beyond AI on her laptop",
    highlights: [
      {
        id: "design",
        title: "AI Designs for You",
        subtitle: "Look professional instantly",
        icon: "zap",
      },
      {
        id: "hosting",
        title: "Hosting Included",
        subtitle: "Nothing extra to buy",
        icon: "cloud",
      },
      {
        id: "publish",
        title: "One Click Publish",
        subtitle: "Go live in minutes",
        icon: "globe",
      },
      {
        id: "grow",
        title: "Built to Grow",
        subtitle: "From first site to many",
        icon: "rocket",
      },
    ],
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
    beyondAiCreator: defaultBeyondAiCreatorSection(),
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

function mergeBeyondAiCreatorSection(
  stored?: Partial<CmsBeyondAiCreatorContent> | null,
): CmsBeyondAiCreatorContent {
  const defaults = defaultBeyondAiCreatorSection();
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

  const highlights =
    Array.isArray(stored.highlights) && stored.highlights.length > 0
      ? stored.highlights.map((item, index) => {
          const fallback =
            defaults.highlights[index % defaults.highlights.length];
          return {
            ...fallback,
            ...item,
            id: item.id || fallback.id || `creator-highlight-${index}`,
            icon: highlightIcon(item.icon, fallback.icon),
            title: item.title || fallback.title,
            subtitle: item.subtitle || fallback.subtitle,
          } satisfies CmsBeyondAiHighlight;
        })
      : defaults.highlights;

  return {
    ...defaults,
    ...stored,
    visible: stored.visible !== false,
    imageUrl:
      typeof stored.imageUrl === "string" && stored.imageUrl.trim()
        ? stored.imageUrl
        : defaults.imageUrl,
    highlights,
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
      return {
        ...fallback,
        ...match,
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
        features: Array.isArray(extra.features) ? extra.features : [],
        visible: extra.visible ?? true,
        order: typeof extra.order === "number" ? extra.order : plans.length,
      });
    }
  }

  const storedGuarantees = Array.isArray(stored.hostingPlans?.guarantees)
    ? stored.hostingPlans!.guarantees
    : [];

  const guarantees: CmsHostingGuarantee[] =
    storedGuarantees.length > 0
      ? storedGuarantees.map((item, index) => {
          const fallback =
            defaults.hostingPlans.guarantees[
              index % defaults.hostingPlans.guarantees.length
            ];
          const icon: CmsHostingGuarantee["icon"] =
            item.icon === "lock" || item.icon === "rocket"
              ? item.icon
              : "shield";
          return {
            ...fallback,
            ...item,
            id: item.id || `guarantee-${index}`,
            icon,
          };
        })
      : defaults.hostingPlans.guarantees;

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
      description: (() => {
        const value = stored.hostingPlans?.description;
        if (
          typeof value === "string" &&
          value.trim() &&
          !/nepal/i.test(value)
        ) {
          return value;
        }
        return defaults.hostingPlans.description;
      })(),
      defaultBilling:
        stored.hostingPlans?.defaultBilling === "monthly"
          ? "monthly"
          : "annually",
      plans: plans.sort((a, b) => a.order - b.order),
      guarantees,
    },
    beyondAi: mergeBeyondAiSection(stored.beyondAi),
    beyondAiCreator: mergeBeyondAiCreatorSection(stored.beyondAiCreator),
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
