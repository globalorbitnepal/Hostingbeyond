import { cache } from "react";
import {
  revalidatePath,
  revalidateTag,
  unstable_cache as nextCache,
} from "next/cache";

import { prisma } from "@/lib/prisma";
import { routes } from "@/config/routes";
import {
  defaultDomainContent,
  mergeDomainContent,
  type DomainContent,
} from "@/lib/domains/content";
import {
  defaultHomeSections,
  defaultLoginPage,
  defaultSiteSettings,
  mergeHomeSections,
  mergeLoginPage,
  type CmsHomeSections,
  type CmsLoginPage,
  type CmsSiteSettings,
} from "@/lib/orbit/defaults";
import {
  defaultBeyondAiPageContent,
  mergeBeyondAiPageContent,
  type CmsBeyondAiPageContent,
} from "@/lib/orbit/beyond-ai-page-content";
import {
  defaultBusinessEmailPageContent,
  mergeBusinessEmailPageContent,
  type CmsBusinessEmailPageContent,
} from "@/lib/orbit/business-email-page-content";
import {
  defaultHostingPageContent,
  mergeHostingPageContent,
  type CmsHostingPageContent,
} from "@/lib/orbit/hosting-page-content";
import {
  defaultEcommerceHostingPageContent,
  mergeEcommerceHostingPageContent,
} from "@/lib/orbit/ecommerce-hosting-page-content";
import {
  defaultPythonHostingPageContent,
  mergePythonHostingPageContent,
} from "@/lib/orbit/python-hosting-page-content";
import {
  defaultWordPressHostingPageContent,
  mergeWordPressHostingPageContent,
} from "@/lib/orbit/wordpress-hosting-page-content";
import {
  defaultCloudHostingPageContent,
  mergeCloudHostingPageContent,
  type CmsCloudHostingPageContent,
} from "@/lib/orbit/cloud-hosting-page-content";
import {
  defaultWebsiteMigrationPageContent,
  mergeWebsiteMigrationPageContent,
  type CmsWebsiteMigrationPageContent,
} from "@/lib/orbit/website-migration-page-content";
import {
  defaultDomainTransferPageContent,
  mergeDomainTransferPageContent,
  type CmsDomainTransferPageContent,
} from "@/lib/orbit/domain-transfer-page-content";
import {
  defaultPricingPageContent,
  mergePricingPageContent,
  type CmsPricingPageContent,
} from "@/lib/orbit/pricing-content";
import {
  defaultTipsHubPageContent,
  mergeTipsHubPageContent,
  type CmsTipsHubPageContent,
} from "@/lib/orbit/tips-hub-page-content";
import {
  defaultUpdatesHubPageContent,
  mergeUpdatesHubPageContent,
  type CmsUpdatesHubPageContent,
} from "@/lib/orbit/updates-hub-page-content";
import {
  getPublicPageSeoEntry,
  mergeStoredPageSeo,
  metadataFromStoredSeo,
  type StoredPageSeo,
} from "@/lib/orbit/page-seo";
import type { Metadata } from "next";

import { ensureHostingProductsSeeded } from "@/lib/hosting/seed-hosting-products";

/**
 * Published content is read on every page, so it is cached until an Orbit save
 * calls revalidateTag. That keeps pages fast without delaying CMS edits.
 */
const CMS_TAG = "orbit-content";
const DOMAIN_SLUG = "domain-search";
const PRICING_SLUG = "pricing";
const BEYOND_AI_PAGE_SLUG = "beyond-ai-product";
const BUSINESS_EMAIL_PAGE_SLUG = "business-email-product";
const HOSTING_PAGE_SLUG = "hosting-product";
const CLOUD_PAGE_SLUG = "cloud-hosting-product";
const WORDPRESS_HOSTING_PAGE_SLUG = "wordpress-hosting-product";
const ECOMMERCE_HOSTING_PAGE_SLUG = "ecommerce-hosting-product";
const PYTHON_HOSTING_PAGE_SLUG = "python-hosting-product";
const WEBSITE_MIGRATION_PAGE_SLUG = "website-migration-product";
const DOMAIN_TRANSFER_PAGE_SLUG = "domain-transfer-product";
const TIPS_HUB_PAGE_SLUG = "tips-hub";
const UPDATES_HUB_PAGE_SLUG = "updates-hub";
/** Safety net so a bad cache entry can never outlive a few minutes. */
const CMS_REVALIDATE = 300;

