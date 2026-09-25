"use client";

import { useState } from "react";

import { OrbitImageField } from "@/components/orbit/image-field";
import { routes } from "@/config/routes";
import { CLOUD_FRAME_SPECS } from "@/lib/cloud/frame-specs";
import type {
  CmsCloudHostingPageContent,
  CmsCloudPageFeature,
} from "@/lib/orbit/cloud-hosting-page-content";
import type { CmsHostingPlan } from "@/lib/orbit/defaults";

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

export function CloudHostingPageEditor({
  value,
  onChange,
  onPersist,
}: {
  value: CmsCloudHostingPageContent;
  onChange: (v: CmsCloudHostingPageContent) => void;
  onPersist: (v: CmsCloudHostingPageContent) => void;
}) {
  const [tab, setTab] = useState<
    | "hero"
    | "pricing"
    | "plans"
    | "features"
    | "performance"
    | "compare"
    | "faq"
    | "closing"
  >("hero");

  function patch(next: Partial<CmsCloudHostingPageContent>, persist = false) {
    const merged = { ...value, ...next };
    onChange(merged);
    if (persist) onPersist(merged);
  }

  const tabs = [
    ["hero", "Hero"],
    ["pricing", "Pricing copy"],
    ["plans", "Cloud plans"],
    ["features", "Features"],
    ["performance", "Performance"],
    ["compare", "Vs shared"],
    ["faq", "FAQs"],
    ["closing", "Closing"],
  ] as const;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <p className="rounded-lg bg-violet-50 px-3 py-2 text-[11px] leading-relaxed text-violet-900">
        <span className="font-bold">Hero panel (image box):</span> upload{" "}
        {CLOUD_FRAME_SPECS.heroPanelImage}. Public URL:{" "}
        <a href={routes.cloud} className="underline">
          {routes.cloud}
        </a>
        . SEO:{" "}
        <a href="/orbit/seo" className="underline">
          Orbit → SEO
        </a>{" "}
        slug <code className="rounded bg-white px-1">cloud</code>.
      </p>
      <div className="flex flex-wrap gap-2">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              tab === id
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "hero" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Eyebrow"
            value={value.heroEyebrow}
            onChange={(v) => patch({ heroEyebrow: v })}
          />
          <Field
            label="Promo"
            value={value.heroPromo}
            onChange={(v) => patch({ heroPromo: v })}
          />
          <Field
            label="Title"
            value={value.heroTitle}
            onChange={(v) => patch({ heroTitle: v })}
          />
          <Field
            label="Accent"
            value={value.heroTitleAccent}
            onChange={(v) => patch({ heroTitleAccent: v })}
          />
          <div className="sm:col-span-2">
            <Field
              label="Description"
              value={value.heroDescription}
              onChange={(v) => patch({ heroDescription: v })}
              multiline
            />
          </div>
          <Field
            label="Primary CTA label"
            value={value.heroPrimaryLabel}
            onChange={(v) => patch({ heroPrimaryLabel: v })}
          />
          <Field
            label="Primary CTA URL"
            value={value.heroPrimaryHref}
            onChange={(v) => patch({ heroPrimaryHref: v })}
          />
          <Field
            label="Secondary CTA label"
            value={value.heroSecondaryLabel}
            onChange={(v) => patch({ heroSecondaryLabel: v })}
          />
          <Field
            label="Secondary CTA URL"
            value={value.heroSecondaryHref}
            onChange={(v) => patch({ heroSecondaryHref: v })}
          />
          <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 sm:col-span-2">
            <p className="text-[11px] font-bold text-violet-900 uppercase">
              Hero panel — background image
            </p>
            <p className="mt-1 text-[11px] text-violet-800">
              Recommended: {CLOUD_FRAME_SPECS.heroPanelImage}. Image sits behind
              the glass caption bar at the bottom of the panel.
            </p>
            <div className="mt-3">
              <OrbitImageField
                label="Panel background"
                value={value.heroImage}
                onChange={(heroImage) => patch({ heroImage })}
                onCommit={(heroImage) => patch({ heroImage }, true)}
              />
            </div>
            <Field
              label="Panel caption (small)"
              value={value.heroCardEyebrow}
              onChange={(v) => patch({ heroCardEyebrow: v })}
            />
            <Field
              label="Panel caption (main line)"
              value={value.heroCardLine}
              onChange={(v) => patch({ heroCardLine: v })}
            />
          </div>
        </div>
      ) : null}

      {tab === "pricing" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Eyebrow"
            value={value.pricingEyebrow}
            onChange={(v) => patch({ pricingEyebrow: v })}
          />
          <Field
            label="Save badge"
            value={value.saveBadge}
            onChange={(v) => patch({ saveBadge: v })}
          />
          <Field
            label="Title"
            value={value.pricingTitle}
            onChange={(v) => patch({ pricingTitle: v })}
          />
          <Field
            label="Accent"
            value={value.pricingTitleAccent}
            onChange={(v) => patch({ pricingTitleAccent: v })}
          />
          <div className="sm:col-span-2">
            <Field
              label="Description"
              value={value.pricingDescription}
              onChange={(v) => patch({ pricingDescription: v })}
              multiline
            />
          </div>
          <Field
            label="Footnote"
            value={value.pricingNote}
            onChange={(v) => patch({ pricingNote: v })}
            multiline
          />
          <Field
            label="Annual toggle label"
            value={value.annualToggleLabel}
            onChange={(v) => patch({ annualToggleLabel: v })}
          />
          <Field
            label="Monthly toggle label"
            value={value.monthlyToggleLabel}
            onChange={(v) => patch({ monthlyToggleLabel: v })}
          />
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Default billing
            <select
              value={value.defaultBilling}
              onChange={(e) =>
                patch({
                  defaultBilling:
                    e.target.value === "monthly" ? "monthly" : "annually",
                })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none"
            >
              <option value="annually">Annually</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
        </div>
      ) : null}

      {tab === "plans" ? (
        <div className="space-y-4">
          {value.plans.map((plan, index) => (
            <PlanFields
              key={plan.id}
              plan={plan}
              onChange={(next) => {
                const plans = [...value.plans];
                plans[index] = next;
                patch({ plans });
              }}
            />
          ))}
        </div>
      ) : null}

      {tab === "features" ? (
        <div className="space-y-3">
          <Field
            label="Eyebrow"
            value={value.featuresEyebrow}
            onChange={(v) => patch({ featuresEyebrow: v })}
          />
          <Field
            label="Heading"
            value={value.featuresHeading}
            onChange={(v) => patch({ featuresHeading: v })}
          />
          <Field
            label="Description"
            value={value.featuresDescription}
            onChange={(v) => patch({ featuresDescription: v })}
            multiline
          />
          {value.features.map((feat, index) => (
            <div
              key={feat.id}
              className="rounded-xl border border-slate-200 p-3"
            >
              <Field
                label="Title"
                value={feat.title}
                onChange={(title) => {
                  const features = [...value.features];
                  features[index] = { ...feat, title };
                  patch({ features });
                }}
              />
              <Field
                label="Description"
                value={feat.description}
                onChange={(description) => {
                  const features = [...value.features];
                  features[index] = { ...feat, description };
                  patch({ features });
                }}
                multiline
              />
              <Field
                label="Icon (cpu|shield|zap|scale|globe|database)"
                value={feat.icon}
                onChange={(icon) => {
                  const features = [...value.features];
                  features[index] = {
                    ...feat,
                    icon: icon as CmsCloudPageFeature["icon"],
                  };
                  patch({ features });
                }}
              />
              <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={feat.visible !== false}
                  onChange={(e) => {
                    const features = [...value.features];
                    features[index] = { ...feat, visible: e.target.checked };
                    patch({ features });
                  }}
                />
                Visible on page
              </label>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "performance" ? (
        <div className="space-y-3">
          <Field
            label="Heading"
            value={value.performanceHeading}
            onChange={(v) => patch({ performanceHeading: v })}
          />
          <Field
            label="Description"
            value={value.performanceDescription}
            onChange={(v) => patch({ performanceDescription: v })}
            multiline
          />
          <Field
            label="Stats (one per line)"
            value={value.performanceStats.join("\n")}
            onChange={(raw) =>
              patch({ performanceStats: raw.split("\n").filter(Boolean) })
            }
            multiline
          />
        </div>
      ) : null}

      {tab === "compare" ? (
        <div className="space-y-3">
          <Field
            label="Heading"
            value={value.vsSharedHeading}
            onChange={(v) => patch({ vsSharedHeading: v })}
          />
          <Field
            label="Description"
            value={value.vsSharedDescription}
            onChange={(v) => patch({ vsSharedDescription: v })}
            multiline
          />
          <Field
            label="Bullets"
            value={value.vsSharedBullets.join("\n")}
            onChange={(raw) =>
              patch({ vsSharedBullets: raw.split("\n").filter(Boolean) })
            }
            multiline
          />
        </div>
      ) : null}

      {tab === "faq" ? (
        <div className="space-y-3">
          <Field
            label="Heading"
            value={value.faqHeading}
            onChange={(v) => patch({ faqHeading: v })}
          />
          <Field
            label="Description"
            value={value.faqDescription}
            onChange={(v) => patch({ faqDescription: v })}
            multiline
          />
          {value.faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="rounded-xl border border-slate-200 p-3"
            >
              <Field
                label="Question"
                value={faq.question}
                onChange={(question) => {
                  const faqs = [...value.faqs];
                  faqs[index] = { ...faq, question };
                  patch({ faqs });
                }}
              />
              <Field
                label="Answer"
                value={faq.answer}
                onChange={(answer) => {
                  const faqs = [...value.faqs];
                  faqs[index] = { ...faq, answer };
                  patch({ faqs });
                }}
                multiline
              />
              <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={faq.visible !== false}
                  onChange={(e) => {
                    const faqs = [...value.faqs];
                    faqs[index] = { ...faq, visible: e.target.checked };
                    patch({ faqs });
                  }}
                />
                Visible on page
              </label>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "closing" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Heading"
            value={value.closingHeading}
            onChange={(v) => patch({ closingHeading: v })}
          />
          <Field
            label="CTA"
            value={value.closingCtaLabel}
            onChange={(v) => patch({ closingCtaLabel: v })}
          />
          <Field
            label="CTA URL"
            value={value.closingCtaHref}
            onChange={(v) => patch({ closingCtaHref: v })}
          />
          <div className="sm:col-span-2">
            <Field
              label="Description"
              value={value.closingDescription}
              onChange={(v) => patch({ closingDescription: v })}
              multiline
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PlanFields({
  plan,
  onChange,
}: {
  plan: CmsHostingPlan;
  onChange: (plan: CmsHostingPlan) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="mb-2 text-sm font-bold text-slate-800">{plan.name}</p>
      <div className="grid gap-2 sm:grid-cols-2">
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
          label="Annual price"
          value={plan.priceAnnually}
          onChange={(priceAnnually) => onChange({ ...plan, priceAnnually })}
        />
        <Field
          label="Monthly price"
          value={plan.priceMonthly}
          onChange={(priceMonthly) => onChange({ ...plan, priceMonthly })}
        />
        <Field
          label="Was (annual)"
          value={plan.originalAnnually}
          onChange={(originalAnnually) =>
            onChange({ ...plan, originalAnnually })
          }
        />
        <Field
          label="Discount badge"
          value={plan.discountBadge}
          onChange={(discountBadge) => onChange({ ...plan, discountBadge })}
        />
        <Field
          label="CTA label"
          value={plan.ctaLabel}
          onChange={(ctaLabel) => onChange({ ...plan, ctaLabel })}
        />
        <Field
          label="CTA URL"
          value={plan.ctaHref}
          onChange={(ctaHref) => onChange({ ...plan, ctaHref })}
        />
      </div>
      <Field
        label="Features (one per line)"
        value={plan.features.join("\n")}
        onChange={(raw) =>
          onChange({ ...plan, features: raw.split("\n").filter(Boolean) })
        }
        multiline
      />
      <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
        <input
          type="checkbox"
          checked={Boolean(plan.popular)}
          onChange={(e) => onChange({ ...plan, popular: e.target.checked })}
        />
        Most popular
      </label>
      <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
        <input
          type="checkbox"
          checked={plan.visible !== false}
          onChange={(e) => onChange({ ...plan, visible: e.target.checked })}
        />
        Visible on page
      </label>
    </div>
  );
}
