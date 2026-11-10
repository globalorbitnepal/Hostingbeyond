"use client";

import { useMemo, useState } from "react";

import { PlanCard } from "@/components/home/hosting-plans-section";
import { catalogPlanToCms } from "@/components/pricing/catalog-to-cms";
import type { CatalogPlan } from "@/config/pricing-plans";
import type {
  CmsHostingPlan,
  CmsHostingPlansContent,
} from "@/lib/orbit/defaults";
import { annualSaveBadgeLabel } from "@/lib/hosting/annual-save-badge";
import { cn } from "@/lib/utils";

type Billing = "annually" | "monthly";

export function PricingPlanPanel({
  hostingContent,
  plans,
  columns = 4,
  showBillingToggle = true,
  defaultBilling = "annually",
  saveBadge,
  productCheckoutSlug,
}: {
  hostingContent?: CmsHostingPlansContent;
  plans?: CmsHostingPlan[] | CatalogPlan[];
  columns?: 3 | 4;
  showBillingToggle?: boolean;
  defaultBilling?: Billing;
  saveBadge?: string;
  productCheckoutSlug?: string;
}) {
  const [billing, setBilling] = useState<Billing>(defaultBilling);

  const cmsPlans = useMemo(() => {
    if (plans?.length) {
      const list = plans;
      const isCatalog = !("order" in list[0]);
      if (isCatalog) {
        return (list as CatalogPlan[]).map((p, i) => catalogPlanToCms(p, i));
      }
      return list as CmsHostingPlan[];
    }
    const fromCms = [...(hostingContent?.plans ?? [])]
      .filter((p) => p.visible !== false)
      .sort((a, b) => a.order - b.order);
    return fromCms;
  }, [hostingContent?.plans, plans]);

  const monthlyLabel = hostingContent?.monthlyToggleLabel || "Monthly";
  const annualLabel = hostingContent?.annualToggleLabel || "Annually";
  const saveBadgeLabel = annualSaveBadgeLabel(
    billing,
    saveBadge ?? hostingContent?.saveBadge,
  );

  if (!cmsPlans.length) return null;

  const gridClass =
    columns === 3
      ? "sm:grid-cols-2 xl:grid-cols-3"
      : "sm:grid-cols-2 xl:grid-cols-4";

  return (
    <div id="plan-selector" className="scroll-mt-28">
      {showBillingToggle ? (
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2 sm:justify-end">
          <div className="inline-flex items-center rounded-full border border-[#e9e4ff] bg-white p-1 shadow-[0_8px_24px_-12px_rgba(47,28,106,0.25)]">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={cn(
                "min-h-11 touch-manipulation rounded-full px-4 py-2 text-[13px] font-bold transition",
                billing === "monthly"
                  ? "bg-[#2f1c6a] text-white"
                  : "text-[#64748b] hover:text-[#2f1c6a]",
              )}
            >
              {monthlyLabel}
            </button>
            <button
              type="button"
              onClick={() => setBilling("annually")}
              className={cn(
                "min-h-11 touch-manipulation rounded-full px-4 py-2 text-[13px] font-bold transition",
                billing === "annually"
                  ? "bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white"
                  : "text-[#64748b] hover:text-[#2f1c6a]",
              )}
            >
              {annualLabel}
            </button>
          </div>
          {saveBadgeLabel ? (
            <span className="inline-flex min-h-11 items-center rounded-full bg-emerald-50 px-3 py-1.5 text-[12px] font-extrabold text-emerald-800 ring-1 ring-emerald-200">
              {saveBadgeLabel}
            </span>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          "isolate grid grid-cols-1 items-stretch gap-5",
          gridClass,
        )}
      >
        {cmsPlans.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billing={billing}
            delay={0.04 * index}
            productCheckoutSlug={productCheckoutSlug}
          />
        ))}
      </div>
    </div>
  );
}
