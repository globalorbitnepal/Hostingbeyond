import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/metadata";

import { BLOG_BASE, blogPostPath } from "./paths";

type PostSeoInput = {
  title: string;
  slug: string;
  excerpt: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImageUrl?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
  featuredImageUrl?: string | null;
  schemaType?: string | null;
};

export function resolvePostSeo(post: PostSeoInput) {
  const path = blogPostPath(post.slug);
  const title = post.seoTitle?.trim() || post.title;
  const description =
    post.seoDescription?.trim() ||
    post.excerpt.trim() ||
    siteConfig.description;
  const ogTitle = post.ogTitle?.trim() || title;
  const ogDescription = post.ogDescription?.trim() || description;
  const image =
    post.ogImageUrl?.trim() ||
    post.twitterImageUrl?.trim() ||
    post.featuredImageUrl?.trim() ||
    undefined;
  const canonical = post.canonicalUrl?.trim() || path;

  return {
    path,
    canonical,
    title,
    description,
    ogTitle,
    ogDescription,
    image,
    twitterTitle: post.twitterTitle?.trim() || ogTitle,
    twitterDescription: post.twitterDescription?.trim() || ogDescription,
    noIndex: Boolean(post.noIndex),
  };
}

export function postMetadata(post: PostSeoInput): Metadata {
  const seo = resolvePostSeo(post);
  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: seo.canonical.startsWith("http") ? seo.canonical : seo.path,
    image: seo.image,
    ogTitle: seo.ogTitle,
    ogDescription: seo.ogDescription,
    twitterTitle: seo.twitterTitle,
    twitterDescription: seo.twitterDescription,
    noIndex: seo.noIndex,
  });
}

export function blogHomeMetadata(): Metadata {
  return buildMetadata({
    title: "HostingBeyond Blog",
    description:
      "Practical hosting guides, domain tips, WordPress tutorials, security advice, and website performance insights from HostingBeyond.",
    path: BLOG_BASE,
  });
}

export function categoryMetadata(input: {
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  noIndex?: boolean;
}) {
  const path = `${BLOG_BASE}/category/${input.slug}`;
  const title = input.seoTitle?.trim() || `${input.name} Guides`;
  const description =
    input.seoDescription?.trim() ||
    input.description?.trim() ||
    `Articles about ${input.name} from the HostingBeyond blog.`;
  return buildMetadata({
    title,
    description,
    path,
    noIndex: Boolean(input.noIndex),
  });
}

export function tagMetadata(input: {
  name: string;
  slug: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  noIndex?: boolean;
}) {
  const path = `${BLOG_BASE}/tag/${input.slug}`;
  const title = input.seoTitle?.trim() || `Tag: ${input.name}`;
  const description =
    input.seoDescription?.trim() ||
    `HostingBeyond blog posts tagged ${input.name}.`;
  return buildMetadata({
    title,
    description,
    path,
    noIndex: Boolean(input.noIndex),
  });
}

export function articleJsonLd(
  post: PostSeoInput & {
    publishedAt?: Date | string | null;
    updatedAt?: Date | string | null;
    authorName?: string | null;
  },
) {
  const seo = resolvePostSeo(post);
  const url = new URL(
    seo.canonical.startsWith("http") ? seo.canonical : seo.path,
    siteConfig.url,
  ).toString();
  const image = seo.image
    ? new URL(seo.image, siteConfig.url).toString()
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": post.schemaType === "Article" ? "Article" : "BlogPosting",
    headline: post.title,
    description: seo.description,
    image,
    datePublished: post.publishedAt
      ? new Date(post.publishedAt).toISOString()
      : undefined,
    dateModified: post.updatedAt
      ? new Date(post.updatedAt).toISOString()
      : undefined,
    author: post.authorName
      ? { "@type": "Person", name: post.authorName }
      : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, siteConfig.url).toString(),
    })),
  };
}
