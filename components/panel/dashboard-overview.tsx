"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Copy,
  Globe,
  Lock,
  Mail,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useState } from "react";

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
import { BEYOND_AI_PUBLIC_ENABLED } from "@/config/beyond-ai-public";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

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

  return (
    <li className="group flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hb-p-border)] bg-white px-4 py-3 transition hover:border-[var(--hb-p-primary)]/40 hover:shadow-sm">
      <span
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
          health === "healthy"
            ? "bg-emerald-50 text-emerald-600"
            : health === "pending"
              ? "bg-sky-50 text-sky-600"
              : "bg-amber-50 text-amber-600",
        )}
        aria-hidden
      >
        <Globe className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/account/my-domains/${encodeURIComponent(domain.domain)}`}
            className="truncate text-sm font-semibold text-slate-900 hover:text-[var(--hb-p-primary)]"
          >
            {domain.domain}
          </Link>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
              tone.pill,
            )}
          >
            {tone.label}
          </span>
          {!domain.autoRenew ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-600 uppercase">
              Auto-renew off
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {domainStatusLabel(domain.status)} · {expiryCopy(domain.expiresAt)}
          {domain.renewalPrice != null
            ? ` · renews at ${formatMoney(domain.renewalPrice, domain.currency)}`
            : ""}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {days !== null && days <= 45 ? (
          <Link
            href={`/account/my-domains/${encodeURIComponent(domain.domain)}`}
            className="rounded-lg bg-[var(--hb-p-primary)] px-3 py-1.5 text-xs font-bold text-white transition hover:brightness-110"
          >
            Renew
          </Link>
        ) : null}
        <Link
          href={`/account/my-domains/${encodeURIComponent(domain.domain)}`}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--hb-p-border)] px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[var(--hb-p-primary)]/40 hover:text-[var(--hb-p-primary)]"
        >
          Manage
          <ArrowRight className="size-3" />
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

  const stats = [
    {
      label: "Domains",
      value: String(domainSummary.total),
      sub:
        domainSummary.expiring > 0
          ? `${domainSummary.expiring} expiring soon`
          : domainSummary.total === 0
            ? "Register your first domain"
            : "All up to date",
      href: routes.myDomains,
      icon: Globe,
      tone:
        domainSummary.expiring + domainSummary.expired > 0
          ? ("warning" as const)
          : ("default" as const),
    },
    {
      label: "Hosting",
      value: String(counts.hostingOrdersActive),
      sub:
        counts.hostingOrdersActive > 0
          ? `of ${counts.hostingOrdersTotal} orders active`
          : "No active hosting",
      href: routes.accountHostingOrders,
      icon: Server,
      tone: "default" as const,
    },
    {
      label: "Wallet balance",
      value: formatMoney(wallet.balance, wallet.currency),
      sub: "Available to spend",
      href: routes.accountWallet,
      icon: Wallet,
      tone: "default" as const,
    },
    {
      label: "Open invoices",
      value: String(counts.openInvoices),
      sub: counts.openInvoices > 0 ? "Payment due" : "Nothing to pay",
      href: routes.accountInvoices,
      icon: ShieldCheck,
      tone:
        counts.openInvoices > 0 ? ("warning" as const) : ("default" as const),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Greeting */}
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-950 sm:text-[1.75rem]">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </h2>
          <button
            type="button"
            onClick={() => void copyAccountEmail()}
            className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-[var(--hb-p-primary)]"
            title="Copy account email"
          >
            {user.email}
            {copied ? (
              <CheckCircle2 className="size-3.5 text-emerald-600" />
            ) : (
              <Copy className="size-3.5 opacity-60" />
            )}
          </button>
        </div>
        <Link
          href={routes.domainSearch}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--hb-p-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
        >
          <Search className="size-4" />
          Register a domain
        </Link>
      </section>

      {orderBannerId ? (
        <p className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">
          Order saved ({orderBannerId}). Complete payment when billing is
          enabled — no charge has been made yet.
        </p>
      ) : null}

      {/* Domains first — the core product */}
      <section className="hb-panel-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hb-p-border)] px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Your domains</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {domainSummary.total === 0
                ? "A domain is step one — everything else points at it."
                : `${domainSummary.active} active · ${domainSummary.expiring} expiring · ${domainSummary.expired} expired`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={routes.domainSearch}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hb-p-border)] px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[var(--hb-p-primary)]/40"
            >
              <Search className="size-3.5" />
              Register
            </Link>
            <Link
              href={routes.myDomains}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--hb-p-primary)] transition hover:underline"
            >
              View all
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        {domains.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-[var(--hb-p-primary)]/10 text-[var(--hb-p-primary)]">
              <Globe className="size-6" />
            </span>
            <p className="mt-4 text-sm font-semibold text-slate-900">
              No domains yet
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Search for a name, register it, then point it at hosting whenever
              you are ready. Free WHOIS privacy on eligible extensions.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link
                href={routes.domainSearch}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--hb-p-primary)] px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
              >
                <Search className="size-4" />
                Search a domain
              </Link>
              <Link
                href={routes.domainTransfer}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--hb-p-border)] px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[var(--hb-p-primary)]/40"
              >
                Transfer an existing domain
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-2 px-3 py-3 sm:px-4">
            {domains.map((domain) => (
              <DomainRow key={domain.domain} domain={domain} />
            ))}
          </ul>
        )}
      </section>

      {/* Attention required */}
      {attentionDomains.length > 0 ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-amber-900">
                {attentionDomains.length === 1
                  ? "One domain needs your attention"
                  : `${attentionDomains.length} domains need your attention`}
              </h3>
              <p className="mt-1 text-sm text-amber-900/80">
                Expired domains lose their website and email, and someone else
                can register them. Renew before the date below.
              </p>
              <ul className="mt-3 space-y-2">
                {attentionDomains.map((domain) => {
                  const days = daysUntil(domain.expiresAt);
                  return (
                    <li
                      key={domain.domain}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {domain.domain}
                        </p>
                        <p className="text-xs text-slate-500">
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
                        className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-700"
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

      {/* Key stats */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className={cn(
                "hb-panel-stat group block p-4 transition hover:shadow-md",
                stat.tone === "warning" && "ring-1 ring-amber-200",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  {stat.label}
                </p>
                <Icon
                  className={cn(
                    "size-4",
                    stat.tone === "warning"
                      ? "text-amber-600"
                      : "text-[var(--hb-p-primary)]/60",
                  )}
                />
              </div>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--hb-p-primary-deep)] tabular-nums">
                {stat.value}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-xs",
                  stat.tone === "warning"
                    ? "font-semibold text-amber-700"
                    : "text-slate-500",
                )}
              >
                {stat.sub}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <section>
        <h3 className="text-sm font-bold text-slate-900">Quick actions</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Register domain",
              hint: "Find an available name",
              href: routes.domainSearch,
              icon: Globe,
            },
            {
              label: "Transfer domain",
              hint: "Move a domain to us",
              href: routes.domainTransfer,
              icon: Lock,
            },
            {
              label: "Web hosting",
              hint: "NVMe plans with free SSL",
              href: routes.hosting,
              icon: ShoppingBag,
            },
            {
              label: "Business email",
              hint: "Your name@yourdomain",
              href: routes.businessEmail,
              icon: Mail,
            },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group flex items-start gap-3 rounded-xl border border-[var(--hb-p-border)] bg-white px-4 py-3 transition hover:border-[var(--hb-p-primary)]/40 hover:shadow-sm"
              >
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--hb-p-primary)]/10 text-[var(--hb-p-primary)]">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-900">
                    {action.label}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {action.hint}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Hosting orders */}
        <section className="hb-panel-card p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Recent hosting orders
            </h3>
            <Link
              href={routes.accountHostingOrders}
              className="text-xs font-semibold text-[var(--hb-p-primary)] hover:underline"
            >
              View all
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-[var(--hb-p-border)] px-4 py-6 text-center">
              <p className="text-sm text-slate-600">No hosting orders yet.</p>
              <Link
                href={routes.hosting}
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--hb-p-primary)] hover:underline"
              >
                Browse hosting plans
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {order.planName ??
                        `${order.productSlug} · ${order.planKey}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {ORDER_STATUS_LABELS[order.status] ?? order.status} ·{" "}
                      {order.billingCycle}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-[var(--hb-p-primary-deep)] tabular-nums">
                    {formatMoney(order.total, order.currency)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Wallet activity */}
        <section className="hb-panel-card p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Recent wallet activity
            </h3>
            <Link
              href={routes.accountBilling}
              className="text-xs font-semibold text-[var(--hb-p-primary)] hover:underline"
            >
              All transactions
            </Link>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-[var(--hb-p-border)] px-4 py-6 text-center">
              <p className="text-sm text-slate-600">No transactions yet.</p>
              <p className="mt-1 text-xs text-slate-500">
                Domain purchases and renewals debit your wallet when completed.
              </p>
            </div>
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
                      {formatPanelDateTime(tx.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-slate-900 tabular-nums">
                    {formatMoney(tx.amount, tx.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-[var(--hb-p-primary)]">
            <Link href={routes.accountWallet} className="hover:underline">
              Top up wallet
            </Link>
            <Link href={routes.accountOrders} className="hover:underline">
              Domain orders
            </Link>
            <Link href={routes.accountInvoices} className="hover:underline">
              Invoices
            </Link>
          </div>
        </section>
      </div>

      {/* What is not live yet — honest, no fake buttons */}
      <section className="rounded-2xl border border-[var(--hb-p-border)] bg-slate-50/70 p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-slate-400" />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900">
              What is live in your panel
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              We only show controls that actually work. Everything below is
              active today.
            </p>
            <ul className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              {[
                "Register, renew and transfer domains",
                "Wallet top-up and transaction history",
                "Invoices with PDF download",
                "Domain management: nameservers, lock, auth code",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <RefreshCw className="size-3" />
                Automated hosting provisioning
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3" />
                Mailbox provisioning
              </span>
              <span>— coming in a later phase.</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-[var(--hb-p-primary)]">
              <Link href={routes.contact} className="hover:underline">
                Contact support
              </Link>
              {counts.migrationRequests > 0 ? (
                <Link
                  href={routes.websiteMigration}
                  className="hover:underline"
                >
                  {counts.migrationRequests} migration request
                  {counts.migrationRequests === 1 ? "" : "s"} on file
                </Link>
              ) : null}
              {BEYOND_AI_PUBLIC_ENABLED ? (
                <Link href={routes.beyondAi} className="hover:underline">
                  Website builder
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
