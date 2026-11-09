import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Globe2,
  LayoutGrid,
  Server,
  Sparkles,
} from "lucide-react";

import { HostingSiteLauncher } from "@/components/panel/hosting-site-launcher";
import { PanelPageHeader } from "@/components/panel/panel-ui";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { listCustomerHostingPlans } from "@/lib/hosting/customer-hosting-plans";
import {
  HOSTING_SITE_TYPE_LABELS,
  type HostingSiteRecord,
} from "@/lib/hosting/customer-hosting-sites";
import { getHostingProductBySlug } from "@/lib/hosting/hosting-products";
import { HOSTING_PRODUCT_REGISTRY } from "@/lib/hosting/products-registry";
import { hostingCheckoutPath } from "@/lib/hosting/purchase-intent";
import { formatMoney } from "@/lib/panel/format-money";
import { cn } from "@/lib/utils";

/** Products customers can actually buy from the panel, in display order. */
const PURCHASABLE_PRODUCTS = [
  "web-hosting",
  "wordpress-hosting",
  "ecommerce-hosting",
  "business-hosting",
] as const;

function siteStatusTone(site: HostingSiteRecord) {
  if (site.status === "live") return "hb-pill-ok";
  if (site.status === "provisioning") return "hb-pill-info";
  return "hb-pill-warn";
}

function siteStatusLabel(site: HostingSiteRecord) {
  if (site.status === "live") return "Live";
  if (site.status === "provisioning") return "Installing";
  return "Setup queued";
}

