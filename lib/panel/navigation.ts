import { routes } from "@/config/routes";

export type PanelNavItem = {
  id: string;
  label: string;
  href?: string;
  /** Shown but not linked — feature not available yet */
  soon?: boolean;
  icon?: string;
};

export type PanelNavSection = {
  id: string;
  label: string;
  items: PanelNavItem[];
};

/** Customer panel navigation — only link routes that exist today. */
export const PANEL_NAV: PanelNavSection[] = [
  {
    id: "overview",
    label: "Overview",
    items: [{ id: "dashboard", label: "Dashboard", href: routes.account }],
  },
  {
    id: "domains",
    label: "Domains",
    items: [
      { id: "my-domains", label: "My Domains", href: routes.myDomains },
      {
        id: "register",
        label: "Register Domain",
        href: routes.accountDomainFind,
      },
      {
        id: "transfer",
        label: "Transfer Domain",
        href: routes.accountDomainTransfer,
      },
      {
        id: "renewals",
        label: "Renewals & expiry",
        href: routes.myDomains,
      },
    ],
  },
  {
    id: "hosting",
    label: "Hosting",
    items: [
      {
        id: "web-hosting",
        label: "Hosting plans",
        href: routes.accountHosting,
      },
      {
        id: "hosting-orders",
        label: "Hosting Orders",
        href: routes.accountHostingOrders,
      },
    ],
  },
  {
    id: "email",
    label: "Business Email",
    items: [
      {
        id: "buy-email",
        label: "Business Email",
        href: routes.accountEmail,
      },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    items: [
      { id: "wallet", label: "Wallet", href: routes.accountWallet },
      {
        id: "transactions",
        label: "Transactions",
        href: routes.accountBilling,
      },
      { id: "orders", label: "Domain orders", href: routes.accountOrders },
      { id: "invoices", label: "Invoices", href: routes.accountInvoices },
    ],
  },
  {
    id: "support",
    label: "Support",
    items: [{ id: "tickets", label: "Support", href: routes.accountSupport }],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { id: "security", label: "Security", href: routes.accountSecurity },
    ],
  },
];

export function getPanelNav(): PanelNavSection[] {
  return PANEL_NAV;
}

function pathMatchesNavItem(pathname: string, href: string) {
  if (href === "/account") return pathname === "/account";
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

export function panelTitleForPath(pathname: string): string {
  if (pathname.startsWith("/account/domains/find")) return "Register a domain";
  if (pathname.startsWith("/account/domains/transfer"))
    return "Transfer a domain";
  if (pathname.startsWith("/account/hosting-orders")) return "Hosting orders";
  if (
    pathname === "/account/hosting" ||
    pathname.startsWith("/account/hosting/")
  )
    return "Hosting plans";
  if (pathname.startsWith("/account/email")) return "Business email";
  if (pathname.startsWith("/account/support")) return "Support";
  if (pathname.startsWith("/account/my-domains/")) return "Domain details";
  if (pathname.startsWith("/account/orders/")) return "Order details";
  if (pathname.startsWith("/account/invoices/")) return "Invoice details";
  let best: { label: string; href: string } | null = null;
  for (const section of getPanelNav()) {
    for (const item of section.items) {
      if (!item.href) continue;
      if (!pathMatchesNavItem(pathname, item.href)) continue;
      if (!best || item.href.length > best.href.length) {
        best = { label: item.label, href: item.href };
      }
    }
  }
  return best?.label ?? "Dashboard";
}
