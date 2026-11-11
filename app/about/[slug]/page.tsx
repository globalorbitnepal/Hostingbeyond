import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditorialPublicPage } from "@/components/editorial/editorial-public-page";
import { getEditorialPageContent } from "@/lib/orbit/content";
import {
  EDITORIAL_PAGES,
  isEditorialSlug,
} from "@/lib/orbit/editorial-page-content";
import { buildMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

const ABOUT_SLUGS = EDITORIAL_PAGES.filter((page) =>
  page.path.startsWith("/about/"),
).map((page) => page.slug);

export function generateStaticParams() {
  return ABOUT_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isEditorialSlug(slug) || !ABOUT_SLUGS.includes(slug)) return {};
  const content = await getEditorialPageContent(slug);
  const path = EDITORIAL_PAGES.find((page) => page.slug === slug)?.path;
  return buildMetadata({
    title: content.seoTitle,
    description: content.seoDescription,
    path,
    keywords: content.keywords.split(",").map((part) => part.trim()),
  });
}

export default async function AboutEditorialPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isEditorialSlug(slug) || !ABOUT_SLUGS.includes(slug)) notFound();
  return <EditorialPublicPage slug={slug} />;
}
