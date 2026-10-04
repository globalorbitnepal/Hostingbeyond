import { routes } from "@/config/routes";

import {
  type CmsHostingPageContent,
  mergeHostingPageContent,
} from "@/lib/orbit/hosting-page-content";

export function defaultWordPressHostingPageContent(): CmsHostingPageContent {
  return {
    heroEyebrow: "WordPress hosting",
    heroTitle: "Managed WordPress",
    heroTitleAccent: "built for speed.",
    heroDescription:
      "Launch blogs, business sites, and WooCommerce stores on NVMe — one-click WordPress, free SSL, automatic updates, and real 24/7 support on every plan.",
    heroPrimaryLabel: "View WordPress plans",
    heroPrimaryHref: "#plans",
    heroSecondaryLabel: "Compare web hosting",
    heroSecondaryHref: routes.hosting,
    heroPromo: "Save up to 70% on annual billing",

    pricingEyebrow: "WordPress plans",
    pricingTitle: "Choose your",
    pricingTitleAccent: "WordPress package",
    pricingDescription:
      "Same transparent HostingBeyond pricing — optimized PHP, MariaDB, and caching for WordPress out of the box.",
    pricingNote:
      "Promotional rates apply to the first term. Standard renewal pricing is shown before you pay.",

    featuresEyebrow: "Built for WordPress",
    featuresHeading: "Everything publishers need",
    featuresDescription:
      "From first install to Black Friday traffic — speed, security, and staging-friendly tools are included.",
    features: [
      {
        id: "install",
        visible: true,
        title: "One-click WordPress",
        description:
          "Install the latest WordPress in seconds — no manual FTP or database setup.",
        icon: "server",
      },
      {
        id: "ssl",
        visible: true,
        title: "Free SSL",
        description:
          "HTTPS on every site with automatic certificate issue and renewal.",
        icon: "shield",
      },
      {
        id: "speed",
        visible: true,
        title: "NVMe & caching",
        description:
          "Fast disks and tuned stacks so admin and storefront stay responsive.",
        icon: "zap",
      },
      {
        id: "updates",
        visible: true,
        title: "Managed updates",
        description:
          "Core security patches and optional staging so you update with confidence.",
        icon: "sparkles",
      },
      {
        id: "woo",
        visible: true,
        title: "WooCommerce ready",
        description:
          "PHP memory and database headroom for carts, checkout, and plugins.",
        icon: "globe",
      },
      {
        id: "support",
        visible: true,
        title: "24/7 WordPress support",
        description:
          "Real humans for DNS, SSL, migrations, and plugin conflicts.",
        icon: "mail",
      },
    ],

    wordpressHeading: "WooCommerce & staging friendly",
    wordpressDescription:
      "Sell online or publish content — clone to staging, test updates, then push live without downtime scares.",
    wordpressBullets: [
      "Staging-friendly file & database tools",
      "WooCommerce-optimized PHP",
      "Free migration on Plus plans and above",
      "Daily backups on higher tiers",
    ],
    wordpressCtaLabel: "Start your WordPress site",
    wordpressCtaHref: routes.getStarted,
    wordpressImage: "",

    compareHeading: "Why HostingBeyond for WordPress?",
    compareDescription:
      "We bundle what other hosts nickel-and-dime — so you focus on content and sales.",
    compareBullets: [
      "Free SSL — not a paid add-on",
      "NVMe storage instead of slow legacy disks",
      "One dashboard for sites, domains, mail & AI",
      "Human support 24/7 — not ticket bots only",
    ],

    faqHeading: "WordPress hosting FAQs",
    faqDescription:
      "Installs, WooCommerce, migrations, and billing — answered in plain language.",
    faqs: [
      {
        id: "install",
        visible: true,
        question: "How do I install WordPress?",
        answer:
          "Open your HostingBeyond panel, choose One-click WordPress, pick your domain, and the stack is provisioned with SSL and database ready to log in.",
      },
      {
        id: "woo",
        visible: true,
        question: "Can I run WooCommerce?",
        answer:
          "Yes. Plans include enough PHP memory and MariaDB performance for catalogs, payments, and traffic spikes. Upgrade if you outgrow shared resources.",
      },
      {
        id: "migrate",
        visible: true,
        question: "Will you migrate my WordPress site?",
        answer:
          "Free assisted migration is included on Plus, Pro, and Ultimate plans. Share your current host details and we move files and database with minimal downtime.",
      },
      {
        id: "updates",
        visible: true,
        question: "Do you update WordPress for me?",
        answer:
          "Security-related core updates can be applied automatically. Major releases and plugins remain under your control — use staging to test first.",
      },
      {
        id: "billing",
        visible: true,
        question: "Monthly vs annual billing?",
        answer:
          "Annual billing gives the lowest effective monthly rate. Toggle prices on this page before checkout — renewal rates are always shown upfront.",
      },
    ],

    closingHeading: "Publish with confidence",
    closingDescription:
      "Pick a plan, install WordPress in one click, and go live with SSL and support included.",
    closingCtaLabel: "Get WordPress hosting",
    closingCtaHref: routes.getStarted,
  };
}

export function mergeWordPressHostingPageContent(
  stored?: Partial<CmsHostingPageContent> | null,
): CmsHostingPageContent {
  return mergeHostingPageContent(stored, defaultWordPressHostingPageContent);
}
