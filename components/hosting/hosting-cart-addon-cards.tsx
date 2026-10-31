"use client";

import { Mail, Sparkles } from "lucide-react";

import type { HostingCartConfiguration } from "@/lib/hosting/cart/types";
import type { CartAddonUiModel } from "@/lib/hosting/addons/load-cart-ui";

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function selectionFor(
  config: HostingCartConfiguration,
  slug: string,
): HostingCartConfiguration["addons"][number] {
  return (
    config.addons.find((a) => a.addonSlug === slug) ?? {
      addonSlug: slug,
      enabled: false,
      quantity: 1,
      optionId: null,
    }
  );
}

function mergeAddon(
  config: HostingCartConfiguration,
  slug: string,
  patch: Partial<HostingCartConfiguration["addons"][number]>,
): HostingCartConfiguration["addons"] {
  const current = selectionFor(config, slug);
  const next = { ...current, ...patch, addonSlug: slug };
  const rest = config.addons.filter((a) => a.addonSlug !== slug);
  return [...rest, next];
}

export function HostingCartAddonCards({
  cartAddons,
  configuration,
  onChange,
  hideBusinessEmail = false,
}: {
  cartAddons: CartAddonUiModel[];
  configuration: HostingCartConfiguration;
  onChange: (addons: HostingCartConfiguration["addons"]) => void;
  hideBusinessEmail?: boolean;
}) {
  const visible = cartAddons.filter((addon) =>
    hideBusinessEmail ? addon.slug !== "business-email" : true,
  );
  if (visible.length === 0) return null;

  return (
    <>
      {visible.map((addon) => {
        const sel = selectionFor(configuration, addon.slug);
        const qtyLabel =
          addon.slug === "business-email" ? "Mailboxes" : "Quantity";

        const AddonIcon = addon.slug === "business-email" ? Mail : Sparkles;
        const first = addon.options[0];

        return (
          <section
            key={addon.slug}
            className="hb-checkout-premium__card relative min-w-0 overflow-hidden p-5 sm:p-6"
          >
            <div className="flex items-start gap-3">
              <span
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--hb-co-surface)] text-[var(--hb-co-primary)] ring-1 ring-[var(--hb-co-border)]"
                aria-hidden
              >
                <AddonIcon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold tracking-[0.16em] text-[var(--hb-co-primary)] uppercase">
                  Optional add-on
                </p>
                <h2 className="font-heading text-lg font-extrabold text-[var(--hb-co-royal)]">
                  {addon.name}
                </h2>
                <p className="mt-1 text-[14px] leading-relaxed text-[var(--hb-co-text-muted)]">
                  {addon.description}
                </p>
                {first ? (
                  <p className="mt-2 text-[13px] font-semibold text-[var(--hb-co-text)]">
                    From {money(first.unitMonthlyPrice)}/mo
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {sel.enabled ? (
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center rounded-full border border-[var(--hb-co-border)] px-5 text-[14px] font-bold text-[var(--hb-co-royal)]"
                  onClick={() =>
                    onChange(
                      mergeAddon(configuration, addon.slug, {
                        enabled: false,
                        optionId: null,
                      }),
                    )
                  }
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  className="hb-checkout-premium__btn-primary min-h-11 px-5 text-[14px]"
                  onClick={() =>
                    onChange(
                      mergeAddon(configuration, addon.slug, {
                        enabled: true,
                        optionId: sel.optionId ?? addon.options[0]?.id ?? null,
                      }),
                    )
                  }
                >
                  Add to order
                </button>
              )}
            </div>
            {sel.enabled ? (
              <div className="mt-4 space-y-4 border-t border-[var(--hb-co-border)] pt-4">
                <div>
                  <label
                    htmlFor={`addon-plan-${addon.slug}`}
                    className="text-[13px] font-semibold text-[var(--hb-co-text)]"
                  >
                    Plan
                  </label>
                  <select
                    id={`addon-plan-${addon.slug}`}
                    className="mt-2 h-12 w-full min-w-0 rounded-xl border border-[var(--hb-co-border)] bg-white px-3 text-[15px]"
                    value={sel.optionId ?? ""}
                    onChange={(e) =>
                      onChange(
                        mergeAddon(configuration, addon.slug, {
                          optionId: e.target.value,
                        }),
                      )
                    }
                  >
                    {addon.options.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label} — {money(p.unitMonthlyPrice)}/mo
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor={`addon-qty-${addon.slug}`}
                    className="text-[13px] font-semibold text-[var(--hb-co-text)]"
                  >
                    {qtyLabel}
                  </label>
                  <input
                    id={`addon-qty-${addon.slug}`}
                    type="number"
                    min={1}
                    max={50}
                    className="mt-2 h-12 w-full max-w-40 rounded-xl border border-[var(--hb-co-border)] px-3 text-[15px]"
                    value={sel.quantity}
                    onChange={(e) =>
                      onChange(
                        mergeAddon(configuration, addon.slug, {
                          quantity: Number(e.target.value),
                        }),
                      )
                    }
                  />
                </div>
              </div>
            ) : null}
          </section>
        );
      })}
    </>
  );
}

export function formatAddonsReviewSummary(
  configuration: HostingCartConfiguration,
  cartAddons: CartAddonUiModel[],
): string {
  const parts: string[] = [];
  if (configuration.freeEmailMonth) {
    parts.push("Business Email (1 month free)");
  }
  const enabled = configuration.addons.filter((a) => a.enabled);
  for (const sel of enabled) {
    if (configuration.freeEmailMonth && sel.addonSlug === "business-email") {
      continue;
    }
    const meta = cartAddons.find((a) => a.slug === sel.addonSlug);
    const opt = meta?.options.find((o) => o.id === sel.optionId);
    const name = meta?.name ?? sel.addonSlug;
    const plan = opt?.label ?? "—";
    parts.push(`${name} (${plan}, ${sel.quantity}×)`);
  }
  return parts.length ? parts.join("; ") : "None";
}
