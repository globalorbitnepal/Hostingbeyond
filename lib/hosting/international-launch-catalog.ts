/**
 * Shared managed hosting catalog — four named tiers on every product.
 * USD monthly list; annual is 10% off (prepaid) plus a first-year .com.
 */
export type InternationalLaunchPlan = {
  planKey: string;
  planName: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
  tagline: string;
  features: string[];
  storage: string;
  websites: string;
  databases: string;
  ssl: string;
  backup: string;
};

export type InternationalLaunchProduct = {
  slug: string;
  plans: InternationalLaunchPlan[];
};

const included = "Included";

/** 10% annual prepaid discount, two-decimal USD. */
export function annualTotalFromMonthly(monthly: number) {
  return Math.round(monthly * 12 * 0.9 * 100) / 100;
}

function plan(
  partial: Omit<InternationalLaunchPlan, "yearlyPrice"> & {
    yearlyPrice?: number;
  },
): InternationalLaunchPlan {
  return {
    ...partial,
    yearlyPrice:
      partial.yearlyPrice ?? annualTotalFromMonthly(partial.monthlyPrice),
  };
}

export const INTERNATIONAL_LAUNCH_PRODUCT_SLUGS = [
  "web-hosting",
  "wordpress-hosting",
  "ecommerce-hosting",
  "nodejs-hosting",
  "laravel-hosting",
] as const;

export const SHARED_HOSTING_PLAN_KEYS = [
  "starter",
  "growth",
  "business",
  "professional",
] as const;

