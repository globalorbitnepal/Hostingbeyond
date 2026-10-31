import Link from "next/link";

import { SiteHeader } from "@/components/layout/header";
import { routes } from "@/config/routes";

export function BusinessEmailCheckoutInvalid() {
  return (
    <div className="hb-checkout-premium hb-checkout-premium--email relative min-h-dvh">
      <div className="hb-checkout-premium__ambient" aria-hidden />
      <SiteHeader />
      <div className="relative z-10 mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-extrabold text-[var(--hb-co-royal)]">
          Business email checkout unavailable
        </h1>
        <p className="mt-3 text-[15px] text-[var(--hb-co-text-muted)]">
          That mailbox plan or billing term is not available. Pick a plan from
          the pricing page and try again.
        </p>
        <Link
          href={`${routes.businessEmail}#plans`}
          className="hb-checkout-premium__btn-primary mt-8 inline-flex"
        >
          View Business Email plans
        </Link>
      </div>
    </div>
  );
}
