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
};

/** Marketing routes with metadata managed in Orbit (plus domain copy in Domains). */
export const PUBLIC_PAGE_SEO_REGISTRY: PublicPageSeoEntry[] = [
  {
    slug: "home",
    label: "Home",
    path: "/",
    editorHref: "/orbit/content",
  },
  {
    slug: "domain-search",
    label: "Domain name search",
    path: "/domain-name-search",
    editorHref: "/orbit/domains",
    note: "Hero and body copy live in Domains. SEO fields below sync on save.",
  },
  {
    slug: "pricing",
    label: "Pricing",
    path: "/pricing",
    editorHref: "/orbit/pricing",
  },
  {
    slug: "beyond-ai",
    label: "Beyond AI",
    path: "/beyond-ai",
    editorHref: "/orbit/beyond-ai",
  },
  {
    slug: "business-email",
    label: "Business email",
    path: "/business-email",
    editorHref: "/orbit/business-email",
  },
  {
    slug: "get-started",
    label: "Get started",
    path: "/get-started",
    editorHref: "/orbit/content",
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
