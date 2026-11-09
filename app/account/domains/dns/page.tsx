import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { listCustomerDomains } from "@/lib/domains/registration-service";

export default async function AccountDomainDnsPage() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  let rows: Array<{ domain: string; status: string }> = [];
  let loadError = false;
  try {
    const domains = await listCustomerDomains(user.id);
    rows = domains.map((row) => ({ domain: row.domain, status: row.status }));
  } catch {
    loadError = true;
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <header>
        <p className="text-[11px] font-bold tracking-[0.18em] text-[var(--hb-p-muted)] uppercase">
          Domains
        </p>
        <h1 className="font-heading mt-1 text-3xl font-extrabold tracking-tight">
          DNS
        </h1>
        <p className="mt-2 text-sm text-[var(--hb-p-muted)]">
          Open a domain to edit records, nameservers, and lock settings.
        </p>
      </header>

      {loadError ? (
        <p className="hb-panel-card p-4 text-sm text-[var(--hb-p-danger)]">
          DNS could not be loaded right now.
        </p>
      ) : rows.length === 0 ? (
        <section className="hb-panel-card p-6">
          <p className="text-sm text-[var(--hb-p-muted)]">
            You do not have a registered domain yet. Search and buy one, then
            DNS records will appear here.
          </p>
          <Link
            href={routes.accountDomainFind}
            className="hb-btn hb-btn-primary mt-4 inline-flex"
          >
            Search domains
          </Link>
        </section>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.domain}>
              <Link
                href={`${routes.myDomains}/${encodeURIComponent(row.domain)}?tab=dns`}
                className="hb-table-row flex items-center justify-between px-4 py-3"
              >
                <span className="font-semibold">{row.domain}</span>
                <span className="text-xs text-[var(--hb-p-muted)]">
                  {row.status} · Open DNS
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
