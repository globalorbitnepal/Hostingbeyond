import { getEligibleAddonsForCheckout } from "./for-cart";
import { resolveAddonPriceOptions } from "./pricing";
import type { AddonPriceOption } from "./types";

export type CartAddonUiModel = {
  slug: string;
  name: string;
  description: string;
  billingMode: string;
  options: AddonPriceOption[];
};

export async function loadCartAddonUiModels(ctx: {
  productSlug: string;
  productCategory: import("@prisma/client").HostingProductCategory;
  planKey: string;
}): Promise<CartAddonUiModel[]> {
  const addons = await getEligibleAddonsForCheckout(ctx);
  const models: CartAddonUiModel[] = [];
  for (const addon of addons) {
    const options = await resolveAddonPriceOptions(addon);
    if (options.length === 0) continue;
    models.push({
      slug: addon.slug,
      name: addon.name,
      description: addon.description,
      billingMode: addon.billingMode,
      options,
    });
  }
  return models;
}
