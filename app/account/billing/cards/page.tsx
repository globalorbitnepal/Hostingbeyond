import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PanelPaymentCards } from "@/components/panel/panel-payment-cards";
import { PanelPageHeader } from "@/components/panel/panel-ui";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { listCustomerCards } from "@/lib/payments/customer-cards";

export default async function AccountPaymentCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string }>;
}) {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  const params = await searchParams;
  let cards: Awaited<ReturnType<typeof listCustomerCards>> = {
    configured: false,
    cards: [],
  };
  try {
    cards = await listCustomerCards({ userId: user.id, email: user.email });
  } catch {
    cards = { configured: false, cards: [] };
  }

  const flash =
    params.setup === "success"
      ? "Card saved. It is available for wallet top-ups and SSL checkout."
      : params.setup === "cancelled"
        ? "Card setup was cancelled. Nothing was saved."
        : null;

  return (
    <div className="mx-auto w-full max-w-xl space-y-5">
      <PanelPageHeader
        eyebrow="Billing"
        title="Payment cards"
        description="Save a card once — Stripe stores it. HostingBeyond never sees the full number."
      />
      <div className="hb-panel-card p-5 sm:p-7">
        <PanelPaymentCards
          cards={cards.cards}
          configured={cards.configured}
          flash={flash}
        />
      </div>
    </div>
  );
}
