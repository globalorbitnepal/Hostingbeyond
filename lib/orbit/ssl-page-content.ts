import { routes } from "@/config/routes";

export type CmsSslFeature = {
  id: string;
  visible: boolean;
  title: string;
  description: string;
  icon: "shield" | "lock" | "zap" | "search" | "globe" | "refresh";
};

export type CmsSslStat = {
  id: string;
  visible: boolean;
  value: string;
  label: string;
};

export type CmsSslIncludedGroup = {
  id: string;
  visible: boolean;
  title: string;
  description: string;
  items: string[];
};

export type CmsSslPlan = {
  id: string;
  visible: boolean;
  name: string;
  bestFor: string;
  badge: string;
  popular?: boolean;
  price1: string;
  price2: string;
  price3: string;
  renew: string;
  off: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
};

export type CmsSslStep = {
  id: string;
  visible: boolean;
  title: string;
  description: string;
};

export type CmsSslCertType = {
  id: string;
  visible: boolean;
  label: string;
  title: string;
  description: string;
  validation: string;
  issueTime: string;
  bestFor: string;
  points: string[];
};

export type CmsSslFaq = {
  id: string;
  visible: boolean;
  question: string;
  answer: string;
};

export type CmsSslReview = {
  id: string;
  visible: boolean;
  quote: string;
  name: string;
  role: string;
};

export type CmsSslPageContent = {
  heroBadge: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroDescription: string;
  heroBullets: string[];
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  heroGuarantee: string;
  heroVisualTitle: string;
  heroVisualDomain: string;
  heroVisualIssuer: string;
  heroVisualExpiryLabel: string;
  heroVisualExpiryValue: string;
  heroVisualScoreLabel: string;
  heroVisualScoreValue: string;

  statsHeading: string;
  stats: CmsSslStat[];

  whyEyebrow: string;
  whyHeading: string;
  whyHeadingAccent: string;
  whyDescription: string;
  features: CmsSslFeature[];

  includedEyebrow: string;
  includedHeading: string;
  includedHeadingAccent: string;
  includedDescription: string;
  includedGroups: CmsSslIncludedGroup[];
  includedFootnote: string;

  pricingEyebrow: string;
  pricingHeading: string;
  pricingHeadingAccent: string;
  pricingDescription: string;
  pricingNote: string;
  pricingSaveBadge: string;
  pricingTrust1: string;
  pricingTrust2: string;
  pricingTrust3: string;
  plans: CmsSslPlan[];

  stepsEyebrow: string;
  stepsHeading: string;
  stepsDescription: string;
  steps: CmsSslStep[];

  typesEyebrow: string;
  typesHeading: string;
  typesDescription: string;
  certTypes: CmsSslCertType[];

  securityEyebrow: string;
  securityHeading: string;
  securityDescription: string;
  securityProblems: string[];
  securityFixes: string[];

  reviewsHeading: string;
  reviewsDescription: string;
  reviews: CmsSslReview[];

  faqHeading: string;
  faqDescription: string;
  faqs: CmsSslFaq[];

  closingHeading: string;
  closingDescription: string;
  closingCtaLabel: string;
  closingCtaHref: string;
  closingFootnote: string;
};

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function lines(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value
    .filter((row): row is string => typeof row === "string")
    .map((row) => row.trim())
    .filter(Boolean);
  return cleaned.length ? cleaned : fallback;
}

function mergeStoredList<T extends { id: string; visible?: boolean }>(
  defaults: T[],
  stored: T[] | undefined | null,
  merge: (item: Partial<T>, base: T) => T,
): T[] {
  if (!Array.isArray(stored) || stored.length === 0) return defaults;
  const defaultById = new Map(defaults.map((row) => [row.id, row]));
  return stored.map((row, index) => {
    const partial = (row ?? {}) as Partial<T>;
    const fallback =
      (partial.id ? defaultById.get(partial.id) : undefined) ??
      defaults[index % defaults.length];
    return {
      ...merge(partial, fallback),
      id:
        typeof partial.id === "string" && partial.id.trim()
          ? partial.id
          : fallback.id,
      visible: partial.visible !== false,
    };
  });
}

