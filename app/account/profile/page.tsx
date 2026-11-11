import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ProfileInformationPanel } from "@/components/panel/profile/profile-information-panel";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { loadProfileSnapshot } from "@/lib/panel/load-profile-snapshot";

export default async function AccountProfilePage() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);
  const snapshot = await loadProfileSnapshot(user);
  return <ProfileInformationPanel initial={snapshot} />;
}
