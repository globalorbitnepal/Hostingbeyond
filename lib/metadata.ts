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
  const fullTitle = title
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} — ${siteConfig.tagline}`;
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
