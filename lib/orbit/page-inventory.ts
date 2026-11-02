import { HOSTING_PRODUCT_REGISTRY } from "@/lib/hosting/products-registry";
import {
  PUBLIC_PAGE_SEO_REGISTRY,
  type PublicPageSeoEntry,
  type StoredPageSeo,
} from "@/lib/orbit/page-seo";

export type OrbitPageCategory =
  | "all"
  | "core"
  | "domains"
  | "hosting"
  | "cloud-vps"
  | "products"
  | "company"
  | "resources"
  | "legal"
  | "account";

export type OrbitPageInventoryItem = PublicPageSeoEntry & {
  category: Exclude<OrbitPageCategory, "all">;
  cmsSlug: string | null;
  /** Where primary SEO fields are edited in Orbit. */
  seoMode: "registry" | "content-editor";
  contentEditorLabel?: string;
};

const SEO_TO_CMS_FROM_HOSTING = Object.fromEntries(
  HOSTING_PRODUCT_REGISTRY.filter((entry) => entry.legacyCmsSlug).map(
    (entry) => [entry.seoRegistrySlug, entry.legacyCmsSlug as string],
  ),
);

const EXTRA_CMS_SLUG: Record<string, string> = {
  home: "home",
  login: "login",
  pricing: "pricing",
  "domain-search": "domain-search",
  "beyond-ai": "beyond-ai-product",
  "business-email": "business-email-product",
  cloud: "cloud-hosting-product",
  "website-migration": "website-migration-product",
  "domain-transfer": "domain-transfer-product",
  ssl: "ssl-product",
  "docs-hub": "docs-hub",
  "growth-hub": "growth-hub",
  "updates-hub": "updates-hub",
  "case-studies-hub": "case-studies-hub",
  about: "about-page",
  contact: "contact-page",
  "tips-hub": "tips-hub",
  ...SEO_TO_CMS_FROM_HOSTING,
};

const SLUG_CATEGORY: Record<string, Exclude<OrbitPageCategory, "all">> = {
  home: "core",
  "get-started": "core",
  resources: "core",
  "domain-search": "domains",
  "bulk-domain-search": "domains",
  "domain-transfer": "domains",
  hosting: "hosting",
  "wordpress-hosting": "hosting",
  "ecommerce-hosting": "hosting",
  "python-hosting": "hosting",
  "reseller-hosting": "hosting",
  "agency-hosting": "hosting",
  ssl: "hosting",
  cloud: "cloud-vps",
  "kvm-vps": "cloud-vps",
  "nvme-vps": "cloud-vps",
  "linux-vps": "cloud-vps",
  "managed-vps": "cloud-vps",
  /* Developer stacks are hosting products, not VPS products. */
  "nodejs-hosting": "hosting",
  "laravel-hosting": "hosting",
  "django-hosting": "hosting",
  "nestjs-hosting": "hosting",
  pricing: "products",
  "beyond-ai": "products",
  "business-email": "products",
  "website-migration": "products",
  about: "company",
  contact: "company",
  blog: "resources",
  "tips-hub": "resources",
  "docs-hub": "resources",
  "growth-hub": "resources",
  "updates-hub": "resources",
  "case-studies-hub": "resources",
  terms: "legal",
  privacy: "legal",
  refund: "legal",
  login: "account",
  signup: "account",
};

