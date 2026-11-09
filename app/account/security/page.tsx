import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AccountSecurityPanel } from "@/components/panel/account-security-panel";
import { PanelPageHeader } from "@/components/panel/panel-ui";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { prisma } from "@/lib/prisma";

export default async function AccountSecurityPage() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  const oauth = await prisma.customerOAuthAccount.findMany({
    where: { userId: user.id },
    select: { provider: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-xl space-y-5">
      <PanelPageHeader
        eyebrow="Account"
        title="Security"
        description="Manage how you sign in to HostingBeyond."
      />
      <div className="hb-panel-card p-5 sm:p-7">
        <AccountSecurityPanel
          email={user.email}
          hasPassword={Boolean(user.passwordHash)}
          hasOauth={oauth.length > 0}
          providers={oauth.map((row) => row.provider)}
        />
      </div>
    </div>
  );
}
