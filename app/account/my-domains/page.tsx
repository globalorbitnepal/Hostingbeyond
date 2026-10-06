import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { BrandMark } from "@/components/auth/brand-mark";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { listCustomerDomains } from "@/lib/domains/registration-service";
import { routes } from "@/config/routes";

export default async function MyDomainsPage() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  const domains = await listCustomerDomains(user.id);

  return (
    <div className="hb-band-cream min-h-dvh px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/">
            <BrandMark />
          </Link>
          <LogoutButton />
        </div>
        <div className="mt-10 rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)]">
          <Link
            href={routes.account}
            className="text-sm font-semibold text-[#673de6]"
          >
            ← Account
          </Link>
          <h1 className="font-heading mt-4 text-2xl font-semibold text-slate-950">
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
    </div>
  );
}
