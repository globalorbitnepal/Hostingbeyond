"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Copy,
  FileText,
  Globe,
  Mail,
  Search,
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
    <div className="hb-dash space-y-4">
      <section className="hb-dash-hero">
        <img
          className="hb-dash-hero__bg"
          src="/images/panel/dash-hero-banner.jpg"
          alt=""
          width={1280}
          height={720}
          draggable={false}
        />
        <img
          className="hb-dash-hero__art"
          src="/images/panel/dash-hero-banner.jpg"
          alt=""
          width={1280}
          height={720}
          draggable={false}
        />
        <div className="hb-dash-hero__copy">
          <p className="hb-dash-hero__kicker">Welcome back</p>
          <h2>
            {firstName ? `Good to see you, ${firstName}` : "Good to see you"}{" "}
            <span aria-hidden>👋</span>
          </h2>
          <p>
            Your domains, hosting, email, and billing — live on this account.
          </p>
          <button type="button" onClick={() => void copyAccountEmail()}>
            <Mail className="size-3.5" />
            {user.email}
            {copied ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
        </div>
        <div className="hb-dash-hero__stats">
          <Link href={routes.myDomains}>
            <Calendar className="size-4" />
            <span>
              <em>Next renewal</em>
              <strong>{nearestDomain?.domain ?? "No domain yet"}</strong>
            </span>
          </Link>
          <Link href={`${routes.accountWallet}#top-up`}>
            <Wallet className="size-4" />
            <span>
              <em>Wallet</em>
              <strong>{formatMoney(wallet.balance, wallet.currency)}</strong>
              <small>Available to spend</small>
            </span>
          </Link>
          <Link href={routes.accountInvoices}>
            <FileText className="size-4" />
            <span>
              <em>Open invoices</em>
              <strong>{counts.openInvoices}</strong>
              <small>
                {counts.openInvoices > 0 ? "Payment due" : "Nothing to pay"}
              </small>
            </span>
          </Link>
        </div>
      </section>

      {orderBannerId ? (
        <p className="hb-panel-card hb-text px-4 py-3 text-sm">
          Order saved ({orderBannerId}). Complete payment in Billing — no charge
          has been made yet.
        </p>
      ) : null}

      {/* Stats */}
      <div className="hb-dash-metrics">
        <Link
          href={routes.myDomains}
          className="hb-dash-metric"
          data-tone="violet"
        >
          <img
            className="hb-dash-metric__art"
            src="/images/panel/dash-icon-globe.jpg"
            alt=""
          />
          <div>
            <p>Domains</p>
            <strong>{domainSummary.total}</strong>
            <span>Registered domains</span>
          </div>
        </Link>
        <Link
          href={routes.accountHosting}
          className="hb-dash-metric"
          data-tone="slate"
        >
          <img
            className="hb-dash-metric__art"
            src="/images/panel/dash-icon-servers.jpg"
            alt=""
          />
          <div>
            <p>Hosting</p>
            <strong>{counts.hostingOrdersActive}</strong>
            <span>Active hosting plans</span>
          </div>
        </Link>
        <div className="hb-dash-metric hb-dash-metric--wallet" data-tone="sand">
          <Link href={routes.accountWallet}>
            <img
              className="hb-dash-metric__art"
              src="/images/panel/dash-icon-wallet.jpg"
              alt=""
            />
            <div>
              <p>Wallet</p>
              <strong>{formatMoney(wallet.balance, wallet.currency)}</strong>
              <span>Available balance</span>
            </div>
          </Link>
          <Link
            href={`${routes.accountWallet}#top-up`}
            className="hb-dash-plus"
            aria-label="Add wallet funds"
          >
            +
          </Link>
        </div>
        <Link
          href={routes.accountInvoices}
          className="hb-dash-metric"
          data-tone="mint"
        >
          <img
            className="hb-dash-metric__art"
            src="/images/panel/dash-icon-invoice.jpg"
            alt=""
          />
          <div>
            <p>Open invoices</p>
            <strong>{counts.openInvoices}</strong>
            <span>
              {counts.openInvoices > 0
                ? "Payment due"
                : "No outstanding invoices"}
            </span>
          </div>
        </Link>
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
      <section className="hb-dash-portfolio">
        <header>
          <div>
            <h3>
              <Globe className="size-4" /> Domain Portfolio
            </h3>
            <p>Manage, transfer and renew your domains.</p>
          </div>
          <form action={routes.accountDomainFind}>
            <Search className="size-4" />
            <input
              name="q"
              placeholder="Search your domains..."
              aria-label="Search your domains"
            />
          </form>
          <Link href={routes.accountDomainTransfer}>Transfer Domain</Link>
        </header>
        {domains.length === 0 ? (
          <div className="hb-dash-empty">
            <div className="hb-dash-empty__art" aria-hidden>
              <img src="/images/panel/dash-empty-laptop.jpg" alt="" />
            </div>
            <div>
              <h4>No domains yet</h4>
              <p>
                You don&apos;t have any registered domains. Get started by
                searching, registering or transferring a domain.
              </p>
              <div>
                <Link href={routes.accountDomainFind}>Search a Domain</Link>
                <Link href={routes.accountDomainFind}>Register a Domain +</Link>
              </div>
            </div>
          </div>
        ) : (
          <ul className="space-y-2 px-4 pt-4 pb-4">
            {domains.slice(0, 6).map((domain) => (
              <DomainRow key={domain.domain} domain={domain} />
            ))}
          </ul>
        )}
      </section>

      <section className="hb-dash-actions">
        <Link href={routes.accountDomainFind}>
          <img src="/images/panel/dash-icon-globe.jpg" alt="" />
          <span>
            <strong>Register a domain</strong>
            <em>Find and buy your perfect domain</em>
          </span>
          <ArrowRight className="size-4" />
        </Link>
        <Link href={routes.accountHosting}>
          <img src="/images/panel/dash-icon-servers.jpg" alt="" />
          <span>
            <strong>Get hosting</strong>
            <em>Launch your website in minutes</em>
          </span>
          <ArrowRight className="size-4" />
        </Link>
        <Link href={routes.accountEmail}>
          <img src="/images/panel/dash-icon-mail.jpg" alt="" />
          <span>
            <strong>Set up email</strong>
            <em>Professional business email</em>
          </span>
          <ArrowRight className="size-4" />
        </Link>
        <Link href={routes.accountAiAgent}>
          <img src="/images/panel/dash-icon-spark.jpg" alt="" />
          <span>
            <strong>Explore AI Agent</strong>
            <em>Build, manage, and grow faster</em>
          </span>
          <ArrowRight className="size-4" />
        </Link>
      </section>

      <section className="hb-dash-studio" aria-label="Account activity">
        <article className="hb-dash-studio__card">
          <header>
            <img src="/images/panel/dash-icon-servers.jpg" alt="" />
            <div>
              <h3>Recent hosting orders</h3>
              <p>Plans bought on this account</p>
            </div>
            <Link href={routes.accountHostingOrders}>View all</Link>
          </header>
          {orders.length === 0 ? (
            <div className="hb-dash-studio__empty">
              <p>No hosting orders yet.</p>
              <Link href={routes.accountHosting}>Browse plans</Link>
            </div>
          ) : (
            <ul>
              {orders.map((order) => (
                <li key={order.id}>
                  <Link href={routes.accountHostingOrders}>
                    <span>
                      <strong>
                        {order.planName ??
                          `${order.productSlug} · ${order.planKey}`}
                      </strong>
                      <em>
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                        {" · "}
                        {order.billingCycle}
                      </em>
                    </span>
                    <b>{formatMoney(order.total, order.currency)}</b>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="hb-dash-studio__card">
          <header>
            <img src="/images/panel/dash-icon-wallet.jpg" alt="" />
            <div>
              <h3>Wallet activity</h3>
              <p>Balance {formatMoney(wallet.balance, wallet.currency)}</p>
            </div>
            <Link href={routes.accountBilling}>All transactions</Link>
          </header>
          {recentTransactions.length === 0 ? (
            <div className="hb-dash-studio__empty">
              <p>No transactions yet.</p>
              <Link href={`${routes.accountWallet}#top-up`}>Top up wallet</Link>
            </div>
          ) : (
            <ul>
              {recentTransactions.map((tx) => (
                <li key={tx.id}>
                  <Link href={routes.accountBilling}>
                    <span>
                      <strong>{tx.note ?? tx.type}</strong>
                      <em>{formatPanelDateTime(tx.createdAt)}</em>
                    </span>
                    <b data-sign={tx.amount < 0 ? "out" : "in"}>
                      {formatMoney(tx.amount, tx.currency)}
                    </b>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="hb-dash-studio__links">
            <Link href={`${routes.accountWallet}#top-up`}>Top up wallet</Link>
            <Link href={routes.accountOrders}>Domain orders</Link>
            <Link href={routes.accountInvoices}>Invoices</Link>
          </div>
        </article>
      </section>
    </div>
  );
}
