import { prisma } from "@/lib/prisma";

import { parseAddonEligibility } from "./eligibility";
import type { ResolvedHostingAddon } from "./types";

const DEFAULT_BUSINESS_EMAIL_ADDON = {
  slug: "business-email",
  name: "Business Email",
  description: "Professional email for your domain.",
  type: "BUSINESS_EMAIL" as const,
  displayOrder: 10,
  billingMode: "MATCH_HOSTING" as const,
  pricingReference: "cms:business-email",
  eligibility: {
    productCategories: ["WEBSITE", "BUSINESS"],
  },
};

const DEFAULT_STORAGE_ADDON = {
  slug: "extra-storage",
  name: "Extra NVMe storage",
  description:
    "Add 10–100 GB NVMe to this plan. Billed monthly with auto-renew, or pay annually.",
  type: "STORAGE" as const,
  displayOrder: 20,
  billingMode: "MONTHLY" as const,
  pricingReference: "storage-nvme-tiers",
  eligibility: { productCategories: ["WEBSITE", "DEVELOPER"] },
};

const LEGACY_STORAGE_SLUGS = [
  "storage-10gb",
  "storage-25gb",
  "storage-50gb",
  "storage-100gb",
];

export async function ensureHostingAddonsSeeded() {
  try {
    await prisma.hostingAddon.findFirst();
  } catch {
    return;
  }

  const existing = await prisma.hostingAddon.findUnique({
    where: { slug: DEFAULT_BUSINESS_EMAIL_ADDON.slug },
  });
  if (!existing) {
    await prisma.hostingAddon.create({
      data: {
        ...DEFAULT_BUSINESS_EMAIL_ADDON,
        active: true,
        eligibility: DEFAULT_BUSINESS_EMAIL_ADDON.eligibility,
      },
    });
  }

  const storage = await prisma.hostingAddon.findUnique({
    where: { slug: DEFAULT_STORAGE_ADDON.slug },
  });
  if (!storage) {
    await prisma.hostingAddon.create({
      data: {
        ...DEFAULT_STORAGE_ADDON,
        active: true,
        eligibility: DEFAULT_STORAGE_ADDON.eligibility,
      },
    });
  } else if (
    !storage.active ||
    storage.pricingReference !== "storage-nvme-tiers"
  ) {
    await prisma.hostingAddon.update({
      where: { slug: DEFAULT_STORAGE_ADDON.slug },
      data: {
        active: true,
        name: DEFAULT_STORAGE_ADDON.name,
        description: DEFAULT_STORAGE_ADDON.description,
        pricingReference: DEFAULT_STORAGE_ADDON.pricingReference,
        billingMode: DEFAULT_STORAGE_ADDON.billingMode,
      },
    });
  }

  await prisma.hostingAddon.updateMany({
    where: { slug: { in: LEGACY_STORAGE_SLUGS } },
    data: { active: false },
  });
}

export async function listActiveHostingAddons(): Promise<
  ResolvedHostingAddon[]
> {
  try {
    await ensureHostingAddonsSeeded();
    const rows = await prisma.hostingAddon.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
    });
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      type: row.type,
      billingMode: row.billingMode,
      pricingReference: row.pricingReference,
      displayOrder: row.displayOrder,
    }));
  } catch {
    return [];
  }
}

export async function listHostingAddonsForAdmin() {
  try {
    await ensureHostingAddonsSeeded();
    return await prisma.hostingAddon.findMany({
      orderBy: { displayOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function updateHostingAddon(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    active: boolean;
    displayOrder: number;
    eligibility: unknown;
  }>,
) {
  return prisma.hostingAddon.update({
    where: { id },
    data: {
      ...data,
      eligibility: data.eligibility as object | undefined,
    },
  });
}

export function addonEligibilityFromRow(row: { eligibility: unknown }) {
  return parseAddonEligibility(row.eligibility);
}
