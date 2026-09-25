import { routes } from "@/config/routes";

export type CmsTransferStep = {
  id: string;
  visible: boolean;
  title: string;
  description: string;
};

export type CmsTransferFeature = {
  id: string;
  visible: boolean;
  title: string;
  description: string;
  icon: "shield" | "clock" | "globe" | "mail" | "server" | "sparkles";
};

export type CmsTransferFaq = {
  id: string;
  visible: boolean;
  question: string;
  answer: string;
};

export type CmsTransferPerk = {
  id: string;
  visible: boolean;
  label: string;
  value: string;
};

export type CmsDomainTransferPageContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroDescription: string;
  heroBullets: string[];
  heroSearchPlaceholder: string;
  heroAuthPlaceholder: string;
  heroImage: string;
  heroGuarantee: string;

  perks: CmsTransferPerk[];

  stepsHeading: string;
  stepsDescription: string;
  steps: CmsTransferStep[];

  whyHeading: string;
  whyDescription: string;
  features: CmsTransferFeature[];

  pricingEyebrow: string;
  pricingTitle: string;
  pricingDescription: string;
  pricingFootnote: string;

  bundleHeading: string;
  bundleDescription: string;
  bundleBullets: string[];
  bundleImage: string;
  bundleCtaLabel: string;
  bundleCtaHref: string;

  supportHeading: string;
  supportDescription: string;
  supportCtaLabel: string;
  supportCtaHref: string;

  faqHeading: string;
  faqDescription: string;
  faqs: CmsTransferFaq[];

  closingHeading: string;
  closingDescription: string;
  closingCtaLabel: string;
  closingCtaHref: string;
};

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
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

