import Link from "next/link";

import { businessEmailBookingHref } from "@/lib/business-email/purchase-intent";
import {
  emailDueTodayForTerm,
  formatEmailUsd,
} from "@/lib/hosting/business-email-term-pricing";
import { getBusinessEmailPageContent } from "@/lib/orbit/content";

export default async function AccountEmailPage() {
  const content = await getBusinessEmailPageContent();
  const plans = content.plans.filter((plan) => plan.visible);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="hb-panel-hero">
        <p className="text-[11px] font-bold tracking-[0.18em] text-white/75 uppercase">
          Business email
        </p>
        <h1 className="font-heading mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Professional email on your own domain
        </h1>
        <p className="mt-1 max-w-xl text-sm text-white/85">
          Mailbox plans are separate from hosting. Pick a plan and checkout asks
          for the domain and mailboxes.
        </p>
      </section>

      {plans.length === 0 ? (
        <p className="hb-panel-card hb-muted px-4 py-3 text-sm">
          Mailbox plans are being updated. Please check back shortly.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.id} className="hb-panel-card flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="hb-text text-sm font-bold">{plan.name}</p>
                {plan.popular ? (
                  <span className="hb-pill hb-pill-info">Most popular</span>
                ) : null}
              </div>
              <p className="hb-muted mt-1 text-xs">{plan.bestFor}</p>
              <p className="hb-text mt-3 text-2xl font-extrabold">
                {plan.price}
                <span className="hb-muted text-xs font-semibold">
                  {" "}
                  /mailbox
                </span>
              </p>
              <p className="hb-muted text-xs">
                {plan.storage} · 48-month term{" "}
                {formatEmailUsd(emailDueTodayForTerm(plan, "48"))} billed today
              </p>
              <ul className="hb-muted mt-3 space-y-1 text-xs">
                {plan.features.slice(0, 5).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link
                href={businessEmailBookingHref(plan.id, "12")}
                className="hb-btn hb-btn-primary mt-4"
              >
                Order {plan.name}
              </Link>
            </article>
          ))}
        </div>
      )}

      <div className="hb-panel-card p-5">
        <h2 className="hb-h2">How mailboxes connect to a domain</h2>
        <p className="hb-muted mt-1 text-sm">
          After checkout, mailbox creation and DNS records (MX, SPF, DKIM) are
          applied to the domain you choose. Nameservers and DNS are managed on
          each domain page under Domain portfolio.
        </p>
        <Link href="/account/my-domains" className="hb-btn hb-btn-ghost mt-3">
          Manage my domains
        </Link>
      </div>
    </div>
  );
}