function revalidateContent() {
  revalidateTag(CMS_TAG);
}

/**
 * Read failures must never reach the cache: one unavailable database would
 * otherwise pin the published site to defaults. Errors propagate so nothing is
 * stored, and the caller falls back for that single request.
 */
const readSiteSettings = nextCache(
  async (): Promise<CmsSiteSettings> => {
    const row = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });
    if (!row) return defaultSiteSettings();
    return {
      ...defaultSiteSettings(),
      ...(row.data as CmsSiteSettings),
    };
  },
  ["orbit-site-settings"],
  { tags: [CMS_TAG], revalidate: CMS_REVALIDATE },
);

export const getSiteSettings = cache(async (): Promise<CmsSiteSettings> => {
  try {
    return await readSiteSettings();
  } catch {
    return defaultSiteSettings();
  }
});

export async function saveSiteSettings(data: CmsSiteSettings) {
  const row = await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", data },
    update: { data },
  });
  revalidateContent();
  revalidatePath("/");
  revalidatePath("/orbit/content");
  return row;
}

const readHomeSections = nextCache(
  async (): Promise<CmsHomeSections> => {
    const page = await prisma.pageContent.findUnique({
      where: { slug: "home" },
    });
    if (!page) return defaultHomeSections();
    return mergeHomeSections(page.sections as Partial<CmsHomeSections>);
  },
  ["orbit-home-sections"],
  { tags: [CMS_TAG], revalidate: CMS_REVALIDATE },
);

export const getHomeSections = cache(async (): Promise<CmsHomeSections> => {
  try {
    return await readHomeSections();
  } catch {
    return defaultHomeSections();
  }
});

export async function saveHomeSections(sections: CmsHomeSections) {
  const normalized = mergeHomeSections(sections);
  const row = await prisma.pageContent.upsert({
    where: { slug: "home" },
    create: {
      slug: "home",
      title: "Home",
      isPublished: true,
      isVisible: true,
      sections: normalized,
      seo: {
        title: "HostingBeyond — Beyond Hosting, Beyond Possibilities",
        description: defaultSiteSettings().description,
      },
    },
    update: { sections: normalized },
  });
  revalidateContent();
  revalidatePath("/");
  revalidatePath("/pricing");
  revalidatePath("/orbit/content");
  return row;
}

const readLoginPage = nextCache(
  async (): Promise<CmsLoginPage> => {
    const page = await prisma.pageContent.findUnique({
      where: { slug: "login" },
    });
    if (!page) return defaultLoginPage();
    return mergeLoginPage(page.sections as Partial<CmsLoginPage>);
  },
  ["orbit-login-page"],
  { tags: [CMS_TAG], revalidate: CMS_REVALIDATE },
);

export const getLoginPage = cache(async (): Promise<CmsLoginPage> => {
  try {
    return await readLoginPage();
  } catch {
    return defaultLoginPage();
  }
});

export async function saveLoginPage(data: CmsLoginPage) {
  const normalized = mergeLoginPage(data);
  const row = await prisma.pageContent.upsert({
    where: { slug: "login" },
    create: {
      slug: "login",
      title: "Login",
      isPublished: true,
      isVisible: true,
      sections: normalized,
      seo: {
        title: "Login — HostingBeyond",
        description: "Sign in to manage your HostingBeyond services.",
      },
    },
    update: { sections: normalized },
  });
  revalidateContent();
  revalidatePath("/");
  revalidatePath("/login");
  return row;
}

