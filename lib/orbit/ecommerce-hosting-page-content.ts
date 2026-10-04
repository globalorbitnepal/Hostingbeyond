import { routes } from "@/config/routes";

import {
  type CmsHostingPageContent,
  mergeHostingPageContent,
} from "@/lib/orbit/hosting-page-content";

export function defaultEcommerceHostingPageContent(): CmsHostingPageContent {
  return {
    heroEyebrow: "Ecommerce hosting",
    heroTitle: "WooCommerce hosting",
    heroTitleAccent: "built to sell.",
    heroDescription:
      "Launch and scale online stores on NVMe — WooCommerce-optimized PHP, free SSL checkout, abandoned-cart tools on higher tiers, and 24/7 commerce support.",
    heroPrimaryLabel: "View store plans",
    heroPrimaryHref: "#plans",
    heroSecondaryLabel: "Compare all pricing",
    heroSecondaryHref: routes.pricing,
    heroPromo: "Store plans priced ~5% below typical market promos",

    pricingEyebrow: "Ecommerce plans",
    pricingTitle: "Choose your",
    pricingTitleAccent: "store package",
    pricingDescription:
      "Commerce Essential through Enterprise — product limits, RAM, and backups scale with your catalog and campaign traffic.",
    pricingNote:
      "Promotional rates apply to the first term. Renewal pricing is always shown before checkout.",

    featuresEyebrow: "Sell online",
    featuresHeading: "Checkout-ready from day one",
    featuresDescription:
      "Secure payments, fast product pages, and room to grow — without juggling separate hosting and SSL vendors.",
    features: [
      {
        id: "woo",
        visible: true,
        title: "WooCommerce optimized",
        description:
          "Tuned PHP, MariaDB, and caching for carts, plugins, and peak sale days.",
        icon: "server",
      },
      {
        id: "ssl",
        visible: true,
        title: "Free SSL checkout",
        description:
          "HTTPS on your storefront with automatic certificate renewal.",
        icon: "shield",
      },
      {
        id: "nvme",
        visible: true,
        title: "NVMe storefront speed",
        description:
          "Fast disks so category and product pages stay snappy on mobile.",
        icon: "zap",
      },
      {
        id: "cart",
        visible: true,
        title: "Cart recovery tools",
        description:
          "Higher tiers include abandoned-cart email features to win back sales.",
        icon: "sparkles",
      },
      {
        id: "scale",
        visible: true,
        title: "Scale with traffic",
        description:
          "Upgrade RAM and storage as catalogs, ads, and subscriptions grow.",
        icon: "globe",
      },
      {
        id: "support",
        visible: true,
        title: "Commerce support 24/7",
        description:
          "Real humans for DNS, SSL, migrations, and checkout issues.",
        icon: "mail",
      },
    ],

    wordpressHeading: "Payments, catalog & campaigns",
    wordpressDescription:
      "Run WooCommerce or connect your stack — staging-friendly updates, daily backups on higher plans, and free migration on Commerce Plus and above.",
    wordpressBullets: [
      "Secure checkout with free SSL",
      "Product limits from 100 to unlimited",
      "Free store migration on eligible plans",
      "Mailboxes for order and support email",
    ],
    wordpressCtaLabel: "Start your online store",
    wordpressCtaHref: routes.getStarted,
    wordpressImage: "",

    compareHeading: "Why HostingBeyond for ecommerce?",
    compareDescription:
      "Transparent store pricing with NVMe, SSL, and AI credits — not hidden checkout fees.",
    compareBullets: [
      "WooCommerce-ready on every commerce tier",
      "NVMe storage — not legacy spinning disks",
      "Domains, mail, hosting & AI in one account",
      "Human support when checkout or DNS breaks",
    ],

    faqHeading: "Ecommerce hosting FAQs",
    faqDescription:
      "WooCommerce, payments, migrations, and billing — answered clearly.",
    faqs: [
      {
        id: "woo",
        visible: true,
        question: "Is WooCommerce included?",
        answer:
          "Yes. Install WooCommerce in one click from your panel. Commerce plans include optimized PHP memory and database headroom for catalogs and checkout plugins.",
      },
      {
        id: "ssl",
        visible: true,
        question: "Is SSL free for my store?",
        answer:
          "Every commerce plan includes free SSL so checkout and customer accounts load over HTTPS with automatic renewal.",
      },
      {
        id: "migrate",
        visible: true,
        question: "Can you migrate my existing store?",
        answer:
          "Free assisted migration is included on Commerce Plus, Cloud, and Enterprise. Share your current host access and we move files and database with minimal downtime.",
      },
      {
        id: "products",
        visible: true,
        question: "How many products can I list?",
        answer:
          "Commerce Essential supports 100 products, Plus supports 500, and Cloud/Enterprise support unlimited products. Upgrade anytime from your panel.",
      },
      {
        id: "email",
        visible: true,
        question: "Can I use branded order email?",
        answer:
          "Yes. Add mailboxes on your domain for orders and support, or connect HostingBeyond Mail in the same account.",
      },
    ],

    closingHeading: "Open your store today",
    closingDescription:
      "Pick a commerce plan, connect your domain, and launch WooCommerce with SSL and support included.",
    closingCtaLabel: "Get ecommerce hosting",
    closingCtaHref: routes.getStarted,
  };
}

export function mergeEcommerceHostingPageContent(
  stored?: Partial<CmsHostingPageContent> | null,
): CmsHostingPageContent {
  return mergeHostingPageContent(stored, defaultEcommerceHostingPageContent);
}
