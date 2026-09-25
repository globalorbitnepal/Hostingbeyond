"use client";

import { useState } from "react";

import { OrbitImageField } from "@/components/orbit/image-field";
import { routes } from "@/config/routes";
import { MIGRATION_FRAME_SPECS } from "@/lib/migration/frame-specs";
import type {
  CmsMigrationFeature,
  CmsWebsiteMigrationPageContent,
} from "@/lib/orbit/website-migration-page-content";

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

export function WebsiteMigrationPageEditor({
  value,
  onChange,
  onPersist,
}: {
  value: CmsWebsiteMigrationPageContent;
  onChange: (v: CmsWebsiteMigrationPageContent) => void;
  onPersist: (v: CmsWebsiteMigrationPageContent) => void;
}) {
  const [tab, setTab] = useState<
    "hero" | "pricing" | "steps" | "why" | "ai" | "support" | "faq" | "closing"
  >("hero");

  function patch(
    next: Partial<CmsWebsiteMigrationPageContent>,
    persist = false,
  ) {
    const merged = { ...value, ...next };
    onChange(merged);
    if (persist) onPersist(merged);
  }

  const tabs = [
    ["hero", "Hero"],
    ["pricing", "Pricing copy"],
    ["steps", "How it works"],
    ["why", "Why us"],
    ["ai", "AI band"],
    ["support", "Support"],
    ["faq", "FAQs"],
    ["closing", "Closing"],
  ] as const;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <p className="rounded-lg bg-violet-50 px-3 py-2 text-[11px] leading-relaxed text-violet-900">
        <span className="font-bold">Plan prices:</span>{" "}
        <a href="/orbit/content" className="underline">
          Website Content → Web Hosting Plans
        </a>
        . Hero artwork: {MIGRATION_FRAME_SPECS.heroComposite}. Public:{" "}
        <a href={routes.websiteMigration} className="underline">
          {routes.websiteMigration}
        </a>
        . SEO slug{" "}
        <code className="rounded bg-white px-1">website-migration</code>.
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
            label="Title"
            value={value.heroTitle}
            onChange={(v) => patch({ heroTitle: v })}
          />
          <Field
            label="Accent"
            value={value.heroTitleAccent}
            onChange={(v) => patch({ heroTitleAccent: v })}
          />
          <Field
            label="Primary CTA"
            value={value.heroPrimaryLabel}
            onChange={(v) => patch({ heroPrimaryLabel: v })}
          />
          <Field
            label="Primary URL"
            value={value.heroPrimaryHref}
            onChange={(v) => patch({ heroPrimaryHref: v })}
          />
          <Field
            label="Guarantee line"
            value={value.heroGuarantee}
            onChange={(v) => patch({ heroGuarantee: v })}
          />
          <div className="sm:col-span-2">
            <Field
              label="Hero bullets (one per line)"
              value={value.heroBullets.join("\n")}
              onChange={(raw) =>
                patch({ heroBullets: raw.split("\n").filter(Boolean) })
              }
              multiline
            />
          </div>
          <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 sm:col-span-2">
            <p className="text-[11px] leading-relaxed text-violet-900">
              Right column: upload full artwork (
              {MIGRATION_FRAME_SPECS.heroComposite}). Shown edge-to-edge — no
              frame/border on the live page.
            </p>
            <OrbitImageField
              label="Hero artwork (full right column)"
              value={value.heroImage}
              onChange={(heroImage) => patch({ heroImage })}
              onCommit={(heroImage) => patch({ heroImage }, true)}
            />
            <Field
              label="Hero size (% — 130 = 30% larger than base)"
              value={String(value.heroVisualScalePercent)}
              onChange={(raw) => {
                const n = Number.parseInt(raw, 10);
                if (!Number.isNaN(n)) {
                  patch({
                    heroVisualScalePercent: Math.min(160, Math.max(80, n)),
                  });
                }
              }}
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
            label="Annual toggle"
            value={value.annualToggleLabel}
            onChange={(v) => patch({ annualToggleLabel: v })}
          />
          <Field
            label="Monthly toggle"
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

      {tab === "steps" ? (
        <div className="space-y-3">
          <Field
            label="Heading"
            value={value.stepsHeading}
            onChange={(v) => patch({ stepsHeading: v })}
          />
          <Field
            label="Description"
            value={value.stepsDescription}
            onChange={(v) => patch({ stepsDescription: v })}
            multiline
          />
          {value.steps.map((step, index) => (
            <div
              key={step.id}
              className="rounded-xl border border-slate-200 p-3"
            >
              <Field
                label="Title"
                value={step.title}
                onChange={(title) => {
                  const steps = [...value.steps];
                  steps[index] = { ...step, title };
                  patch({ steps });
                }}
              />
              <Field
                label="Description"
                value={step.description}
                onChange={(description) => {
                  const steps = [...value.steps];
                  steps[index] = { ...step, description };
                  patch({ steps });
                }}
                multiline
              />
              <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={step.visible !== false}
                  onChange={(e) => {
                    const steps = [...value.steps];
                    steps[index] = { ...step, visible: e.target.checked };
                    patch({ steps });
                  }}
                />
                Visible on page
              </label>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "why" ? (
        <div className="space-y-3">
          <Field
            label="Heading"
            value={value.whyHeading}
            onChange={(v) => patch({ whyHeading: v })}
          />
          <Field
            label="Description"
            value={value.whyDescription}
            onChange={(v) => patch({ whyDescription: v })}
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
                label="Icon (zap|shield|clock|users|bot|globe)"
                value={feat.icon}
                onChange={(icon) => {
                  const features = [...value.features];
                  features[index] = {
                    ...feat,
                    icon: icon as CmsMigrationFeature["icon"],
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

      {tab === "ai" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Heading"
            value={value.aiHeading}
            onChange={(v) => patch({ aiHeading: v })}
          />
          <div className="sm:col-span-2">
            <Field
              label="Description"
              value={value.aiDescription}
              onChange={(v) => patch({ aiDescription: v })}
              multiline
            />
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Bullets"
              value={value.aiBullets.join("\n")}
              onChange={(raw) =>
                patch({ aiBullets: raw.split("\n").filter(Boolean) })
              }
              multiline
            />
          </div>
          <div className="sm:col-span-2">
            <p className="text-[11px] text-slate-600">
              Right illustration: {MIGRATION_FRAME_SPECS.aiBandImage}. Shown
              without border/frame on a blue–lavender gradient band.
            </p>
            <OrbitImageField
              label="Beyond AI band artwork"
              value={value.aiImage}
              onChange={(aiImage) => patch({ aiImage })}
              onCommit={(aiImage) => patch({ aiImage }, true)}
            />
          </div>
        </div>
      ) : null}

      {tab === "support" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Heading"
            value={value.supportHeading}
            onChange={(v) => patch({ supportHeading: v })}
          />
          <Field
            label="CTA"
            value={value.supportCtaLabel}
            onChange={(v) => patch({ supportCtaLabel: v })}
          />
          <Field
            label="CTA URL"
            value={value.supportCtaHref}
            onChange={(v) => patch({ supportCtaHref: v })}
          />
          <div className="sm:col-span-2">
            <Field
              label="Description"
              value={value.supportDescription}
              onChange={(v) => patch({ supportDescription: v })}
              multiline
            />
          </div>
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
