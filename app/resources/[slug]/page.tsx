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

const PARAM: Record<string, string> = {
  help: "help",
  status: "status",
  "knowledge-base": "knowledge-base",
  guides: "guides",
  security: "security",
  wordpress: "wordpress-tutorials",
};

export function generateStaticParams() {
  return Object.keys(PARAM).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const editorial = PARAM[slug];
  if (!editorial || !isEditorialSlug(editorial)) return {};
  const content = await getEditorialPageContent(editorial);
  const path = EDITORIAL_PAGES.find((page) => page.slug === editorial)?.path;
  return buildMetadata({
    title: content.seoTitle,
    description: content.seoDescription,
    path,
    keywords: content.keywords.split(",").map((part) => part.trim()),
  });
}

export default async function ResourcesEditorialPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const editorial = PARAM[slug];
  if (!editorial || !isEditorialSlug(editorial)) notFound();
  return <EditorialPublicPage slug={editorial} />;
}