const readDomainContent = nextCache(
  async (): Promise<DomainContent> => {
    const page = await prisma.pageContent.findUnique({
      where: { slug: DOMAIN_SLUG },
    });
    if (!page) return defaultDomainContent();
    return mergeDomainContent(page.sections as Partial<DomainContent>);
  },
  ["orbit-domain-content"],
  { tags: [CMS_TAG], revalidate: CMS_REVALIDATE },
);

export const getDomainContent = cache(async (): Promise<DomainContent> => {
  try {
    return await readDomainContent();
  } catch {
    return defaultDomainContent();
  }
});

const readPricingContent = nextCache(
  async (): Promise<CmsPricingPageContent> => {
    const page = await prisma.pageContent.findUnique({
      where: { slug: PRICING_SLUG },
    });
    if (!page) return defaultPricingPageContent();
    return mergePricingPageContent(
      page.sections as Partial<CmsPricingPageContent>,
    );
  },
  ["orbit-pricing-content"],
  { tags: [CMS_TAG], revalidate: CMS_REVALIDATE },
);

export const getPricingPageContent = cache(
  async (): Promise<CmsPricingPageContent> => {
    try {
      return await readPricingContent();
    } catch {
      return defaultPricingPageContent();
    }
  },
);

const readBeyondAiPageContent = nextCache(
  async (): Promise<CmsBeyondAiPageContent> => {
    const page = await prisma.pageContent.findUnique({
      where: { slug: BEYOND_AI_PAGE_SLUG },
    });
    if (!page) return defaultBeyondAiPageContent();
    return mergeBeyondAiPageContent(
      page.sections as Partial<CmsBeyondAiPageContent>,
    );
  },
  ["orbit-beyond-ai-page-content"],
  { tags: [CMS_TAG], revalidate: CMS_REVALIDATE },
);

export const getBeyondAiPageContent = cache(
  async (): Promise<CmsBeyondAiPageContent> => {
    try {
      return await readBeyondAiPageContent();
    } catch {
      return defaultBeyondAiPageContent();
    }
  },
);

const readBusinessEmailPageContent = nextCache(
  async (): Promise<CmsBusinessEmailPageContent> => {
    const page = await prisma.pageContent.findUnique({
      where: { slug: BUSINESS_EMAIL_PAGE_SLUG },
    });
    if (!page) return defaultBusinessEmailPageContent();
    return mergeBusinessEmailPageContent(
      page.sections as Partial<CmsBusinessEmailPageContent>,
    );
  },
  ["orbit-business-email-page-content"],
  { tags: [CMS_TAG], revalidate: CMS_REVALIDATE },
);

export const getBusinessEmailPageContent = cache(
  async (): Promise<CmsBusinessEmailPageContent> => {
    try {
      return await readBusinessEmailPageContent();
    } catch {
      return defaultBusinessEmailPageContent();
    }
  },
);

const readHostingPageContent = nextCache(
  async (): Promise<CmsHostingPageContent> => {
    const page = await prisma.pageContent.findUnique({
      where: { slug: HOSTING_PAGE_SLUG },
    });
    if (!page) return defaultHostingPageContent();
    return mergeHostingPageContent(
      page.sections as Partial<CmsHostingPageContent>,
    );
  },
  ["orbit-hosting-page-content"],
  { tags: [CMS_TAG], revalidate: CMS_REVALIDATE },
);

export const getHostingPageContent = cache(
  async (): Promise<CmsHostingPageContent> => {
    try {
      return await readHostingPageContent();
    } catch {
      return defaultHostingPageContent();
    }
  },
);

