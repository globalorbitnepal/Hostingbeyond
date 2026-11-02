"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import type {
  AdminHostingPlan,
  HostingPlanUpdateInput,
} from "@/lib/hosting/hosting-products";
import { readResponseError } from "@/lib/orbit/read-response-error";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  status: string;
  canonicalPath: string;
  shortDescription: string;
  heroTitle: string;
  heroDescription: string;
  heroCtaLabel: string | null;
  heroCtaHref: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaHref: string | null;
  badge: string | null;
  featured: boolean;
  billingMonthlyEnabled: boolean;
  billingYearlyEnabled: boolean;
  freeDomainAnnualEnabled: boolean;
  seo: Record<string, string> | null;
};

type DraftPlan = AdminHostingPlan & {
  /** Present only for newly added rows. */
  isNew?: boolean;
};

const TABS = ["Plans & pricing", "Hero & copy", "SEO", "Settings"] as const;

type Tab = (typeof TABS)[number];

const SPEC_FIELDS: Array<{
  key: keyof AdminHostingPlan;
  label: string;
  placeholder: string;
}> = [
  { key: "storage", label: "Storage", placeholder: "40 GB NVMe SSD" },
  { key: "bandwidth", label: "Bandwidth", placeholder: "Unmetered (fair use)" },
  { key: "websites", label: "Websites", placeholder: "Unlimited (fair use)" },
  { key: "databases", label: "Databases", placeholder: "Unlimited MySQL" },
  { key: "emailAccounts", label: "Email accounts", placeholder: "Unlimited" },
  { key: "domains", label: "Domains", placeholder: "1 free domain / year" },
  { key: "ssl", label: "SSL", placeholder: "Free SSL certificate" },
  { key: "backup", label: "Backups", placeholder: "Daily, 30-day retention" },
  { key: "support", label: "Support", placeholder: "24/7 priority support" },
];

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export function HostingProductEditor({
  initial,
  initialPlans,
}: {
  initial: Product;
  initialPlans: AdminHostingPlan[];
}) {
  const [tab, setTab] = useState<Tab>("Plans & pricing");
  const [product, setProduct] = useState<Product>(initial);
  const [plans, setPlans] = useState<DraftPlan[]>(initialPlans);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const annualSaving = useMemo(
    () =>
      plans.map((plan) => {
        const listAnnual = plan.monthlyPrice * 12;
        return listAnnual > 0
          ? Math.round((1 - plan.yearlyPrice / listAnnual) * 100)
          : 0;
      }),
    [plans],
  );

  const updatePlan = useCallback((id: string, patch: Partial<DraftPlan>) => {
    setPlans((current) =>
      current.map((plan) => (plan.id === id ? { ...plan, ...patch } : plan)),
    );
    setDirty(true);
    setMessage("");
  }, []);

  const updateFeature = (id: string, index: number, value: string) => {
    setPlans((current) =>
      current.map((plan) => {
        if (plan.id !== id) return plan;
        const features = [...plan.features];
        features[index] = value;
        return { ...plan, features };
      }),
    );
    setDirty(true);
  };

  const addFeature = (id: string) => {
    setPlans((current) =>
      current.map((plan) =>
        plan.id === id ? { ...plan, features: [...plan.features, ""] } : plan,
      ),
    );
    setDirty(true);
  };

  const removeFeature = (id: string, index: number) => {
    setPlans((current) =>
      current.map((plan) =>
        plan.id === id
          ? { ...plan, features: plan.features.filter((_, i) => i !== index) }
          : plan,
      ),
    );
    setDirty(true);
  };

  function addPlan() {
    const nextOrder = plans.length
      ? Math.max(...plans.map((p) => p.sortOrder)) + 1
      : 0;
    setPlans((current) => [
      ...current,
      {
        id: `new-${Date.now()}`,
        isNew: true,
        planKey: "",
        planName: "",
        monthlyPrice: 0,
        yearlyPrice: 0,
        currency: "USD",
        tagline: null,
        storage: null,
        bandwidth: null,
        websites: null,
        domains: null,
        emailAccounts: null,
        databases: null,
        ssl: null,
        backup: null,
        support: null,
        features: [],
        popular: false,
        sortOrder: nextOrder,
        active: true,
        orderCount: 0,
      },
    ]);
    setDirty(true);
    setMessage("");
  }

  function removePlan(plan: DraftPlan) {
    if (!plan.isNew && plan.orderCount > 0) {
      setError(
        `${plan.planName || plan.planKey} has ${plan.orderCount} order(s) and cannot be deleted. Deactivate it instead.`,
      );
      return;
    }
    if (
      !plan.isNew &&
      !window.confirm(`Remove ${plan.planName || plan.planKey}?`)
    ) {
      return;
    }
    setPlans((current) => current.filter((p) => p.id !== plan.id));
    setDirty(true);
  }

  async function savePlans() {
    setSaving(true);
    setError("");
    setMessage("Saving plans…");

    for (const plan of plans) {
      if (!plan.planKey.trim()) {
        setError(`${plan.planName || "A plan"} needs a plan key.`);
        setSaving(false);
        setMessage("");
        return;
      }
      if (!Number.isFinite(plan.monthlyPrice) || plan.monthlyPrice < 0) {
        setError(`${plan.planName}: monthly price is invalid.`);
        setSaving(false);
        setMessage("");
        return;
      }
      if (!Number.isFinite(plan.yearlyPrice) || plan.yearlyPrice < 0) {
        setError(`${plan.planName}: yearly price is invalid.`);
        setSaving(false);
        setMessage("");
        return;
      }
    }

    const payload: HostingPlanUpdateInput[] = plans.map((plan) => ({
      ...(plan.isNew ? {} : { id: plan.id }),
      planKey: plan.planKey.trim(),
      planName: plan.planName.trim(),
      monthlyPrice: Number(plan.monthlyPrice),
      yearlyPrice: Number(plan.yearlyPrice),
      currency: plan.currency || "USD",
      tagline: plan.tagline,
      storage: plan.storage,
      bandwidth: plan.bandwidth,
      websites: plan.websites,
      domains: plan.domains,
      emailAccounts: plan.emailAccounts,
      databases: plan.databases,
      ssl: plan.ssl,
      backup: plan.backup,
      support: plan.support,
      features: plan.features.map((f) => f.trim()).filter(Boolean),
      popular: plan.popular,
      sortOrder: plan.sortOrder,
      active: plan.active,
    }));

    try {
      const res = await fetch(`/api/orbit/hosting-products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plans: payload }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        throw new Error(parsed.text);
      }
      const json = (await res.json()) as { plans?: AdminHostingPlan[] };
      if (json.plans) setPlans(json.plans);
      setDirty(false);
      setMessage("Plans saved — public pages revalidated.");
    } catch (err) {
      setMessage("");
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveProduct() {
    setSaving(true);
    setError("");
    setMessage("Saving…");
    try {
      const res = await fetch(`/api/orbit/hosting-products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: {
            name: product.name,
            shortDescription: product.shortDescription,
            heroTitle: product.heroTitle,
            heroDescription: product.heroDescription,
            heroCtaLabel: product.heroCtaLabel,
            heroCtaHref: product.heroCtaHref,
            secondaryCtaLabel: product.secondaryCtaLabel,
            secondaryCtaHref: product.secondaryCtaHref,
            badge: product.badge,
            featured: product.featured,
            billingMonthlyEnabled: product.billingMonthlyEnabled,
            billingYearlyEnabled: product.billingYearlyEnabled,
            freeDomainAnnualEnabled: product.freeDomainAnnualEnabled,
            seo: product.seo,
          },
        }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        throw new Error(parsed.text);
      }
      setDirty(false);
      setMessage("Saved — public page revalidated.");
    } catch (err) {
      setMessage("");
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus() {
    const next = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/orbit/hosting-products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Status update failed");
        throw new Error(parsed.text);
      }
      setProduct({ ...product, status: next });
      setMessage(next === "ACTIVE" ? "Product activated." : "Product hidden.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  const seo = product.seo ?? {};

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-bold",
              product.status === "ACTIVE"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-600",
            )}
          >
            {product.status}
          </span>
          <span className="text-slate-500">{product.category}</span>
          <a
            href={product.canonicalPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[var(--hb-blue)]"
          >
            {product.canonicalPath}
            <ExternalLink className="size-3.5" />
          </a>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => void toggleStatus()}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-60"
        >
          {product.status === "ACTIVE" ? "Deactivate product" : "Activate"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setTab(label)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
              tab === label
                ? "bg-violet-600 text-white"
                : "border border-slate-200 text-slate-700 hover:bg-slate-50",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {message ? (
        <p className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <CheckCircle2 className="size-4" />
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="inline-flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}

      {tab === "Plans & pricing" ? (
        <div className="space-y-4">
          {plans.map((plan, planIndex) => (
            <section
              key={plan.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {plan.planName || "Untitled plan"}
                    </h3>
                    {plan.popular ? (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800 uppercase">
                        Most popular
                      </span>
                    ) : null}
                    {!plan.active ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                        Inactive
                      </span>
                    ) : null}
                    {plan.isNew ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                        New
                      </span>
                    ) : null}
                    {plan.orderCount > 0 ? (
                      <span className="text-[11px] font-semibold text-slate-400">
                        {plan.orderCount} order(s)
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {money(plan.monthlyPrice)}/mo · {money(plan.yearlyPrice)}/yr
                    {annualSaving[planIndex] > 0
                      ? ` · ${annualSaving[planIndex]}% off annual`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={plan.popular}
                      onChange={(e) =>
                        updatePlan(plan.id, { popular: e.target.checked })
                      }
                    />
                    Popular
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={plan.active}
                      onChange={(e) =>
                        updatePlan(plan.id, { active: e.target.checked })
                      }
                    />
                    Active
                  </label>
                  <button
                    type="button"
                    onClick={() => removePlan(plan)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-red-200 hover:text-red-600"
                    aria-label={`Remove ${plan.planName || "plan"}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase">
                  Plan name
                  <input
                    value={plan.planName}
                    onChange={(e) =>
                      updatePlan(plan.id, { planName: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
                  />
                </label>
                <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase">
                  Plan key
                  <input
                    value={plan.planKey}
                    disabled={!plan.isNew}
                    onChange={(e) =>
                      updatePlan(plan.id, {
                        planKey: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-"),
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm font-normal text-slate-900 normal-case disabled:bg-slate-50 disabled:text-slate-500"
                  />
                  <span className="mt-1 block text-[10px] font-normal text-slate-400 normal-case">
                    {plan.isNew
                      ? "Lowercase. Cannot change after saving."
                      : "Locked — orders reference this key."}
                  </span>
                </label>
                <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase">
                  Monthly price (USD)
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={plan.monthlyPrice}
                    onChange={(e) =>
                      updatePlan(plan.id, {
                        monthlyPrice: Number(e.target.value),
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
                  />
                </label>
                <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase">
                  Yearly price (USD)
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={plan.yearlyPrice}
                    onChange={(e) =>
                      updatePlan(plan.id, {
                        yearlyPrice: Number(e.target.value),
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
                  />
                </label>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase">
                  Tagline
                  <input
                    value={plan.tagline ?? ""}
                    onChange={(e) =>
                      updatePlan(plan.id, { tagline: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
                  />
                </label>
                <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase">
                  Display order
                  <input
                    type="number"
                    value={plan.sortOrder}
                    onChange={(e) =>
                      updatePlan(plan.id, { sortOrder: Number(e.target.value) })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {SPEC_FIELDS.map((field) => (
                  <label
                    key={String(field.key)}
                    className="block text-xs font-bold tracking-wide text-slate-500 uppercase"
                  >
                    {field.label}
                    <input
                      value={String(plan[field.key] ?? "")}
                      placeholder={field.placeholder}
                      onChange={(e) =>
                        updatePlan(plan.id, {
                          [field.key]: e.target.value,
                        } as Partial<DraftPlan>)
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                  Card feature lines
                </p>
                <div className="mt-2 space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        value={feature}
                        onChange={(e) =>
                          updateFeature(plan.id, index, e.target.value)
                        }
                        className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(plan.id, index)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-red-600"
                        aria-label="Remove feature"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addFeature(plan.id)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--hb-blue)]"
                >
                  <Plus className="size-3.5" />
                  Add feature line
                </button>
              </div>
            </section>
          ))}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addPlan}
              className="rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Add plan
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void savePlans()}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Save className="size-4" />
              {saving ? "Saving…" : "Save plans"}
            </button>
          </div>
        </div>
      ) : null}

      {tab === "Hero & copy" ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700">
            Product name
            <input
              value={product.name}
              onChange={(e) => {
                setProduct({ ...product, name: e.target.value });
                setDirty(true);
              }}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Short description
            <textarea
              rows={3}
              value={product.shortDescription}
              onChange={(e) => {
                setProduct({ ...product, shortDescription: e.target.value });
                setDirty(true);
              }}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Hero title
            <input
              value={product.heroTitle}
              onChange={(e) => {
                setProduct({ ...product, heroTitle: e.target.value });
                setDirty(true);
              }}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Hero description
            <textarea
              rows={4}
              value={product.heroDescription}
              onChange={(e) => {
                setProduct({ ...product, heroDescription: e.target.value });
                setDirty(true);
              }}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Primary CTA label
              <input
                value={product.heroCtaLabel ?? ""}
                onChange={(e) => {
                  setProduct({ ...product, heroCtaLabel: e.target.value });
                  setDirty(true);
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Primary CTA link
              <input
                value={product.heroCtaHref ?? ""}
                onChange={(e) => {
                  setProduct({ ...product, heroCtaHref: e.target.value });
                  setDirty(true);
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveProduct()}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Save hero & copy
          </button>
        </div>
      ) : null}

      {tab === "SEO" ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Also editable in Orbit → Pages. Meta title should be 20–70
            characters and the description 80–170.
          </p>
          <label className="block text-sm font-semibold text-slate-700">
            Meta title
            <input
              value={seo.metaTitle ?? ""}
              onChange={(e) => {
                setProduct({
                  ...product,
                  seo: { ...seo, metaTitle: e.target.value },
                });
                setDirty(true);
              }}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Meta description
            <textarea
              rows={3}
              value={seo.metaDescription ?? ""}
              onChange={(e) => {
                setProduct({
                  ...product,
                  seo: { ...seo, metaDescription: e.target.value },
                });
                setDirty(true);
              }}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveProduct()}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Save SEO
          </button>
        </div>
      ) : null}

      {tab === "Settings" ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={product.billingMonthlyEnabled}
              onChange={(e) => {
                setProduct({
                  ...product,
                  billingMonthlyEnabled: e.target.checked,
                });
                setDirty(true);
              }}
            />
            Monthly billing enabled
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={product.billingYearlyEnabled}
              onChange={(e) => {
                setProduct({
                  ...product,
                  billingYearlyEnabled: e.target.checked,
                });
                setDirty(true);
              }}
            />
            Annual billing enabled
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={product.freeDomainAnnualEnabled}
              onChange={(e) => {
                setProduct({
                  ...product,
                  freeDomainAnnualEnabled: e.target.checked,
                });
                setDirty(true);
              }}
            />
            Free domain for the first year on eligible annual orders
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={product.featured}
              onChange={(e) => {
                setProduct({ ...product, featured: e.target.checked });
                setDirty(true);
              }}
            />
            Feature this product
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveProduct()}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Save settings
          </button>
        </div>
      ) : null}
    </div>
  );
}
