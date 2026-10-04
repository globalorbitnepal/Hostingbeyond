import { getBusinessEmailPageContent } from "@/lib/orbit/content";

import { parseUsdPrice } from "./parse-price";

export type BusinessEmailAddonPlan = {
  id: string;
  name: string;
  monthlyPrice: number;
  mailboxesLabel: string;
  storageLabel: string;
};

export async function getBusinessEmailAddonPlans(): Promise<
  BusinessEmailAddonPlan[]
> {
  const content = await getBusinessEmailPageContent();
  return content.plans
    .filter((p) => p.visible)
    .map((p) => ({
      id: p.id,
      name: p.name,
      monthlyPrice: parseUsdPrice(p.price),
      mailboxesLabel: p.mailboxes,
      storageLabel: p.storage,
    }))
    .filter((p) => p.monthlyPrice > 0);
}