const readTipsHubPageContent = nextCache(
  async (): Promise<CmsTipsHubPageContent> => {
    const page = await prisma.pageContent.findUnique({
      where: { slug: TIPS_HUB_PAGE_SLUG },
    });
    if (!page) return defaultTipsHubPageContent();
    return mergeTipsHubPageContent(
      page.sections as Partial<CmsTipsHubPageContent>,
    );
  },
  ["orbit-tips-hub-page-content"],
  { tags: [CMS_TAG], revalidate: CMS_REVALIDATE },
);

export const getTipsHubPageContent = cache(
  async (): Promise<CmsTipsHubPageContent> => {
    try {
      return await readTipsHubPageContent();
    } catch {
      return defaultTipsHubPageContent();
    }
  },
);

const readUpdatesHubPageContent = nextCache(
  async (): Promise<CmsUpdatesHubPageContent> => {
    const page = await prisma.pageContent.findUnique({
      where: { slug: UPDATES_HUB_PAGE_SLUG },
    });
    if (!page) return defaultUpdatesHubPageContent();
    return mergeUpdatesHubPageContent(
      page.sections as Partial<CmsUpdatesHubPageContent>,
    );
  },
  ["orbit-updates-hub-page-content"],
  { tags: [CMS_TAG], revalidate: CMS_REVALIDATE },
);

export const getUpdatesHubPageContent = cache(
  async (): Promise<CmsUpdatesHubPageContent> => {
    try {
      return await readUpdatesHubPageContent();
    } catch {
      return defaultUpdatesHubPageContent();
    }
  },
);

const readCloudHostingPageContent = nextCache(
  async (): Promise<CmsCloudHostingPageContent> => {
    const page = await prisma.pageContent.findUnique({
      where: { slug: CLOUD_PAGE_SLUG },
    });
    if (!page) return defaultCloudHostingPageContent();
    return mergeCloudHostingPageContent(
      page.sections as Partial<CmsCloudHostingPageContent>,
    );
  },
  ["orbit-cloud-hosting-page-content"],
  { tags: [CMS_TAG], revalidate: CMS_REVALIDATE },
);

export const getCloudHostingPageContent = cache(
  async (): Promise<CmsCloudHostingPageContent> => {
    try {
      return await readCloudHostingPageContent();
    } catch {
      return defaultCloudHostingPageContent();
    }
  },
);

const readWordPressHostingPageContent = nextCache(
  async (): Promise<CmsHostingPageContent> => {
    const page = await prisma.pageContent.findUnique({
      where: { slug: WORDPRESS_HOSTING_PAGE_SLUG },
    });
    if (!page) return defaultWordPressHostingPageContent();
    return mergeWordPressHostingPageContent(
      page.sections as Partial<CmsHostingPageContent>,
    );
  },
  ["orbit-wordpress-hosting-page-content"],
  { tags: [CMS_TAG], revalidate: CMS_REVALIDATE },
);

export const getWordPressHostingPageContent = cache(
  async (): Promise<CmsHostingPageContent> => {
    try {
      return await readWordPressHostingPageContent();
    } catch {
      return defaultWordPressHostingPageContent();
    }
  },
);

const readEcommerceHostingPageContent = nextCache(
  async (): Promise<CmsHostingPageContent> => {
    const page = await prisma.pageContent.findUnique({
      where: { slug: ECOMMERCE_HOSTING_PAGE_SLUG },
    });
    if (!page) return defaultEcommerceHostingPageContent();
    return mergeEcommerceHostingPageContent(
      page.sections as Partial<CmsHostingPageContent>,
    );
  },
  ["orbit-ecommerce-hosting-page-content"],
  { tags: [CMS_TAG], revalidate: CMS_REVALIDATE },
);

export const getEcommerceHostingPageContent = cache(
  async (): Promise<CmsHostingPageContent> => {
    try {
      return await readEcommerceHostingPageContent();
    } catch {
      return defaultEcommerceHostingPageContent();
    }
  },
);

