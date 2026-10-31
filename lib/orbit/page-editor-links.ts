import { PUBLIC_PAGE_SEO_REGISTRY } from "@/lib/orbit/page-seo";

export type OrbitPageLink = {
  editor: string;
  preview: string;
};

const CMS_SLUG_LINKS: Record<string, OrbitPageLink> = {
  home: { editor: "/orbit/content", preview: "/" },
  login: { editor: "/orbit/content", preview: "/login" },
  pricing: { editor: "/orbit/pricing", preview: "/pricing" },
  "domain-search": { editor: "/orbit/domains", preview: "/domain-name-search" },
  "beyond-ai-product": { editor: "/orbit/beyond-ai", preview: "/beyond-ai" },
  "business-email-product": {
    editor: "/orbit/business-email",
    preview: "/business-email",
  },
  "hosting-product": { editor: "/orbit/hosting", preview: "/web-hosting" },
  "cloud-hosting-product": {
    editor: "/orbit/cloud",
    preview: "/cloud-hosting",
  },
  "wordpress-hosting-product": {
    editor: "/orbit/hosting",
    preview: "/web-hosting/wordpress",
  },
  "ecommerce-hosting-product": {
    editor: "/orbit/hosting",
    preview: "/web-hosting/ecommerce",
  },
  "python-hosting-product": {
    editor: "/orbit/hosting",
    preview: "/web-hosting/python",
  },
  "website-migration-product": {
    editor: "/orbit/website-migration",
    preview: "/website-migration",
  },
  "domain-transfer-product": {
    editor: "/orbit/domain-transfer",
    preview: "/domain-transfer",
  },
  "tips-hub": { editor: "/orbit/blog/tips-hub", preview: "/resources/tips" },
  "updates-hub": {
    editor: "/orbit/blog/updates-hub",
    preview: "/resources/updates",
  },
  "case-studies-hub": {
    editor: "/orbit/blog/case-studies-hub",
    preview: "/resources/case-studies",
  },
  "growth-hub": {
    editor: "/orbit/blog/growth-hub",
    preview: "/resources/growth",
  },
  "about-page": { editor: "/orbit/about", preview: "/about" },
  "contact-page": { editor: "/orbit/contact", preview: "/contact" },
};

export function orbitPageLinks(slug: string): OrbitPageLink {
  if (CMS_SLUG_LINKS[slug]) return CMS_SLUG_LINKS[slug];
  const seo = PUBLIC_PAGE_SEO_REGISTRY.find((entry) => entry.slug === slug);
  if (seo) {
    return { editor: seo.editorHref, preview: seo.path };
  }
  return { editor: "/orbit/content", preview: "/" };
}