export default async function AccountHostingPage() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  const [myPlans, ...products] = await Promise.all([
    listCustomerHostingPlans(user.id),
    ...PURCHASABLE_PRODUCTS.map((slug) => getHostingProductBySlug(slug)),
  ]);

  const activePlans = myPlans.filter((plan) => plan.readyForSites);
  const pendingPlans = myPlans.filter((plan) => !plan.readyForSites);
  const totalSites = myPlans.reduce((sum, plan) => sum + plan.sites.length, 0);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <PanelPageHeader
        eyebrow="Hosting"
        title="Hosting"
        description="Every plan you own, the websites running on it, and the full catalogue — all inside your account."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={routes.accountHostingOrders}
              className="hb-btn hb-btn-ghost"
            >
              Order history
            </Link>
            <a href="#plans" className="hb-btn hb-btn-primary">
              Browse plans
            </a>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Active plans",
            value: String(activePlans.length),
            icon: Server,
          },
          { label: "Websites", value: String(totalSites), icon: Globe2 },
          {
            label: "Awaiting payment",
            value: String(pendingPlans.length),
            icon: Clock3,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="hb-panel-card flex items-center gap-3 px-4 py-3"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-[var(--hb-p-primary)]/12 text-[var(--hb-p-primary)]">
              <stat.icon className="size-4" />
            </span>
            <div>
              <p className="hb-muted text-[11px] font-bold tracking-[0.12em] uppercase">
                {stat.label}
              </p>
              <p className="hb-text text-xl font-extrabold tabular-nums">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Owning hosting ------------------------------------------------ */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="hb-h2">My hosting</h2>
            <p className="hb-muted text-sm">
              Websites live on the plan you bought — WordPress, AI Builder, web
              apps, or plain PHP/HTML.
            </p>
          </div>
        </div>

        {myPlans.length === 0 ? (
          <div className="hb-panel-card px-5 py-8 text-center">
            <p className="hb-text text-sm font-bold">No hosting plans yet</p>
            <p className="hb-muted mx-auto mt-1 max-w-md text-sm">
              Pick a plan below, complete checkout, and your hosting appears
              here ready for websites.
            </p>
            <a href="#plans" className="hb-btn hb-btn-primary mt-4 inline-flex">
              See plans
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {myPlans.map((plan) => {
              const remaining =
                plan.siteLimit == null
                  ? null
                  : Math.max(0, plan.siteLimit - plan.sites.length);
              return (
                <article key={plan.orderId} className="hb-panel-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="hb-text text-base font-extrabold">
                          {plan.planName}
                        </h3>
                        <span
                          className={cn(
                            "hb-pill",
                            plan.readyForSites
                              ? "hb-pill-ok"
                              : plan.status === "FAILED"
                                ? "hb-pill-danger"
                                : "hb-pill-warn",
                          )}
                        >
                          {plan.readyForSites ? "Active" : plan.statusLabel}
                        </span>
                      </div>
                      <p className="hb-muted mt-1 text-xs">
                        {plan.orderReference} · {plan.productName} ·{" "}
                        {plan.billingCycle} ·{" "}
                        {formatMoney(plan.total, plan.currency)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="hb-muted text-[11px] font-bold tracking-[0.12em] uppercase">
                        Websites
                      </p>
                      <p className="hb-text text-sm font-bold tabular-nums">
                        {plan.sites.length}
                        {plan.siteLimit != null
                          ? ` / ${plan.siteLimit}`
                          : " / ∞"}
                      </p>
                    </div>
                  </div>

                  {plan.sites.length > 0 ? (
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {plan.sites.map((site) => (
                        <li
                          key={site.id}
                          className="flex items-start justify-between gap-2 rounded-xl border border-[var(--hb-p-border)] px-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="hb-text truncate text-sm font-bold">
                              {site.name}
                            </p>
                            <p className="hb-muted truncate text-xs">
                              {HOSTING_SITE_TYPE_LABELS[site.type]}
                              {site.domain ? ` · ${site.domain}` : ""}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "hb-pill shrink-0",
                              siteStatusTone(site),
                            )}
                          >
                            {siteStatusLabel(site)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="hb-muted mt-3 text-xs">
                      No websites on this plan yet.
                    </p>
                  )}

                  <div className="mt-4 border-t border-[var(--hb-p-border)] pt-4">
                    {plan.readyForSites ? (
                      <HostingSiteLauncher
                        orderId={plan.orderId}
                        planName={plan.planName}
                        defaultDomain={null}
                        remainingSlots={remaining}
                      />
                    ) : plan.ctaHref ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={plan.ctaHref}
                          className="hb-btn hb-btn-primary inline-flex items-center gap-2"
                        >
                          Complete payment
                          <ArrowRight className="size-4" />
                        </Link>
                        <span className="hb-muted text-xs">
                          Your hosting activates automatically after payment
                          confirms.
                        </span>
                      </div>
                    ) : (
                      <p className="hb-muted text-xs">
                        {plan.statusLabel}. Our team is finishing activation —
                        you will be emailed when websites can be created.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Catalogue ---------------------------------------------------- */}
      <section id="plans" className="scroll-mt-24 space-y-4">
        <div>
          <h2 className="hb-h2">Plans you can buy</h2>
          <p className="hb-muted text-sm">
            Live catalogue from Orbit. Prices, specs and billing match the
            public site exactly.
          </p>
        </div>

        {products.map((product, index) => {
          if (!product || product.status !== "ACTIVE") return null;
          const slug = PURCHASABLE_PRODUCTS[index];
          const registry = HOSTING_PRODUCT_REGISTRY.find(
            (entry) => entry.slug === slug,
          );
          if (product.plans.length === 0) return null;
          return (
            <div key={product.slug} className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <LayoutGrid className="size-4 text-[var(--hb-p-primary)]" />
                <h3 className="hb-text text-sm font-extrabold">
                  {product.name}
                </h3>
                {product.shortDescription ? (
                  <span className="hb-muted text-xs">
                    {product.shortDescription}
                  </span>
                ) : null}
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {product.plans.map((plan) => (
                  <article
                    key={plan.id}
                    className={cn(
                      "hb-panel-card flex flex-col p-4",
                      plan.popular && "ring-1 ring-[var(--hb-p-primary)]/35",
                    )}
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
                      <p className="hb-muted mt-1 text-xs leading-relaxed">
                        {plan.tagline}
                      </p>
                    ) : null}

                    <p className="hb-text mt-3 text-2xl font-extrabold tabular-nums">
                      {formatMoney(
                        Number(plan.yearlyPrice) / 12,
                        plan.currency,
                      )}
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
                      {plan.storage ? <li>{plan.storage}</li> : null}
                      {plan.bandwidth ? <li>{plan.bandwidth}</li> : null}
                      {plan.websites ? <li>{plan.websites}</li> : null}
                      {plan.emailAccounts ? (
                        <li>{plan.emailAccounts}</li>
                      ) : null}
                      {plan.ssl ? <li>{plan.ssl}</li> : null}
                    </ul>

                    {Array.isArray(plan.features) &&
                    plan.features.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-xs">
                        {(plan.features as string[])
                          .slice(0, 4)
                          .map((feature) => (
                            <li
                              key={feature}
                              className="hb-text-soft flex items-start gap-1.5"
                            >
                              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[var(--hb-p-ok)]" />
                              <span>{feature}</span>
                            </li>
                          ))}
                      </ul>
                    ) : null}

                    <Link
                      href={hostingCheckoutPath({
                        product: product.slug,
                        plan: plan.planKey,
                        billing: "annually",
                      })}
                      className="hb-btn hb-btn-primary mt-auto pt-2 pb-2 text-center"
                    >
                      Buy {plan.planName}
                    </Link>
                    {registry ? (
                      <Link
                        href={registry.canonicalPath}
                        className="hb-muted mt-2 text-center text-[11px] font-semibold hover:underline"
                      >
                        See full specs
                      </Link>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="hb-panel-card flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--hb-p-primary)]/12 text-[var(--hb-p-primary)]">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="hb-text text-sm font-bold">
              Moving a site from another host?
            </p>
            <p className="hb-muted text-xs">
              We migrate your files, database and email at no extra cost.
            </p>
          </div>
        </div>
        <Link href={routes.websiteMigration} className="hb-btn hb-btn-ghost">
          Request migration
        </Link>
      </section>
    </div>
  );
}
