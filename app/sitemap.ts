import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";

const SITEMAP_EXCLUDE = new Set([
  routes.login,
  routes.signup,
  routes.account,
  "/checkout/hosting",
]);

export default function sitemap(): MetadataRoute.Sitemap {
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

  return all.map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
    lastModified,
    changeFrequency: path === routes.home ? "weekly" : "monthly",
    priority: path === routes.home ? 1 : 0.8,
  }));
}
