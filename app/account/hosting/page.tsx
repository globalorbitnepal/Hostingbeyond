import Link from "next/link";

import { hostingCheckoutPath } from "@/lib/hosting/purchase-intent";
import { getHostingProductBySlug } from "@/lib/hosting/hosting-products";

const PRODUCTS = [
  {
    slug: "web-hosting",
    title: "Web Hosting",
    blurb: "NVMe sites with free SSL. Plans stay on this product only.",
  },
  {
    slug: "wordpress-hosting",
    title: "WordPress Hosting",
    blurb:
      "A separate WordPress plan. It does not reuse web hosting specs. Order it here; site setup follows the active hosting order.",
  },
  {
    slug: "business-hosting",
    title: "Business Hosting",
    blurb: "Higher resources for business sites, priced on its own plans.",
  },
] as const;

function money(value: { toString(): string }, currency: string) {
  const amount = Number(value.toString());
  if (!Number.isFinite(amount)) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount);
}

export default async function AccountHostingPage() {
  const products = await Promise.all(
    PRODUCTS.map(async (product) => ({
      ...product,
      record: await getHostingProductBySlug(product.slug),
    })),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h2 className="font-heading text-2xl font-bold">Hosting plans</h2>
        <p className="mt-1 text-sm text-[var(--hb-p-muted)]">
          Each product keeps its own price. Checkout is the order flow, not the
          public marketing page.
        </p>
      </header>
      {products.map((product) => (
        <section key={product.slug} className="space-y-3">
          <div>
            <h3 className="text-lg font-bold">{product.title}</h3>
            <p className="text-sm text-[var(--hb-p-muted)]">{product.blurb}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {(product.record?.plans ?? []).map((plan) => (
              <article
                key={plan.id}
                className="hb-panel-card flex flex-col p-4"
              >
                <p className="text-sm font-bold">{plan.planName}</p>
                {plan.tagline ? (
                  <p className="mt-1 text-xs text-[var(--hb-p-muted)]">
                    {plan.tagline}
                  </p>
                ) : null}
                <p className="mt-3 text-2xl font-bold tabular-nums">
                  {money(plan.monthlyPrice, plan.currency)}
                  <span className="text-xs font-medium text-[var(--hb-p-muted)]">
                    {" "}
                    /mo
                  </span>
                </p>
                <p className="text-xs text-[var(--hb-p-muted)]">
                  {money(plan.yearlyPrice, plan.currency)} billed yearly
                </p>
                <Link
                  href={hostingCheckoutPath({
                    product: product.slug,
                    plan: plan.planKey,
                    billing: "annually",
                  })}
                  className="mt-4 inline-flex justify-center rounded-xl bg-[var(--hb-p-primary)] px-3 py-2 text-xs font-bold text-[#1c1530] dark:text-white"
                  style={{ color: "#fff" }}
                >
                  Order {plan.planName}
                </Link>
              </article>
            ))}
          </div>
          {(product.record?.plans.length ?? 0) === 0 ? (
            <p className="text-sm text-[var(--hb-p-muted)]">
              Plans for {product.title} are not published yet.
            </p>
          ) : null}
        </section>
      ))}
      <p className="text-sm">
        <Link
          href="/account/hosting-orders"
          className="font-semibold text-[var(--hb-p-primary)]"
        >
          View hosting orders
        </Link>
      </p>
    </div>
  );
}
