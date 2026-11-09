import { Prisma } from "@prisma/client";

import { vpsPlans } from "@/config/pricing-plans";
import { defaultHostingPlansSection } from "@/lib/orbit/defaults";
import { defaultHostingPageContent } from "@/lib/orbit/hosting-page-content";
import { defaultPythonHostingPageContent } from "@/lib/orbit/python-hosting-page-content";
import { prisma } from "@/lib/prisma";

import {
  catalogForSlug,
  INTERNATIONAL_LAUNCH_PRODUCT_SLUGS,
} from "./international-launch-catalog";
import { parseUsdPrice } from "./parse-price";
import {
  categoryToPrisma,
  HOSTING_PRODUCT_REGISTRY,
} from "./products-registry";
import type { HostingVpsSpecifications } from "./product-types";
import { syncInternationalLaunchPlans } from "./sync-international-launch-plans";

function launchCatalogPlanRows(slug: string) {
  const product = catalogForSlug(slug);
  if (!product) return null;
  return product.plans.map((plan, index) => ({
    planKey: plan.planKey,
    planName: plan.planName,
    monthlyPrice: plan.monthlyPrice,
    yearlyPrice: plan.yearlyPrice,
    tagline: plan.tagline,
    popular: Boolean(plan.popular),
    sortOrder: index,
    features: plan.features,
    storage: plan.storage,
    websites: plan.websites,
    databases: plan.databases,
    ssl: plan.ssl,
    backup: plan.backup,
  }));
}

function sharedWebPlans() {
  return defaultHostingPlansSection().plans.map((plan, index) => ({
    planKey: plan.id,
    planName: plan.name,
    monthlyPrice: parseUsdPrice(plan.priceMonthly),
    yearlyPrice:
      parseUsdPrice(plan.billedAnnually) ||
      parseUsdPrice(plan.priceMonthly) * 12,
    tagline: plan.tagline,
    popular: plan.popular,
    sortOrder: plan.order ?? index,
    features: plan.features,
    storage: plan.features.find((f) => /storage/i.test(f)) ?? null,
    bandwidth: plan.features.find((f) => /bandwidth/i.test(f)) ?? null,
    websites: plan.features.find((f) => /website/i.test(f)) ?? null,
    ssl: "Free SSL",
    backup: plan.features.find((f) => /backup/i.test(f)) ?? null,
    support: plan.features.find((f) => /support/i.test(f)) ?? null,
  }));
}

function planRowsForProduct(slug: string, isVps: boolean) {
  if (isVps) return vpsPlanRows();
  const launch = launchCatalogPlanRows(slug);
  if (launch) return launch;
  return sharedWebPlans();
}

function vpsPlanRows() {
  return vpsPlans.map((plan, index) => ({
    planKey: plan.id,
    planName: plan.name,
    monthlyPrice: parseUsdPrice(plan.priceMonthly),
    yearlyPrice:
      parseUsdPrice(plan.billedAnnually) ||
      parseUsdPrice(plan.priceMonthly) * 12,
    tagline: plan.tagline,
    popular: Boolean(plan.popular),
    sortOrder: index,
    features: plan.features,
  }));
}

function defaultVpsSpecs(slug: string): HostingVpsSpecifications {
  const base: HostingVpsSpecifications = {
    virtualization: "KVM",
    rootAccess: "Full root access",
    operatingSystem: "Ubuntu, Debian, AlmaLinux",
    ipv4: "1 dedicated IPv4",
    ipv6: "/64 IPv6 included",
    location: "US & EU data centers",
    snapshots: "Weekly snapshots",
    backups: "Optional daily backups",
  };
  if (slug === "nvme-vps") {
    return { ...base, nvmeStorage: "NVMe-only storage tier" };
  }
  if (slug === "linux-vps") {
    return {
      ...base,
      operatingSystem: "Linux distributions (Ubuntu, Debian, Alma)",
    };
  }
  if (slug === "managed-vps") {
    return {
      ...base,
      backups: "Managed patches & monitoring",
      support: "Managed support included",
    };
  }
  return {
    ...base,
    cpuCores: "1–8 vCPU",
    ram: "4–32 GB RAM",
    nvmeStorage: "50–400 GB NVMe",
    bandwidth: "4–32 TB transfer",
  };
}

