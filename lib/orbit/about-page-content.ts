import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

export type CmsAboutStat = {
  id: string;
  label: string;
  value: string;
};

export type CmsAboutValue = {
  id: string;
  title: string;
  description: string;
  visible?: boolean;
};

export type CmsAboutProduct = {
  id: string;
  title: string;
  description: string;
  href: string;
  visible?: boolean;
};

export type CmsAboutMilestone = {
  id: string;
  year: string;
  title: string;
  description: string;
  visible?: boolean;
};

export type CmsAboutTeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl?: string;
  visible?: boolean;
};

export type CmsAboutTrustItem = {
  id: string;
  title: string;
  description: string;
  visible?: boolean;
};

export type CmsAboutFaq = {
  id: string;
  question: string;
  answer: string;
  visible?: boolean;
};

export type CmsAboutPageContent = {
  seoTitle: string;
  seoDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroDescription: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  companyLegalName: string;
  headquartersLine: string;
  servingLine: string;
  missionTitle: string;
  missionBody: string;
  visionTitle: string;
  visionBody: string;
  usaTitle: string;
  usaBody: string;
  usaBodySecondary: string;
  storyTitle: string;
  storyBody: string;
  storyBodySecondary: string;
  stats: CmsAboutStat[];
  values: CmsAboutValue[];
  products: CmsAboutProduct[];
  milestones: CmsAboutMilestone[];
  teamSectionTitle: string;
  teamSectionIntro: string;
  team: CmsAboutTeamMember[];
  trustTitle: string;
  trustIntro: string;
  trustItems: CmsAboutTrustItem[];
  commitmentTitle: string;
  commitmentBody: string;
  faqs: CmsAboutFaq[];
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

export function defaultAboutPageContent(): CmsAboutPageContent {
  return {
    seoTitle: "About HostingBeyond | USA-Based Hosting & Domain Company",
    seoDescription:
      "Learn about HostingBeyond — a United States–based company delivering premium web hosting, domains, business email and cloud tools for builders, agencies and growing businesses worldwide.",
    heroEyebrow: "ABOUT HOSTINGBEYOND",
    heroTitle: "Beyond hosting.",
    heroTitleAccent: "Beyond possibilities.",
    heroDescription:
      "We are a USA-based technology company focused on reliable infrastructure, honest pricing and human support — so you can launch, grow and protect your online presence with confidence.",
    heroPrimaryLabel: "Explore hosting",
    heroPrimaryHref: routes.hosting,
    heroSecondaryLabel: "Contact us",
    heroSecondaryHref: routes.contact,
    companyLegalName: "HostingBeyond",
    headquartersLine: "United States–based company",
    servingLine: "Serving customers and partners globally",
    missionTitle: "Our mission",
    missionBody:
      "Make professional-grade hosting, domains and business tools accessible to everyone — from first-time site owners to agencies managing dozens of client projects. We build products that are fast to set up, straightforward to manage and dependable under real-world traffic.",
    visionTitle: "Our vision",
    visionBody:
      "A web where every business, creator and organization can compete online with infrastructure they trust — without enterprise complexity or surprise bills. HostingBeyond exists to be the long-term partner behind that growth.",
    usaTitle: "Built in the United States, trusted worldwide",
    usaBody:
      "HostingBeyond operates as a United States–based company with a global customer base. Our team designs and operates the HostingBeyond platform with U.S. business standards for transparency, security-conscious engineering and responsive customer care.",
    usaBodySecondary:
      "Whether you are in North America, Europe, Asia or beyond, you get the same commitment: clear product communication, stable billing and support that treats your uptime as seriously as you do.",
    storyTitle: "Our story",
    storyBody: `${siteConfig.name} was created to unify what growing online businesses need most — domains, hosting, email and migration-friendly tooling — under one modern brand. We saw too many teams juggling disconnected providers, opaque renewals and support that vanished after checkout.`,
    storyBodySecondary:
      "Today we continue to invest in performance, automation and the Orbit content platform so our public site and customer experience stay fast, accurate and easy to evolve. We measure success by your ability to ship projects, not by vanity metrics.",
    stats: [
      { id: "s1", label: "Headquarters", value: "USA" },
      { id: "s2", label: "Focus", value: "Hosting & domains" },
      { id: "s3", label: "Support", value: "24/7 mindset" },
      { id: "s4", label: "Platform", value: "Always improving" },
    ],
    values: [
      {
        id: "v1",
        title: "Reliability first",
        description:
          "Uptime, backups and security are not upsells — they are the foundation of every plan we offer.",
      },
      {
        id: "v2",
        title: "Clarity over hype",
        description:
          "Straightforward pricing, readable docs and honest release notes — no dark patterns.",
      },
      {
        id: "v3",
        title: "Partnership",
        description:
          "We succeed when your sites stay fast, your domains stay yours and your team stays focused on growth.",
      },
      {
        id: "v4",
        title: "Continuous improvement",
        description:
          "Regular platform updates, performance work and customer feedback shape our roadmap.",
      },
    ],
    products: [
      {
        id: "p1",
        title: "Web hosting",
        description:
          "NVMe-powered hosting for WordPress, stores and custom apps.",
        href: routes.hosting,
      },
      {
        id: "p2",
        title: "Domains",
        description:
          "Search, register, transfer and manage domains in one place.",
        href: routes.domains,
      },
      {
        id: "p3",
        title: "Business email",
        description: "Professional email aligned with your domain and brand.",
        href: routes.businessEmail,
      },
      {
        id: "p4",
        title: "Cloud & VPS",
        description: "Scale when shared hosting is no longer enough.",
        href: routes.cloud,
      },
      {
        id: "p5",
        title: "Website migration",
        description: "Move to HostingBeyond with guided migration support.",
        href: routes.websiteMigration,
      },
      {
        id: "p6",
        title: "Beyond AI",
        description: "AI-powered tools for modern teams.",
        href: routes.beyondAi,
      },
    ],
    milestones: [],
    teamSectionTitle: "Leadership & team",
    teamSectionIntro:
      "Add team profiles in Orbit when you are ready to introduce people publicly. We never display placeholder names on the live site.",
    team: [],
    trustTitle: "Why customers choose HostingBeyond",
    trustIntro:
      "Enterprise habits at approachable scale — engineered for real businesses, not demos.",
    trustItems: [
      {
        id: "t1",
        title: "Security-conscious platform",
        description:
          "SSL, access controls and ongoing hardening across hosting, billing and account areas.",
      },
      {
        id: "t2",
        title: "Performance engineering",
        description:
          "Modern stacks, caching-friendly hosting and monitoring-minded operations.",
      },
      {
        id: "t3",
        title: "Human support",
        description:
          "When something breaks, you need answers — not a ticket black hole.",
      },
      {
        id: "t4",
        title: "Transparent billing",
        description:
          "Renewals and upgrades designed to be understandable before you pay.",
      },
    ],
    commitmentTitle: "Our commitment to you",
    commitmentBody:
      "We treat every account as a long-term relationship. That means documenting changes, improving self-service resources and investing in the products you rely on every day — hosting, domains, email and beyond.",
    faqs: [
      {
        id: "f1",
        question: "Where is HostingBeyond based?",
        answer:
          "HostingBeyond is a United States–based company. Edit this answer in Orbit with your preferred legal entity and address details.",
      },
      {
        id: "f2",
        question: "Who is HostingBeyond for?",
        answer:
          "Freelancers, agencies, small businesses and technical teams who want dependable infrastructure without unnecessary complexity.",
      },
      {
        id: "f3",
        question: "How do I get support?",
        answer:
          "Use the contact page or your customer account area. We prioritize clear, actionable responses.",
      },
    ],
    ctaEyebrow: "Ready to work with us?",
    ctaTitle: "Start with hosting or find your domain",
    ctaDescription:
      "Join builders and businesses who trust HostingBeyond for the foundation of their online presence.",
    ctaPrimaryLabel: "View hosting plans",
    ctaPrimaryHref: routes.hosting,
    ctaSecondaryLabel: "Search domains",
    ctaSecondaryHref: routes.domains,
  };
}

export function mergeAboutPageContent(
  stored?: Partial<CmsAboutPageContent> | null,
): CmsAboutPageContent {
  const d = defaultAboutPageContent();
  if (!stored) return d;
  return {
    ...d,
    ...stored,
    stats: stored.stats?.length ? stored.stats : d.stats,
    values: stored.values?.length ? stored.values : d.values,
    products: stored.products?.length ? stored.products : d.products,
    milestones: stored.milestones ?? d.milestones,
    team: stored.team ?? d.team,
    trustItems: stored.trustItems?.length ? stored.trustItems : d.trustItems,
    faqs: stored.faqs?.length ? stored.faqs : d.faqs,
  };
}

export function newAboutValue(): CmsAboutValue {
  return { id: nid(), title: "", description: "" };
}

export function newAboutMilestone(): CmsAboutMilestone {
  return { id: nid(), year: "", title: "", description: "" };
}

export function newAboutTeamMember(): CmsAboutTeamMember {
  return { id: nid(), name: "", role: "", bio: "" };
}

export function newAboutFaq(): CmsAboutFaq {
  return { id: nid(), question: "", answer: "" };
}
