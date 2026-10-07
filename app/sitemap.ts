import type { MetadataRoute } from "next";

import {
  blogSitemapEntries,
  tipsSitemapEntries,
  updatesSitemapEntries,
} from "@/lib/blog/sitemap";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";

const SITEMAP_EXCLUDE = new Set([
  routes.login,
  routes.signup,
  routes.account,
  "/checkout/hosting",
]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const paths = Object.values(routes).filter(
    (path) => !SITEMAP_EXCLUDE.has(path),
  );

  const extraHosting = [
    "/web-hosting/wordpress",
    "/web-hosting/ecommerce",
    routes.cloud,
    routes.businessEmail,
    routes.domains,
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