const readPythonHostingPageContent = nextCache(
  async (): Promise<CmsHostingPageContent> => {
    const page = await prisma.pageContent.findUnique({
      where: { slug: PYTHON_HOSTING_PAGE_SLUG },
    });
    if (!page) return defaultPythonHostingPageContent();
    return mergePythonHostingPageContent(
      page.sections as Partial<CmsHostingPageContent>,
    );
  },
  ["orbit-python-hosting-page-content"],
  { tags: [CMS_TAG], revalidate: CMS_REVALIDATE },
);

export const getPythonHostingPageContent = cache(
  async (): Promise<CmsHostingPageContent> => {
    try {
      return await readPythonHostingPageContent();
    } catch {
      return defaultPythonHostingPageContent();
    }
  },
);

const readWebsiteMigrationPageContent = nextCache(
  async (): Promise<CmsWebsiteMigrationPageContent> => {
    const page = await prisma.pageContent.findUnique({
      where: { slug: WEBSITE_MIGRATION_PAGE_SLUG },
    });
    if (!page) return defaultWebsiteMigrationPageContent();
    return mergeWebsiteMigrationPageContent(
      page.sections as Partial<CmsWebsiteMigrationPageContent>,
    );
  },
  ["orbit-website-migration-page-content"],
  { tags: [CMS_TAG], revalidate: CMS_REVALIDATE },
);

export const getWebsiteMigrationPageContent = cache(
  async (): Promise<CmsWebsiteMigrationPageContent> => {
    try {
      return await readWebsiteMigrationPageContent();
    } catch {
      return defaultWebsiteMigrationPageContent();
    }
  },
);

const readDomainTransferPageContent = nextCache(
  async (): Promise<CmsDomainTransferPageContent> => {
    const page = await prisma.pageContent.findUnique({
      where: { slug: DOMAIN_TRANSFER_PAGE_SLUG },
    });
    if (!page) return defaultDomainTransferPageContent();
    return mergeDomainTransferPageContent(
      page.sections as Partial<CmsDomainTransferPageContent>,
    );
  },
  ["orbit-domain-transfer-page-content"],
  { tags: [CMS_TAG], revalidate: CMS_REVALIDATE },
);

export const getDomainTransferPageContent = cache(
  async (): Promise<CmsDomainTransferPageContent> => {
    try {
      return await readDomainTransferPageContent();
    } catch {
      return defaultDomainTransferPageContent();
    }
  },
);

export async function saveDomainTransferPageContent(
  content: CmsDomainTransferPageContent,
) {
  const normalized = mergeDomainTransferPageContent(content);
  const row = await prisma.pageContent.upsert({
    where: { slug: DOMAIN_TRANSFER_PAGE_SLUG },
    create: {
      slug: DOMAIN_TRANSFER_PAGE_SLUG,
      title: "Domain transfer",
      isPublished: true,
      isVisible: true,
      sections: normalized,
      seo: {
        title: "Transfer Your Domain | HostingBeyond",
        description:
          "Transfer your domain to HostingBeyond with transparent pricing, DNS tools, and 24/7 support.",
        keywords:
          "domain transfer, transfer domain, EPP code, move domain registrar",
      },
    },
    update: { sections: normalized },
  });
  revalidateContent();
  revalidatePath(routes.domainTransfer);
  revalidatePath("/orbit/domain-transfer");
  return row;
}

export async function saveWebsiteMigrationPageContent(
  content: CmsWebsiteMigrationPageContent,
) {
  const normalized = mergeWebsiteMigrationPageContent(content);
  const row = await prisma.pageContent.upsert({
    where: { slug: WEBSITE_MIGRATION_PAGE_SLUG },
    create: {
      slug: WEBSITE_MIGRATION_PAGE_SLUG,
      title: "Website migration",
      isPublished: true,
      isVisible: true,
      sections: normalized,
      seo: {
        title: "Free Website Migration | HostingBeyond",
        description:
          "Move your website to HostingBeyond with free migration on eligible plans, expert support, and Beyond AI checks.",
        keywords:
          "website migration, free site migration, WordPress migration, move hosting",
      },
    },
    update: { sections: normalized },
  });
  revalidateContent();
  revalidatePath(routes.websiteMigration);
  revalidatePath("/orbit/website-migration");
  return row;
}