/** Pages managed in Orbit but not yet in the SEO registry. */
const SUPPLEMENTAL_PAGES: PublicPageSeoEntry[] = [
  {
    slug: "about",
    label: "About us",
    path: "/about",
    editorHref: "/orbit/about",
    note: "Hero, story, team and stats live in the About editor.",
    defaultSeo: {
      metaTitle: "About HostingBeyond — Global Web Hosting & Domains",
      metaDescription:
        "Learn about HostingBeyond: premium hosting, domains, business email and Beyond AI — built for speed, transparency and 24/7 support.",
      keywords:
        "About HostingBeyond, web hosting company, domain registrar, business email hosting",
    },
  },
  {
    slug: "contact",
    label: "Contact",
    path: "/contact",
    editorHref: "/orbit/contact",
    note: "Contact hero, offices and FAQ are edited in Contact.",
    defaultSeo: {
      metaTitle: "Contact HostingBeyond — Sales & Support",
      metaDescription:
        "Reach HostingBeyond sales and support by chat, email or ticket. We help with hosting, domains, email and migrations.",
      keywords:
        "contact HostingBeyond, hosting support, domain help, sales hosting",
    },
  },
  {
    slug: "tips-hub",
    label: "Tips hub",
    path: "/resources/tips",
    editorHref: "/orbit/blog/tips-hub",
    defaultSeo: {
      metaTitle: "Hosting Tips & Guides | HostingBeyond Resources",
      metaDescription:
        "Practical hosting, domain, email and website tips from the HostingBeyond team.",
      keywords:
        "hosting tips, website guides, domain tips, email deliverability",
    },
  },
  {
    slug: "resources",
    label: "Resources index",
    path: "/resources",
    editorHref: "/orbit/navigation",
    note: "Hub links — adjust main navigation promos in Navigation if needed.",
    defaultSeo: {
      metaTitle: "Resources — Blog, Tips & Product Guides | HostingBeyond",
      metaDescription:
        "HostingBeyond blog, tips, case studies, documentation and product updates for hosting and domains.",
      keywords:
        "hosting resources, web hosting blog, domain guides, product updates",
    },
  },
  {
    slug: "blog",
    label: "Blog index",
    path: "/resources/blog",
    editorHref: "/orbit/blog",
    note: "Individual articles are managed under Articles.",
    defaultSeo: {
      metaTitle: "HostingBeyond Blog — Hosting, Domains & Growth",
      metaDescription:
        "Expert articles on web hosting, domains, email, security and growing your online business.",
      keywords:
        "hosting blog, domain registration guides, website security, ecommerce hosting",
    },
  },
  {
    slug: "terms",
    label: "Terms of service",
    path: "/legal/terms",
    editorHref: "/orbit/content",
    defaultSeo: {
      metaTitle: "Terms of Service | HostingBeyond",
      metaDescription:
        "HostingBeyond terms of service for hosting, domains and related services.",
      noIndex: false,
    },
  },
  {
    slug: "privacy",
    label: "Privacy policy",
    path: "/legal/privacy",
    editorHref: "/orbit/content",
    defaultSeo: {
      metaTitle: "Privacy Policy | HostingBeyond",
      metaDescription:
        "How HostingBeyond collects, uses and protects your data.",
    },
  },
  {
    slug: "refund",
    label: "Refund policy",
    path: "/legal/refund",
    editorHref: "/orbit/content",
    defaultSeo: {
      metaTitle: "Refund Policy | HostingBeyond",
      metaDescription: "HostingBeyond refund and cancellation policy.",
    },
  },
];

function inferCategory(
  entry: PublicPageSeoEntry,
): Exclude<OrbitPageCategory, "all"> {
  if (SLUG_CATEGORY[entry.slug]) return SLUG_CATEGORY[entry.slug];
  if (entry.path.startsWith("/web-hosting")) return "hosting";
  if (entry.path.includes("domain")) return "domains";
  if (entry.path.startsWith("/resources")) return "resources";
  return "core";
}

function toInventoryItem(entry: PublicPageSeoEntry): OrbitPageInventoryItem {
  const cmsSlug = EXTRA_CMS_SLUG[entry.slug] ?? null;
  const seoMode =
    entry.slug === "about" || entry.slug === "contact"
      ? "content-editor"
      : "registry";
  return {
    ...entry,
    category: inferCategory(entry),
    cmsSlug,
    seoMode,
    contentEditorLabel:
      seoMode === "content-editor" ? "Page sections" : "Page content",
  };
}

/** Full public page list for Orbit → Pages (deduped, stable order). */
export function getOrbitPageInventory(): OrbitPageInventoryItem[] {
  const bySlug = new Map<string, PublicPageSeoEntry>();
  for (const entry of PUBLIC_PAGE_SEO_REGISTRY) {
    bySlug.set(entry.slug, entry);
  }
  for (const entry of SUPPLEMENTAL_PAGES) {
    if (!bySlug.has(entry.slug)) bySlug.set(entry.slug, entry);
  }

  const categoryOrder: Exclude<OrbitPageCategory, "all">[] = [
    "core",
    "domains",
    "hosting",
    "cloud-vps",
    "products",
    "company",
    "resources",
    "legal",
    "account",
  ];

  return [...bySlug.values()].map(toInventoryItem).sort((a, b) => {
    const ca = categoryOrder.indexOf(a.category);
    const cb = categoryOrder.indexOf(b.category);
    if (ca !== cb) return ca - cb;
    return a.label.localeCompare(b.label);
  });
}

export function getOrbitPageBySlug(
  slug: string,
): OrbitPageInventoryItem | undefined {
  return getOrbitPageInventory().find((page) => page.slug === slug);
}

export const ORBIT_PAGE_CATEGORY_LABELS: Record<
  Exclude<OrbitPageCategory, "all">,
  string
> = {
  core: "Core",
  domains: "Domains",
  hosting: "Web hosting",
  "cloud-vps": "Cloud & VPS",
  products: "Products",
  company: "Company",
  resources: "Resources",
  legal: "Legal",
  account: "Account",
};

export function embeddedSeoFromAboutSections(
  sections: unknown,
): StoredPageSeo | null {
  if (!sections || typeof sections !== "object") return null;
  const row = sections as { seoTitle?: string; seoDescription?: string };
  if (!row.seoTitle && !row.seoDescription) return null;
  return {
    metaTitle: row.seoTitle,
    metaDescription: row.seoDescription,
  };
}

export function embeddedSeoFromContactSections(
  sections: unknown,
): StoredPageSeo | null {
  if (!sections || typeof sections !== "object") return null;
  const row = sections as { seoTitle?: string; seoDescription?: string };
  if (!row.seoTitle && !row.seoDescription) return null;
  return {
    metaTitle: row.seoTitle,
    metaDescription: row.seoDescription,
  };
}
