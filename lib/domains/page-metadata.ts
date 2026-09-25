import type { Metadata } from "next";

import type { DomainPageCopy } from "@/lib/domains/content";
import { buildMetadata } from "@/lib/metadata";
import { parseKeywords } from "@/lib/orbit/page-seo";

export function buildDomainPageMetadata(
  page: DomainPageCopy,
  path: string,
  defaultImage = "/images/domains/hero.jpg",
): Metadata {
  return buildMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path,
    image: page.ogImage?.trim() || defaultImage,
    keywords: parseKeywords(page.seoKeywords),
    ogTitle: page.ogTitle?.trim() || undefined,
    ogDescription: page.ogDescription?.trim() || undefined,
    twitterTitle: page.ogTitle?.trim() || undefined,
    twitterDescription: page.ogDescription?.trim() || undefined,
  });
}
