/** Recommended upload sizes shown in Orbit → Domains image fields. */
export const DOMAIN_FRAME_SPECS = {
  showcaseRegistrar: "560 × 640 px (4:5) — left tall bento visual",
  showcasePrivacy: "960 × 480 px (2:1) — wide privacy photo",
  showcaseSupport: "560 × 400 px (7:5) — support / human photo",
  showcaseSetup: "400 × 400 px (1:1) — setup visual",
  popularTldCard: "520 × 280 px (≈16:9) — top banner inside each TLD card",
  guidePillar: "600 × 720 px (5:6) — full pillar card background",
} as const;

export function showcaseImageSpecLabel(
  layout: "registrar" | "privacy" | "support" | "setup",
): string {
  switch (layout) {
    case "registrar":
      return DOMAIN_FRAME_SPECS.showcaseRegistrar;
    case "privacy":
      return DOMAIN_FRAME_SPECS.showcasePrivacy;
    case "support":
      return DOMAIN_FRAME_SPECS.showcaseSupport;
    case "setup":
      return DOMAIN_FRAME_SPECS.showcaseSetup;
    default:
      return DOMAIN_FRAME_SPECS.showcaseRegistrar;
  }
}
