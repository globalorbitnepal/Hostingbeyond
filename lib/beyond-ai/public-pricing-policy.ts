import { BEYOND_AI_PUBLIC_ENABLED } from "@/config/beyond-ai-public";
import type { CmsPricingPageContent } from "@/lib/orbit/pricing-content";

export function applyBeyondAiPublicPricingPolicy(
  content: CmsPricingPageContent,
): CmsPricingPageContent {
  if (BEYOND_AI_PUBLIC_ENABLED) return content;

  return {
    ...content,
    categories: content.categories.map((category) =>
      category.id === "ai-builder" ? { ...category, visible: false } : category,
    ),
    trustPills: content.trustPills.map((pill) =>
      pill.id === "ai" ? { ...pill, visible: false } : pill,
    ),
  };
}
