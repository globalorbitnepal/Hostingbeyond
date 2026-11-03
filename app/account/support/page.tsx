import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PanelSupportForm } from "@/components/panel/panel-support-form";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";

export default async function AccountSupportPage() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  return (
    <PanelSupportForm
      name={user.name?.trim() || user.email.split("@")[0]}
      email={user.email}
    />
  );
}
