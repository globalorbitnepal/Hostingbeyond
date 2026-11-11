import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Bell, Globe, Receipt, Wallet } from "lucide-react";

import { PanelPageHeader } from "@/components/panel/panel-ui";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { expiryCopy } from "@/lib/panel/domain-status";
import { loadDashboardOverview } from "@/lib/panel/load-dashboard-overview";

export default async function AccountNotificationsPage() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  const data = await loadDashboardOverview(user.id);
  const items: Array<{
    href: string;
    icon: typeof Bell;
    title: string;
    hint: string;
  }> = [];

  for (const domain of data.attentionDomains) {
    items.push({
      href: `/account/my-domains/${encodeURIComponent(domain.domain)}`,
      icon: Globe,
      title: `${domain.domain} needs attention`,
      hint: expiryCopy(domain.expiresAt),
    });
  }

  if (data.counts.openInvoices > 0) {
    items.push({
      href: routes.accountInvoices,
      icon: Receipt,
      title: `${data.counts.openInvoices} open invoice${data.counts.openInvoices === 1 ? "" : "s"}`,
      hint: "Payment is due",
    });
  }

  const pendingOrders = data.orders.filter(
    (order) => order.status === "PENDING_PAYMENT" || order.status === "DRAFT",
  );
  for (const order of pendingOrders.slice(0, 4)) {
    items.push({
      href: routes.accountHostingOrders,
      icon: Wallet,
      title: `${order.planName ?? "Hosting"} is waiting`,
      hint: "Complete payment to activate",
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <PanelPageHeader
        eyebrow="Account"
        title="Notifications"
        description="Renewals, invoices, and orders that need a click — live from this account."
      />
      {items.length === 0 ? (
        <div className="hb-panel-card px-5 py-10 text-center">
          <Bell className="mx-auto size-6 text-[var(--hb-p-primary)]" />
          <p className="hb-text mt-3 text-sm font-bold">
            You are all caught up
          </p>
          <p className="hb-muted mx-auto mt-1 max-w-sm text-sm">
            Domain renewals, unpaid invoices, and pending orders will show up
            here.
          </p>
        </div>
      ) : (
        <ul className="hb-panel-card divide-y divide-[var(--hb-p-border)] !p-0">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={`${item.href}-${item.title}`}>
                <Link
                  href={item.href}
                  className="flex items-start gap-3 px-5 py-4 hover:bg-[color-mix(in_srgb,var(--hb-p-primary)_6%,transparent)]"
                >
                  <span className="mt-0.5 grid size-9 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--hb-p-primary)_12%,transparent)] text-[var(--hb-p-primary)]">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="hb-text block text-sm font-bold">
                      {item.title}
                    </span>
                    <span className="hb-muted block text-xs">{item.hint}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
