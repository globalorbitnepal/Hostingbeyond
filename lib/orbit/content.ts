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

/**
 * Published content is read on every page, so it is cached until an Orbit save
 * calls revalidateTag. That keeps pages fast without delaying CMS edits.
 */
const CMS_TAG = "orbit-content";
const DOMAIN_SLUG = "domain-search";

function revalidateContent() {
  revalidateTag(CMS_TAG);
}

const readSiteSettings = nextCache(
  async (): Promise<CmsSiteSettings> => {
    try {
      const row = await prisma.siteSettings.findUnique({
        where: { id: "default" },
      });
      if (!row) return defaultSiteSettings();
      return {
        ...defaultSiteSettings(),
        ...(row.data as CmsSiteSettings),
      };
    } catch {
      return defaultSiteSettings();
    }
  },
  ["orbit-site-settings"],
  { tags: [CMS_TAG] },
);

export const getSiteSettings = cache((): Promise<CmsSiteSettings> =>
  readSiteSettings(),
);

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
    try {
      const page = await prisma.pageContent.findUnique({
        where: { slug: "home" },
      });
      if (!page) return defaultHomeSections();
      return mergeHomeSections(page.sections as Partial<CmsHomeSections>);
    } catch {
      return defaultHomeSections();
    }
  },
  ["orbit-home-sections"],
  { tags: [CMS_TAG] },
);

export const getHomeSections = cache((): Promise<CmsHomeSections> =>
  readHomeSections(),
);

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
  revalidatePath("/orbit/content");
  return row;
}

const readLoginPage = nextCache(
  async (): Promise<CmsLoginPage> => {
    try {
      const page = await prisma.pageContent.findUnique({
        where: { slug: "login" },
      });
      if (!page) return defaultLoginPage();
      return mergeLoginPage(page.sections as Partial<CmsLoginPage>);
    } catch {
      return defaultLoginPage();
    }
  },
  ["orbit-login-page"],
  { tags: [CMS_TAG] },
);

export const getLoginPage = cache((): Promise<CmsLoginPage> => readLoginPage());

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
    try {
      const page = await prisma.pageContent.findUnique({
        where: { slug: DOMAIN_SLUG },
      });
      if (!page) return defaultDomainContent();
      return mergeDomainContent(page.sections as Partial<DomainContent>);
    } catch {
      return defaultDomainContent();
    }
  },
  ["orbit-domain-content"],
  { tags: [CMS_TAG] },
);

export const getDomainContent = cache((): Promise<DomainContent> =>
  readDomainContent(),
);

export async function saveDomainContent(content: DomainContent) {
  const normalized = mergeDomainContent(content);
  const row = await prisma.pageContent.upsert({
    where: { slug: DOMAIN_SLUG },
    create: {
      slug: DOMAIN_SLUG,
      title: "Domain search pages",
      isPublished: true,
      isVisible: true,
      sections: normalized,
      seo: {
        title: normalized.single.seoTitle,
        description: normalized.single.seoDescription,
      },
    },
    update: { sections: normalized },
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
  } catch {
    /* DB may be unavailable during local UI work */
  }
}
