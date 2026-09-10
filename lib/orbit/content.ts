import { prisma } from "@/lib/prisma";
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

export async function getSiteSettings(): Promise<CmsSiteSettings> {
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });
    if (!row) return defaultSiteSettings();
    return {
      ...defaultSiteSettings(),
      ...(row.data as CmsSiteSettings),
      logoPath:
        !(row.data as CmsSiteSettings)?.logoPath ||
        (row.data as CmsSiteSettings).logoPath.includes(
          "hostingbeyond-logo-transparent",
        ) ||
        (row.data as CmsSiteSettings).logoPath.includes(
          "hostingbeyond-logo-wordmark",
        ) ||
        (row.data as CmsSiteSettings).logoPath.includes(
          "hostingbeyond-logo-header",
        ) ||
        (row.data as CmsSiteSettings).logoPath.includes(
          "hostingbeyond-logo-light",
        )
          ? defaultSiteSettings().logoPath
          : (row.data as CmsSiteSettings).logoPath,
    };
  } catch {
    return defaultSiteSettings();
  }
}

export async function saveSiteSettings(data: CmsSiteSettings) {
  return prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", data },
    update: { data },
  });
}

export async function getHomeSections(): Promise<CmsHomeSections> {
  try {
    const page = await prisma.pageContent.findUnique({
      where: { slug: "home" },
    });
    if (!page) return defaultHomeSections();
    return mergeHomeSections(page.sections as Partial<CmsHomeSections>);
  } catch {
    return defaultHomeSections();
  }
}

export async function saveHomeSections(sections: CmsHomeSections) {
  const normalized = mergeHomeSections(sections);
  return prisma.pageContent.upsert({
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
}

export async function getLoginPage(): Promise<CmsLoginPage> {
  try {
    const page = await prisma.pageContent.findUnique({
      where: { slug: "login" },
    });
    if (!page) return defaultLoginPage();
    return mergeLoginPage(page.sections as Partial<CmsLoginPage>);
  } catch {
    return defaultLoginPage();
  }
}

export async function saveLoginPage(data: CmsLoginPage) {
  const normalized = mergeLoginPage(data);
  return prisma.pageContent.upsert({
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
