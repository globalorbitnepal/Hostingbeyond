import Link from "next/link";

import { hostingCheckoutPath } from "@/lib/hosting/purchase-intent";
import { getHostingProductBySlug } from "@/lib/hosting/hosting-products";
import { formatMoney } from "@/lib/panel/format-money";

const PRODUCTS = [
  {
    slug: "web-hosting",
    title: "Web Hosting",
    blurb:
      "NVMe sites with free SSL. Each plan is priced on this product only.",
  },
  {
    slug: "wordpress-hosting",
    title: "WordPress Hosting",
    blurb:
      "A separate WordPress plan with its own specs. Ordering it never reuses web hosting pricing.",
  },
  {
    slug: "business-hosting",
    title: "Business Hosting",
    blurb: "More resources for business sites, priced independently.",
  },
] as const;

export default async function AccountHostingPage() {
  const products = await Promise.all(
    PRODUCTS.map(async (product) => ({
      ...product,
      record: await getHostingProductBySlug(product.slug),
    })),
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="hb-eyebrow">Hosting</p>
          <h1 className="hb-h1 mt-1">Hosting plans</h1>
          <p className="hb-muted mt-1 max-w-2xl text-sm">
            Live plan catalogue from Orbit. Checkout is the order flow — you
            stay inside the panel the whole way.
          </p>
        </div>
        <Link href="/account/hosting-orders" className="hb-btn hb-btn-ghost">
          My hosting orders
        </Link>
      </header>

      {products.map((product) => {
        const plans = product.record?.plans ?? [];
        return (
          <section key={product.slug} className="space-y-3">
            <div>
              <h2 className="hb-h2">{product.title}</h2>
              <p className="hb-muted text-sm">{product.blurb}</p>
            </div>
            {plans.length === 0 ? (
              <p className="hb-panel-card hb-muted px-4 py-3 text-sm">
                Plans for {product.title} are not published yet.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {plans.map((plan) => (
                  <article
                    key={plan.id}
                    className="hb-panel-card flex flex-col p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="hb-text text-sm font-bold">
                        {plan.planName}
                      </p>
                      {plan.popular ? (
                        <span className="hb-pill hb-pill-info">Popular</span>
                      ) : null}
                    </div>
                    {plan.tagline ? (
                      <p className="hb-muted mt-1 text-xs">{plan.tagline}</p>
                    ) : null}
                    <p className="hb-text mt-3 text-2xl font-extrabold tabular-nums">
                      {formatMoney(Number(plan.monthlyPrice), plan.currency)}
                      <span className="hb-muted text-xs font-semibold">
                        {" "}
                        /mo
                      </span>
                    </p>
                    <p className="hb-muted text-xs">
                      {formatMoney(Number(plan.yearlyPrice), plan.currency)}{" "}
                      billed yearly
                    </p>
                    <ul className="hb-muted mt-3 space-y-1 text-xs">
                      {plan.storage ? <li>{plan.storage} storage</li> : null}
                      {plan.bandwidth ? (
                        <li>{plan.bandwidth} bandwidth</li>
                      ) : null}
                      {plan.websites ? <li>{plan.websites} websites</li> : null}
                      {plan.emailAccounts ? (
                        <li>{plan.emailAccounts} mailboxes</li>
                      ) : null}
                      {plan.ssl ? <li>{plan.ssl}</li> : null}
                    </ul>
                    <Link
                      href={hostingCheckoutPath({
                        product: product.slug,
                        plan: plan.planKey,
                        billing: "annually",
                      })}
                      className="hb-btn hb-btn-primary mt-4"
                    >
                      Order {plan.planName}
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
