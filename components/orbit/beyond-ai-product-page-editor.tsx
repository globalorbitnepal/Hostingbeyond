"use client";

import { useState } from "react";

import type {
  CmsBeyondAiFaq,
  CmsBeyondAiPageContent,
  CmsBeyondAiPlanCard,
} from "@/lib/orbit/beyond-ai-page-content";

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

type Props = {
  value: CmsBeyondAiPageContent;
  onChange: (value: CmsBeyondAiPageContent) => void;
  onPersist: (value: CmsBeyondAiPageContent) => void;
  saving?: boolean;
};

export function BeyondAiProductPageEditor({
  value,
  onChange,
  onPersist,
  saving,
}: Props) {
  const [tab, setTab] = useState<
    "hero" | "pricing" | "plans" | "video" | "faqs"
  >("hero");

  function patch(next: Partial<CmsBeyondAiPageContent>) {
    onChange({ ...value, ...next });
  }

  function updatePlan(index: number, next: CmsBeyondAiPlanCard) {
    const plans = [...value.plans];
    plans[index] = next;
    patch({ plans });
  }

  function updateFaq(index: number, next: CmsBeyondAiFaq) {
    const faqs = [...value.faqs];
    faqs[index] = next;
    patch({ faqs });
  }

  const tabs = [
    ["hero", "Hero"],
    ["pricing", "Pricing copy"],
    ["plans", "Plan cards"],
    ["video", "Video band"],
    ["faqs", "FAQs"],
  ] as const;

  return (
    <div className="space-y-4">
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
        <button
          type="button"
          disabled={saving}
          onClick={() => onPersist(value)}
          className="ml-auto rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save page"}
        </button>
      </div>

      {tab === "hero" ? (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          <Field
            label="Eyebrow"
            value={value.heroEyebrow}
            onChange={(heroEyebrow) => patch({ heroEyebrow })}
          />
          <Field
            label="Title line 1"
            value={value.heroTitle}
            onChange={(heroTitle) => patch({ heroTitle })}
          />
          <Field
            label="Title accent line"
            value={value.heroTitleAccent}
            onChange={(heroTitleAccent) => patch({ heroTitleAccent })}
          />
          <Field
            label="Description"
            value={value.heroDescription}
            multiline
            onChange={(heroDescription) => patch({ heroDescription })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Primary CTA"
              value={value.heroPrimaryLabel}
              onChange={(heroPrimaryLabel) => patch({ heroPrimaryLabel })}
            />
            <Field
              label="Primary href"
              value={value.heroPrimaryHref}
              onChange={(heroPrimaryHref) => patch({ heroPrimaryHref })}
            />
            <Field
              label="Secondary CTA"
              value={value.heroSecondaryLabel}
              onChange={(heroSecondaryLabel) => patch({ heroSecondaryLabel })}
            />
            <Field
              label="Secondary href"
              value={value.heroSecondaryHref}
              onChange={(heroSecondaryHref) => patch({ heroSecondaryHref })}
            />
          </div>
        </section>
      ) : null}

      {tab === "pricing" ? (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          <Field
            label="Eyebrow"
            value={value.pricingEyebrow}
            onChange={(pricingEyebrow) => patch({ pricingEyebrow })}
          />
          <Field
            label="Title"
            value={value.pricingTitle}
            onChange={(pricingTitle) => patch({ pricingTitle })}
          />
          <Field
            label="Title accent"
            value={value.pricingTitleAccent}
            onChange={(pricingTitleAccent) => patch({ pricingTitleAccent })}
          />
          <Field
            label="Description"
            value={value.pricingDescription}
            multiline
            onChange={(pricingDescription) => patch({ pricingDescription })}
          />
          <Field
            label="Yearly save badge"
            value={value.saveBadge}
            onChange={(saveBadge) => patch({ saveBadge })}
          />
        </section>
      ) : null}

      {tab === "plans" ? (
        <section className="space-y-4">
          <p className="text-xs text-slate-500">
            Prices here match the public /beyond-ai cards and should stay
            aligned with Orbit → Pricing → AI Builder.
          </p>
          {value.plans.map((plan, index) => (
            <div
              key={plan.id}
              className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-800">{plan.id}</p>
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={plan.visible}
                    onChange={(e) =>
                      updatePlan(index, { ...plan, visible: e.target.checked })
                    }
                  />
                  Visible
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Badge"
                  value={plan.badge}
                  onChange={(badge) => updatePlan(index, { ...plan, badge })}
                />
                <Field
                  label="Tagline"
                  value={plan.tagline}
                  onChange={(tagline) =>
                    updatePlan(index, { ...plan, tagline })
                  }
                />
                <Field
                  label="Monthly price (number)"
                  value={String(plan.priceMonthly)}
                  onChange={(raw) =>
                    updatePlan(index, {
                      ...plan,
                      priceMonthly: Number(raw) || 0,
                    })
                  }
                />
                <Field
                  label="Included credit USD"
                  value={String(plan.includedCreditUsd)}
                  onChange={(raw) =>
                    updatePlan(index, {
                      ...plan,
                      includedCreditUsd: Number(raw) || 0,
                    })
                  }
                />
                <Field
                  label="CTA label"
                  value={plan.cta}
                  onChange={(cta) => updatePlan(index, { ...plan, cta })}
                />
                <Field
                  label="Meter %"
                  value={String(plan.meterPct)}
                  onChange={(raw) =>
                    updatePlan(index, {
                      ...plan,
                      meterPct: Math.min(100, Math.max(0, Number(raw) || 0)),
                    })
                  }
                />
              </div>
              <Field
                label="Features (one per line)"
                value={plan.features.join("\n")}
                multiline
                onChange={(raw) =>
                  updatePlan(index, {
                    ...plan,
                    features: raw
                      .split("\n")
                      .map((l) => l.trim())
                      .filter(Boolean),
                  })
                }
              />
              <Field
                label="Support line"
                value={plan.support}
                onChange={(support) => updatePlan(index, { ...plan, support })}
              />
            </div>
          ))}
        </section>
      ) : null}

      {tab === "video" ? (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={value.videoVisible}
              onChange={(e) => patch({ videoVisible: e.target.checked })}
            />
            Show video band (below pricing, above FAQs)
          </label>
          <Field
            label="Video URL (mp4/webm — optional)"
            value={value.videoUrl}
            onChange={(videoUrl) => patch({ videoUrl })}
          />
          <Field
            label="Eyebrow"
            value={value.videoEyebrow}
            onChange={(videoEyebrow) => patch({ videoEyebrow })}
          />
          <Field
            label="Title"
            value={value.videoTitle}
            onChange={(videoTitle) => patch({ videoTitle })}
          />
          <Field
            label="Description"
            value={value.videoDescription}
            multiline
            onChange={(videoDescription) => patch({ videoDescription })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="CTA label"
              value={value.videoCtaLabel}
              onChange={(videoCtaLabel) => patch({ videoCtaLabel })}
            />
            <Field
              label="CTA href"
              value={value.videoCtaHref}
              onChange={(videoCtaHref) => patch({ videoCtaHref })}
            />
          </div>
        </section>
      ) : null}

      {tab === "faqs" ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <Field
            label="FAQ eyebrow"
            value={value.faqEyebrow}
            onChange={(faqEyebrow) => patch({ faqEyebrow })}
          />
          <Field
            label="FAQ title"
            value={value.faqTitle}
            onChange={(faqTitle) => patch({ faqTitle })}
          />
          <Field
            label="FAQ accent"
            value={value.faqTitleAccent}
            onChange={(faqTitleAccent) => patch({ faqTitleAccent })}
          />
          <Field
            label="FAQ intro"
            value={value.faqDescription}
            multiline
            onChange={(faqDescription) => patch({ faqDescription })}
          />
          {value.faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3"
            >
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={faq.visible}
                  onChange={(e) =>
                    updateFaq(index, { ...faq, visible: e.target.checked })
                  }
                />
                Visible
              </label>
              <Field
                label="Question"
                value={faq.question}
                onChange={(question) => updateFaq(index, { ...faq, question })}
              />
              <Field
                label="Answer"
                value={faq.answer}
                multiline
                onChange={(answer) => updateFaq(index, { ...faq, answer })}
              />
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
