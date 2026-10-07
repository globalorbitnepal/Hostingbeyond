import { routes } from "@/config/routes";
import { BLOG_BASE, TIPS_BASE } from "@/lib/blog/paths";
import { UPDATES_BASE } from "@/lib/updates/paths";

export const CONTACT_TOPICS = [
  "General inquiry",
  "Sales & pricing",
  "Technical support",
  "Billing & invoices",
  "Domain services",
  "Migration help",
  "Partnerships",
  "Report abuse",
  "Press & media",
] as const;

export type CmsContactChannel = {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  href: string;
  visible?: boolean;
};

export type CmsContactOffice = {
  id: string;
  city: string;
  country: string;
  addressLine1: string;
  addressLine2?: string;
  visible?: boolean;
};

export type CmsContactHelpLink = {
  id: string;
  title: string;
  description: string;
  href: string;
  visible?: boolean;
};

export type CmsContactFaq = {
  id: string;
  question: string;
  answer: string;
  visible?: boolean;
};

export type CmsContactPageContent = {
  seoTitle: string;
  seoDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroDescription: string;
  introTitle: string;
  introBody: string;
  introBodySecondary: string;
  formTitle: string;
  formDescription: string;
  formSuccessTitle: string;
  formSuccessMessage: string;
  channelsTitle: string;
  channelsIntro: string;
  channels: CmsContactChannel[];
  helpTitle: string;
  helpIntro: string;
  helpLinks: CmsContactHelpLink[];
  mediaTitle: string;
  mediaDescription: string;
  mediaEmail: string;
  officesTitle: string;
  officesIntro: string;
  offices: CmsContactOffice[];
  responseTitle: string;
  responseBody: string;
  faqs: CmsContactFaq[];
  ctaEyebrow: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
};

function nid() {
  return Math.random().toString(36).slice(2, 10);
}

export function defaultContactPageContent(): CmsContactPageContent {
  return {
    seoTitle: "Contact HostingBeyond | Sales, Support & Billing",
    seoDescription:
      "Contact HostingBeyond for sales, technical support, billing, domains, migrations and partnerships. United States–based hosting and domain provider with responsive customer care.",
    heroEyebrow: "CONTACT HOSTINGBEYOND",
    heroTitle: "How can we",
    heroTitleAccent: "help you today?",
    heroDescription:
      "Reach our team for sales questions, technical support, billing, domains, migrations or partnerships. We aim to respond with clear, actionable answers.",
    introTitle: "We are here when you need us",
    introBody:
      "Whether you are choosing your first hosting plan, moving a production site, or troubleshooting DNS and email, HostingBeyond support is built around practical help — not endless redirects. Use the form for a tracked request, or choose a direct channel below for the fastest path.",
    introBodySecondary:
      "Existing customers: include your account email and domain or invoice ID so we can find your account quickly. For urgent outages, describe what changed and when the issue started.",
    formTitle: "Send us a message",
    formDescription:
      "We typically respond within one business day. Fields marked with * are required.",
    formSuccessTitle: "Message received",
    formSuccessMessage:
      "Thank you — your message was submitted successfully. Our team will reply to the email address you provided.",
    channelsTitle: "Other ways to reach us",
    channelsIntro:
      "Pick the channel that matches your question for the quickest resolution.",
    channels: [
      {
        id: "ch1",
        title: "Customer support",
        description: "Help with hosting, DNS, SSL, email and account access.",
        actionLabel: "Use the contact form",
        href: "#contact-form",
      },
      {
        id: "ch2",
        title: "Sales & plans",
        description:
          "Questions about pricing, upgrades, or which product fits your project.",
        actionLabel: "View pricing",
        href: routes.pricing,
      },
      {
        id: "ch3",
        title: "Website migration",
        description: "Request a guided migration from another host.",
        actionLabel: "Migration request",
        href: routes.websiteMigration,
      },
      {
        id: "ch4",
        title: "Report abuse",
        description: "Report spam, phishing, malware or policy violations.",
        actionLabel: "Contact abuse team",
        href: "#contact-form",
      },
    ],
    helpTitle: "Self-service resources",
    helpIntro:
      "Many answers are available instantly — explore these before you wait on a reply.",
    helpLinks: [
      {
        id: "h1",
        title: "Tips & guides",
        description: "How-tos for hosting, WordPress, DNS and security.",
        href: TIPS_BASE,
      },
      {
        id: "h2",
        title: "Product updates",
        description: "Release notes and platform changes.",
        href: UPDATES_BASE,
      },
      {
        id: "h3",
        title: "Blog",
        description: "News and deeper articles from HostingBeyond.",
        href: BLOG_BASE,
      },
      {
        id: "h4",
        title: "Legal & policies",
        description: "Terms, privacy, refunds and acceptable use.",
        href: "/legal/terms",
      },
    ],
    mediaTitle: "Press & media",
    mediaDescription:
      "Journalists and partners — reach our team for press inquiries and official statements.",
    mediaEmail: "press@hostingbeyond.com",
    officesTitle: "Our location",
    officesIntro:
      "HostingBeyond is a United States–based company serving customers worldwide.",
    offices: [
      {
        id: "o1",
        city: "United States",
        country: "USA",
        addressLine1: "Edit your office address in Orbit → Contact page",
        addressLine2: "",
      },
    ],
    responseTitle: "What happens after you contact us",
    responseBody:
      "Your request is routed to the right team. Support issues are prioritized by impact — site down and email delivery problems come first. Sales and partnership inquiries receive a tailored response with next steps. We do not share your details with third parties for marketing.",
    faqs: [
      {
        id: "f1",
        question: "What should I include in a support message?",
        answer:
          "Your account email, domain name, what you expected versus what happened, and any error messages or screenshots. For DNS issues, include the record you changed and when.",
      },
      {
        id: "f2",
        question: "Do you offer phone support?",
        answer:
          "Edit this answer in Orbit with your published phone hours and number if applicable.",
      },
      {
        id: "f3",
        question: "Where can I manage billing?",
        answer:
          "Sign in to your HostingBeyond account to view invoices, payment methods and renewals.",
      },
    ],
    ctaEyebrow: "Prefer to explore first?",
    ctaTitle: "Find hosting or register a domain",
    ctaDescription: "Compare plans, search domains and launch with confidence.",
    ctaPrimaryLabel: "View hosting",
    ctaPrimaryHref: routes.hosting,
    ctaSecondaryLabel: "Search domains",
    ctaSecondaryHref: routes.domains,
  };
}

export function mergeContactPageContent(
  stored?: Partial<CmsContactPageContent> | null,
): CmsContactPageContent {
  const d = defaultContactPageContent();
  if (!stored) return d;
  return {
    ...d,
    ...stored,
    channels: stored.channels?.length ? stored.channels : d.channels,
    helpLinks: stored.helpLinks?.length ? stored.helpLinks : d.helpLinks,
    offices: stored.offices?.length ? stored.offices : d.offices,
    faqs: stored.faqs?.length ? stored.faqs : d.faqs,
  };
}

export function newContactOffice(): CmsContactOffice {
  return {
    id: nid(),
    city: "",
    country: "",
    addressLine1: "",
  };
}

export function newContactChannel(): CmsContactChannel {
  return {
    id: nid(),
    title: "",
    description: "",
    actionLabel: "Learn more",
    href: "#",
  };
}

export function newContactFaq(): CmsContactFaq {
  return { id: nid(), question: "", answer: "" };
}
