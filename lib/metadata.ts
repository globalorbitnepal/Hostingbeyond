import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

type BuildMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  keywords?: string[];
  /** Full Open Graph title (defaults to browser title). */
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  noIndex?: boolean;
};

/**
 * Builds page-level Metadata with Open Graph, Twitter Cards, and canonical URL.
 * Pass `image` once brand/OG assets are available under /public.
 */
export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image,
  keywords = [],
  ogTitle,
  ogDescription,
  twitterTitle,
  twitterDescription,
  noIndex = false,
}: BuildMetadataInput = {}): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const brand = siteConfig.name;
  const brandSuffix = new RegExp(`\\s*[|–—-]\\s*${brand}\\s*$`, "i");
  const brandPrefix = new RegExp(`^${brand}\\s*[|–—-]\\s+`, "i");
  /**
   * Brand stays at the start of the tab title so Chrome shows the name
   * before it truncates. A title that already starts or ends with the brand
   * is left as written.
   */
  const rawTitle = title?.trim() ?? "";
  const fullTitle = rawTitle
    ? brandSuffix.test(rawTitle) || brandPrefix.test(rawTitle)
      ? rawTitle
      : `${rawTitle} | ${brand}`
    : `${brand} – Web Hosting, Domains, Email & More`;
  const socialTitle = ogTitle || fullTitle;
  const socialDescription = ogDescription || description;
  const xTitle = twitterTitle || socialTitle;
  const xDescription = twitterDescription || socialDescription;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    ...(keywords.length > 0 ? { keywords } : {}),
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url,
      title: socialTitle,
      description: socialDescription,
      siteName: siteConfig.name,
      ...(image
        ? {
            images: [
              {
                url: image,
                width: 1200,
                height: 630,
                alt: siteConfig.name,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: xTitle,
      description: xDescription,
      creator: siteConfig.twitterHandle,
      ...(image ? { images: [image] } : {}),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };

  return metadata;
}
