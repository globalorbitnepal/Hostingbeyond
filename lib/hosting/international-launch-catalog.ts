/**
 * International launch hosting catalog — single source for Orbit DB plans,
 * homepage defaults, and customer checkout (USD, 20% annual discount).
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

const free = "Free";

function plan(partial: InternationalLaunchPlan): InternationalLaunchPlan {
  return partial;
}

export const INTERNATIONAL_LAUNCH_PRODUCT_SLUGS = [
  "web-hosting",
  "wordpress-hosting",
  "ecommerce-hosting",
  "nodejs-hosting",
  "laravel-hosting",
] as const;

export const INTERNATIONAL_LAUNCH_CATALOG: InternationalLaunchProduct[] = [
  {
    slug: "web-hosting",
    plans: [
      plan({
        planKey: "starter",
        planName: "Starter",
        monthlyPrice: 2.99,
        yearlyPrice: 28.7,
        tagline: "One site, essentials to go live.",
        storage: "10 GB NVMe",
        websites: "1",
        databases: "2",
        ssl: free,
        backup: "Weekly",
        features: [
          "1 Website",
          "10 GB NVMe storage",
          "1 GB RAM",
          "1 vCPU",
          "2 Databases",
          "Free SSL",
          "Weekly backups",
        ],
      }),
      plan({
        planKey: "business",
        planName: "Business",
        monthlyPrice: 4.99,
        yearlyPrice: 47.9,
        popular: true,
        tagline: "More sites and daily backups for growing brands.",
        storage: "25 GB NVMe",
        websites: "10",
        databases: "10",
        ssl: free,
        backup: "Daily",
        features: [
          "10 Websites",
          "25 GB NVMe storage",
          "2 GB RAM",
          "2 vCPU",
          "10 Databases",
          "Free SSL",
          "Daily backups",
        ],
      }),
      plan({
        planKey: "professional",
        planName: "Professional",
        monthlyPrice: 8.99,
        yearlyPrice: 86.3,
        tagline: "Higher limits for busy sites and teams.",
        storage: "50 GB NVMe",
        websites: "25",
        databases: "25",
        ssl: free,
        backup: "Daily",
        features: [
          "25 Websites",
          "50 GB NVMe storage",
          "3 GB RAM",
          "2 vCPU",
          "25 Databases",
          "Free SSL",
          "Daily backups",
        ],
      }),
    ],
  },
  {
    slug: "wordpress-hosting",
    plans: [
      plan({
        planKey: "wp-starter",
        planName: "WP Starter",
        monthlyPrice: 2.99,
        yearlyPrice: 28.7,
        tagline: "Launch a single WordPress site fast.",
        storage: "10 GB NVMe",
        websites: "1",
        databases: "2",
        ssl: free,
        backup: "Weekly",
        features: [
          "1 Website",
          "10 GB NVMe storage",
          "1 GB RAM",
          "1 vCPU",
          "WordPress installer",
          "Free SSL",
          "Weekly backups",
          "Basic WordPress cache",
        ],
      }),
      plan({
        planKey: "wp-business",
        planName: "WP Business",
        monthlyPrice: 5.99,
        yearlyPrice: 57.5,
        popular: true,
        tagline: "Multiple WordPress sites with advanced cache.",
        storage: "25 GB NVMe",
        websites: "5",
        databases: "10",
        ssl: free,
        backup: "Daily",
        features: [
          "5 Websites",
          "25 GB NVMe storage",
          "2 GB RAM",
          "2 vCPU",
          "WordPress installer",
          "Free SSL",
          "Daily backups",
          "Advanced WordPress cache",
        ],
      }),
      plan({
        planKey: "wp-pro",
        planName: "WP Pro",
        monthlyPrice: 9.99,
        yearlyPrice: 95.9,
        tagline: "Pro limits for agencies and busy stores.",
        storage: "50 GB NVMe",
        websites: "15",
        databases: "25",
        ssl: free,
        backup: "Daily",
        features: [
          "15 Websites",
          "50 GB NVMe storage",
          "3 GB RAM",
          "2 vCPU",
          "WordPress installer",
          "Free SSL",
          "Daily backups",
          "Advanced WordPress cache",
        ],
      }),
    ],
  },
  {
    slug: "ecommerce-hosting",
    plans: [
      plan({
        planKey: "store-starter",
        planName: "Store Starter",
        monthlyPrice: 5.99,
        yearlyPrice: 57.5,
        tagline: "First WooCommerce store on reliable NVMe.",
        storage: "15 GB NVMe",
        websites: "1",
        databases: "5",
        ssl: free,
        backup: "Weekly",
        features: [
          "1 Store",
          "15 GB NVMe storage",
          "2 GB RAM",
          "2 vCPU",
          "5 Databases",
          "SSL",
          "Weekly backups",
          "WooCommerce",
        ],
      }),
      plan({
        planKey: "store-business",
        planName: "Store Business",
        monthlyPrice: 9.99,
        yearlyPrice: 95.9,
        popular: true,
        tagline: "Run multiple storefronts with daily backups.",
        storage: "30 GB NVMe",
        websites: "3",
        databases: "15",
        ssl: free,
        backup: "Daily",
        features: [
          "3 Stores",
          "30 GB NVMe storage",
          "3 GB RAM",
          "2 vCPU",
          "15 Databases",
          "SSL",
          "Daily backups",
          "WooCommerce",
        ],
      }),
      plan({
        planKey: "store-pro",
        planName: "Store Pro",
        monthlyPrice: 14.99,
        yearlyPrice: 143.9,
        tagline: "Highest catalog limits for scaling sellers.",
        storage: "60 GB NVMe",
        websites: "5",
        databases: "30",
        ssl: free,
        backup: "Daily",
        features: [
          "5 Stores",
          "60 GB NVMe storage",
          "4 GB RAM",
          "3 vCPU",
          "30 Databases",
          "SSL",
          "Daily backups",
          "WooCommerce",
        ],
      }),
    ],
  },
  {
    slug: "nodejs-hosting",
    plans: [
      plan({
        planKey: "node-starter",
        planName: "Node Starter",
        monthlyPrice: 4.99,
        yearlyPrice: 47.9,
        tagline: "Deploy Node.js, NestJS, or Next.js apps.",
        storage: "10 GB NVMe",
        websites: "1",
        databases: "2",
        ssl: free,
        backup: "Weekly",
        features: [
          "1 Application",
          "10 GB NVMe storage",
          "1 GB RAM",
          "1 vCPU",
          "Git deployment",
          "Environment variables",
          "SSL",
          "Process management",
          "Basic logs",
        ],
      }),
      plan({
        planKey: "node-business",
        planName: "Node Business",
        monthlyPrice: 7.99,
        yearlyPrice: 76.7,
        popular: true,
        tagline: "More apps with advanced logging.",
        storage: "25 GB NVMe",
        websites: "3",
        databases: "10",
        ssl: free,
        backup: "Daily",
        features: [
          "3 Applications",
          "25 GB NVMe storage",
          "2 GB RAM",
          "2 vCPU",
          "Git deployment",
          "Environment variables",
          "SSL",
          "Process management",
          "Advanced logs",
        ],
      }),
      plan({
        planKey: "node-pro",
        planName: "Node Pro",
        monthlyPrice: 12.99,
        yearlyPrice: 124.7,
        tagline: "Production headroom for busy APIs.",
        storage: "50 GB NVMe",
        websites: "5",
        databases: "25",
        ssl: free,
        backup: "Daily",
        features: [
          "5 Applications",
          "50 GB NVMe storage",
          "4 GB RAM",
          "2 vCPU",
          "Git deployment",
          "Environment variables",
          "SSL",
          "Process management",
          "Advanced logs",
        ],
      }),
    ],
  },
  {
    slug: "laravel-hosting",
    plans: [
      plan({
        planKey: "php-starter",
        planName: "PHP Starter",
        monthlyPrice: 3.99,
        yearlyPrice: 38.3,
        tagline: "PHP sites with Composer and limited SSH.",
        storage: "10 GB NVMe",
        websites: "1",
        databases: "2",
        ssl: free,
        backup: "Weekly",
        features: [
          "1 Website",
          "10 GB NVMe storage",
          "1 GB RAM",
          "1 vCPU",
          "Supported PHP versions",
          "Composer",
          "Limited SSH",
          "Laravel Artisan",
          "SSL",
          "Weekly backups",
        ],
      }),
      plan({
        planKey: "laravel-business",
        planName: "Laravel Business",
        monthlyPrice: 6.99,
        yearlyPrice: 67.1,
        popular: true,
        tagline: "Full SSH for Laravel teams.",
        storage: "25 GB NVMe",
        websites: "5",
        databases: "15",
        ssl: free,
        backup: "Daily",
        features: [
          "5 Websites",
          "25 GB NVMe storage",
          "2 GB RAM",
          "2 vCPU",
          "Supported PHP versions",
          "Composer",
          "SSH",
          "Laravel Artisan",
          "SSL",
          "Daily backups",
        ],
      }),
      plan({
        planKey: "php-pro",
        planName: "PHP Pro",
        monthlyPrice: 11.99,
        yearlyPrice: 115.1,
        tagline: "Maximum PHP/Laravel capacity.",
        storage: "50 GB NVMe",
        websites: "15",
        databases: "30",
        ssl: free,
        backup: "Daily",
        features: [
          "15 Websites",
          "50 GB NVMe storage",
          "3 GB RAM",
          "2 vCPU",
          "Supported PHP versions",
          "Composer",
          "SSH",
          "Laravel Artisan",
          "SSL",
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
