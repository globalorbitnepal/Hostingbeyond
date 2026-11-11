"use client";

import Link from "next/link";
import {
  Globe,
  HardDrive,
  Mail,
  Server,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { money } from "@/lib/orbit/ops-dashboard-math";
import type { OpsRow, OpsSnapshot } from "@/lib/orbit/ops-dashboard-types";

function Stat({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  href: string;
}) {
  return (
    <Link href={href} className="hb-orbit-stat">
      <p className="hb-orbit-stat__label">{label}</p>
      <p className="hb-orbit-stat__value">{value}</p>
      {hint ? <p className="hb-orbit-stat__hint">{hint}</p> : null}
    </Link>
  );
}

function Rows({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: OpsRow[];
}) {
  return (
    <section className="hb-orbit-panel">
      <h2>{title}</h2>
      {rows.length === 0 ? (
        <p className="hb-orbit-empty">{empty}</p>
      ) : (
        <ul>
          {rows.map((row) => (
            <li key={row.id}>
              <Link href={row.href}>
                <span>
                  <strong>{row.title}</strong>
                  <em>{row.meta}</em>
                </span>
                <b>{row.amount}</b>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function OpsDashboardView({ data }: { data: OpsSnapshot }) {
  const currency = data.money.currency;
  const sslDate = data.ssl.siteExpiresAt
    ? new Date(data.ssl.siteExpiresAt).toLocaleDateString()
    : "Unknown";

  return (
    <div className="hb-orbit-ops">
      <header className="hb-orbit-ops__head">
        <div>
          <p className="hb-orbit-ops__kicker">Operations</p>
          <h1>Dashboard</h1>
          <p>
            Live orders, renewals, payments, SSL, and this server. Updated{" "}
            {new Date(data.generatedAt).toLocaleString()}.
          </p>
        </div>
      </header>

      <section>
        <h2 className="hb-orbit-ops__section">Money received</h2>
        <div className="hb-orbit-stats">
          <Stat
            label="Paid invoices"
            value={money(data.money.invoicesPaidTotal, currency)}
            hint={`${data.money.invoicesPaidCount} paid · ${data.money.invoicesOpenCount} still open`}
            href="/orbit/invoices"
          />
          <Stat
            label="Domain orders paid"
            value={money(data.money.domainPaidTotal, currency)}
            hint={`${data.money.domainPaidCount} paid · ${data.money.domainPendingCount} awaiting payment`}
            href="/orbit/domain-orders"
          />
          <Stat
            label="Hosting orders paid"
            value={money(data.money.hostingPaidTotal, currency)}
            hint={`${data.money.hostingPaidCount} paid or active · ${data.money.hostingPendingCount} not paid`}
            href="/orbit/hosting-orders"
          />
          <Stat
            label="Wallet top-ups"
            value={money(data.money.walletTopupTotal, currency)}
            hint={`${data.money.walletTopupCount} succeeded. This is cash added to wallets, not invoice revenue.`}
            href="/orbit/wallets"
          />
        </div>
      </section>

      <section>
        <h2 className="hb-orbit-ops__section">
          <Globe className="size-4" /> Domains
        </h2>
        <div className="hb-orbit-stats">
          <Stat
            label="Active domains"
            value={String(data.domains.active)}
            hint={`${data.domains.autoRenew} set to auto-renew`}
            href="/orbit/customer-domains"
          />
          <Stat
            label="Renew in 30 days"
            value={String(data.domains.expiring30)}
            hint={`${data.domains.expired} already expired`}
            href="/orbit/customer-domains"
          />
          <Stat
            label="Transfers in progress"
            value={String(data.domains.transfersOpen)}
            href="/orbit/domain-orders"
          />
          <Stat
            label="Customers"
            value={String(data.customers.total)}
            hint={`${data.customers.sessions24h} sessions in 24 hours`}
            href="/orbit/users"
          />
        </div>
      </section>

      <section>
        <h2 className="hb-orbit-ops__section">
          <HardDrive className="size-4" /> Hosting
        </h2>
        {data.hosting.length === 0 ? (
          <p className="hb-orbit-empty">No hosting orders yet.</p>
        ) : (
          <div className="hb-orbit-stats">
            {data.hosting.map((row) => (
              <Stat
                key={row.status}
                label={row.status.replaceAll("_", " ")}
                value={String(row.count)}
                hint={money(row.total, currency)}
                href="/orbit/hosting-orders"
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="hb-orbit-ops__section">
          <Mail className="size-4" /> Business email and support
        </h2>
        <div className="hb-orbit-stats">
          <Stat
            label="Queued customer mail"
            value={String(data.email.queuedMessages)}
            hint={`${data.email.mailboxesStored} customer mail stores. This is panel queue data, not a live mail-host mailbox count.`}
            href="/orbit/business-email"
          />
          <Stat
            label="Open support tickets"
            value={String(data.email.openTickets)}
            href="/orbit/beyond-master/tickets"
          />
        </div>
      </section>

      <section>
        <h2 className="hb-orbit-ops__section">
          <ShieldCheck className="size-4" /> SSL
        </h2>
        <div className="hb-orbit-stats">
          <Stat
            label="Customer certificates"
            value={String(data.ssl.stored)}
            hint={`${data.ssl.active} active · ${data.ssl.premium} premium · ${data.ssl.expiring30} expire within 30 days`}
            href="/orbit/ssl"
          />
          <Stat
            label={`${data.ssl.siteHost} certificate`}
            value={data.ssl.siteOk ? "Valid" : "Check failed"}
            hint={
              data.ssl.siteOk
                ? `Issuer ${data.ssl.siteIssuer ?? "unknown"} · expires ${sslDate}`
                : `Live check failed (${data.ssl.siteError ?? "unknown"})`
            }
            href="/"
          />
        </div>
      </section>

      <section>
        <h2 className="hb-orbit-ops__section">
          <Server className="size-4" /> This server
        </h2>
        <div className="hb-orbit-stats">
          <Stat
            label="Host"
            value={data.server.hostname}
            hint={`${data.server.platform} · Node ${data.server.node}`}
            href="/orbit/activity"
          />
          <Stat
            label="Memory"
            value={`${data.server.memoryUsedMb} MB`}
            hint={`of ${data.server.memoryTotalMb} MB`}
            href="/orbit/activity"
          />
          <Stat
            label="Load 1 / 5 / 15"
            value={data.server.load}
            hint={`Host up ${data.server.hostUptimeHours}h · app up ${data.server.processUptimeHours}h`}
            href="/orbit/activity"
          />
          <Stat
            label="Traffic sources"
            value="Not connected"
            hint={data.traffic.note}
            href="/orbit/settings"
          />
        </div>
      </section>

      <section>
        <h2 className="hb-orbit-ops__section">
          <Wallet className="size-4" /> Connected APIs
        </h2>
        <div className="hb-orbit-apis">
          {data.integrations.map((item) => (
            <div key={item.id} data-on={item.connected ? "true" : "false"}>
              <strong>{item.label}</strong>
              <span>{item.connected ? "Connected" : "Off"}</span>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="hb-orbit-split">
        <Rows
          title="Latest domain orders"
          empty="No domain orders yet."
          rows={data.recentDomains}
        />
        <Rows
          title="Latest hosting orders"
          empty="No hosting orders yet."
          rows={data.recentHosting}
        />
        <Rows
          title="Latest paid invoices"
          empty="No paid invoices yet."
          rows={data.recentInvoices}
        />
        <Rows
          title="Domains renewing in 30 days"
          empty="No active domains expire in the next 30 days."
          rows={data.expiringDomains}
        />
      </div>
    </div>
  );
}
