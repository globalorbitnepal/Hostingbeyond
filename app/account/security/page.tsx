import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AccountSecurityPanel } from "@/components/panel/account-security-panel";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";

export default async function AccountSecurityPage() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  return (
    <div className="mx-auto max-w-xl">
      <div className="hb-panel-card p-6 sm:p-8">
        <h1 className="font-heading text-2xl font-semibold text-slate-950">
          Security
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage how you sign in to HostingBeyond.
        </p>
        <AccountSecurityPanel
          email={user.email}
          hasPassword={Boolean(user.passwordHash)}
        />
      </div>
    </div>
  );
}
