import type { MetadataRoute } from "next";

import {
  blogSitemapEntries,
  tipsSitemapEntries,
  updatesSitemapEntries,
} from "@/lib/blog/sitemap";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import { BEYOND_AI_PUBLIC_ENABLED } from "@/config/beyond-ai-public";

const SITEMAP_EXCLUDE = new Set([
  routes.login,
  routes.signup,
  routes.account,
  "/checkout/hosting",
  "/checkout/business-email",
]);

/**
 * The sitemap is generated from live CMS data (posts, categories, tips,
 * updates). Building it once at deploy time would miss every article published
 * afterwards, so it is rendered on request and cached briefly.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const paths = Object.values(routes).filter(
    (path) =>
      !SITEMAP_EXCLUDE.has(path) &&
      (BEYOND_AI_PUBLIC_ENABLED || path !== routes.beyondAi),
  );

  const extraHosting = [
    "/web-hosting/wordpress",
    "/web-hosting/ecommerce",
    "/web-hosting/ssl",
    routes.cloud,
    routes.businessEmail,
    routes.domains,
    "/resources/case-studies",
    "/resources/growth",
    "/resources/docs",
    "/resources/updates",
    "/resources/tips",
  ];

  const all = [...new Set([...paths, ...extraHosting])];

  const staticEntries: MetadataRoute.Sitemap = all.map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
    lastModified,
    changeFrequency: (path === routes.home ? "weekly" : "monthly") as
      "weekly" | "monthly",
    priority: path === routes.home ? 1 : 0.8,
  }));

  const [blogEntries, tipsEntries, updatesEntries] = await Promise.all([
    blogSitemapEntries(),
    tipsSitemapEntries(),
    updatesSitemapEntries(),
  ]);
  return [...staticEntries, ...blogEntries, ...tipsEntries, ...updatesEntries];
}