export async function saveCloudHostingPageContent(
  content: CmsCloudHostingPageContent,
) {
  const normalized = mergeCloudHostingPageContent(content);
  const row = await prisma.pageContent.upsert({
    where: { slug: CLOUD_PAGE_SLUG },
    create: {
      slug: CLOUD_PAGE_SLUG,
      title: "Cloud Hosting product",
      isPublished: true,
      isVisible: true,
      sections: normalized,
      seo: {
        title: "Cloud Hosting — Dedicated Resources | HostingBeyond",
        description:
          "Cloud hosting with dedicated CPU, RAM, and NVMe storage. Compare Cloud Starter, Business, and Pro plans with free SSL and 24/7 support.",
        keywords:
          "cloud hosting, managed cloud hosting, scalable web hosting, WooCommerce cloud",
      },
    },
    update: { sections: normalized },
  });
  revalidateContent();
  revalidatePath(routes.cloud);
  revalidatePath("/cloud");
  revalidatePath("/orbit/cloud");
  return row;
}

export async function saveUpdatesHubPageContent(
  content: CmsUpdatesHubPageContent,
) {
  const normalized = mergeUpdatesHubPageContent(content);
  const row = await prisma.pageContent.upsert({
    where: { slug: UPDATES_HUB_PAGE_SLUG },
    create: {
      slug: UPDATES_HUB_PAGE_SLUG,
      title: "Product Updates Hub",
      isPublished: true,
      isVisible: true,
      sections: normalized,
      seo: {
        title: normalized.seoTitle,
        description: normalized.seoDescription,
        keywords:
          "HostingBeyond updates, release notes, product changelog, hosting news, platform updates",
      },
    },
    update: {
      sections: normalized,
      seo: {
        title: normalized.seoTitle,
        description: normalized.seoDescription,
      },
    },
  });
  revalidateContent();
  revalidatePath("/resources/updates");
  revalidatePath("/orbit/blog/updates-hub");
  return row;
}

export async function saveTipsHubPageContent(content: CmsTipsHubPageContent) {
  const normalized = mergeTipsHubPageContent(content);
  const row = await prisma.pageContent.upsert({
    where: { slug: TIPS_HUB_PAGE_SLUG },
    create: {
      slug: TIPS_HUB_PAGE_SLUG,
      title: "Tips & Learning Hub",
      isPublished: true,
      isVisible: true,
      sections: normalized,
      seo: {
        title: normalized.seoTitle,
        description: normalized.seoDescription,
        keywords:
          "hosting tips, domain guides, WordPress tutorials, website security, DNS help, HostingBeyond guides",
      },
    },
    update: {
      sections: normalized,
      seo: {
        title: normalized.seoTitle,
        description: normalized.seoDescription,
      },
    },
  });
  revalidateContent();
  revalidatePath("/resources/tips");
  revalidatePath("/orbit/blog/tips-hub");
  return row;
}

export async function saveHostingPageContent(content: CmsHostingPageContent) {
  const normalized = mergeHostingPageContent(content);
  const row = await prisma.pageContent.upsert({
    where: { slug: HOSTING_PAGE_SLUG },
    create: {
      slug: HOSTING_PAGE_SLUG,
      title: "Web Hosting product",
      isPublished: true,
      isVisible: true,
      sections: normalized,
      seo: {
        title: "Web Hosting — Fast WordPress & NVMe | HostingBeyond",
        description:
          "Compare web hosting plans with free SSL, NVMe storage, managed WordPress, and 24/7 support. Save up to 70% on annual billing.",
        keywords:
          "web hosting, WordPress hosting, shared hosting, NVMe hosting, cheap web hosting",
      },
    },
    update: { sections: normalized },
  });
  revalidateContent();
  revalidatePath(routes.hosting);
  revalidatePath("/hosting");
  revalidatePath("/orbit/hosting");
  return row;
}

