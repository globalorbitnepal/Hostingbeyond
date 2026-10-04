import type { Metadata } from "next";

import { buildMetadata } from "@/lib/metadata";

/** Stored in `PageContent.seo` (JSON) and editable from Orbit → SEO. */
export type StoredPageSeo = {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  noIndex?: boolean;
};

export type PublicPageSeoEntry = {
  slug: string;
  label: string;
  path: string;
  editorHref: string;
  note?: string;
  /** Suggested SEO when nothing is saved in Orbit yet. */
  defaultSeo?: StoredPageSeo;
};

export function getPublicPageSeoEntry(
  slug: string,
): PublicPageSeoEntry | undefined {
  return PUBLIC_PAGE_SEO_REGISTRY.find((entry) => entry.slug === slug);
}

/** Marketing routes with metadata managed in Orbit → Page SEO. */
export const PUBLIC_PAGE_SEO_REGISTRY: PublicPageSeoEntry[] = [
  {
    slug: "home",
    label: "Home",
    path: "/",
    editorHref: "/orbit/content",
    defaultSeo: {
      keywords:
        "web hosting, domain registration, business email, website builder, NVMe hosting, HostingBeyond",
      ogTitle: "Web Hosting, Domains, Email & AI Sites | HostingBeyond",
      ogDescription:
        "Premium hosting, domains, business email and Beyond AI websites — one panel, transparent pricing, 24/7 support.",
    },
  },
  {
    slug: "domain-search",
    label: "Domain name search",
    path: "/domain-name-search",
    editorHref: "/orbit/domains",
    note: "Hero copy lives in Domains. These SEO fields override meta when saved here.",
    defaultSeo: {
      keywords:
        "domain name search, buy domain, register domain, cheap domains, WHOIS privacy, domain lookup, .com domain",
      ogTitle: "Domain Name Search — Check Availability & Register",
      ogDescription:
        "Search 300+ extensions, compare renewal pricing upfront, and register with free WHOIS privacy on eligible TLDs.",
    },
  },
  {
    slug: "bulk-domain-search",
    label: "Bulk domain search",
    path: "/bulk-domain-search",
    editorHref: "/orbit/domains",
    defaultSeo: {
      keywords:
        "bulk domain search, register multiple domains, domain portfolio, wholesale domains",
      noIndex: false,
    },
  },
  {
    slug: "pricing",
    label: "Pricing",
    path: "/pricing",
    editorHref: "/orbit/pricing",
    defaultSeo: {
      keywords:
        "hosting pricing, web hosting plans, ecommerce hosting price, VPS pricing, domain prices",
      ogTitle: "Hosting & Domain Pricing — Transparent Plans",
      ogDescription:
        "Compare website, ecommerce, cloud, VPS, domains, and business email pricing with renewal rates shown upfront.",
    },
  },
  {
    slug: "hosting",
    label: "Web hosting",
    path: "/web-hosting",
    editorHref: "/orbit/hosting",
    defaultSeo: {
      keywords:
        "web hosting, shared hosting, NVMe hosting, WordPress hosting, free SSL, managed hosting",
      ogTitle: "Web Hosting — Fast NVMe WordPress Hosting",
      ogDescription:
        "Compare web hosting with free SSL, NVMe storage, managed WordPress, and 24/7 expert support.",
    },
  },
  {
    slug: "wordpress-hosting",
    label: "WordPress hosting",
    path: "/web-hosting/wordpress",
    editorHref: "/orbit/hosting",
    defaultSeo: {
      keywords:
        "WordPress hosting, managed WordPress, WooCommerce hosting, one-click WordPress, WordPress SSL",
      ogTitle: "WordPress Hosting — Managed & WooCommerce Ready",
      ogDescription:
        "Managed WordPress on NVMe with one-click install, free SSL, updates, and 24/7 support.",
    },
  },
  {
    slug: "ecommerce-hosting",
    label: "Ecommerce hosting",
    path: "/web-hosting/ecommerce",
    editorHref: "/orbit/hosting",
    defaultSeo: {
      keywords:
        "ecommerce hosting, WooCommerce hosting, online store hosting, secure checkout SSL, NVMe ecommerce",
      ogTitle: "Ecommerce Hosting — WooCommerce NVMe Stores",
      ogDescription:
        "WooCommerce ecommerce hosting with NVMe, free SSL checkout, scalable store plans, and 24/7 commerce support.",
      ogImage: "/images/hosting/ecommerce.jpg",
    },
  },
  {
    slug: "python-hosting",
    label: "Python hosting",
    path: "/web-hosting/python",
    editorHref: "/orbit/hosting",
    defaultSeo: {
      keywords:
        "Python hosting, Django hosting, Flask hosting, FastAPI hosting, Python web app hosting, CPython Linux",
      ogTitle: "Python Hosting — Django, Flask & FastAPI on NVMe",
      ogDescription:
        "Managed Python hosting for Flask, Django, and FastAPI with free SSL and SSH on Pro+ plans.",
    },
  },
  {
    slug: "cloud",
    label: "Cloud hosting",
    path: "/cloud-hosting",
    editorHref: "/orbit/cloud",
    defaultSeo: {
      keywords:
        "cloud hosting, dedicated RAM hosting, vCPU hosting, scalable cloud, NVMe cloud hosting",
      ogTitle: "Cloud Hosting — Dedicated CPU & NVMe",
      ogDescription:
        "Managed cloud hosting with dedicated RAM, vCPU, and NVMe — scale without noisy neighbours.",
    },
  },
  {
    slug: "website-migration",
    label: "Website migration",
    path: "/website-migration",
    editorHref: "/orbit/website-migration",
    defaultSeo: {
      keywords:
        "website migration, free site migration, move hosting, WordPress migration, cPanel migration",
    },
  },
  {
    slug: "domain-transfer",
    label: "Domain transfer",
    path: "/domain-transfer",
    editorHref: "/orbit/domain-transfer",
    note: "Domain transfer hero SEO also syncs from Domains when saved there.",
    defaultSeo: {
      keywords:
        "domain transfer, transfer domain, EPP code, auth code, move domain registrar",
    },
  },
  {
    slug: "beyond-ai",
    label: "Beyond AI",
    path: "/beyond-ai",
    editorHref: "/orbit/beyond-ai",
    defaultSeo: {
      keywords:
        "AI website builder, Beyond AI, AI landing pages, AI copywriting hosting, AI web design",
    },
  },
  {
    slug: "business-email",
    label: "Business email",
    path: "/business-email",
    editorHref: "/orbit/business-email",
    defaultSeo: {
      keywords:
        "business email hosting, professional email, branded email, SPF DKIM email, domain email",
    },
  },
  {
    slug: "get-started",
    label: "Get started",
    path: "/get-started",
    editorHref: "/orbit/content",
    defaultSeo: {
      keywords:
        "sign up hosting, create hosting account, get started HostingBeyond",
      noIndex: true,
    },
  },
  {
    slug: "login",
    label: "Login",
    path: "/login",
    editorHref: "/orbit/content",
    defaultSeo: {
      noIndex: true,
    },
  },
  {
    slug: "signup",
    label: "Sign up",
    path: "/signup",
    editorHref: "/orbit/content",
    defaultSeo: {
      noIndex: true,
    },
  },
];

