import { routes } from "@/config/routes";

import {
  DEFAULT_HOSTING_SECTION_FLAGS,
  type HostingProductRegistryEntry,
  type HostingProductSectionFlags,
} from "./product-types";

function flags(
  overrides: Partial<HostingProductSectionFlags>,
): HostingProductSectionFlags {
  return { ...DEFAULT_HOSTING_SECTION_FLAGS, ...overrides };
}

const VPS_FLAGS = flags({
  wordpressSpotlight: false,
  specs: true,
  comparison: true,
});

const DEV_FLAGS = flags({
  wordpressSpotlight: false,
  specs: false,
});

/** Static registry — DB rows are seeded from this list. */
export const HOSTING_PRODUCT_REGISTRY: HostingProductRegistryEntry[] = [
  {
    slug: "web-hosting",
    name: "Web Hosting",
    category: "website",
    canonicalPath: routes.hosting,
    legacyCmsSlug: "hosting-product",
    seoRegistrySlug: "hosting",
    pageTemplate: "standard",
    sectionFlags: flags({}),
  },
  {
    slug: "wordpress-hosting",
    name: "WordPress Hosting",
    category: "website",
    canonicalPath: `${routes.hosting}/wordpress`,
    legacyCmsSlug: "wordpress-hosting-product",
    seoRegistrySlug: "wordpress-hosting",
    pageTemplate: "standard",
    sectionFlags: flags({ wordpressSpotlight: true }),
  },
  {
    slug: "ecommerce-hosting",
    name: "eCommerce Hosting",
    category: "website",
    canonicalPath: `${routes.hosting}/ecommerce`,
    legacyCmsSlug: "ecommerce-hosting-product",
    seoRegistrySlug: "ecommerce-hosting",
    pageTemplate: "standard",
    sectionFlags: flags({ wordpressSpotlight: false }),
  },
  {
    slug: "business-hosting",
    name: "Business Hosting",
    category: "website",
    canonicalPath: routes.cloud,
    legacyCmsSlug: "cloud-hosting-product",
    seoRegistrySlug: "cloud",
    pageTemplate: "cloud",
    sectionFlags: flags({ wordpressSpotlight: false }),
  },
  {
    slug: "nodejs-hosting",
    name: "Node.js Hosting",
    category: "developer",
    canonicalPath: "/nodejs-hosting",
    seoRegistrySlug: "nodejs-hosting",
    pageTemplate: "standard",
    sectionFlags: DEV_FLAGS,
    legacyQueryRedirects: [
      { search: { stack: "nodejs" }, targetPath: "/nodejs-hosting" },
    ],
  },
  {
    slug: "python-hosting",
    name: "Python Hosting",
    category: "developer",
    canonicalPath: `${routes.hosting}/python`,
    legacyCmsSlug: "python-hosting-product",
    seoRegistrySlug: "python-hosting",
    pageTemplate: "standard",
    sectionFlags: DEV_FLAGS,
  },
  {
    slug: "laravel-hosting",
    name: "Laravel Hosting",
    category: "developer",
    canonicalPath: "/laravel-hosting",
    seoRegistrySlug: "laravel-hosting",
    pageTemplate: "standard",
    sectionFlags: DEV_FLAGS,
    legacyQueryRedirects: [
      { search: { stack: "laravel" }, targetPath: "/laravel-hosting" },
    ],
  },
  {
    slug: "django-hosting",
    name: "Django Hosting",
    category: "developer",
    canonicalPath: "/django-hosting",
    seoRegistrySlug: "django-hosting",
    pageTemplate: "standard",
    sectionFlags: DEV_FLAGS,
    legacyQueryRedirects: [
      { search: { stack: "django" }, targetPath: "/django-hosting" },
    ],
  },
  {
    slug: "nestjs-hosting",
    name: "NestJS Hosting",
    category: "developer",
    canonicalPath: "/nestjs-hosting",
    seoRegistrySlug: "nestjs-hosting",
    pageTemplate: "standard",
    sectionFlags: DEV_FLAGS,
    legacyQueryRedirects: [
      { search: { stack: "nestjs" }, targetPath: "/nestjs-hosting" },
    ],
  },
  {
    slug: "kvm-vps",
    name: "KVM VPS",
    category: "vps",
    canonicalPath: "/kvm-vps",
    seoRegistrySlug: "kvm-vps",
    pageTemplate: "standard",
    sectionFlags: VPS_FLAGS,
    legacyQueryRedirects: [
      {
        search: { hypervisor: "kvm" },
        targetPath: "/kvm-vps",
      },
    ],
  },
  {
    slug: "nvme-vps",
    name: "NVMe VPS",
    category: "vps",
    canonicalPath: "/nvme-vps",
    seoRegistrySlug: "nvme-vps",
    pageTemplate: "standard",
    sectionFlags: VPS_FLAGS,
    legacyQueryRedirects: [
      { search: { storage: "nvme" }, targetPath: "/nvme-vps" },
    ],
  },
  {
    slug: "linux-vps",
    name: "Linux VPS",
    category: "vps",
    canonicalPath: "/linux-vps",
    seoRegistrySlug: "linux-vps",
    pageTemplate: "standard",
    sectionFlags: VPS_FLAGS,
    legacyQueryRedirects: [
      { search: { os: "linux" }, targetPath: "/linux-vps" },
    ],
  },
  {
    slug: "managed-vps",
    name: "Managed VPS",
    category: "vps",
    canonicalPath: "/managed-vps",
    seoRegistrySlug: "managed-vps",
    pageTemplate: "standard",
    sectionFlags: VPS_FLAGS,
    legacyQueryRedirects: [
      { search: { managed: "1" }, targetPath: "/managed-vps" },
    ],
  },
  {
    slug: "reseller-hosting",
    name: "Reseller Hosting",
    category: "business",
    canonicalPath: `${routes.hosting}/reseller`,
    seoRegistrySlug: "reseller-hosting",
    pageTemplate: "standard",
    sectionFlags: flags({ wordpressSpotlight: false }),
  },
  {
    slug: "agency-hosting",
    name: "Agency Hosting",
    category: "business",
    canonicalPath: "/agency-hosting",
    seoRegistrySlug: "agency-hosting",
    pageTemplate: "standard",
    sectionFlags: flags({ wordpressSpotlight: false }),
  },
];

