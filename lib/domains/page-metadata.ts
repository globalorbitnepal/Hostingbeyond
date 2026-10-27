import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import type { DomainPageCopy } from "@/lib/domains/content";
import { buildMetadata } from "@/lib/metadata";
import { parseKeywords } from "@/lib/orbit/page-seo";

const BRAND_SUFFIX = new RegExp(
  `\\s*[|\\u2013\\u2014\\-]\\s*${siteConfig.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`,
  "i",
);

export function stripBrandTitleSuffix(title: string): string {
  return title.replace(BRAND_SUFFIX, "").trim();
}

export function buildDomainPageMetadata(
  page: DomainPageCopy,
  path: string,
  defaultImage = "/images/domains/hero.jpg",
): Metadata {
  const title = stripBrandTitleSuffix(page.seoTitle);
  const ogTitle = page.ogTitle?.trim()
    ? stripBrandTitleSuffix(page.ogTitle)
    : undefined;
  return buildMetadata({
    title,
    description: page.seoDescription,
    path,
    image: page.ogImage?.trim() || defaultImage,
    keywords: parseKeywords(page.seoKeywords),
    ogTitle,
    ogDescription: page.ogDescription?.trim() || undefined,
    twitterTitle: ogTitle,
    twitterDescription: page.ogDescription?.trim() || undefined,
  });
}