function heroFromLegacy(slug: string) {
  if (slug === "python-hosting") {
    const page = defaultPythonHostingPageContent();
    return {
      heroTitle: `${page.heroTitle} ${page.heroTitleAccent}`.trim(),
      heroDescription: page.heroDescription,
      shortDescription: page.heroDescription,
    };
  }
  const page = defaultHostingPageContent();
  return {
    heroTitle: `${page.heroTitle} ${page.heroTitleAccent}`.trim(),
    heroDescription: page.heroDescription,
    shortDescription: page.heroDescription,
  };
}

export async function ensureHostingProductsSeeded() {
  try {
    await prisma.hostingProduct.findFirst();
  } catch {
    return;
  }

  for (const [index, entry] of HOSTING_PRODUCT_REGISTRY.entries()) {
    const existing = await prisma.hostingProduct.findUnique({
      where: { slug: entry.slug },
      include: { plans: true },
    });
    if (existing) {
      if (entry.slug === "web-hosting" && !existing.freeDomainAnnualEnabled) {
        await prisma.hostingProduct.update({
          where: { id: existing.id },
          data: { freeDomainAnnualEnabled: true },
        });
      }
      continue;
    }

    const hero = heroFromLegacy(entry.slug);
    const isVps = entry.category === "vps";

    await prisma.hostingProduct.create({
      data: {
        slug: entry.slug,
        name: entry.name,
        category: categoryToPrisma(entry.category),
        status: "ACTIVE",
        displayOrder: index,
        canonicalPath: entry.canonicalPath,
        legacyCmsSlug: entry.legacyCmsSlug ?? null,
        pageTemplate: entry.pageTemplate,
        seoRegistrySlug: entry.seoRegistrySlug,
        shortDescription: hero.shortDescription,
        heroTitle: entry.name,
        heroDescription: hero.heroDescription,
        heroCtaLabel: "View plans",
        heroCtaHref: "#plans",
        secondaryCtaLabel: "Talk to sales",
        secondaryCtaHref: "/contact",
        freeDomainAnnualEnabled: INTERNATIONAL_LAUNCH_PRODUCT_SLUGS.includes(
          entry.slug as (typeof INTERNATIONAL_LAUNCH_PRODUCT_SLUGS)[number],
        ),
        sectionFlags: entry.sectionFlags,
        specifications: isVps
          ? (defaultVpsSpecs(entry.slug) as Prisma.InputJsonValue)
          : {},
        benefits: [
          { id: "ssl", label: "Free SSL on every plan" },
          { id: "support", label: "24/7 expert support" },
          { id: "nvme", label: "NVMe-powered infrastructure" },
        ],
        plans: {
          create: planRowsForProduct(entry.slug, isVps).map((row) => {
            const base = {
              planKey: row.planKey,
              planName: row.planName,
              monthlyPrice: row.monthlyPrice,
              yearlyPrice: row.yearlyPrice,
              tagline: row.tagline,
              popular: row.popular,
              sortOrder: row.sortOrder,
              features: row.features,
            };
            if (isVps) return base;
            const web = row as ReturnType<typeof sharedWebPlans>[number] & {
              databases?: string;
            };
            return {
              ...base,
              storage: web.storage ?? undefined,
              bandwidth: web.bandwidth ?? undefined,
              websites: web.websites ?? undefined,
              databases: web.databases ?? undefined,
              ssl: web.ssl ?? undefined,
              backup: web.backup ?? undefined,
              support: web.support ?? undefined,
            };
          }),
        },
      },
    });
  }

  await syncInternationalLaunchPlans();

  for (const slug of INTERNATIONAL_LAUNCH_PRODUCT_SLUGS) {
    await prisma.hostingProduct.updateMany({
      where: { slug },
      data: { status: "ACTIVE" },
    });
  }
}
