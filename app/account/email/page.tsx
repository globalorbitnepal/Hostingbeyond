import Link from "next/link";

import { businessEmailBookingHref } from "@/lib/business-email/purchase-intent";
import { getBusinessEmailPageContent } from "@/lib/orbit/content";

export default async function AccountEmailPage() {
  const content = await getBusinessEmailPageContent();
  const plans = content.plans.filter((plan) => plan.visible);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header>
        <h2 className="font-heading text-2xl font-bold">Business email</h2>
        <p className="mt-1 text-sm text-[var(--hb-p-muted)]">
          Mailbox plans are separate from hosting. Pick a plan to open email
          checkout with your domain.
        </p>
      </header>
      <div className="grid gap-3 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.id} className="hb-panel-card flex flex-col p-5">
            <p className="text-sm font-bold">{plan.name}</p>
            <p className="mt-1 text-xs text-[var(--hb-p-muted)]">
              {plan.bestFor}
            </p>
            <p className="mt-3 text-2xl font-bold">{plan.price}</p>
            <p className="text-xs text-[var(--hb-p-muted)]">{plan.storage}</p>
            <ul className="mt-3 space-y-1 text-xs text-[var(--hb-p-muted)]">
              {plan.features.slice(0, 4).map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Link
              href={businessEmailBookingHref(plan.id, "12")}
              className="mt-4 inline-flex justify-center rounded-xl px-3 py-2 text-xs font-bold text-white"
              style={{ background: "var(--hb-p-primary)", color: "#fff" }}
            >
              Order {plan.name}
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