export async function saveBusinessEmailPageContent(
  content: CmsBusinessEmailPageContent,
) {
  const normalized = mergeBusinessEmailPageContent(content);
  const row = await prisma.pageContent.upsert({
    where: { slug: BUSINESS_EMAIL_PAGE_SLUG },
    create: {
      slug: BUSINESS_EMAIL_PAGE_SLUG,
      title: "Business Email product",
      isPublished: true,
      isVisible: true,
      sections: normalized,
      seo: {
        title: "Business Email — HostingBeyond",
        description:
          "Professional business email on your domain with AI, migration, and 24/7 support.",
      },
    },
    update: { sections: normalized },
  });
  revalidateContent();
  revalidatePath(routes.businessEmail);
  revalidatePath("/orbit/business-email");
  return row;
}

export async function saveBeyondAiPageContent(content: CmsBeyondAiPageContent) {
  const normalized = mergeBeyondAiPageContent(content);
  const row = await prisma.pageContent.upsert({
    where: { slug: BEYOND_AI_PAGE_SLUG },
    create: {
      slug: BEYOND_AI_PAGE_SLUG,
      title: "Beyond AI product",
      isPublished: true,
      isVisible: true,
      sections: normalized,
      seo: {
        title: "Beyond AI — HostingBeyond",
        description:
          "Build websites with AI models, included credit, and Free Deploy on HostingBeyond.",
      },
    },
    update: { sections: normalized },
  });
  revalidateContent();
  revalidatePath(routes.beyondAi);
  revalidatePath("/orbit/beyond-ai");
  return row;
}

export async function savePricingPageContent(content: CmsPricingPageContent) {
  const normalized = mergePricingPageContent(content);
  const row = await prisma.pageContent.upsert({
    where: { slug: PRICING_SLUG },
    create: {
      slug: PRICING_SLUG,
      title: "Pricing",
      isPublished: true,
      isVisible: true,
      sections: normalized,
      seo: {
        title: "Pricing — HostingBeyond",
        description:
          "Compare HostingBeyond pricing for websites, ecommerce, domains, AI, VPS, and business email.",
      },
    },
    update: { sections: normalized },
  });
  revalidateContent();
  revalidatePath(routes.pricing);
  revalidatePath("/orbit/pricing");
  return row;
}

function domainRowSeo(single: DomainContent["single"]): StoredPageSeo {
  return {
    metaTitle: single.seoTitle,
    metaDescription: single.seoDescription,
    keywords: single.seoKeywords,
    ogTitle: single.ogTitle,
    ogDescription: single.ogDescription,
    ogImage: single.ogImage,
  };
}

export async function getStoredPageSeo(slug: string): Promise<StoredPageSeo> {
  try {
    const row = await prisma.pageContent.findUnique({
      where: { slug },
      select: { seo: true },
    });
    return mergeStoredPageSeo(row?.seo);
  } catch {
    return mergeStoredPageSeo(null);
  }
}

export async function buildPublicPageMetadata(
  slug: string,
  path: string,
  defaults: { title?: string; description?: string; image?: string },
): Promise<Metadata> {
  const entry = getPublicPageSeoEntry(slug);
  const stored = await getStoredPageSeo(slug);
  const seo = mergeStoredPageSeo(stored, {
    ...entry?.defaultSeo,
    metaTitle: defaults.title,
    metaDescription: defaults.description,
    ogImage: defaults.image ?? entry?.defaultSeo?.ogImage,
    ogTitle: entry?.defaultSeo?.ogTitle ?? defaults.title,
    ogDescription: entry?.defaultSeo?.ogDescription ?? defaults.description,
    twitterTitle: entry?.defaultSeo?.twitterTitle ?? defaults.title,
    twitterDescription:
      entry?.defaultSeo?.twitterDescription ?? defaults.description,
  });
  return metadataFromStoredSeo(path, seo, defaults);
}

