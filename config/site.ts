/**
 * Site-wide configuration for HostingBeyond.
 */

export const siteConfig = {
  name: "HostingBeyond",
  tagline: "Beyond Hosting, Beyond Possibilities",
  description:
    "Premium domains, blazing-fast hosting, and secure business email — everything you need to build, grow, and succeed online.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://hosting.theglobalorbit.com",
  locale: "en_US",
  twitterHandle: "@hostingbeyond",
} as const;

export type SiteConfig = typeof siteConfig;
