import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  DomainTable,
  type DomainTableRow,
} from "@/components/panel/domain-table";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { listCustomerDomains } from "@/lib/domains/registration-service";
import { summarizeDomains } from "@/lib/panel/domain-status";

export default async function MyDomainsPage() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  let rows: DomainTableRow[] = [];
  let loadError = false;
  try {
    const domains = await listCustomerDomains(user.id);
    rows = domains.map((row) => ({
      domain: row.domain,
      status: row.status,
      registeredAt: row.registeredAt ? row.registeredAt.toISOString() : null,
      expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
      autoRenew: row.autoRenew,
      renewalPrice: row.renewalPrice,
      currency: row.currency,
    }));
  } catch {
    loadError = true;
  }

  const summary = summarizeDomains(
    rows.map((row) => ({ status: row.status, expiresAt: row.expiresAt })),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-950">
            My domains
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Renew, lock, and point your domains at any website or email
            provider.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={routes.domainSearch}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--hb-p-primary)] px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
          >
            Register a domain
          </Link>
          <Link
            href={routes.domainTransfer}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--hb-p-border)] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[var(--hb-p-primary)]/40"
          >
            Transfer
          </Link>
        </div>
      </div>

      {!loadError && rows.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total domains", value: summary.total },
            { label: "Active", value: summary.active },
            { label: "Expiring soon", value: summary.expiring },
            { label: "Expired", value: summary.expired },
          ].map((stat) => (
            <div key={stat.label} className="hb-panel-stat px-4 py-3">
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
              <p className="mt-1 text-xl font-bold text-[var(--hb-p-primary-deep)] tabular-nums">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {loadError ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          Could not load your domains right now. Please refresh in a moment.
        </p>
      ) : rows.length === 0 ? (
        <div className="hb-panel-card px-5 py-12 text-center">
          <h2 className="font-heading text-lg font-bold text-slate-900">
            No domains yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            A domain is the address customers type to reach you. Search for one
            and it appears here in seconds.
          </p>
          <Link
            href={routes.domainSearch}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--hb-p-primary)] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
          >
            Search domains
          </Link>
        </div>
      ) : (
        <DomainTable rows={rows} />
      )}
    </div>
  );
}
