import type { Metadata } from "next";

import { getRegistryEntryBySlug } from "@/lib/hosting/products-registry";
import { buildPublicPageMetadata } from "@/lib/orbit/content";

export async function hostingProductMetadata(
  slug: string,
  defaults: { title?: string; description?: string; image?: string },
): Promise<Metadata> {
  const entry = getRegistryEntryBySlug(slug);
  if (!entry) {
    return { title: defaults.title ?? "Hosting" };
  }
  return buildPublicPageMetadata(
    entry.seoRegistrySlug,
    entry.canonicalPath,
    defaults,
  );
}
