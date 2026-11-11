import Link from "next/link";

import { PanelEmailPlans } from "@/components/panel/panel-email-plans";
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
          Monthly or yearly — same plans as the public storefront. Checkout asks
          for the domain and mailbox count.
        </p>
      </section>

      <PanelEmailPlans plans={plans} />

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
