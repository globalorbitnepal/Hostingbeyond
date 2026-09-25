"use client";

import { useState } from "react";

import { OrbitImageField } from "@/components/orbit/image-field";
import { routes } from "@/config/routes";
import type { CmsDomainTransferPageContent } from "@/lib/orbit/domain-transfer-page-content";

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

export function DomainTransferPageEditor({
  value,
  onChange,
  onPersist,
}: {
  value: CmsDomainTransferPageContent;
  onChange: (v: CmsDomainTransferPageContent) => void;
  onPersist: (v: CmsDomainTransferPageContent) => void;
}) {
  const [tab, setTab] = useState<
    | "hero"
    | "perks"
    | "steps"
    | "why"
    | "pricing"
    | "bundle"
    | "support"
    | "faq"
    | "closing"
  >("hero");

  function patch(next: Partial<CmsDomainTransferPageContent>, persist = false) {
    const merged = { ...value, ...next };
    onChange(merged);
    if (persist) onPersist(merged);
  }

  const tabs = [
    ["hero", "Hero"],
    ["perks", "Perks"],
    ["steps", "Steps"],
    ["why", "Why us"],
    ["pricing", "Pricing copy"],
    ["bundle", "Bundle"],
    ["support", "Support"],
    ["faq", "FAQs"],
    ["closing", "Closing"],
  ] as const;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <p className="rounded-lg bg-violet-50 px-3 py-2 text-[11px] leading-relaxed text-violet-900">
        TLD transfer prices sync from{" "}
        <a href="/orbit/domains" className="underline">
          Orbit → Domain Pages
        </a>
        . Eligibility API:{" "}
        <code className="rounded bg-white px-1">
          POST /api/domains/transfer-check
        </code>{" "}
        (set{" "}
        <code className="rounded bg-white px-1">
          DOMAIN_TRANSFER_LOOKUP_URL
        </code>{" "}
        for registrar). Public:{" "}
        <a href={routes.domainTransfer} className="underline">
          {routes.domainTransfer}
        </a>
        . SEO slug{" "}
        <code className="rounded bg-white px-1">domain-transfer</code>.
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
            label="Title accent"
            value={value.heroTitleAccent}
            onChange={(v) => patch({ heroTitleAccent: v })}
          />
          <Field
            label="Guarantee"
            value={value.heroGuarantee}
            onChange={(v) => patch({ heroGuarantee: v })}
          />
          <div className="sm:col-span-2">
            <Field
              label="Description"
              value={value.heroDescription}
              onChange={(v) => patch({ heroDescription: v })}
              multiline
            />
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Bullets (one per line)"
              value={value.heroBullets.join("\n")}
              onChange={(raw) =>
                patch({ heroBullets: raw.split("\n").filter(Boolean) })
              }
              multiline
            />
          </div>
          <Field
            label="Search placeholder"
            value={value.heroSearchPlaceholder}
            onChange={(v) => patch({ heroSearchPlaceholder: v })}
          />
          <Field
            label="Auth code placeholder"
            value={value.heroAuthPlaceholder}
            onChange={(v) => patch({ heroAuthPlaceholder: v })}
          />
          <div className="sm:col-span-2">
            <OrbitImageField
              label="Hero image"
              value={value.heroImage}
              onChange={(heroImage) => patch({ heroImage })}
              onCommit={(heroImage) => patch({ heroImage }, true)}
            />
          </div>
        </div>
      ) : null}

      {tab === "perks" ? (
        <div className="space-y-4">
          {value.perks.map((perk, index) => (
            <div
              key={perk.id}
              className="grid gap-2 rounded-lg border border-slate-100 p-3 sm:grid-cols-2"
            >
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={perk.visible !== false}
                  onChange={(e) => {
                    const perks = [...value.perks];
                    perks[index] = { ...perk, visible: e.target.checked };
                    patch({ perks });
                  }}
                />
                Visible
              </label>
              <Field
                label="Label"
                value={perk.label}
                onChange={(v) => {
                  const perks = [...value.perks];
                  perks[index] = { ...perk, label: v };
                  patch({ perks });
                }}
              />
              <Field
                label="Value"
                value={perk.value}
                onChange={(v) => {
                  const perks = [...value.perks];
                  perks[index] = { ...perk, value: v };
                  patch({ perks });
                }}
              />
            </div>
          ))}
        </div>
      ) : null}

      {tab === "steps" ? (
        <div className="space-y-4">
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
              className="space-y-2 rounded-lg border border-slate-100 p-3"
            >
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={step.visible !== false}
                  onChange={(e) => {
                    const steps = [...value.steps];
                    steps[index] = { ...step, visible: e.target.checked };
                    patch({ steps });
                  }}
                />
                Step {index + 1} visible
              </label>
              <Field
                label="Title"
                value={step.title}
                onChange={(v) => {
                  const steps = [...value.steps];
                  steps[index] = { ...step, title: v };
                  patch({ steps });
                }}
              />
              <Field
                label="Description"
                value={step.description}
                onChange={(v) => {
                  const steps = [...value.steps];
                  steps[index] = { ...step, description: v };
                  patch({ steps });
                }}
                multiline
              />
            </div>
          ))}
        </div>
      ) : null}

      {tab === "why" ? (
        <div className="space-y-4">
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
              className="space-y-2 rounded-lg border border-slate-100 p-3"
            >
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={feat.visible !== false}
                  onChange={(e) => {
                    const features = [...value.features];
                    features[index] = { ...feat, visible: e.target.checked };
                    patch({ features });
                  }}
                />
                Visible
              </label>
              <Field
                label="Title"
                value={feat.title}
                onChange={(v) => {
                  const features = [...value.features];
                  features[index] = { ...feat, title: v };
                  patch({ features });
                }}
              />
              <Field
                label="Description"
                value={feat.description}
                onChange={(v) => {
                  const features = [...value.features];
                  features[index] = { ...feat, description: v };
                  patch({ features });
                }}
                multiline
              />
            </div>
          ))}
        </div>
      ) : null}

      {tab === "pricing" ? (
        <div className="grid gap-3">
          <Field
            label="Eyebrow"
            value={value.pricingEyebrow}
            onChange={(v) => patch({ pricingEyebrow: v })}
          />
          <Field
            label="Title"
            value={value.pricingTitle}
            onChange={(v) => patch({ pricingTitle: v })}
          />
          <Field
            label="Description"
            value={value.pricingDescription}
            onChange={(v) => patch({ pricingDescription: v })}
            multiline
          />
          <Field
            label="Footnote"
            value={value.pricingFootnote}
            onChange={(v) => patch({ pricingFootnote: v })}
            multiline
          />
        </div>
      ) : null}

      {tab === "bundle" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Heading"
            value={value.bundleHeading}
            onChange={(v) => patch({ bundleHeading: v })}
          />
          <Field
            label="CTA label"
            value={value.bundleCtaLabel}
            onChange={(v) => patch({ bundleCtaLabel: v })}
          />
          <Field
            label="CTA URL"
            value={value.bundleCtaHref}
            onChange={(v) => patch({ bundleCtaHref: v })}
          />
          <div className="sm:col-span-2">
            <Field
              label="Description"
              value={value.bundleDescription}
              onChange={(v) => patch({ bundleDescription: v })}
              multiline
            />
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Bullets (one per line)"
              value={value.bundleBullets.join("\n")}
              onChange={(raw) =>
                patch({ bundleBullets: raw.split("\n").filter(Boolean) })
              }
              multiline
            />
          </div>
          <div className="sm:col-span-2">
            <OrbitImageField
              label="Bundle image"
              value={value.bundleImage}
              onChange={(bundleImage) => patch({ bundleImage })}
              onCommit={(bundleImage) => patch({ bundleImage }, true)}
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
            label="CTA label"
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
        <div className="space-y-4">
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
              className="space-y-2 rounded-lg border border-slate-100 p-3"
            >
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={faq.visible !== false}
                  onChange={(e) => {
                    const faqs = [...value.faqs];
                    faqs[index] = { ...faq, visible: e.target.checked };
                    patch({ faqs });
                  }}
                />
                Visible
              </label>
              <Field
                label="Question"
                value={faq.question}
                onChange={(v) => {
                  const faqs = [...value.faqs];
                  faqs[index] = { ...faq, question: v };
                  patch({ faqs });
                }}
              />
              <Field
                label="Answer"
                value={faq.answer}
                onChange={(v) => {
                  const faqs = [...value.faqs];
                  faqs[index] = { ...faq, answer: v };
                  patch({ faqs });
                }}
                multiline
              />
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
            label="CTA label"
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
