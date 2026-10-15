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
    where: { userId: user.id, domain, status: "ACTIVE" },
  });
  if (!registration) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="hb-panel-card p-6 sm:p-8">
        <Link
          href={routes.myDomains}
          className="text-sm font-semibold text-[#673de6]"
        >
          ← My domains
        </Link>
        <div className="mt-6">
          <DomainManagePanel
            registrationId={registration.id}
            domainName={registration.domain}
          />
        </div>
      </div>
    </div>
  );
}
