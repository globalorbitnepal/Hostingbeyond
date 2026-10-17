import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Mail,
  Server,
  ShoppingBag,
  Wallet,
} from "lucide-react";

import type { DashboardOverview } from "@/lib/panel/load-dashboard-overview";
import { routes } from "@/config/routes";

function orderStatusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING_PAYMENT: "Pending payment",
    DRAFT: "Draft",
    PAID: "Paid",
    PROVISIONING: "Pending activation",
    ACTIVE: "Active",
    CANCELLED: "Cancelled",
    FAILED: "Failed",
    EXPIRED: "Expired",
  };
  return map[status] ?? status;
}

function domainStatusLabel(status: string) {
  const map: Record<string, string> = {
    ACTIVE: "Active",
    PENDING_REGISTRATION: "Pending",
    EXPIRED: "Expired",
    SUSPENDED: "Suspended",
    FAILED: "Failed",
  };
  return map[status] ?? status;
}

const QUICK_ACTIONS = [
  { label: "Register a domain", href: routes.domainSearch, icon: Globe },
  { label: "Buy hosting", href: routes.hosting, icon: ShoppingBag },
  { label: "Buy business email", href: routes.businessEmail, icon: Mail },
  { label: "Order VPS", href: routes.vps, icon: Server },
  { label: "Transfer domain", href: routes.domainTransfer, icon: Globe },
  { label: "View wallet", href: routes.accountWallet, icon: Wallet },
  { label: "Contact support", href: routes.contact, icon: Mail },
] as const;

export function DashboardOverview({
  data,
  orderBannerId,
}: {
  data: DashboardOverview;
  orderBannerId?: string;
}) {
  const { user, wallet, orders, domains, counts, recentTransactions } = data;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="hb-panel-card p-6 sm:p-8">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
          Overview
        </p>
        <h2 className="font-heading mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Welcome back{user.name ? `, ${user.name}` : ""}
        </h2>
        <p className="mt-2 text-sm text-slate-500">{user.email}</p>
        {orderBannerId ? (
          <p className="mt-4 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-900">
            Order saved ({orderBannerId}). Complete payment when billing is
            enabled — no charge has been made yet.
          </p>
        ) : null}
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Wallet balance",
            value: `${wallet.currency} ${wallet.balance.toFixed(2)}`,
            href: routes.accountWallet,
          },
          {
            label: "Active domains",
            value: String(counts.activeDomains),
            href: routes.myDomains,
          },
          {
            label: "Hosting orders",
            value: String(counts.hostingOrdersTotal),
            sub:
              counts.hostingOrdersTotal === 0
                ? "None on file"
                : counts.hostingOrdersActive > 0
                  ? `${counts.hostingOrdersActive} active or provisioning · ${counts.hostingOrdersTotal} total`
                  : `${counts.hostingOrdersTotal} total (none active yet)`,
            href: routes.accountHostingOrders,
          },
          {
            label: "Builder projects",
            value: String(counts.beyondAiProjects),
            href: routes.beyondAi,
          },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="hb-panel-stat block p-4 transition-shadow hover:shadow-md"
          >
            <p className="text-xs font-medium text-slate-500">{stat.label}</p>
            <p className="mt-1 text-xl font-bold text-[var(--hb-p-primary-deep)]">
              {stat.value}
            </p>
            {stat.sub ? (
              <p className="mt-1 text-xs text-slate-500">{stat.sub}</p>
            ) : null}
          </Link>
        ))}
      </div>

      <section>
        <h3 className="text-sm font-bold text-slate-900">Quick actions</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--hb-p-border)] bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-[var(--hb-p-primary)] hover:text-[var(--hb-p-primary)]"
              >
                <Icon className="h-3.5 w-3.5" />
                {action.label}
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="hb-panel-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Recent hosting orders
            </h3>
            <Link
              href={routes.accountHostingOrders}
              className="text-xs font-semibold text-[var(--hb-p-primary)]"
            >
              View all
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No hosting orders yet.{" "}
              <Link
                href={routes.pricing}
                className="font-semibold text-[var(--hb-p-primary)]"
              >
                Browse plans
              </Link>
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {order.planName ??
                          `${order.productSlug} · ${order.planKey}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        {orderStatusLabel(order.status)} · {order.billingCycle}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[var(--hb-p-primary)]">
                      {order.currency} {order.total.toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {counts.hostingOrdersActive === 0 && counts.hostingOrdersTotal > 0 ? (
            <p className="mt-4 text-xs text-slate-500">
              Hosting service management and provisioning controls will appear
              here once your order is activated.
            </p>
          ) : null}
        </section>

        <section className="hb-panel-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900">Your domains</h3>
            <Link
              href={routes.myDomains}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--hb-p-primary)]"
            >
              Manage
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {domains.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No domains in your account.{" "}
              <Link
                href={routes.domainSearch}
                className="font-semibold text-[var(--hb-p-primary)]"
              >
                Search availability
              </Link>
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {domains.map((row) => (
                <li
                  key={row.domain}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {row.domain}
                  </p>
                  <p className="text-xs text-slate-500">
                    {domainStatusLabel(row.status)}
                    {row.expiresAt
                      ? ` · Expires ${row.expiresAt.toLocaleDateString()}`
                      : ""}
                    {row.autoRenew ? " · Auto-renew on" : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="hb-panel-card p-5 sm:p-6">
          <h3 className="text-sm font-bold text-slate-900">
            Recent wallet activity
          </h3>
          {recentTransactions.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No transactions yet. Domain purchases and renewals debit your
              wallet when completed.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {recentTransactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">
                      {tx.note ?? tx.type}
                    </p>
                    <p className="text-xs text-slate-500">
                      {tx.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-slate-900">
                    {tx.currency} {tx.amount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-[var(--hb-p-primary)]">
            <Link href={routes.accountBilling}>All transactions</Link>
            <Link href={routes.accountOrders}>Domain orders</Link>
            <Link href={routes.accountInvoices}>Invoices</Link>
            <Link href={routes.accountWallet}>Wallet</Link>
          </div>
        </section>

        <section className="hb-panel-card p-5 sm:p-6">
          <h3 className="text-sm font-bold text-slate-900">
            Services not yet in panel
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>
              <strong className="text-slate-800">Web hosting instances</strong>{" "}
              — orders are recorded; automated provisioning and cPanel-style
              management are planned for a later phase.
            </li>
            <li>
              <strong className="text-slate-800">Business email</strong> — buy
              from the storefront; mailbox provisioning will appear here when
              connected to the email provider API.
            </li>
            <li>
              <strong className="text-slate-800">VPS servers</strong> — catalog
              and marketing pages only until infrastructure provisioning is
              configured.
            </li>
            <li>
              <strong className="text-slate-800">Invoices</strong> —{" "}
              <Link
                href={routes.accountInvoices}
                className="font-semibold text-[var(--hb-p-primary)]"
              >
                View your invoices
              </Link>{" "}
              for issued domain-order billing (PDF when available).
            </li>
            <li>
              <strong className="text-slate-800">Support tickets</strong> — not
              available in the panel yet; use{" "}
              <Link
                href={routes.contact}
                className="font-semibold text-[var(--hb-p-primary)]"
              >
                Contact support
              </Link>
              .
            </li>
          </ul>
          {counts.migrationRequests > 0 ? (
            <p className="mt-4 text-xs text-slate-500">
              You have {counts.migrationRequests} website migration request
              {counts.migrationRequests === 1 ? "" : "s"} on file.{" "}
              <Link
                href={routes.websiteMigration}
                className="font-semibold text-[var(--hb-p-primary)]"
              >
                Migration info
              </Link>
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
