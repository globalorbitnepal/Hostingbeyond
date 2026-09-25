export const BUSINESS_EMAIL_FRAME_SPECS = {
  aiFeatureCard:
    "800 × 500 px (16:10) — full card background (Work smarter with AI)",
  impressionPhoto: "1400 × 933 px (3:2) — impression tab photo (right panel)",
  migrateImage: "1600 × 900 px (16:9) — migration band image",
  marketingImage: "1600 × 692 px — marketing band image",
  reviewAvatar: "88 × 88 px (1:1) — testimonial profile photo",
  supportTile: "400 × 480 px (5:6) — purple support tile background",
} as const;

export const BUSINESS_EMAIL_IMAGE_GUIDE = Object.values(
  BUSINESS_EMAIL_FRAME_SPECS,
).join(" · ");