export function defaultSslPageContent(): CmsSslPageContent {
  return {
    heroBadge: "HTTPS FOR EVERY DOMAIN",
    heroTitle: "Premium SSL certificates that make your site",
    heroTitleAccent: "trusted at first click",
    heroDescription:
      "Encrypt every login, form, and checkout with a certificate your visitors can verify in one glance. Free automated SSL on every hosting plan — or upgrade to a premium certificate with higher warranty, wildcard coverage, and priority issuance.",
    heroBullets: [
      "Free Let's Encrypt SSL on every HostingBeyond hosting plan",
      "Premium DV, wildcard, and multi-domain certificates with up to $1,750,000 warranty",
      "Automatic renewal, mixed-content cleanup, and HTTP → HTTPS redirects",
      "Validated domain control in minutes — issued before your coffee is cold",
    ],
    heroPrimaryLabel: "Compare SSL plans",
    heroPrimaryHref: "#ssl-plans",
    heroSecondaryLabel: "Talk to a specialist",
    heroSecondaryHref: routes.contact,
    heroGuarantee:
      "30-day money-back guarantee · Free reissue if your domain changes",
    heroVisualTitle: "Certificate verified",
    heroVisualDomain: "yourstore.com",
    heroVisualIssuer: "Issued by HostingBeyond Trust",
    heroVisualExpiryLabel: "Expires",
    heroVisualExpiryValue: "in 364 days",
    heroVisualScoreLabel: "Browser trust score",
    heroVisualScoreValue: "100 / 100",

    statsHeading: "Security your customers can measure",
    stats: [
      {
        id: "encrypted",
        visible: true,
        value: "100%",
        label: "Traffic encrypted end to end",
      },
      {
        id: "issuance",
        visible: true,
        value: "2 min",
        label: "Average issuance time",
      },
      {
        id: "uptime",
        visible: true,
        value: "99.99%",
        label: "Certificate validation uptime",
      },
      {
        id: "browsers",
        visible: true,
        value: "All",
        label: "Modern browsers and devices",
      },
    ],

    whyEyebrow: "WHY HTTPS IS NON-NEGOTIABLE",
    whyHeading: "A padlock is no longer optional — it is",
    whyHeadingAccent: "your first sale",
    whyDescription:
      "Chrome, Safari, and Edge label plain HTTP pages as “Not secure”. That warning sits directly above your pricing table and your checkout button. An SSL certificate removes it, protects form data in transit, and protects the search rankings you already earned.",
    features: [
      {
        id: "seo",
        visible: true,
        title: "Search visibility",
        description:
          "HTTPS is a confirmed ranking signal. Secure pages keep the positions your content earned instead of losing them to browser warnings.",
        icon: "search",
      },
      {
        id: "encryption",
        visible: true,
        title: "256-bit encryption",
        description:
          "Passwords, card details, and uploaded files travel encrypted, so intercepted traffic cannot be read on public Wi-Fi or hostile networks.",
        icon: "lock",
      },
      {
        id: "trust",
        visible: true,
        title: "Buyer confidence",
        description:
          "The padlock and verified issuer appear beside your address bar, removing the hesitation that quietly kills abandoned carts.",
        icon: "shield",
      },
      {
        id: "speed",
        visible: true,
        title: "Faster HTTP/2 & HTTP/3",
        description:
          "Modern protocols require TLS. Securing your domain unlocks multiplexed requests and lower latency on mobile connections.",
        icon: "zap",
      },
      {
        id: "forms",
        visible: true,
        title: "Safe lead capture",
        description:
          "Contact forms, newsletter signups, and account logins are protected in transit — no silent leaks into analytics or proxies.",
        icon: "globe",
      },
      {
        id: "auto",
        visible: true,
        title: "Renewal you never think about",
        description:
          "Certificates renew automatically before expiry, with alerts if DNS or validation ever needs your attention.",
        icon: "refresh",
      },
    ],

    includedEyebrow: "WHAT SHIPS WITH EVERY CERTIFICATE",
    includedHeading: "Everything around the certificate,",
    includedHeadingAccent: "handled for you",
    includedDescription:
      "A certificate is only half the job. HostingBeyond installs it, forces HTTPS, fixes mixed content, and monitors renewal on every domain you point at us.",
    includedGroups: [
      {
        id: "install",
        visible: true,
        title: "Installation & routing",
        description:
          "Set up in one click from your hosting panel — no CSR files.",
        items: [
          "Automatic installation on all assigned domains",
          "HTTP → HTTPS 301 redirects configured for you",
          "www and non-www both secured",
          "Subdomains covered with wildcard certificates",
        ],
      },
      {
        id: "hardening",
        visible: true,
        title: "Hardening & compliance",
        description:
          "Modern TLS defaults that keep auditors and payment providers happy.",
        items: [
          "TLS 1.2 and TLS 1.3 with strong cipher suites",
          "HSTS ready, mixed-content scanner included",
          "PCI-DSS friendly encryption for checkout pages",
          "Free reissue when your domain or host changes",
        ],
      },
      {
        id: "monitoring",
        visible: true,
        title: "Monitoring & support",
        description:
          "We watch expiry so you never ship an expired certificate.",
        items: [
          "Expiry alerts at 30, 14, and 7 days",
          "Downtime-free renewal on the same key pair",
          "24/7 support for validation and DNS issues",
          "Plain-language help if a browser flags your site",
        ],
      },
    ],
    includedFootnote:
      "Free automated SSL is included on all HostingBeyond web and cloud hosting plans. Premium certificates can be purchased for domains hosted anywhere.",

    pricingEyebrow: "SSL CERTIFICATES",
    pricingHeading: "Choose the certificate that matches",
    pricingHeadingAccent: "your risk",
    pricingDescription:
      "Start free with automated Let's Encrypt SSL, or upgrade for warranty-backed validation, unlimited subdomains, and priority issuance.",
    pricingNote:
      "Prices are per certificate and exclude applicable taxes. Multi-year terms are paid upfront; renewal pricing is shown before checkout.",
    pricingSaveBadge: "Save up to 45% on multi-year terms",
    pricingTrust1: "Instant activation",
    pricingTrust2: "Free reissue",
    pricingTrust3: "Cancel anytime",
    plans: [
      {
        id: "free",
        visible: true,
        name: "Free SSL",
        bestFor: "every hosting plan",
        badge: "INCLUDED",
        price1: "0",
        price2: "0",
        price3: "0",
        renew: "0",
        off: "FREE",
        features: [
          "Domain-validated (DV) encryption",
          "Auto-install and auto-renew",
          "HTTP → HTTPS redirect included",
          "Unlimited traffic",
          "Ideal for blogs, portfolios, and staging",
        ],
        ctaLabel: "Included with hosting",
        ctaHref: routes.hosting,
      },
      {
        id: "premium",
        visible: true,
        name: "Premium SSL",
        bestFor: "online stores and lead-gen sites",
        badge: "MOST POPULAR",
        popular: true,
        price1: "39.99",
        price2: "34.99",
        price3: "29.99",
        renew: "49.99",
        off: "SAVE 20%",
        features: [
          "DV certificate with $250,000 warranty",
          "Issued in under 2 minutes",
          "Trusted by 99.9% of browsers",
          "Free reissue and unlimited server licences",
          "Priority validation support",
        ],
        ctaLabel: "Buy Premium SSL",
        ctaHref: routes.contact,
      },
      {
        id: "wildcard",
        visible: true,
        name: "Wildcard SSL",
        bestFor: "apps with many subdomains",
        badge: "BEST VALUE",
        price1: "99.99",
        price2: "89.99",
        price3: "79.99",
        renew: "119.99",
        off: "SAVE 33%",
        features: [
          "Secures a domain plus unlimited subdomains",
          "DV validation with $500,000 warranty",
          "Perfect for SaaS, panels, and multi-tenant apps",
          "One certificate for api., app., and www.",
          "Free reissue for new subdomains",
        ],
        ctaLabel: "Buy Wildcard SSL",
        ctaHref: routes.contact,
      },
      {
        id: "multi",
        visible: true,
        name: "Multi-Domain Enterprise",
        bestFor: "agencies and brand portfolios",
        badge: "MAXIMUM COVERAGE",
        price1: "179.99",
        price2: "164.99",
        price3: "149.99",
        renew: "219.99",
        off: "SAVE 32%",
        features: [
          "Protect up to 100 domains on one certificate",
          "Business-validated (OV) identity checks",
          "Up to $1,750,000 warranty",
          "Dedicated onboarding specialist",
          "Managed renewal across every domain",
        ],
        ctaLabel: "Talk to sales",
        ctaHref: routes.contact,
      },
    ],

    stepsEyebrow: "FROM PURCHASE TO PADLOCK",
    stepsHeading: "Live with HTTPS in four steps",
    stepsDescription:
      "No certificate signing requests, no server restarts, no downtime. Most domains are secured before the browser tab finishes loading.",
    steps: [
      {
        id: "pick",
        visible: true,
        title: "Pick your certificate",
        description:
          "Choose free automated SSL or a premium plan. Wildcard covers unlimited subdomains; multi-domain covers up to 100 sites.",
      },
      {
        id: "validate",
        visible: true,
        title: "Verify domain control",
        description:
          "We validate via DNS or HTTP automatically. For OV certificates, our team collects business documents for you.",
      },
      {
        id: "install",
        visible: true,
        title: "We install and force HTTPS",
        description:
          "The certificate is deployed to your hosting, redirects are configured, and mixed-content warnings are cleaned up.",
      },
      {
        id: "monitor",
        visible: true,
        title: "Renewals handled forever",
        description:
          "Expiry monitoring runs continuously. Renewal happens on the same key pair, so no visitor ever sees a warning page.",
      },
    ],

    typesEyebrow: "CERTIFICATE TYPES",
    typesHeading: "Understand what each validation level buys you",
    typesDescription:
      "Every certificate encrypts traffic the same way. The difference is how much identity checking sits behind the padlock — and how much liability the issuer covers.",
    certTypes: [
      {
        id: "dv",
        visible: true,
        label: "DV",
        title: "Domain Validated",
        description:
          "The issuer confirms you control the domain. Issued in minutes, ideal for blogs, brochures, and most hosting customers.",
        validation: "Domain control only",
        issueTime: "1–5 minutes",
        bestFor: "Most websites",
        points: [
          "Strongest encryption, fastest issuance",
          "Free option included with hosting",
          "Removes “Not secure” warnings",
        ],
      },
      {
        id: "ov",
        visible: true,
        label: "OV",
        title: "Organization Validated",
        description:
          "The issuer verifies your registered business exists and owns the domain. Preferred by B2B buyers and procurement teams.",
        validation: "Business registry check",
        issueTime: "1–3 business days",
        bestFor: "B2B and regulated sites",
        points: [
          "Company name verified by the CA",
          "Higher warranty coverage",
          "Satisfies enterprise vendor reviews",
        ],
      },
      {
        id: "ev",
        visible: true,
        label: "EV",
        title: "Extended Validation",
        description:
          "The strictest identity audit available: legal, operational, and domain checks. Required by some finance and government portals.",
        validation: "Full legal + operational audit",
        issueTime: "3–7 business days",
        bestFor: "Finance, gov, healthcare",
        points: [
          "Maximum verification depth",
          "Highest warranty tier",
          "Dedicated compliance specialist",
        ],
      },
    ],

    securityEyebrow: "THE COST OF DOING NOTHING",
    securityHeading: "What an unsecured page quietly costs you",
    securityDescription:
      "Browsers now treat HTTP as broken by default. Every visitor who sees a warning is a decision point — and most of them leave.",
    securityProblems: [
      "“Not secure” printed next to your brand in the address bar",
      "Login and checkout fields transmitted in clear text",
      "Card processors refuse or downgrade unencrypted checkout pages",
      "Search engines demote pages that never moved to HTTPS",
      "Session cookies exposed to interception on shared networks",
      "Customers abandoning carts at the moment of payment",
    ],
    securityFixes: [
      "Green padlock and verified issuer on every page",
      "256-bit TLS encryption for all form submissions",
      "PCI-friendly checkout that payment providers accept",
      "Ranking parity, plus HTTP/2 and HTTP/3 speed gains",
      "HttpOnly, Secure cookies by default in your panel",
      "One continuous, trusted path from landing page to receipt",
    ],

    reviewsHeading: "Trusted by stores, agencies, and SaaS teams",
    reviewsDescription:
      "Real feedback from customers who moved their domains to HostingBeyond certificates.",
    reviews: [
      {
        id: "r1",
        visible: true,
        quote:
          "We switched three storefronts to wildcard SSL over a lunch break. Zero downtime, and our checkout abandonment dropped the same week.",
        name: "Priya Sharma",
        role: "Founder, Kathmandu Craft Co.",
      },
      {
        id: "r2",
        visible: true,
        quote:
          "Our enterprise client demanded OV validation. HostingBeyond handled the paperwork and had the certificate installed before the review call.",
        name: "Daniel Osei",
        role: "Agency Director, Northline Digital",
      },
      {
        id: "r3",
        visible: true,
        quote:
          "Renewals used to be my recurring nightmare across 40 client domains. Now I only hear about SSL when something needs a DNS tweak.",
        name: "Marta Ruiz",
        role: "Operations Lead, Studio Vertex",
      },
    ],

    faqHeading: "SSL questions, answered plainly",
    faqDescription:
      "Everything customers ask before they secure their first domain with us.",
    faqs: [
      {
        id: "free",
        visible: true,
        question: "Is SSL really free with hosting?",
        answer:
          "Yes. Every HostingBeyond web, cloud, WordPress, and ecommerce hosting plan includes automated Let's Encrypt SSL for all assigned domains, with automatic renewal and forced HTTPS redirects at no extra cost.",
      },
      {
        id: "difference",
        visible: true,
        question: "What do premium certificates add over free SSL?",
        answer:
          "The same encryption, plus a financial warranty, issued identity validation (OV/EV), wildcard or multi-domain coverage, priority support, and unlimited server licences. Premium plans also suit agencies reselling to clients.",
      },
      {
        id: "wildcard",
        visible: true,
        question: "Do I need a wildcard certificate?",
        answer:
          "If you run apps on subdomains — app., api., shop., or customer-specific subdomains — a wildcard covers all of them with one certificate instead of issuing each separately. It does not cover a second-level different domain.",
      },
      {
        id: "migration",
        visible: true,
        question: "Can I use your certificate on another host?",
        answer:
          "Yes. Premium certificates are issued to you and can be installed wherever your DNS points. Our team provides the certificate chain and installation guidance for cPanel, Plesk, Nginx, and Apache.",
      },
      {
        id: "downtime",
        visible: true,
        question: "Will enabling SSL break my site?",
        answer:
          "No. Installation is non-disruptive and we scan for mixed content — hard-coded http:// links, images, and scripts — so browsers do not downgrade the padlock after the switch.",
      },
      {
        id: "expiry",
        visible: true,
        question: "What happens if a certificate expires?",
        answer:
          "Automated certificates renew 30 days before expiry. Premium certificates are monitored by our team with alerts at 30, 14, and 7 days, and renewal is applied without downtime on the same key pair.",
      },
    ],

    closingHeading: "Secure your domain before your next visitor arrives",
    closingDescription:
      "Activate free SSL in one click, or upgrade to a premium certificate with warranty-backed validation and wildcard coverage.",
    closingCtaLabel: "Secure my domain",
    closingCtaHref: "#ssl-plans",
    closingFootnote:
      "Need help choosing between DV, wildcard, and multi-domain? Our team replies in minutes, 24/7.",
  };
}

