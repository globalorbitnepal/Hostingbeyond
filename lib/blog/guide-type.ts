import type { BlogGuideType } from "@prisma/client";

const LABELS: Record<BlogGuideType, string> = {
  HOW_TO: "How-To",
  STEP_BY_STEP: "Step-by-Step",
  BEGINNER_GUIDE: "Beginner Guide",
  TROUBLESHOOTING: "Troubleshooting",
  BEST_PRACTICES: "Best Practices",
  EXPLAINER: "Explainer",
  CHECKLIST: "Checklist",
};

const SHORT_BADGE: Record<BlogGuideType, string> = {
  HOW_TO: "HOW TO",
  STEP_BY_STEP: "GUIDE",
  BEGINNER_GUIDE: "GUIDE",
  TROUBLESHOOTING: "FIX",
  BEST_PRACTICES: "GUIDE",
  EXPLAINER: "GUIDE",
  CHECKLIST: "CHECKLIST",
};

export function guideTypeLabel(type: BlogGuideType | null | undefined) {
  if (!type) return null;
  return LABELS[type];
}

export function guideTypeBadge(type: BlogGuideType | null | undefined) {
  if (!type) return null;
  return SHORT_BADGE[type];
}

export const GUIDE_TYPE_OPTIONS: { value: BlogGuideType; label: string }[] = [
  { value: "HOW_TO", label: LABELS.HOW_TO },
  { value: "STEP_BY_STEP", label: LABELS.STEP_BY_STEP },
  { value: "BEGINNER_GUIDE", label: LABELS.BEGINNER_GUIDE },
  { value: "TROUBLESHOOTING", label: LABELS.TROUBLESHOOTING },
  { value: "BEST_PRACTICES", label: LABELS.BEST_PRACTICES },
  { value: "EXPLAINER", label: LABELS.EXPLAINER },
  { value: "CHECKLIST", label: LABELS.CHECKLIST },
];