export function defaultDomainTransferPageContent(): CmsDomainTransferPageContent {
  return {
    heroEyebrow: "Domain transfer",
    heroTitle: "Transfer your domain to",
    heroTitleAccent: "HostingBeyond",
    heroDescription:
      "Move your name here in a few guided steps — keep DNS, hosting, and business email under one roof with transparent transfer pricing.",
    heroBullets: [
      "Extend your registration by one year on most transfers",
      "Free DNS management and WHOIS privacy on eligible TLDs",
      "24/7 specialists if your auth code or unlock step gets stuck",
    ],
    heroSearchPlaceholder: "Enter domain to transfer — yourbrand.com",
    heroAuthPlaceholder: "Auth / EPP code (optional for now)",
    heroImage: "/images/domains/transfer.jpg",
    heroGuarantee: "No surprise registrar lock — we show fees before checkout.",

    perks: [
      {
        id: "speed",
        visible: true,
        label: "Typical transfer time",
        value: "5–7 days",
      },
      {
        id: "price",
        visible: true,
        label: ".com transfer from",
        value: "$9.99/yr",
      },
      {
        id: "support",
        visible: true,
        label: "Transfer help",
        value: "24/7 chat",
      },
    ],

    stepsHeading: "How domain transfer works",
    stepsDescription:
      "The process is standard across registrars — we keep the steps visible so you always know what happens next.",
    steps: [
      {
        id: "unlock",
        visible: true,
        title: "Unlock at your current registrar",
        description:
          "Turn off registrar lock and confirm you are the domain owner. Some hosts call this “transfer protection.”",
      },
      {
        id: "code",
        visible: true,
        title: "Get your authorization code",
        description:
          "Request the EPP / auth code from your current provider. Paste it during checkout when you are ready.",
      },
      {
        id: "approve",
        visible: true,
        title: "Approve and point DNS",
        description:
          "Confirm the transfer email, then update nameservers or DNS records to HostingBeyond when we prompt you.",
      },
    ],

    whyHeading: "Why transfer to HostingBeyond",
    whyDescription:
      "Stop juggling logins across registrars, hosts, and mail providers — manage the stack that actually runs your business.",
    features: [
      {
        id: "dns",
        visible: true,
        title: "DNS you control",
        description:
          "Edit A, CNAME, MX, and TXT records from the same panel as your hosting plans.",
        icon: "globe",
      },
      {
        id: "privacy",
        visible: true,
        title: "Privacy where supported",
        description:
          "WHOIS privacy on eligible extensions so your personal details stay off public lookups.",
        icon: "shield",
      },
      {
        id: "email",
        visible: true,
        title: "Business email ready",
        description:
          "Add mailboxes on your domain without a separate Google Workspace bill if you do not need one.",
        icon: "mail",
      },
      {
        id: "hosting",
        visible: true,
        title: "Hosting on NVMe",
        description:
          "Pair the transfer with web hosting or Beyond AI so the site and domain renew together.",
        icon: "server",
      },
      {
        id: "fast",
        visible: true,
        title: "Clear timelines",
        description:
          "Track transfer status in your account — we surface approval emails and expiry windows.",
        icon: "clock",
      },
      {
        id: "ai",
        visible: true,
        title: "Beyond AI optional",
        description:
          "Spin up a new marketing site on the same domain while DNS propagates.",
        icon: "sparkles",
      },
    ],

    pricingEyebrow: "Transfer pricing",
    pricingTitle: "Popular extensions",
    pricingDescription:
      "Transfer price includes a one-year extension on most TLDs. ICANN fees apply where required.",
    pricingFootnote:
      "Prices in USD. Renewals after year one follow the standard renewal rate for each extension.",

    bundleHeading: "Domain + hosting + mail",
    bundleDescription:
      "Transfers are smoother when everything lives in one place. Add hosting or business email during checkout or anytime after the move.",
    bundleBullets: [
      "Point nameservers to HostingBeyond in one click after transfer",
      "Free SSL on hosting plans — HTTPS follows your domain",
      "Optional website migration when you upgrade hosting",
    ],
    bundleImage: "/images/domains/brand-kit.jpg",
    bundleCtaLabel: "See hosting plans",
    bundleCtaHref: `${routes.hosting}#plans`,

    supportHeading: "Stuck on an auth code or unlock?",
    supportDescription:
      "Send us your domain and current registrar — we will tell you exactly which menu to open.",
    supportCtaLabel: "Talk to domain support",
    supportCtaHref: routes.contact,

    faqHeading: "Domain transfer FAQs",
    faqDescription:
      "Timing, auth codes, downtime, and what happens to email during a transfer.",
    faqs: [
      {
        id: "time",
        visible: true,
        question: "How long does a domain transfer take?",
        answer:
          "Most gTLD transfers complete within 5–7 days after you approve the transfer email. ccTLDs can take longer depending on the registry.",
      },
      {
        id: "downtime",
        visible: true,
        question: "Will my website go down during the transfer?",
        answer:
          "No — transferring the domain does not change DNS by itself. Update nameservers only when you are ready to host with HostingBeyond.",
      },
      {
        id: "auth",
        visible: true,
        question: "What is an authorization (EPP) code?",
        answer:
          "It is a unique password your current registrar gives you to prove you own the domain. You enter it at checkout so the registry can approve the move.",
      },
      {
        id: "email",
        visible: true,
        question: "What happens to email on my domain?",
        answer:
          "MX records stay wherever they point today until you change DNS. Plan MX updates if you move mail to HostingBeyond business email.",
      },
      {
        id: "year",
        visible: true,
        question: "Do I get an extra year of registration?",
        answer:
          "On most extensions, paying the transfer fee adds one year to your current expiry date. Your panel shows the new expiry before you pay.",
      },
      {
        id: "fail",
        visible: true,
        question: "What if the transfer fails?",
        answer:
          "Common causes are an incorrect auth code, registrar lock, or a recently registered/transferred domain inside the 60-day ICANN window. Support can read the registry message and tell you the fix.",
      },
    ],

    closingHeading: "Ready to move your domain?",
    closingDescription:
      "Check eligibility, grab your auth code, and finish checkout — we will guide the approval emails from there.",
    closingCtaLabel: "Start transfer",
    closingCtaHref: "#transfer-check",
  };
}