export async function saveDomainContent(content: DomainContent) {
  const normalized = mergeDomainContent(content);
  const seo = domainRowSeo(normalized.single);
  const row = await prisma.pageContent.upsert({
    where: { slug: DOMAIN_SLUG },
    create: {
      slug: DOMAIN_SLUG,
      title: "Domain search pages",
      isPublished: true,
      isVisible: true,
      sections: normalized,
      seo,
    },
    update: { sections: normalized, seo },
  });
  revalidateContent();
  revalidatePath(routes.domainSearch);
  revalidatePath(routes.bulkDomainSearch);
  revalidatePath(routes.domainTransfer);
  revalidatePath("/orbit/domains");
  return row;
}

export async function listPages() {
  try {
    const pages = await prisma.pageContent.findMany({
      orderBy: { updatedAt: "desc" },
    });
    if (pages.length) return pages;
  } catch {
    /* fall through */
  }

  const defaults = defaultHomeSections();
  return [
    {
      id: "home-fallback",
      slug: "home",
      title: "Home",
      isPublished: true,
      isVisible: true,
      seo: null,
      sections: defaults,
      updatedAt: new Date(),
      createdAt: new Date(),
    },
  ];
}

export async function ensureHomeSeeded() {
  try {
    const existing = await prisma.pageContent.findUnique({
      where: { slug: "home" },
    });
    if (!existing) {
      await saveHomeSections(defaultHomeSections());
    }
    const login = await prisma.pageContent.findUnique({
      where: { slug: "login" },
    });
    if (!login) {
      await saveLoginPage(defaultLoginPage());
    }
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });
    if (!settings) {
      await saveSiteSettings(defaultSiteSettings());
    }
    const pricing = await prisma.pageContent.findUnique({
      where: { slug: PRICING_SLUG },
    });
    if (!pricing) {
      await savePricingPageContent(defaultPricingPageContent());
    }
    const beyondAiPage = await prisma.pageContent.findUnique({
      where: { slug: BEYOND_AI_PAGE_SLUG },
    });
    if (!beyondAiPage) {
      await saveBeyondAiPageContent(defaultBeyondAiPageContent());
    }
    const businessEmailPage = await prisma.pageContent.findUnique({
      where: { slug: BUSINESS_EMAIL_PAGE_SLUG },
    });
    if (!businessEmailPage) {
      await saveBusinessEmailPageContent(defaultBusinessEmailPageContent());
    }
    const hostingPage = await prisma.pageContent.findUnique({
      where: { slug: HOSTING_PAGE_SLUG },
    });
    if (!hostingPage) {
      await saveHostingPageContent(defaultHostingPageContent());
    }
    const cloudPage = await prisma.pageContent.findUnique({
      where: { slug: CLOUD_PAGE_SLUG },
    });
    if (!cloudPage) {
      await saveCloudHostingPageContent(defaultCloudHostingPageContent());
    }
    const migrationPage = await prisma.pageContent.findUnique({
      where: { slug: WEBSITE_MIGRATION_PAGE_SLUG },
    });
    if (!migrationPage) {
      await saveWebsiteMigrationPageContent(
        defaultWebsiteMigrationPageContent(),
      );
    }
    const tipsHub = await prisma.pageContent.findUnique({
      where: { slug: TIPS_HUB_PAGE_SLUG },
    });
    if (!tipsHub) {
      await saveTipsHubPageContent(defaultTipsHubPageContent());
    }
    const updatesHub = await prisma.pageContent.findUnique({
      where: { slug: UPDATES_HUB_PAGE_SLUG },
    });
    if (!updatesHub) {
      await saveUpdatesHubPageContent(defaultUpdatesHubPageContent());
    }
    await ensureHostingProductsSeeded();
  } catch {
    /* DB may be unavailable during local UI work */
  }
}
