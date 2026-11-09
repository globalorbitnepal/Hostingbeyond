import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  Blocks,
  Braces,
  Globe2,
  LayoutGrid,
  Plus,
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
  HOSTING_SITE_TYPE_DESCRIPTIONS,
  HOSTING_SITE_TYPE_LABELS,
  HOSTING_SITE_TYPES,
  type HostingSiteRecord,
  type HostingSiteType,
} from "@/lib/hosting/customer-hosting-sites";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<HostingSiteType, typeof Server> = {
  wordpress: Blocks,
  "ai-builder": Sparkles,
  "web-apps": Braces,
  "php-html": LayoutGrid,
};

function statusPill(site: HostingSiteRecord) {
  if (site.status === "live") return { className: "hb-pill-ok", label: "Live" };
  if (site.status === "provisioning") {
    return { className: "hb-pill-info", label: "Installing" };
  }
  return { className: "hb-pill-warn", label: "Setup queued" };
}

export default async function AccountMyWebsitesPage() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  const plans = await listCustomerHostingPlans(user.id);
  const activePlans = plans.filter((plan) => plan.readyForSites);
  const sites = plans.flatMap((plan) =>
    plan.sites.map((site) => ({ site, plan })),
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PanelPageHeader
        eyebrow="Hosting"
        title="My websites"
        description="WordPress, AI Builder, web apps, or plain PHP/HTML — created on the hosting plan you already own."
        actions={
          <Link href={routes.accountHosting} className="hb-btn hb-btn-ghost">
            Browse plans
          </Link>
        }
      />

      {/* Site types -------------------------------------------------- */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {HOSTING_SITE_TYPES.map((type) => {
          const Icon = TYPE_ICONS[type];
          const count = sites.filter((row) => row.site.type === type).length;
          return (
            <div key={type} className="hb-panel-card p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-[var(--hb-p-primary)]/12 text-[var(--hb-p-primary)]">
                  <Icon className="size-4" />
                </span>
                <span className="hb-pill hb-pill-neutral tabular-nums">
                  {count}
                </span>
              </div>
              <p className="hb-text mt-3 text-sm font-bold">
                {HOSTING_SITE_TYPE_LABELS[type]}
              </p>
              <p className="hb-muted mt-1 text-xs leading-relaxed">
                {HOSTING_SITE_TYPE_DESCRIPTIONS[type]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Existing websites ------------------------------------------- */}
      <section className="space-y-3">
        <h2 className="hb-h2">Your websites</h2>
        {sites.length === 0 ? (
          <div className="hb-panel-card px-5 py-8 text-center">
            <p className="hb-text text-sm font-bold">No websites yet</p>
            <p className="hb-muted mx-auto mt-1 max-w-md text-sm">
              {activePlans.length > 0
                ? "You have active hosting — create your first website below."
                : "Buy a hosting plan first, then create WordPress or app sites from here."}
            </p>
            {activePlans.length === 0 ? (
              <Link
                href={routes.accountHosting}
                className="hb-btn hb-btn-primary mt-4 inline-flex items-center gap-2"
              >
                <Plus className="size-4" />
                Choose a plan
              </Link>
            ) : null}
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {sites.map(({ site, plan }) => {
              const pill = statusPill(site);
              const Icon = TYPE_ICONS[site.type];
              return (
                <li key={site.id} className="hb-panel-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--hb-p-primary)]/12 text-[var(--hb-p-primary)]">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="hb-text truncate text-sm font-bold">
                          {site.name}
                        </p>
                        <p className="hb-muted truncate text-xs">
                          {HOSTING_SITE_TYPE_LABELS[site.type]}
                          {site.domain
                            ? ` · ${site.domain}`
                            : " · no domain yet"}
                        </p>
                      </div>
                    </div>
                    <span className={cn("hb-pill shrink-0", pill.className)}>
                      {pill.label}
                    </span>
                  </div>
                  <p className="hb-muted mt-3 border-t border-[var(--hb-p-border)] pt-2 text-xs">
                    On {plan.planName} · {plan.orderReference}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Create new -------------------------------------------------- */}
      <section className="space-y-3">
        <h2 className="hb-h2">Create a website</h2>
        {activePlans.length === 0 ? (
          <div className="hb-panel-card flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--hb-p-primary)]/12 text-[var(--hb-p-primary)]">
                <Server className="size-4" />
              </span>
              <div>
                <p className="hb-text text-sm font-bold">
                  No active hosting plan yet
                </p>
                <p className="hb-muted text-xs">
                  Websites can be created as soon as a plan shows Active.
                </p>
              </div>
            </div>
            <Link
              href={routes.accountHosting}
              className="hb-btn hb-btn-primary"
            >
              Buy a plan
            </Link>
          </div>
        ) : (
          activePlans.map((plan) => {
            const remaining =
              plan.siteLimit == null
                ? null
                : Math.max(0, plan.siteLimit - plan.sites.length);
            return (
              <div key={plan.orderId} className="hb-panel-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="hb-text text-sm font-bold">{plan.planName}</p>
                    <p className="hb-muted text-xs">
                      {plan.orderReference} · {plan.sites.length}
                      {plan.siteLimit != null
                        ? ` / ${plan.siteLimit}`
                        : " / ∞"}{" "}
                      websites used
                    </p>
                  </div>
                  <Globe2 className="hb-muted size-4" />
                </div>
                <div className="mt-4">
                  <HostingSiteLauncher
                    orderId={plan.orderId}
                    planName={plan.planName}
                    defaultDomain={null}
                    remainingSlots={remaining}
                  />
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
