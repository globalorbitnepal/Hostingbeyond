import { filterNavBeyondAi } from "./beyond-ai-public";
import { routes } from "./routes";

export type NavChild = {
  label: string;
  href: string;
};

export type NavItem = {
  label: string;
  href: string;
  children?: NavChild[];
};

/**
 * Every hosting child points at a real, canonical route (no query-string
 * redirects and no 404s). Keep this list in sync with `HOSTING_PRODUCT_REGISTRY`
 * and `app/**` hosting routes.
 */
const _mainNavigation: NavItem[] = [
  {
    label: "Domains",
    href: routes.domains,
    children: [
      { label: "Domain Name Search", href: routes.domainSearch },
      { label: "Bulk Domain Search", href: routes.bulkDomainSearch },
      { label: "Domain Transfer", href: routes.domainTransfer },
    ],
  },
  {
    label: "Hosting",
    href: routes.hosting,
    children: [
      { label: "Web Hosting", href: routes.hosting },
      { label: "WordPress Hosting", href: `${routes.hosting}/wordpress` },
      { label: "eCommerce Hosting", href: `${routes.hosting}/ecommerce` },
      { label: "Node.js Hosting", href: "/nodejs-hosting" },
      { label: "Laravel Hosting", href: "/laravel-hosting" },
      { label: "SSL Certificates", href: `${routes.hosting}/ssl` },
    ],
  },
  {
    label: "Business Email",
    href: routes.businessEmail,
  },
  {
    label: "Resources",
    href: routes.resources,
    children: [
      { label: "Blog", href: `${routes.resources}/blog` },
      { label: "Expert Tips", href: `${routes.resources}/tips` },
      { label: "Product Updates", href: `${routes.resources}/updates` },
      { label: "Our Story", href: routes.about },
      { label: "Contact", href: routes.contact },
    ],
  },
  {
    label: "Pricing",
    href: routes.pricing,
  },
  {
    label: "Beyond AI",
    href: routes.beyondAi,
  },
];

export const mainNavigation: NavItem[] = filterNavBeyondAi(_mainNavigation);
