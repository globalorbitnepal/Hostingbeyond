"use client";

import { useState } from "react";

import { OrbitImageField } from "@/components/orbit/image-field";
import { routes } from "@/config/routes";
import { HOSTING_FRAME_SPECS } from "@/lib/hosting/frame-specs";
import type { CmsHostingPageContent } from "@/lib/orbit/hosting-page-content";

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

export function HostingPageEditor({
  value,
  onChange,
  onPersist,
}: {
  value: CmsHostingPageContent;
  onChange: (v: CmsHostingPageContent) => void;
  onPersist: (v: CmsHostingPageContent) => void;
}) {
  const [tab, setTab] = useState<
    | "hero"
    | "pricing"
    | "features"
    | "wordpress"
    | "compare"
    | "faq"
    | "closing"
  >("hero");

  function patch(next: Partial<CmsHostingPageContent>, persist = false) {
    const merged = { ...value, ...next };
    onChange(merged);
    if (persist) onPersist(merged);
  }

  const tabs = [
    ["hero", "Hero"],
    ["pricing", "Pricing copy"],
    ["features", "Features"],
    ["wordpress", "WordPress"],
    ["compare", "Compare"],
    ["faq", "FAQs"],
    ["closing", "Closing"],
  ] as const;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <p className="rounded-lg bg-violet-50 px-3 py-2 text-[11px] text-violet-900">
        <span className="font-bold">Plan prices & features:</span> edit under{" "}
        <a href="/orbit/content" className="underline">
          Website Content → Web Hosting Plans
        </a>
        . Public URL:{" "}
        <a href={routes.hosting} className="underline">
          {routes.hosting}
        </a>
        . Image sizes: {HOSTING_FRAME_SPECS.wordpressBand}
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
            label="Promo badge"
            value={value.heroPromo}
            onChange={(v) => patch({ heroPromo: v })}
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
          <div className="sm:col-span-2">
            <Field
              label="Description"
              value={value.heroDescription}
              onChange={(v) => patch({ heroDescription: v })}
              multiline
            />
          </div>
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
            label="Secondary CTA"
            value={value.heroSecondaryLabel}
            onChange={(v) => patch({ heroSecondaryLabel: v })}
          />
          <Field
            label="Secondary URL"
            value={value.heroSecondaryHref}
            onChange={(v) => patch({ heroSecondaryHref: v })}
          />
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
            label="Title"
            value={value.pricingTitle}
            onChange={(v) => patch({ pricingTitle: v })}
          />
          <Field
            label="Title accent"
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
          <div className="sm:col-span-2">
            <Field
              label="Footnote"
              value={value.pricingNote}
              onChange={(v) => patch({ pricingNote: v })}
              multiline
            />
          </div>
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
                label="Icon (zap|shield|globe|server|mail|sparkles)"
                value={feat.icon}
                onChange={(icon) => {
                  const features = [...value.features];
                  features[index] = { ...feat, icon: icon as typeof feat.icon };
                  patch({ features });
                }}
              />
            </div>
          ))}
        </div>
      ) : null}

      {tab === "wordpress" ? (
        <div className="space-y-3">
          <Field
            label="Heading"
            value={value.wordpressHeading}
            onChange={(v) => patch({ wordpressHeading: v })}
          />
          <Field
            label="Description"
            value={value.wordpressDescription}
            onChange={(v) => patch({ wordpressDescription: v })}
            multiline
          />
          <Field
            label="Bullets (one per line)"
            value={value.wordpressBullets.join("\n")}
            onChange={(raw) =>
              patch({ wordpressBullets: raw.split("\n").filter(Boolean) })
            }
            multiline
          />
          <Field
            label="CTA label"
            value={value.wordpressCtaLabel}
            onChange={(v) => patch({ wordpressCtaLabel: v })}
          />
          <Field
            label="CTA URL"
            value={value.wordpressCtaHref}
            onChange={(v) => patch({ wordpressCtaHref: v })}
          />
          <OrbitImageField
            label={`Optional image — ${HOSTING_FRAME_SPECS.wordpressBand}`}
            value={value.wordpressImage}
            onChange={(wordpressImage) => patch({ wordpressImage })}
            onCommit={(wordpressImage) => patch({ wordpressImage }, true)}
          />
        </div>
      ) : null}

      {tab === "compare" ? (
        <div className="space-y-3">
          <Field
            label="Heading"
            value={value.compareHeading}
            onChange={(v) => patch({ compareHeading: v })}
          />
          <Field
            label="Description"
            value={value.compareDescription}
            onChange={(v) => patch({ compareDescription: v })}
            multiline
          />
          <Field
            label="Bullets"
            value={value.compareBullets.join("\n")}
            onChange={(raw) =>
              patch({ compareBullets: raw.split("\n").filter(Boolean) })
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
          />
          <button
            type="button"
            className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800"
            onClick={() =>
              patch({
                faqs: [
                  ...value.faqs,
                  {
                    id: `faq-${Date.now()}`,
                    visible: true,
                    question: "Question?",
                    answer: "Answer.",
                  },
                ],
              })
            }
          >
            + Add FAQ
          </button>
          {value.faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="rounded-xl border border-slate-200 p-3"
            >
              <button
                type="button"
                className="mb-2 text-xs font-semibold text-red-600"
                onClick={() =>
                  patch(
                    { faqs: value.faqs.filter((_, i) => i !== index) },
                    true,
                  )
                }
              >
                Remove
              </button>
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
