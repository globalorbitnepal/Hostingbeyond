"use client";

import { useState } from "react";

import { OrbitImageField } from "@/components/orbit/image-field";
import type { CmsHostingPlan } from "@/lib/orbit/defaults";
import type {
  CmsPricingCategoryContent,
  CmsPricingPageContent,
  PricingCategoryId,
} from "@/lib/orbit/pricing-content";

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
      {label}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none"
        />
      )}
    </label>
  );
}

function PlanEditor({
  plan,
  onChange,
}: {
  plan: CmsHostingPlan;
  onChange: (plan: CmsHostingPlan) => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-sm font-semibold text-slate-800">{plan.name}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Name"
          value={plan.name}
          onChange={(name) => onChange({ ...plan, name })}
        />
        <Field
          label="Tagline"
          value={plan.tagline}
          onChange={(tagline) => onChange({ ...plan, tagline })}
        />
        <Field
          label="Annual price /mo"
          value={plan.priceAnnually}
          onChange={(priceAnnually) => onChange({ ...plan, priceAnnually })}
        />
        <Field
          label="Monthly price /mo"
          value={plan.priceMonthly}
          onChange={(priceMonthly) => onChange({ ...plan, priceMonthly })}
        />
        <Field
          label="CTA label"
          value={plan.ctaLabel}
          onChange={(ctaLabel) => onChange({ ...plan, ctaLabel })}
        />
        <Field
          label="CTA href"
          value={plan.ctaHref}
          onChange={(ctaHref) => onChange({ ...plan, ctaHref })}
        />
      </div>
      <Field
        label="Features (one per line)"
        value={plan.features.join("\n")}
        multiline
        onChange={(raw) =>
          onChange({
            ...plan,
            features: raw
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean),
          })
        }
      />
    </div>
  );
}

