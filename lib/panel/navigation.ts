import { routes } from "@/config/routes";

export type PanelNavItem = {
  id: string;
  label: string;
  href?: string;
  /** Shown but not linked — feature not available yet */
  soon?: boolean;
  /** Indented child of the previous top-level item. */
  child?: boolean;
  /** Rounded parent pill (Hostinger-style section header). */
  hub?: boolean;
  /** Small tag next to the label, e.g. Beta. */
  tag?: string;
};

export type PanelNavSection = {
  id: string;
  label: string;
  items: PanelNavItem[];
};

/**
 * Customer panel navigation.
 *
 * Every entry must resolve to a page inside `/account`. Marketing pages are
 * deliberately absent: once a customer is signed in, clicking a sidebar link
 * should never throw them back to the public storefront.
 */
export const PANEL_NAV: PanelNavSection[] = [
  {
    id: "overview",
    label: "",
    items: [
      { id: "dashboard", label: "Dashboard", href: routes.account },
      {
        id: "ai-agent",
        label: "AI Agent",
        href: routes.accountAiAgent,
        tag: "New",
      },
      {
        id: "my-websites",
        label: "Websites",
        href: routes.accountHostingWebsites,
      },
      { id: "buy-email", label: "Emails", href: routes.accountEmail },
    ],
  },
  {
    id: "domains",
    label: "",
    items: [
      {
        id: "domains-hub",
        label: "Domains",
        hub: true,
      },
      {
        id: "my-domains",
        label: "Domain portfolio",
        href: routes.myDomains,
        child: true,
      },
      {
        id: "register",
        label: "Domain search",
        href: routes.accountDomainFind,
        child: true,
      },
      {
        id: "transfer",
        label: "Transfers",
        href: routes.accountDomainTransfer,
        child: true,
      },
      {
        id: "dns",
        label: "DNS",
        href: routes.accountDomainDns,
        child: true,
      },
      {
        id: "contacts",
        label: "Contact profiles",
        href: routes.accountDomainContacts,
        child: true,
      },
      {
        id: "tlds",
        label: "TLD list",
        href: routes.accountDomainTlds,
        child: true,
      },
    ],
  },
  {
    id: "hosting",
    label: "",
    items: [
      {
        id: "hosting-hub",
        label: "Hosting",
        hub: true,
      },
      {
        id: "hosting-plans",
        label: "Plans & pricing",
        href: routes.accountHosting,
        child: true,
      },
      {
        id: "hosting-orders",
        label: "Hosting orders",
        href: routes.accountHostingOrders,
        child: true,
      },
    ],
  },
  {
    id: "ssl",
    label: "",
    items: [
      {
        id: "ssl-hub",
        label: "SSL",
        hub: true,
      },
      {
        id: "ssl-certs",
        label: "Certificates",
        href: routes.accountSsl,
        child: true,
      },
      {
        id: "ssl-buy",
        label: "Buy SSL",
        href: `${routes.accountSsl}#buy`,
        child: true,
      },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    items: [
      { id: "wallet", label: "Wallet", href: routes.accountWallet },
      {
        id: "payment-methods",
        label: "Payment cards",
        href: routes.accountPaymentMethods,
      },
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
    id: "account",
    label: "Account",
    items: [
      { id: "security", label: "Security", href: routes.accountSecurity },
      {
        id: "notifications",
        label: "Notifications",
        href: routes.accountNotifications,
      },
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

const EXACT_TITLES: Array<[string, string]> = [
  ["/account/domains/find", "Domain search"],
  ["/account/domains/transfer", "Transfers"],
  ["/account/domains/dns", "DNS"],
  ["/account/domains/contacts", "Contact profiles"],
  ["/account/domains/tlds", "TLD list"],
  ["/account/hosting-orders", "Hosting orders"],
  ["/account/my-domains/", "Domain details"],
  ["/account/orders/", "Order details"],
  ["/account/invoices/", "Invoice details"],
  ["/account/hosting/websites", "My websites"],
  ["/account/hosting", "Hosting plans"],
  ["/account/email", "Business email"],
  ["/account/support", "Support"],
  ["/account/notifications", "Notifications"],
  ["/account/ai-agent", "AI Agent"],
  ["/account/ssl", "SSL certificates"],
  ["/account/billing/cards", "Payment cards"],
];

export function panelTitleForPath(pathname: string): string {
  for (const [prefix, title] of EXACT_TITLES) {
    if (
      prefix.endsWith("/") ? pathname.startsWith(prefix) : pathname === prefix
    ) {
      return title;
    }
  }

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
