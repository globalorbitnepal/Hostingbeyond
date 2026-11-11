import { redirect } from "next/navigation";

import { DashboardOverview } from "@/components/panel/dashboard-overview";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { loadDashboardOverview } from "@/lib/panel/load-dashboard-overview";
import { getBusinessEmailPageContent } from "@/lib/orbit/content";
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
  const [overview, emailPage] = await Promise.all([
    loadDashboardOverview(user.id),
    getBusinessEmailPageContent(),
  ]);

  return (
    <DashboardOverview
      data={overview}
      orderBannerId={params.order}
      emailPlans={emailPage.plans.filter((plan) => plan.visible)}
    />
  );
}
