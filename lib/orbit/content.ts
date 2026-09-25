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
  defaultPricingPageContent,
  mergePricingPageContent,
  type CmsPricingPageContent,
} from "@/lib/orbit/pricing-content";
import {
  mergeStoredPageSeo,
  metadataFromStoredSeo,
  type StoredPageSeo,
} from "@/lib/orbit/page-seo";
import type { Metadata } from "next";

/**
 * Published content is read on every page, so it is cached until an Orbit save
 * calls revalidateTag. That keeps pages fast without delaying CMS edits.
 */
const CMS_TAG = "orbit-content";
const DOMAIN_SLUG = "domain-search";
const PRICING_SLUG = "pricing";
const BEYOND_AI_PAGE_SLUG = "beyond-ai-product";
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
  const seo = await getStoredPageSeo(slug);
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
  } catch {
    /* DB may be unavailable during local UI work */
  }
}