function CategoryEditor({
  category,
  onChange,
}: {
  category: CmsPricingCategoryContent;
  onChange: (c: CmsPricingCategoryContent) => void;
}) {
  return (
    <details className="rounded-xl border border-slate-200 bg-white p-4">
      <summary className="cursor-pointer text-sm font-semibold text-slate-800">
        {category.label}{" "}
        <span className="text-xs font-normal text-slate-500">
          ({category.faqs.length} FAQs)
        </span>
      </summary>
      <div className="mt-4 grid gap-3">
        <Field
          label="Headline"
          value={category.headline}
          onChange={(headline) => onChange({ ...category, headline })}
        />
        <Field
          label="Description"
          value={category.description}
          multiline
          onChange={(description) => onChange({ ...category, description })}
        />
        <Field
          label="Showcase title"
          value={category.showcaseTitle}
          onChange={(showcaseTitle) => onChange({ ...category, showcaseTitle })}
        />
        <Field
          label="Showcase body"
          value={category.showcaseBody}
          multiline
          onChange={(showcaseBody) => onChange({ ...category, showcaseBody })}
        />
        <Field
          label="Save badge"
          value={category.saveBadge}
          onChange={(saveBadge) => onChange({ ...category, saveBadge })}
        />
        <OrbitImageField
          label="Showcase media"
          value={category.mediaSrc}
          onChange={(mediaSrc) => onChange({ ...category, mediaSrc })}
        />
        <Field
          label="Media alt text"
          value={category.mediaAlt}
          onChange={(mediaAlt) => onChange({ ...category, mediaAlt })}
        />
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase">FAQs</p>
          {category.faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="rounded-lg border border-slate-100 bg-slate-50 p-3"
            >
              <Field
                label={`Q${index + 1}`}
                value={faq.question}
                onChange={(question) => {
                  const faqs = [...category.faqs];
                  faqs[index] = { ...faq, question };
                  onChange({ ...category, faqs });
                }}
              />
              <Field
                label="Answer"
                value={faq.answer}
                multiline
                onChange={(answer) => {
                  const faqs = [...category.faqs];
                  faqs[index] = { ...faq, answer };
                  onChange({ ...category, faqs });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

type Props = {
  value: CmsPricingPageContent;
  onChange: (value: CmsPricingPageContent) => void;
  onPersist: (value: CmsPricingPageContent) => void;
  saving: boolean;
};

export function PricingPageEditor({
  value,
  onChange,
  onPersist,
  saving,
}: Props) {
  const [tab, setTab] = useState<
    "hero" | "categories" | "ecommerce" | "catalog" | "faq"
  >("hero");

  function patch(partial: Partial<CmsPricingPageContent>) {
    onChange({ ...value, ...partial });
  }

  function updateCategory(
    id: PricingCategoryId,
    next: CmsPricingCategoryContent,
  ) {
    patch({
      categories: value.categories.map((c) => (c.id === id ? next : c)),
    });
  }

  function updateEcommercePlan(index: number, plan: CmsHostingPlan) {
    const plans = [...value.ecommercePlans];
    plans[index] = plan;
    patch({ ecommercePlans: plans });
  }

  function updateCatalog(
    key: "vpsPlans" | "aiBuilderPlans" | "aiAgentPlans" | "businessEmailPlans",
    index: number,
    plan: CmsHostingPlan,
  ) {
    const plans = [...value[key]];
    plans[index] = plan;
    patch({ [key]: plans });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["hero", "Hero & CTA"],
            ["categories", "Categories & media"],
            ["ecommerce", "Ecommerce plans"],
            ["catalog", "VPS / AI / Email"],
            ["faq", "FAQ section"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              tab === id
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          disabled={saving}
          onClick={() => onPersist(value)}
          className="ml-auto rounded-full bg-emerald-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save pricing page"}
        </button>
      </div>

      {tab === "hero" ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Hero</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Eyebrow"
              value={value.heroEyebrow}
              onChange={(heroEyebrow) => patch({ heroEyebrow })}
            />
            <Field
              label="Title"
              value={value.heroTitle}
              onChange={(heroTitle) => patch({ heroTitle })}
            />
            <Field
              label="Title accent"
              value={value.heroTitleAccent}
              onChange={(heroTitleAccent) => patch({ heroTitleAccent })}
            />
          </div>
          <Field
            label="Description"
            value={value.heroDescription}
            multiline
            onChange={(heroDescription) => patch({ heroDescription })}
          />
          <OrbitImageField
            label="Hero media"
            value={value.heroMediaSrc}
            onChange={(heroMediaSrc) => patch({ heroMediaSrc })}
          />
          <Field
            label="Hero media alt"
            value={value.heroMediaAlt}
            onChange={(heroMediaAlt) => patch({ heroMediaAlt })}
          />
          <h3 className="pt-4 font-semibold">Bottom CTA</h3>
          <Field
            label="Eyebrow"
            value={value.bottomEyebrow}
            onChange={(bottomEyebrow) => patch({ bottomEyebrow })}
          />
          <Field
            label="Title"
            value={value.bottomTitle}
            onChange={(bottomTitle) => patch({ bottomTitle })}
          />
          <Field
            label="Body"
            value={value.bottomBody}
            multiline
            onChange={(bottomBody) => patch({ bottomBody })}
          />
        </section>
      ) : null}

      {tab === "categories" ? (
        <section className="space-y-3">
          {value.categories
            .sort((a, b) => a.order - b.order)
            .map((cat) => (
              <CategoryEditor
                key={cat.id}
                category={cat}
                onChange={(next) => updateCategory(cat.id, next)}
              />
            ))}
        </section>
      ) : null}

      {tab === "ecommerce" ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Ecommerce plan cards</h2>
          <p className="text-xs text-slate-500">
            Hostinger-style commerce tiers — defaults are ~5% below typical
            market promos. Website hosting plans still come from Home → Hosting
            plans.
          </p>
          {value.ecommercePlans.map((plan, index) => (
            <PlanEditor
              key={plan.id}
              plan={plan}
              onChange={(next) => updateEcommercePlan(index, next)}
            />
          ))}
        </section>
      ) : null}

      {tab === "catalog" ? (
        <section className="space-y-6">
          {(
            [
              ["vpsPlans", "VPS plans", value.vpsPlans],
              ["aiBuilderPlans", "AI Builder", value.aiBuilderPlans],
              ["aiAgentPlans", "AI Agents", value.aiAgentPlans],
              [
                "businessEmailPlans",
                "Business email",
                value.businessEmailPlans,
              ],
            ] as const
          ).map(([key, title, plans]) => (
            <div
              key={key}
              className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5"
            >
              <h2 className="font-semibold">{title}</h2>
              {key === "aiBuilderPlans" ? (
                <p className="text-xs text-slate-500">
                  Keep in sync with Orbit → Beyond AI product page and public
                  /beyond-ai pricing (Free $0, Pro $20, Pro+ $40, Ultra $100).
                </p>
              ) : null}
              {plans.map((plan, index) => (
                <PlanEditor
                  key={plan.id}
                  plan={plan}
                  onChange={(next) => updateCatalog(key, index, next)}
                />
              ))}
            </div>
          ))}
        </section>
      ) : null}

      {tab === "faq" ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">FAQ block (page footer)</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Eyebrow"
              value={value.faqEyebrow}
              onChange={(faqEyebrow) => patch({ faqEyebrow })}
            />
            <Field
              label="Title"
              value={value.faqTitle}
              onChange={(faqTitle) => patch({ faqTitle })}
            />
            <Field
              label="Title accent"
              value={value.faqTitleAccent}
              onChange={(faqTitleAccent) => patch({ faqTitleAccent })}
            />
            <label className="block text-xs font-semibold text-slate-500 uppercase">
              Preview count
              <input
                type="number"
                min={1}
                max={20}
                value={value.faqPreviewCount}
                onChange={(e) =>
                  patch({ faqPreviewCount: Number(e.target.value) || 5 })
                }
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <Field
            label="Description"
            value={value.faqDescription}
            multiline
            onChange={(faqDescription) => patch({ faqDescription })}
          />
          <p className="text-xs text-slate-500">
            Edit per-category questions under Categories & media.
          </p>
        </section>
      ) : null}
    </div>
  );
}
