import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PanelAiAgentWorkspace } from "@/components/panel/panel-ai-agent-workspace";
import { PanelPageHeader } from "@/components/panel/panel-ui";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { listCustomerDomains } from "@/lib/domains/registration-service";
import { listCustomerHostingPlans } from "@/lib/hosting/customer-hosting-plans";

export default async function AccountAiAgentPage() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  const [plans, domains] = await Promise.all([
    listCustomerHostingPlans(user.id).catch(() => []),
    listCustomerDomains(user.id).catch(() => []),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <PanelPageHeader
        eyebrow="AI"
        title="AI Agent"
        description="Search in your own words. DNS, WordPress, and hosting stay on this account and follow the plan you paid for."
      />
      <PanelAiAgentWorkspace
        name={user.name?.trim() || user.email.split("@")[0]}
        plans={plans.map((plan) => ({
          orderId: plan.orderId,
          planName: plan.planName,
          productName: plan.productName,
          readyForSites: plan.readyForSites,
          remainingSlots:
            plan.siteLimit == null
              ? null
              : Math.max(0, plan.siteLimit - plan.sites.length),
        }))}
        domains={domains.map((row) => ({ domain: row.domain }))}
      />
    </div>
  );
}
