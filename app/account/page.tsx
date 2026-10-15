import { redirect } from "next/navigation";

import { DashboardOverview } from "@/components/panel/dashboard-overview";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { loadDashboardOverview } from "@/lib/panel/load-dashboard-overview";
import { cookies } from "next/headers";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect("/login");

  const params = await searchParams;
  const overview = await loadDashboardOverview(user.id);

  return <DashboardOverview data={overview} orderBannerId={params.order} />;
}
