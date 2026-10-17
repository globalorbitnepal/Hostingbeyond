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
    items: [
      { id: "dashboard", label: "Dashboard", href: routes.account },
      { id: "notifications", label: "Notifications", soon: true },
      { id: "activity", label: "Recent activity", soon: true },
    ],
  },
  {
    id: "websites",
    label: "Websites",
    items: [
      { id: "my-websites", label: "My Websites", soon: true },
      { id: "wordpress", label: "WordPress", soon: true },
      { id: "builder", label: "Website Builder", href: routes.beyondAi },
      {
        id: "migration",
        label: "Website Migration",
        href: routes.websiteMigration,
      },
      { id: "backups", label: "Backups", soon: true },
    ],
  },
  {
    id: "hosting",
    label: "Hosting",
    items: [
      { id: "web-hosting", label: "Web Hosting", href: routes.hosting },
      { id: "plans", label: "Hosting Plans", href: routes.pricing },
      { id: "manage", label: "Manage Hosting", soon: true },
      { id: "usage", label: "Resource Usage", soon: true },
    ],
  },
  {
    id: "domains",
    label: "Domains",
    items: [
      { id: "my-domains", label: "My Domains", href: routes.myDomains },
      { id: "register", label: "Register Domain", href: routes.domainSearch },
      { id: "transfer", label: "Transfer Domain", href: routes.domainTransfer },
      {
        id: "dns",
        label: "DNS & nameservers",
        href: routes.myDomains,
      },
      { id: "renewals", label: "Domain Renewals", href: routes.myDomains },
    ],
  },
  {
    id: "email",
    label: "Business Email",
    items: [
      { id: "my-email", label: "My Email Services", soon: true },
      {
        id: "buy-email",
        label: "Buy Business Email",
        href: routes.businessEmail,
      },
      { id: "mailboxes", label: "Mailboxes", soon: true },
      { id: "email-dns", label: "Email Setup & DNS", soon: true },
    ],
  },
  {
    id: "servers",
    label: "Servers",
    items: [
      { id: "vps", label: "VPS Servers", href: routes.vps },
      { id: "dedicated", label: "Dedicated Servers", soon: true },
      { id: "server-orders", label: "Server Orders", soon: true },
      { id: "monitoring", label: "Resource Monitoring", soon: true },
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
      {
        id: "hosting-orders",
        label: "Hosting orders",
        href: routes.accountHostingOrders,
      },
      { id: "invoices", label: "Invoices", href: routes.accountInvoices },
      { id: "payment-methods", label: "Payment Methods", soon: true },
      { id: "renewals-billing", label: "Renewals", href: routes.myDomains },
    ],
  },
  {
    id: "support",
    label: "Support",
    items: [
      { id: "help", label: "Help Centre", href: routes.resources },
      { id: "tickets", label: "Support Tickets", soon: true },
      { id: "contact", label: "Contact Support", href: routes.contact },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { id: "profile", label: "Profile", href: routes.account },
      { id: "security", label: "Security", soon: true },
      { id: "sessions", label: "Login & Sessions", soon: true },
      { id: "prefs", label: "Notification Preferences", soon: true },
    ],
  },
];

function pathMatchesNavItem(pathname: string, href: string) {
  if (href === "/account") return pathname === "/account";
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

export function panelTitleForPath(pathname: string): string {
  if (pathname.startsWith("/account/my-domains/")) return "Domain details";
  if (pathname.startsWith("/account/orders/")) return "Order details";
  if (pathname.startsWith("/account/invoices/")) return "Invoice details";
  if (pathname.startsWith("/account/hosting-orders")) return "Hosting orders";
  let best: { label: string; href: string } | null = null;
  for (const section of PANEL_NAV) {
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
