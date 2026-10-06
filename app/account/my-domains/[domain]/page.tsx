import Link from "next/link";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";

import { BrandMark } from "@/components/auth/brand-mark";
import { LogoutButton } from "@/components/auth/logout-button";
import { DomainManagePanel } from "@/components/domains/domain-manage-panel";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { routes } from "@/config/routes";
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
    <div className="hb-band-cream min-h-dvh px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/">
            <BrandMark />
          </Link>
          <LogoutButton />
        </div>
        <div className="mt-10 rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)]">
          <Link
            href="/account/my-domains"
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
    </div>
  );
}
