"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Copy,
  Globe,
  Mail,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import type {
  DashboardDomain,
  DashboardOverview,
} from "@/lib/panel/load-dashboard-overview";
import {
  daysUntil,
  domainHealth,
  domainStatusLabel,
  expiryCopy,
  formatDomainDate,
  formatPanelDateTime,
  healthTone,
} from "@/lib/panel/domain-status";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

import {
  PanelCard,
  PanelCardTitle,
  PanelEmpty,
  PanelQuickAction,
  PanelStat,
} from "./panel-ui";

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pending payment",
  DRAFT: "Draft",
  PAID: "Paid",
  PROVISIONING: "Pending activation",
  ACTIVE: "Active",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
  EXPIRED: "Expired",
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function DomainRow({ domain }: { domain: DashboardDomain }) {
  const health = domainHealth(domain.status, domain.expiresAt);
  const tone = healthTone(health);
  const days = daysUntil(domain.expiresAt);
  const manageHref = `/account/my-domains/${encodeURIComponent(domain.domain)}`;

  return (
    <li className="hb-table-row group flex flex-wrap items-center gap-3 px-4 py-3">
      <span
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-xl",
          health === "healthy"
            ? "hb-pill-ok"
            : health === "pending"
              ? "hb-pill-info"
              : "hb-pill-warn",
        )}
        aria-hidden
      >
        <Globe className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={manageHref}
            className="hb-text truncate text-sm font-bold"
          >
            {domain.domain}
          </Link>
          <span className={cn("hb-pill", tone.pillClass)}>{tone.label}</span>
          {!domain.autoRenew ? (
            <span className="hb-pill hb-pill-neutral">Auto-renew off</span>
          ) : null}
        </div>
        <p className="hb-muted mt-0.5 truncate text-xs">
          {domainStatusLabel(domain.status)} · {expiryCopy(domain.expiresAt)}
          {domain.renewalPrice != null
            ? ` · renews at ${formatMoney(domain.renewalPrice, domain.currency)}`
            : ""}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {days !== null && days <= 45 ? (
          <Link href={manageHref} className="hb-btn hb-btn-primary hb-btn-sm">
            Renew
          </Link>
        ) : null}
        <Link href={manageHref} className="hb-btn hb-btn-ghost hb-btn-sm">
          Manage
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </li>
  );
}