export const INTERNATIONAL_LAUNCH_CATALOG: InternationalLaunchProduct[] = [
  {
    slug: "web-hosting",
    plans: [
      plan({
        planKey: "starter",
        planName: "Starter",
        monthlyPrice: 3.99,
        tagline: "Personal sites and first launches.",
        storage: "10 GB NVMe",
        websites: "1",
        databases: "2 MySQL / 1 PostgreSQL",
        ssl: included,
        backup: "Weekly",
        features: [
          "1 website",
          "10 GB NVMe storage",
          "1 GB RAM · 1 vCPU",
          "2 MySQL + 1 PostgreSQL",
          "File Manager, FTP/SFTP, DNS",
          "PHP version manager",
          "SSL included",
          "Weekly backups",
        ],
      }),
      plan({
        planKey: "growth",
        planName: "Growth",
        monthlyPrice: 6.99,
        tagline: "Multiple sites for growing brands.",
        storage: "25 GB NVMe",
        websites: "5",
        databases: "10 MySQL / 3 PostgreSQL",
        ssl: included,
        backup: "Weekly",
        features: [
          "5 websites",
          "25 GB NVMe storage",
          "2 GB RAM · 2 vCPU",
          "10 MySQL + 3 PostgreSQL",
          "File Manager, FTP/SFTP, DNS",
          "PHP version manager",
          "SSL included",
          "Weekly backups",
        ],
      }),
      plan({
        planKey: "business",
        planName: "Business",
        monthlyPrice: 11.99,
        popular: true,
        tagline: "Professional sites with SSH and daily backups.",
        storage: "50 GB NVMe",
        websites: "15",
        databases: "25 MySQL / 10 PostgreSQL",
        ssl: included,
        backup: "Daily",
        features: [
          "15 websites",
          "50 GB NVMe storage",
          "3 GB RAM · 2 vCPU",
          "25 MySQL + 10 PostgreSQL",
          "SSH access",
          "Daily backups",
          "File Manager, DNS, PHP manager",
          "SSL included",
        ],
      }),
      plan({
        planKey: "professional",
        planName: "Professional",
        monthlyPrice: 18.99,
        tagline: "High-resource sites and developer workflows.",
        storage: "100 GB NVMe",
        websites: "30",
        databases: "50 MySQL / 20 PostgreSQL",
        ssl: included,
        backup: "Daily",
        features: [
          "30 websites",
          "100 GB NVMe storage",
          "4 GB RAM · 4 vCPU",
          "50 MySQL + 20 PostgreSQL",
          "SSH access",
          "Daily backups",
          "File Manager, DNS, PHP manager",
          "SSL included",
        ],
      }),
    ],
  },
  {
    slug: "wordpress-hosting",
    plans: [
      plan({
        planKey: "starter",
        planName: "Starter",
        monthlyPrice: 4.99,
        tagline: "One WordPress site, one-click install.",
        storage: "10 GB NVMe",
        websites: "1",
        databases: "2 MySQL / 1 PostgreSQL",
        ssl: included,
        backup: "Weekly",
        features: [
          "1 WordPress website",
          "10 GB NVMe storage",
          "1 GB RAM · 1 vCPU",
          "One-click WordPress install",
          "WordPress File Manager",
          "SSL included",
          "Weekly WordPress backups",
        ],
      }),
      plan({
        planKey: "growth",
        planName: "Growth",
        monthlyPrice: 7.99,
        tagline: "Agencies and content teams with several sites.",
        storage: "25 GB NVMe",
        websites: "5",
        databases: "10 MySQL / 3 PostgreSQL",
        ssl: included,
        backup: "Weekly",
        features: [
          "5 WordPress websites",
          "25 GB NVMe storage",
          "2 GB RAM · 2 vCPU",
          "One-click WordPress install",
          "WordPress File Manager",
          "SSL included",
          "Weekly WordPress backups",
        ],
      }),
      plan({
        planKey: "business",
        planName: "Business",
        monthlyPrice: 12.99,
        popular: true,
        tagline: "Staging, WP-CLI, and daily backups.",
        storage: "50 GB NVMe",
        websites: "15",
        databases: "25 MySQL / 10 PostgreSQL",
        ssl: included,
        backup: "Daily",
        features: [
          "15 WordPress websites",
          "50 GB NVMe storage",
          "3 GB RAM · 2 vCPU",
          "SSH / WP-CLI",
          "Staging environment",
          "Daily WordPress backups",
          "SSL included",
        ],
      }),
      plan({
        planKey: "professional",
        planName: "Professional",
        monthlyPrice: 19.99,
        tagline: "Highest WordPress capacity for publishers.",
        storage: "100 GB NVMe",
        websites: "30",
        databases: "50 MySQL / 20 PostgreSQL",
        ssl: included,
        backup: "Daily",
        features: [
          "30 WordPress websites",
          "100 GB NVMe storage",
          "4 GB RAM · 4 vCPU",
          "SSH / WP-CLI",
          "Staging environment",
          "Daily WordPress backups",
          "SSL included",
        ],
      }),
    ],
  },
  {
    slug: "ecommerce-hosting",
    plans: [
      plan({
        planKey: "starter",
        planName: "Starter",
        monthlyPrice: 7.99,
        tagline: "Launch a WooCommerce store without a VPS.",
        storage: "15 GB NVMe",
        websites: "1",
        databases: "5 MySQL / 1 PostgreSQL",
        ssl: included,
        backup: "Daily",
        features: [
          "1 online store",
          "15 GB NVMe storage",
          "2 GB RAM · 1 vCPU",
          "WooCommerce ready",
          "File Manager",
          "SSL included",
          "Daily backups",
        ],
      }),
      plan({
        planKey: "growth",
        planName: "Growth",
        monthlyPrice: 12.99,
        tagline: "A second storefront plus staging.",
        storage: "30 GB NVMe",
        websites: "2",
        databases: "15 MySQL / 3 PostgreSQL",
        ssl: included,
        backup: "Daily",
        features: [
          "2 online stores",
          "30 GB NVMe storage",
          "3 GB RAM · 2 vCPU",
          "WooCommerce ready",
          "Staging environment",
          "SSL included",
          "Daily backups",
        ],
      }),
      plan({
        planKey: "business",
        planName: "Business",
        monthlyPrice: 19.99,
        popular: true,
        tagline: "SSH, Git, and more catalog headroom.",
        storage: "60 GB NVMe",
        websites: "5",
        databases: "30 MySQL / 10 PostgreSQL",
        ssl: included,
        backup: "Daily",
        features: [
          "5 online stores",
          "60 GB NVMe storage",
          "4 GB RAM · 3 vCPU",
          "SSH + Git deployment",
          "Staging environment",
          "SSL included",
          "Daily backups",
        ],
      }),
      plan({
        planKey: "professional",
        planName: "Professional",
        monthlyPrice: 29.99,
        tagline: "Serious shops with 8 GB RAM and 10 stores.",
        storage: "120 GB NVMe",
        websites: "10",
        databases: "60 MySQL / 20 PostgreSQL",
        ssl: included,
        backup: "Daily",
        features: [
          "10 online stores",
          "120 GB NVMe storage",
          "8 GB RAM · 4 vCPU",
          "SSH + Git deployment",
          "Staging environment",
          "SSL included",
          "Daily backups",
        ],
      }),
    ],
  },
  {
    slug: "nodejs-hosting",
    plans: [
      plan({
        planKey: "starter",
        planName: "Starter",
        monthlyPrice: 7.99,
        tagline: "Node.js, Next.js, NestJS, and Express apps.",
        storage: "10 GB NVMe",
        websites: "1",
        databases: "2 MySQL / 1 PostgreSQL",
        ssl: included,
        backup: "Weekly",
        features: [
          "1 application",
          "10 GB NVMe storage",
          "1 GB RAM · 1 vCPU",
          "SSH + Git deployment",
          "npm / pnpm + env vars",
          "SSL and custom domains",
          "Weekly backups",
        ],
      }),
      plan({
        planKey: "growth",
        planName: "Growth",
        monthlyPrice: 12.99,
        tagline: "A few production apps with more RAM.",
        storage: "25 GB NVMe",
        websites: "3",
        databases: "10 MySQL / 3 PostgreSQL",
        ssl: included,
        backup: "Weekly",
        features: [
          "3 applications",
          "25 GB NVMe storage",
          "2 GB RAM · 2 vCPU",
          "SSH + Git deployment",
          "npm / pnpm + env vars",
          "SSL and custom domains",
          "Weekly backups",
        ],
      }),
      plan({
        planKey: "business",
        planName: "Business",
        monthlyPrice: 19.99,
        popular: true,
        tagline: "APIs and Next.js apps with daily backups.",
        storage: "50 GB NVMe",
        websites: "10",
        databases: "25 MySQL / 10 PostgreSQL",
        ssl: included,
        backup: "Daily",
        features: [
          "10 applications",
          "50 GB NVMe storage",
          "4 GB RAM · 3 vCPU",
          "SSH + Git deployment",
          "Process + log manager",
          "SSL and custom domains",
          "Daily backups",
        ],
      }),
      plan({
        planKey: "professional",
        planName: "Professional",
        monthlyPrice: 32.99,
        tagline: "Highest Node.js capacity for busy APIs.",
        storage: "100 GB NVMe",
        websites: "20",
        databases: "50 MySQL / 20 PostgreSQL",
        ssl: included,
        backup: "Daily",
        features: [
          "20 applications",
          "100 GB NVMe storage",
          "8 GB RAM · 4 vCPU",
          "SSH + Git deployment",
          "Process + log manager",
          "SSL and custom domains",
          "Daily backups",
        ],
      }),
    ],
  },
  {
    slug: "laravel-hosting",
    plans: [
      plan({
        planKey: "starter",
        planName: "Starter",
        monthlyPrice: 6.99,
        tagline: "PHP and Laravel with Composer and SSH.",
        storage: "10 GB NVMe",
        websites: "1",
        databases: "2 MySQL / 1 PostgreSQL",
        ssl: included,
        backup: "Weekly",
        features: [
          "1 website",
          "10 GB NVMe storage",
          "1 GB RAM · 1 vCPU",
          "SSH + Composer + Git",
          "PHP version manager",
          "Laravel Artisan",
          "SSL included",
          "Weekly backups",
        ],
      }),
      plan({
        planKey: "growth",
        planName: "Growth",
        monthlyPrice: 10.99,
        tagline: "Several PHP apps with more storage.",
        storage: "25 GB NVMe",
        websites: "5",
        databases: "10 MySQL / 3 PostgreSQL",
        ssl: included,
        backup: "Weekly",
        features: [
          "5 websites",
          "25 GB NVMe storage",
          "2 GB RAM · 2 vCPU",
          "SSH + Composer + Git",
          "PHP version manager",
          "Laravel Artisan",
          "SSL included",
          "Weekly backups",
        ],
      }),
      plan({
        planKey: "business",
        planName: "Business",
        monthlyPrice: 17.99,
        popular: true,
        tagline: "Queues, cron, and daily backups for Laravel.",
        storage: "50 GB NVMe",
        websites: "15",
        databases: "25 MySQL / 10 PostgreSQL",
        ssl: included,
        backup: "Daily",
        features: [
          "15 websites",
          "50 GB NVMe storage",
          "4 GB RAM · 3 vCPU",
          "SSH + Composer + Git",
          "Cron and queue workers",
          "Laravel Artisan",
          "SSL included",
          "Daily backups",
        ],
      }),
      plan({
        planKey: "professional",
        planName: "Professional",
        monthlyPrice: 27.99,
        tagline: "Maximum PHP/Laravel capacity.",
        storage: "100 GB NVMe",
        websites: "30",
        databases: "50 MySQL / 20 PostgreSQL",
        ssl: included,
        backup: "Daily",
        features: [
          "30 websites",
          "100 GB NVMe storage",
          "6 GB RAM · 4 vCPU",
          "SSH + Composer + Git",
          "Cron and queue workers",
          "Laravel Artisan",
          "SSL included",
          "Daily backups",
        ],
      }),
    ],
  },
];

export function catalogForSlug(
  slug: string,
): InternationalLaunchProduct | undefined {
  return INTERNATIONAL_LAUNCH_CATALOG.find((p) => p.slug === slug);
}

export function webHostingLaunchPlans(): InternationalLaunchPlan[] {
  return catalogForSlug("web-hosting")!.plans;
}