export function mergeDomainTransferPageContent(
  stored?: Partial<CmsDomainTransferPageContent> | null,
): CmsDomainTransferPageContent {
  const defaults = defaultDomainTransferPageContent();
  if (!stored) return defaults;

  return {
    ...defaults,
    heroEyebrow: text(stored.heroEyebrow, defaults.heroEyebrow),
    heroTitle: text(stored.heroTitle, defaults.heroTitle),
    heroTitleAccent: text(stored.heroTitleAccent, defaults.heroTitleAccent),
    heroDescription: text(stored.heroDescription, defaults.heroDescription),
    heroBullets:
      stored.heroBullets?.length && stored.heroBullets.some((b) => b.trim())
        ? stored.heroBullets
        : defaults.heroBullets,
    heroSearchPlaceholder: text(
      stored.heroSearchPlaceholder,
      defaults.heroSearchPlaceholder,
    ),
    heroAuthPlaceholder: text(
      stored.heroAuthPlaceholder,
      defaults.heroAuthPlaceholder,
    ),
    heroImage: text(stored.heroImage, defaults.heroImage),
    heroGuarantee: text(stored.heroGuarantee, defaults.heroGuarantee),
    stepsHeading: text(stored.stepsHeading, defaults.stepsHeading),
    stepsDescription: text(stored.stepsDescription, defaults.stepsDescription),
    whyHeading: text(stored.whyHeading, defaults.whyHeading),
    whyDescription: text(stored.whyDescription, defaults.whyDescription),
    pricingEyebrow: text(stored.pricingEyebrow, defaults.pricingEyebrow),
    pricingTitle: text(stored.pricingTitle, defaults.pricingTitle),
    pricingDescription: text(
      stored.pricingDescription,
      defaults.pricingDescription,
    ),
    pricingFootnote: text(stored.pricingFootnote, defaults.pricingFootnote),
    bundleHeading: text(stored.bundleHeading, defaults.bundleHeading),
    bundleDescription: text(
      stored.bundleDescription,
      defaults.bundleDescription,
    ),
    bundleBullets:
      stored.bundleBullets?.length && stored.bundleBullets.some((b) => b.trim())
        ? stored.bundleBullets
        : defaults.bundleBullets,
    bundleImage: text(stored.bundleImage, defaults.bundleImage),
    bundleCtaLabel: text(stored.bundleCtaLabel, defaults.bundleCtaLabel),
    bundleCtaHref: text(stored.bundleCtaHref, defaults.bundleCtaHref),
    supportHeading: text(stored.supportHeading, defaults.supportHeading),
    supportDescription: text(
      stored.supportDescription,
      defaults.supportDescription,
    ),
    supportCtaLabel: text(stored.supportCtaLabel, defaults.supportCtaLabel),
    supportCtaHref: text(stored.supportCtaHref, defaults.supportCtaHref),
    faqHeading: text(stored.faqHeading, defaults.faqHeading),
    faqDescription: text(stored.faqDescription, defaults.faqDescription),
    closingHeading: text(stored.closingHeading, defaults.closingHeading),
    closingDescription: text(
      stored.closingDescription,
      defaults.closingDescription,
    ),
    closingCtaLabel: text(stored.closingCtaLabel, defaults.closingCtaLabel),
    closingCtaHref: text(stored.closingCtaHref, defaults.closingCtaHref),
    perks: mergeStoredList(defaults.perks, stored.perks, (item, base) => ({
      ...base,
      label: text(item.label, base.label),
      value: text(item.value, base.value),
    })),
    steps: mergeStoredList(defaults.steps, stored.steps, (item, base) => ({
      ...base,
      title: text(item.title, base.title),
      description: text(item.description, base.description),
    })),
    features: mergeStoredList(
      defaults.features,
      stored.features,
      (item, base) => ({
        ...base,
        title: text(item.title, base.title),
        description: text(item.description, base.description),
        icon: (item.icon ?? base.icon) as CmsTransferFeature["icon"],
      }),
    ),
    faqs: mergeStoredList(defaults.faqs, stored.faqs, (item, base) => ({
      ...base,
      question: text(item.question, base.question),
      answer: text(item.answer, base.answer),
    })),
  };
}
