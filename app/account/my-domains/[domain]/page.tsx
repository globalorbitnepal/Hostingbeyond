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

type Params = {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function ManageDomainPage({
  params,
  searchParams,
}: Params) {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  const { domain: domainParam } = await params;
  const { tab } = await searchParams;
  const domain = decodeURIComponent(domainParam).toLowerCase();
  const initialTab =
    tab === "dns" || tab === "nameservers" || tab === "security"
      ? tab
      : "overview";
  const registration = await prisma.domainRegistration.findFirst({
    where: { userId: user.id, domain },
  });
  if (!registration) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <nav className="hb-muted flex items-center gap-2 text-xs">
        <Link href={routes.account} className="hover:hb-text">
          Dashboard
        </Link>
        <span aria-hidden>/</span>
        <Link href={routes.myDomains} className="hover:hb-text">
          Domain portfolio
        </Link>
        <span aria-hidden>/</span>
        <span className="hb-text font-semibold">{domain}</span>
      </nav>
      <DomainManagePanel
        registrationId={registration.id}
        domainName={registration.domain}
        initialTab={initialTab}
      />
    </div>
  );
}
