"use client";

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
}: {
  cartAddons: CartAddonUiModel[];
  configuration: HostingCartConfiguration;
  onChange: (addons: HostingCartConfiguration["addons"]) => void;
}) {
  if (cartAddons.length === 0) return null;

  return (
    <>
      {cartAddons.map((addon) => {
        const sel = selectionFor(configuration, addon.slug);
        const qtyLabel =
          addon.slug === "business-email" ? "Mailboxes" : "Quantity";

        return (
          <section
            key={addon.slug}
            className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="font-heading text-lg font-extrabold text-[#2f1c6a]">
              {addon.name}
            </h2>
            <p className="mt-2 text-[14px] text-slate-600">
              {addon.description}
            </p>
            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 size-4 rounded border-slate-300"
                checked={sel.enabled}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  onChange(
                    mergeAddon(configuration, addon.slug, {
                      enabled,
                      optionId: enabled
                        ? (sel.optionId ?? addon.options[0]?.id ?? null)
                        : null,
                    }),
                  );
                }}
              />
              <span className="text-[15px] font-semibold text-[#2f1c6a]">
                Add {addon.name}
              </span>
            </label>
            {sel.enabled ? (
              <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                <div>
                  <label
                    htmlFor={`addon-plan-${addon.slug}`}
                    className="text-[13px] font-semibold text-slate-700"
                  >
                    Plan
                  </label>
                  <select
                    id={`addon-plan-${addon.slug}`}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-[15px]"
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
                    className="text-[13px] font-semibold text-slate-700"
                  >
                    {qtyLabel}
                  </label>
                  <input
                    id={`addon-qty-${addon.slug}`}
                    type="number"
                    min={1}
                    max={50}
                    className="mt-2 h-11 w-32 rounded-xl border border-slate-200 px-3 text-[15px]"
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
  const enabled = configuration.addons.filter((a) => a.enabled);
  if (enabled.length === 0) return "None";
  return enabled
    .map((sel) => {
      const meta = cartAddons.find((a) => a.slug === sel.addonSlug);
      const opt = meta?.options.find((o) => o.id === sel.optionId);
      const name = meta?.name ?? sel.addonSlug;
      const plan = opt?.label ?? "—";
      return `${name} (${plan}, ${sel.quantity}×)`;
    })
    .join("; ");
}
