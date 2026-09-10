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

export const mainNavigation: NavItem[] = [
  {
    label: "Domains",
    href: routes.domains,
    children: [
      { label: "Register Domain", href: `${routes.domains}/register` },
      { label: "Transfer Domain", href: `${routes.domains}/transfer` },
      { label: "Domain Pricing", href: `${routes.domains}/pricing` },
      { label: "WHOIS Lookup", href: `${routes.domains}/whois` },
    ],
  },
  {
    label: "Hosting",
    href: routes.hosting,
    children: [
      { label: "Shared Hosting", href: `${routes.hosting}/shared` },
      { label: "WordPress Hosting", href: `${routes.hosting}/wordpress` },
      { label: "Reseller Hosting", href: `${routes.hosting}/reseller` },
      { label: "Cloud Hosting", href: routes.cloud },
      { label: "VPS Hosting", href: routes.vps },
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
];
