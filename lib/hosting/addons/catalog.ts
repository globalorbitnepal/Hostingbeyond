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
