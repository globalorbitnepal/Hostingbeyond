import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";

export default async function AccountDomainContactsPage() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  const displayName = user.name?.trim() || "HostingBeyond customer";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <header>
        <p className="text-[11px] font-bold tracking-[0.18em] text-[var(--hb-p-muted)] uppercase">
          Domains
        </p>
        <h1 className="font-heading mt-1 text-3xl font-extrabold tracking-tight">
          Contact profiles
        </h1>
        <p className="mt-2 text-sm text-[var(--hb-p-muted)]">
          New registrations use your account contact. WHOIS privacy is included
          on eligible domains.
        </p>
      </header>

      <section className="hb-panel-card space-y-4 p-6">
        <p className="text-xs font-bold tracking-[0.14em] text-[var(--hb-p-muted)] uppercase">
          Registrant
        </p>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-[var(--hb-p-muted)]">Name</dt>
            <dd className="font-semibold">{displayName}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--hb-p-muted)]">Email</dt>
            <dd className="font-semibold">{user.email}</dd>
          </div>
        </dl>
        <p className="text-sm text-[var(--hb-p-muted)]">
          Administrative, billing, and technical contacts match this profile at
          checkout. Privacy hides them from the public WHOIS.
        </p>
        <Link
          href={routes.accountDomainFind}
          className="hb-btn hb-btn-primary inline-flex"
        >
          Register a domain
        </Link>
      </section>
    </div>
  );
}