export function mergeSslPageContent(
  stored?: Partial<CmsSslPageContent> | null,
): CmsSslPageContent {
  const defaults = defaultSslPageContent();
  if (!stored) return defaults;

  return {
    ...defaults,
    heroBadge: text(stored.heroBadge, defaults.heroBadge),
    heroTitle: text(stored.heroTitle, defaults.heroTitle),
    heroTitleAccent: text(stored.heroTitleAccent, defaults.heroTitleAccent),
    heroDescription: text(stored.heroDescription, defaults.heroDescription),
    heroBullets: lines(stored.heroBullets, defaults.heroBullets),
    heroPrimaryLabel: text(stored.heroPrimaryLabel, defaults.heroPrimaryLabel),
    heroPrimaryHref: text(stored.heroPrimaryHref, defaults.heroPrimaryHref),
    heroSecondaryLabel: text(
      stored.heroSecondaryLabel,
      defaults.heroSecondaryLabel,
    ),
    heroSecondaryHref: text(
      stored.heroSecondaryHref,
      defaults.heroSecondaryHref,
    ),
    heroGuarantee: text(stored.heroGuarantee, defaults.heroGuarantee),
    heroVisualTitle: text(stored.heroVisualTitle, defaults.heroVisualTitle),
    heroVisualDomain: text(stored.heroVisualDomain, defaults.heroVisualDomain),
    heroVisualIssuer: text(stored.heroVisualIssuer, defaults.heroVisualIssuer),
    heroVisualExpiryLabel: text(
      stored.heroVisualExpiryLabel,
      defaults.heroVisualExpiryLabel,
    ),
    heroVisualExpiryValue: text(
      stored.heroVisualExpiryValue,
      defaults.heroVisualExpiryValue,
    ),
    heroVisualScoreLabel: text(
      stored.heroVisualScoreLabel,
      defaults.heroVisualScoreLabel,
    ),
    heroVisualScoreValue: text(
      stored.heroVisualScoreValue,
      defaults.heroVisualScoreValue,
    ),

    statsHeading: text(stored.statsHeading, defaults.statsHeading),
    stats: mergeStoredList(defaults.stats, stored.stats, (item, base) => ({
      ...base,
      value: text(item.value, base.value),
      label: text(item.label, base.label),
    })),

    whyEyebrow: text(stored.whyEyebrow, defaults.whyEyebrow),
    whyHeading: text(stored.whyHeading, defaults.whyHeading),
    whyHeadingAccent: text(stored.whyHeadingAccent, defaults.whyHeadingAccent),
    whyDescription: text(stored.whyDescription, defaults.whyDescription),
    features: mergeStoredList(
      defaults.features,
      stored.features,
      (item, base) => ({
        ...base,
        title: text(item.title, base.title),
        description: text(item.description, base.description),
        icon: (item.icon ?? base.icon) as CmsSslFeature["icon"],
      }),
    ),

    includedEyebrow: text(stored.includedEyebrow, defaults.includedEyebrow),
    includedHeading: text(stored.includedHeading, defaults.includedHeading),
    includedHeadingAccent: text(
      stored.includedHeadingAccent,
      defaults.includedHeadingAccent,
    ),
    includedDescription: text(
      stored.includedDescription,
      defaults.includedDescription,
    ),
    includedGroups: mergeStoredList(
      defaults.includedGroups,
      stored.includedGroups,
      (item, base) => ({
        ...base,
        title: text(item.title, base.title),
        description: text(item.description, base.description),
        items: lines(item.items, base.items),
      }),
    ),
    includedFootnote: text(stored.includedFootnote, defaults.includedFootnote),

    pricingEyebrow: text(stored.pricingEyebrow, defaults.pricingEyebrow),
    pricingHeading: text(stored.pricingHeading, defaults.pricingHeading),
    pricingHeadingAccent: text(
      stored.pricingHeadingAccent,
      defaults.pricingHeadingAccent,
    ),
    pricingDescription: text(
      stored.pricingDescription,
      defaults.pricingDescription,
    ),
    pricingNote: text(stored.pricingNote, defaults.pricingNote),
    pricingSaveBadge: text(stored.pricingSaveBadge, defaults.pricingSaveBadge),
    pricingTrust1: text(stored.pricingTrust1, defaults.pricingTrust1),
    pricingTrust2: text(stored.pricingTrust2, defaults.pricingTrust2),
    pricingTrust3: text(stored.pricingTrust3, defaults.pricingTrust3),
    plans: mergeStoredList(defaults.plans, stored.plans, (item, base) => ({
      ...base,
      name: text(item.name, base.name),
      bestFor: text(item.bestFor, base.bestFor),
      badge: text(item.badge, base.badge),
      popular: item.popular ?? base.popular,
      price1: text(item.price1, base.price1),
      price2: text(item.price2, base.price2),
      price3: text(item.price3, base.price3),
      renew: text(item.renew, base.renew),
      off: text(item.off, base.off),
      features: lines(item.features, base.features),
      ctaLabel: text(item.ctaLabel, base.ctaLabel),
      ctaHref: text(item.ctaHref, base.ctaHref),
    })),

    stepsEyebrow: text(stored.stepsEyebrow, defaults.stepsEyebrow),
    stepsHeading: text(stored.stepsHeading, defaults.stepsHeading),
    stepsDescription: text(stored.stepsDescription, defaults.stepsDescription),
    steps: mergeStoredList(defaults.steps, stored.steps, (item, base) => ({
      ...base,
      title: text(item.title, base.title),
      description: text(item.description, base.description),
    })),

    typesEyebrow: text(stored.typesEyebrow, defaults.typesEyebrow),
    typesHeading: text(stored.typesHeading, defaults.typesHeading),
    typesDescription: text(stored.typesDescription, defaults.typesDescription),
    certTypes: mergeStoredList(
      defaults.certTypes,
      stored.certTypes,
      (item, base) => ({
        ...base,
        label: text(item.label, base.label),
        title: text(item.title, base.title),
        description: text(item.description, base.description),
        validation: text(item.validation, base.validation),
        issueTime: text(item.issueTime, base.issueTime),
        bestFor: text(item.bestFor, base.bestFor),
        points: lines(item.points, base.points),
      }),
    ),

    securityEyebrow: text(stored.securityEyebrow, defaults.securityEyebrow),
    securityHeading: text(stored.securityHeading, defaults.securityHeading),
    securityDescription: text(
      stored.securityDescription,
      defaults.securityDescription,
    ),
    securityProblems: lines(stored.securityProblems, defaults.securityProblems),
    securityFixes: lines(stored.securityFixes, defaults.securityFixes),

    reviewsHeading: text(stored.reviewsHeading, defaults.reviewsHeading),
    reviewsDescription: text(
      stored.reviewsDescription,
      defaults.reviewsDescription,
    ),
    reviews: mergeStoredList(
      defaults.reviews,
      stored.reviews,
      (item, base) => ({
        ...base,
        quote: text(item.quote, base.quote),
        name: text(item.name, base.name),
        role: text(item.role, base.role),
      }),
    ),

    faqHeading: text(stored.faqHeading, defaults.faqHeading),
    faqDescription: text(stored.faqDescription, defaults.faqDescription),
    faqs: mergeStoredList(defaults.faqs, stored.faqs, (item, base) => ({
      ...base,
      question: text(item.question, base.question),
      answer: text(item.answer, base.answer),
    })),

    closingHeading: text(stored.closingHeading, defaults.closingHeading),
    closingDescription: text(
      stored.closingDescription,
      defaults.closingDescription,
    ),
    closingCtaLabel: text(stored.closingCtaLabel, defaults.closingCtaLabel),
    closingCtaHref: text(stored.closingCtaHref, defaults.closingCtaHref),
    closingFootnote: text(stored.closingFootnote, defaults.closingFootnote),
  };
}
