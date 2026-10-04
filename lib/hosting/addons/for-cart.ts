import type { HostingProductCategory } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { ensureHostingAddonsSeeded } from "./catalog";
import { isAddonEligible, parseAddonEligibility } from "./eligibility";
import type { ResolvedHostingAddon } from "./types";

export async function getEligibleAddonsForCheckout(ctx: {
  productSlug: string;
  productCategory: HostingProductCategory;
  planKey: string;
}): Promise<ResolvedHostingAddon[]> {
  try {
    await ensureHostingAddonsSeeded();
    const rows = await prisma.hostingAddon.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
    });

    return rows
      .filter((row) =>
        isAddonEligible(parseAddonEligibility(row.eligibility), ctx),
      )
      .map((row) => ({
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
