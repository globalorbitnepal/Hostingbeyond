import { emailPricePerMonthForTerm } from "@/lib/hosting/business-email-term-pricing";
import { getBusinessEmailPageContent } from "@/lib/orbit/content";

export type BusinessEmailAddonPlan = {
  id: string;
  name: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
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
      monthlyPrice: emailPricePerMonthForTerm(p, "monthly"),
      annualMonthlyPrice: emailPricePerMonthForTerm(p, "12"),
      mailboxesLabel: p.mailboxes,
      storageLabel: p.storage,
    }))
    .filter((p) => p.monthlyPrice > 0 || p.annualMonthlyPrice > 0);
}
