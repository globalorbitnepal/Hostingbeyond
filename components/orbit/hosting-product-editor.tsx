"use client";

import { useMemo, useState } from "react";

import type { HostingPlanUpdateInput } from "@/lib/hosting/hosting-products";
import { readResponseError } from "@/lib/orbit/read-response-error";

type Product = {
  id: string;
  slug: string;
  name: string;
  status: string;
  shortDescription: string;
  heroTitle: string;
  heroDescription: string;
  heroCtaLabel: string | null;
  heroCtaHref: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaHref: string | null;
  billingMonthlyEnabled: boolean;
  billingYearlyEnabled: boolean;
  freeDomainAnnualEnabled: boolean;
  seo: Record<string, string> | null;
  plans: Array<{
    id: string;
    planKey: string;
    planName: string;
    monthlyPrice: string;
    yearlyPrice: string;
    tagline: string | null;
    popular: boolean;
    sortOrder: number;
    active: boolean;
  }>;
};

const TABS = ["Basic", "Hero", "Pricing", "SEO", "Visibility"] as const;

export function HostingProductEditor({ initial }: { initial: Product }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Basic");
  const [product, setProduct] = useState(initial);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const planInputs: HostingPlanUpdateInput[] = useMemo(
    () =>
      product.plans.map((plan) => ({
        id: plan.id,
        planKey: plan.planKey,
        planName: plan.planName,
        monthlyPrice: Number(plan.monthlyPrice),
        yearlyPrice: Number(plan.yearlyPrice),
        tagline: plan.tagline,
        popular: plan.popular,
        sortOrder: plan.sortOrder,
        active: plan.active,
      })),
    [product.plans],
  );

  async function saveProduct(patch: Partial<Product>) {
    setSaving(true);
    setMessage("Saving…");
    try {
      const res = await fetch(`/api/orbit/hosting-products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: {
            name: patch.name ?? product.name,
            shortDescription:
              patch.shortDescription ?? product.shortDescription,
            heroTitle: patch.heroTitle ?? product.heroTitle,
            heroDescription: patch.heroDescription ?? product.heroDescription,
            heroCtaLabel: patch.heroCtaLabel ?? product.heroCtaLabel,
            heroCtaHref: patch.heroCtaHref ?? product.heroCtaHref,
            secondaryCtaLabel:
              patch.secondaryCtaLabel ?? product.secondaryCtaLabel,
            secondaryCtaHref:
              patch.secondaryCtaHref ?? product.secondaryCtaHref,
            billingMonthlyEnabled:
              patch.billingMonthlyEnabled ?? product.billingMonthlyEnabled,
            billingYearlyEnabled:
              patch.billingYearlyEnabled ?? product.billingYearlyEnabled,
            freeDomainAnnualEnabled:
              patch.freeDomainAnnualEnabled ?? product.freeDomainAnnualEnabled,
            seo: patch.seo ?? product.seo,
          },
        }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        throw new Error(parsed.text);
      }
      const json = (await res.json()) as { product?: Product };
      if (json.product) setProduct({ ...product, ...json.product });
      setMessage("Saved");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function savePlans() {
    setSaving(true);
    setMessage("Saving plans…");
    try {
      const res = await fetch(
        `/api/orbit/hosting-products/${product.id}/plans`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plans: planInputs }),
        },
      );
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        throw new Error(parsed.text);
      }
      const json = (await res.json()) as { product?: Product };
      if (json.product) setProduct({ ...product, plans: json.product.plans });
      setMessage("Plans saved");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus() {
    const next = product.status === "ACTIVE" ? "INACTIVE" : ("ACTIVE" as const);
    setSaving(true);
    try {
      const res = await fetch(`/api/orbit/hosting-products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Status update failed");
      setProduct({ ...product, status: next });
      setMessage(
        next === "ACTIVE" ? "Product activated" : "Product deactivated",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  function updatePlan(
    planId: string,
    patch: Partial<Product["plans"][number]>,
  ) {
    setProduct({
      ...product,
      plans: product.plans.map((p) =>
        p.id === planId ? { ...p, ...patch } : p,
      ),
    });
  }

  const seo = product.seo ?? {};

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setTab(label)}
            className={
              tab === label
                ? "rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white"
                : "rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "Basic" ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <label className="block text-sm font-semibold text-slate-700">
            Product name
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Short description
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              rows={3}
              value={product.shortDescription}
              onChange={(e) =>
                setProduct({ ...product, shortDescription: e.target.value })
              }
            />
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveProduct(product)}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Save basic info
          </button>
        </div>
      ) : null}

      {tab === "Hero" ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <label className="block text-sm font-semibold text-slate-700">
            Hero title
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={product.heroTitle}
              onChange={(e) =>
                setProduct({ ...product, heroTitle: e.target.value })
              }
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Hero description
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              rows={4}
              value={product.heroDescription}
              onChange={(e) =>
                setProduct({ ...product, heroDescription: e.target.value })
              }
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Primary CTA label
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={product.heroCtaLabel ?? ""}
                onChange={(e) =>
                  setProduct({ ...product, heroCtaLabel: e.target.value })
                }
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Primary CTA link
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={product.heroCtaHref ?? ""}
                onChange={(e) =>
                  setProduct({ ...product, heroCtaHref: e.target.value })
                }
              />
            </label>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveProduct(product)}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Save hero
          </button>
        </div>
      ) : null}

      {tab === "Pricing" ? (
        <div className="space-y-4">
          {product.plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-slate-900">{plan.planName}</h3>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={plan.popular}
                    onChange={(e) =>
                      updatePlan(plan.id, { popular: e.target.checked })
                    }
                  />
                  Popular
                </label>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">
                  Monthly price (USD)
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    value={plan.monthlyPrice}
                    onChange={(e) =>
                      updatePlan(plan.id, { monthlyPrice: e.target.value })
                    }
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Yearly price (USD)
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    value={plan.yearlyPrice}
                    onChange={(e) =>
                      updatePlan(plan.id, { yearlyPrice: e.target.value })
                    }
                  />
                </label>
              </div>
            </div>
          ))}
          <button
            type="button"
            disabled={saving}
            onClick={() => void savePlans()}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Save pricing
          </button>
        </div>
      ) : null}

      {tab === "SEO" ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">
            Also editable in Orbit → SEO using slug{" "}
            <code className="rounded bg-slate-100 px-1">{product.slug}</code>
          </p>
          <label className="block text-sm font-semibold text-slate-700">
            Meta title
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={seo.metaTitle ?? ""}
              onChange={(e) =>
                setProduct({
                  ...product,
                  seo: { ...seo, metaTitle: e.target.value },
                })
              }
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Meta description
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              rows={3}
              value={seo.metaDescription ?? ""}
              onChange={(e) =>
                setProduct({
                  ...product,
                  seo: { ...seo, metaDescription: e.target.value },
                })
              }
            />
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveProduct({ seo: product.seo })}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Save SEO
          </button>
        </div>
      ) : null}

      {tab === "Visibility" ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">
            Status: <strong>{product.status}</strong>
          </p>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={product.billingMonthlyEnabled}
              onChange={(e) =>
                setProduct({
                  ...product,
                  billingMonthlyEnabled: e.target.checked,
                })
              }
            />
            Monthly billing enabled
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={product.billingYearlyEnabled}
              onChange={(e) =>
                setProduct({
                  ...product,
                  billingYearlyEnabled: e.target.checked,
                })
              }
            />
            Yearly billing enabled
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={product.freeDomainAnnualEnabled}
              onChange={(e) =>
                setProduct({
                  ...product,
                  freeDomainAnnualEnabled: e.target.checked,
                })
              }
            />
            Free domain (1st year) on eligible annual checkout
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveProduct(product)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold"
            >
              Save billing options
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void toggleStatus()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {product.status === "ACTIVE" ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>
      ) : null}

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
