import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { listCustomerDomains } from "@/lib/domains/registration-service";

export default async function MyDomainsPage() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  const domains = await listCustomerDomains(user.id);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="hb-panel-card p-6 sm:p-8">
        <h1 className="font-heading text-2xl font-semibold text-slate-950">
          My domains
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage nameservers, transfer lock, renewals, and auth codes.
        </p>
        {domains.length === 0 ? (
          <p className="mt-6 text-sm text-slate-600">
            No domains yet.{" "}
            <Link href={routes.domainSearch} className="text-[#673de6]">
              Search for a domain
            </Link>
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-slate-100">
            {domains.map((row) => (
              <li
                key={row.domain}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">{row.domain}</p>
                  <p className="text-xs text-slate-500">
                    {row.status}
                    {row.expiresAt
                      ? ` · expires ${new Date(row.expiresAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <Link
                  href={`/account/my-domains/${encodeURIComponent(row.domain)}`}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Manage
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
