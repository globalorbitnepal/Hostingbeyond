import type { CmsHostingPlansContent } from "@/lib/orbit/defaults";
import type { CmsPricingPageContent } from "@/lib/orbit/pricing-content";

/** Pricing ecommerce tiers for the dedicated ecommerce landing page. */
export function ecommercePlansSection(
  pricing: CmsPricingPageContent,
): CmsHostingPlansContent {
  return {
    visible: true,
    eyebrow: "",
    title: "",
    titleAccent: "",
    description: "",
    supportLabel: "24/7 commerce support",
    supportHint: "Checkout & DNS help",
    activationLabel: "Instant provisioning",
    activationHint: "Store live in minutes",
    uptimeLabel: "99.9% uptime",
    uptimeHint: "Monitored NVMe stack",
    scaleLabel: "Upgrade as you sell",
    scaleHint: "More RAM & products",
    saveBadge: "Save on annual",
    annualToggleLabel: "Annually",
    monthlyToggleLabel: "Monthly",
    defaultBilling: "annually",
    plans: pricing.ecommercePlans,
    guarantees: [],
  };
}
