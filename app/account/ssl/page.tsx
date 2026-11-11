import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PanelSslManager } from "@/components/panel/panel-ssl-manager";
import { PanelPageHeader } from "@/components/panel/panel-ui";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { loadNameSiloSslCatalog } from "@/lib/panel/namesilo-ssl-catalog";
import { listSslInventory } from "@/lib/panel/ssl-inventory";

export default async function AccountSslPage({
  searchParams,
}: {
  searchParams: Promise<{ ssl?: string }>;
}) {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  const params = await searchParams;
  const [{ rows, hasActiveHosting }, catalog] = await Promise.all([
    listSslInventory(user.id),
    loadNameSiloSslCatalog(),
  ]);

  const flash =
    params.ssl === "processing"
      ? "Payment received. Premium SSL activates when Stripe confirms — this page will show the new expiry."
      : params.ssl === "cancelled"
        ? "SSL checkout was cancelled. Nothing was charged."
        : null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <PanelPageHeader
        eyebrow="Domains"
        title="SSL certificates"
        description="Every domain’s renewal date, free AutoSSL when hosting is active, and premium NameSilo certificates at the registrar’s price."
      />
      <PanelSslManager
        rows={rows}
        products={catalog.products}
        livePrices={catalog.live}
        hasActiveHosting={hasActiveHosting}
        flash={flash}
      />
    </div>
  );
}