export function parseKeywords(value: string | undefined | null): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[,;|\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function mergeStoredPageSeo(
  stored: unknown,
  fallback: StoredPageSeo = {},
): StoredPageSeo {
  const partial = (stored ?? {}) as StoredPageSeo;
  const pick = (key: keyof StoredPageSeo) => {
    const value = partial[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    const fb = fallback[key];
    return typeof fb === "string" ? fb : fb === true ? true : undefined;
  };
  return {
    metaTitle: pick("metaTitle") as string | undefined,
    metaDescription: pick("metaDescription") as string | undefined,
    keywords: pick("keywords") as string | undefined,
    ogTitle: pick("ogTitle") as string | undefined,
    ogDescription: pick("ogDescription") as string | undefined,
    ogImage: pick("ogImage") as string | undefined,
    twitterTitle: pick("twitterTitle") as string | undefined,
    twitterDescription: pick("twitterDescription") as string | undefined,
    noIndex: partial.noIndex === true || fallback.noIndex === true,
  };
}

export function metadataFromStoredSeo(
  path: string,
  seo: StoredPageSeo,
  defaults?: { title?: string; description?: string; image?: string },
): Metadata {
  const title = seo.metaTitle || defaults?.title;
  const description = seo.metaDescription || defaults?.description;
  const ogTitle = seo.ogTitle || title;
  const ogDescription = seo.ogDescription || description;
  const twitterTitle = seo.twitterTitle || ogTitle;
  const twitterDescription = seo.twitterDescription || ogDescription;

  return buildMetadata({
    title,
    description,
    path,
    image: seo.ogImage || defaults?.image,
    keywords: parseKeywords(seo.keywords),
    ogTitle,
    ogDescription,
    twitterTitle,
    twitterDescription,
    noIndex: seo.noIndex,
  });
}