export function DashboardOverview({
  data,
  orderBannerId,
}: {
  data: DashboardOverview;
  orderBannerId?: string;
}) {
  const {
    user,
    wallet,
    orders,
    domains,
    attentionDomains,
    domainSummary,
    counts,
    recentTransactions,
  } = data;

  const [copied, setCopied] = useState(false);
  const firstName = user.name?.trim().split(/\s+/)[0] || null;

  async function copyAccountEmail() {
    try {
      await navigator.clipboard.writeText(user.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const nearestDomain = [...domains]
    .filter((domain) => domain.expiresAt)
    .sort(
      (a, b) =>
        new Date(a.expiresAt as Date).getTime() -
        new Date(b.expiresAt as Date).getTime(),
    )[0];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Hero */}
      <section className="hb-panel-hero">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.18em] text-white/75 uppercase">
              HostingBeyond control panel
            </p>
            <h2 className="font-heading mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {firstName ? `Good to see you, ${firstName}` : "Good to see you"}
            </h2>
            <p className="mt-1.5 max-w-lg text-sm text-white/85">
              Domains, hosting, wallet and support — every control below is
              wired to the live registrar and billing systems.
            </p>
            <button
              type="button"
              onClick={() => void copyAccountEmail()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/25"
            >
              {user.email}
              {copied ? (
                <CheckCircle2 className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>

          <form
            className="relative w-full max-w-md"
            action={routes.accountDomainFind}
          >
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-violet-700" />
            <input
              name="q"
              placeholder="Find your next domain"
              className="hb-panel-search"
              aria-label="Search for a domain"
            />
            <button
              type="submit"
              className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full bg-violet-700 px-3 py-1.5 text-xs font-bold text-white"
            >
              Search
            </button>
          </form>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {[
            {
              label: "Next renewal",
              value: nearestDomain?.domain ?? "No domain yet",
              hint: nearestDomain ? expiryCopy(nearestDomain.expiresAt) : null,
              href: routes.myDomains,
            },
            {
              label: "Wallet",
              value: formatMoney(wallet.balance, wallet.currency),
              hint: "Available to spend",
              href: routes.accountWallet,
            },
            {
              label: "Open invoices",
              value: String(counts.openInvoices),
              hint: counts.openInvoices > 0 ? "Payment due" : "Nothing to pay",
              href: routes.accountInvoices,
            },
          ].map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className="rounded-xl bg-white/12 px-3 py-2.5 ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/20"
            >
              <p className="text-[10px] font-bold tracking-[0.14em] text-white/70 uppercase">
                {tile.label}
              </p>
              <p className="mt-0.5 truncate text-sm font-bold text-white">
                {tile.value}
              </p>
              {tile.hint ? (
                <p className="truncate text-[11px] text-white/70">
                  {tile.hint}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      </section>

      {orderBannerId ? (
        <p className="hb-panel-card hb-text px-4 py-3 text-sm">
          Order saved ({orderBannerId}). Complete payment in Billing — no charge
          has been made yet.
        </p>
      ) : null}

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <PanelStat
          label="Domains"
          value={String(domainSummary.total)}
          hint={
            domainSummary.expiring + domainSummary.expired > 0
              ? `${domainSummary.expiring + domainSummary.expired} need attention`
              : domainSummary.total === 0
                ? "Register your first domain"
                : "All up to date"
          }
          href={routes.myDomains}
          icon={Globe}
          tone={
            domainSummary.expiring + domainSummary.expired > 0
              ? "warn"
              : "default"
          }
        />
        <PanelStat
          label="Hosting"
          value={String(counts.hostingOrdersActive)}
          hint={
            counts.hostingOrdersActive > 0
              ? `of ${counts.hostingOrdersTotal} orders active`
              : "No active hosting"
          }
          href={routes.accountHostingOrders}
          icon={Server}
        />
        <PanelStat
          label="Wallet"
          value={formatMoney(wallet.balance, wallet.currency)}
          hint="Available to spend"
          href={routes.accountWallet}
          icon={Wallet}
        />
        <PanelStat
          label="Open invoices"
          value={String(counts.openInvoices)}
          hint={counts.openInvoices > 0 ? "Payment due" : "Nothing to pay"}
          href={routes.accountInvoices}
          icon={ShieldCheck}
          tone={counts.openInvoices > 0 ? "warn" : "ok"}
        />
      </div>

      {attentionDomains.length > 0 ? (
        <section className="hb-panel-card p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[var(--hb-p-warn)]" />
            <div className="min-w-0 flex-1">
              <h3 className="hb-text text-sm font-bold">
                {attentionDomains.length === 1
                  ? "One domain needs your attention"
                  : `${attentionDomains.length} domains need your attention`}
              </h3>
              <p className="hb-muted mt-1 text-sm">
                Expired domains lose their website and email, and someone else
                can register them.
              </p>
              <ul className="mt-3 space-y-2">
                {attentionDomains.map((domain) => {
                  const days = daysUntil(domain.expiresAt);
                  return (
                    <li
                      key={domain.domain}
                      className="hb-soft flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="hb-text truncate text-sm font-bold">
                          {domain.domain}
                        </p>
                        <p className="hb-muted text-xs">
                          {domain.expiresAt
                            ? `Expires ${formatDomainDate(domain.expiresAt)}`
                            : "No expiry date on file"}
                          {days !== null && days > 0
                            ? ` · ${days} day${days === 1 ? "" : "s"} left`
                            : ""}
                        </p>
                      </div>
                      <Link
                        href={`/account/my-domains/${encodeURIComponent(domain.domain)}`}
                        className="hb-btn hb-btn-primary hb-btn-sm shrink-0"
                      >
                        Renew now
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {/* Domains */}
      <PanelCard className="!p-0">
        <div className="px-5 pt-5">
          <PanelCardTitle
            title="Domain portfolio"
            description={
              domainSummary.total === 0
                ? "A domain is step one — hosting and email point at it."
                : `${domainSummary.active} active · ${domainSummary.expiring} expiring · ${domainSummary.expired} expired · ${domainSummary.pending} setting up`
            }
            action={
              <div className="flex items-center gap-2">
                <Link
                  href={routes.accountDomainFind}
                  className="hb-btn hb-btn-ghost hb-btn-sm"
                >
                  <Search className="size-3.5" />
                  Search
                </Link>
                <Link
                  href={routes.myDomains}
                  className="hb-btn hb-btn-ghost hb-btn-sm"
                >
                  View all
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            }
          />
        </div>

        {domains.length === 0 ? (
          <div className="px-5 pt-4 pb-5">
            <PanelEmpty
              title="No domains yet"
              description="Search for a name, register it, then point nameservers or DNS at hosting whenever you are ready."
            >
              <Link
                href={routes.accountDomainFind}
                className="hb-btn hb-btn-primary"
              >
                <Search className="size-4" />
                Search a domain
              </Link>
              <Link
                href={routes.accountDomainTransfer}
                className="hb-btn hb-btn-ghost"
              >
                Transfer a domain
              </Link>
            </PanelEmpty>
          </div>
        ) : (
          <ul className="space-y-2 px-4 pt-4 pb-4">
            {domains.slice(0, 6).map((domain) => (
              <DomainRow key={domain.domain} domain={domain} />
            ))}
          </ul>
        )}
      </PanelCard>

      {/* Quick actions */}
      <section>
        <h3 className="hb-eyebrow mb-2">Quick actions</h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <PanelQuickAction
            label="Register domain"
            hint="Live availability and pricing"
            href={routes.accountDomainFind}
            icon={Globe}
          />
          <PanelQuickAction
            label="AI Agent"
            hint="DNS, WordPress, hosting in one search"
            href={routes.accountAiAgent}
            icon={Sparkles}
          />
          <PanelQuickAction
            label="Hosting plans"
            hint="NVMe hosting with free AutoSSL"
            href={routes.accountHosting}
            icon={Server}
          />
          <PanelQuickAction
            label="SSL certificates"
            hint="Renewal dates and NameSilo premium SSL"
            href={routes.accountSsl}
            icon={ShieldCheck}
          />
          <PanelQuickAction
            label="Business email"
            hint="yourname@yourdomain"
            href={routes.accountEmail}
            icon={Mail}
          />
          <PanelQuickAction
            label="Transfer domain"
            hint="Move a domain to HostingBeyond"
            href={routes.accountDomainTransfer}
            icon={RefreshCw}
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelCard>
          <PanelCardTitle
            title="Recent hosting orders"
            action={
              <Link
                href={routes.accountHostingOrders}
                className="hb-link text-xs"
              >
                View all
              </Link>
            }
          />
          {orders.length === 0 ? (
            <div className="mt-4">
              <PanelEmpty
                title="No hosting orders yet"
                description="Pick a plan and it will appear here with its activation status."
              >
                <Link
                  href={routes.accountHosting}
                  className="hb-btn hb-btn-primary"
                >
                  Browse plans
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </PanelEmpty>
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="hb-table-row flex flex-wrap items-start justify-between gap-2 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="hb-text truncate text-sm font-bold">
                      {order.planName ??
                        `${order.productSlug} · ${order.planKey}`}
                    </p>
                    <p className="hb-muted text-xs">
                      {ORDER_STATUS_LABELS[order.status] ?? order.status} ·{" "}
                      {order.billingCycle}
                    </p>
                  </div>
                  <p className="hb-text shrink-0 text-sm font-bold tabular-nums">
                    {formatMoney(order.total, order.currency)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </PanelCard>

        <PanelCard>
          <PanelCardTitle
            title="Wallet activity"
            action={
              <Link href={routes.accountBilling} className="hb-link text-xs">
                All transactions
              </Link>
            }
          />
          {recentTransactions.length === 0 ? (
            <div className="mt-4">
              <PanelEmpty
                title="No transactions yet"
                description="Domain purchases, renewals and top-ups appear here once money moves."
              />
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {recentTransactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between gap-2 border-b border-[var(--hb-p-border)] pb-2 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="hb-text truncate text-sm font-semibold">
                      {tx.note ?? tx.type}
                    </p>
                    <p className="hb-muted text-xs">
                      {formatPanelDateTime(tx.createdAt)}
                    </p>
                  </div>
                  <span className="hb-text shrink-0 text-sm font-bold tabular-nums">
                    {formatMoney(tx.amount, tx.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <Link href={routes.accountWallet} className="hb-link">
              Top up wallet
            </Link>
            <Link href={routes.accountOrders} className="hb-link">
              Domain orders
            </Link>
            <Link href={routes.accountInvoices} className="hb-link">
              Invoices
            </Link>
          </div>
        </PanelCard>
      </div>
    </div>
  );
}