export function getRegistryEntryBySlug(
  slug: string,
): HostingProductRegistryEntry | undefined {
  return HOSTING_PRODUCT_REGISTRY.find((p) => p.slug === slug);
}

export function getRegistryEntryByPath(
  path: string,
): HostingProductRegistryEntry | undefined {
  const normalized = path.split("?")[0];
  return HOSTING_PRODUCT_REGISTRY.find((p) => p.canonicalPath === normalized);
}

export function resolveProductSlugFromLegacySearch(
  basePath: string,
  search: Record<string, string | string[] | undefined>,
): string | null {
  const normalized = basePath.split("?")[0];
  for (const entry of HOSTING_PRODUCT_REGISTRY) {
    for (const rule of entry.legacyQueryRedirects ?? []) {
      const matches = Object.entries(rule.search).every(([key, value]) => {
        const raw = search[key];
        const v = Array.isArray(raw) ? raw[0] : raw;
        return v === value;
      });
      if (!matches) continue;
      if (normalized === routes.vps || normalized === routes.hosting) {
        return entry.slug;
      }
    }
  }
  return null;
}

export function categoryToPrisma(
  category: HostingProductRegistryEntry["category"],
): "WEBSITE" | "DEVELOPER" | "VPS" | "BUSINESS" {
  switch (category) {
    case "website":
      return "WEBSITE";
    case "developer":
      return "DEVELOPER";
    case "vps":
      return "VPS";
    case "business":
      return "BUSINESS";
  }
}
