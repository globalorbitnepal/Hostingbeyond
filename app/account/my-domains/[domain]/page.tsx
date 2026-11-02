import Link from "next/link";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";

import { DomainManagePanel } from "@/components/domains/domain-manage-panel";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ domain: string }> };

export default async function ManageDomainPage({ params }: Params) {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  const { domain: domainParam } = await params;
  const domain = decodeURIComponent(domainParam).toLowerCase();
  const registration = await prisma.domainRegistration.findFirst({
    where: { userId: user.id, domain },
  });
  if (!registration) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <nav className="mb-3 flex items-center gap-2 text-xs text-slate-500">
        <Link
          href={routes.account}
          className="hover:text-[var(--hb-p-primary)]"
        >
          Dashboard
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={routes.myDomains}
          className="hover:text-[var(--hb-p-primary)]"
        >
          My domains
        </Link>
        <span aria-hidden>/</span>
        <span className="font-semibold text-slate-700">{domain}</span>
      </nav>
      <div className="hb-panel-card p-5 sm:p-7">
        <DomainManagePanel
          registrationId={registration.id}
          domainName={registration.domain}
        />
      </div>
    </div>
  );
}
