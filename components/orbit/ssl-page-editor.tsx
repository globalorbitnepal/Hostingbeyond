"use client";

import { useState } from "react";

import type {
  CmsSslFeature,
  CmsSslIncludedGroup,
  CmsSslPageContent,
  CmsSslPlan,
} from "@/lib/orbit/ssl-page-content";

function Field({
  label,
  value,
  onChange,
  multiline,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  hint?: string;
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
      {hint ? (
        <span className="mt-1 block text-[11px] font-normal tracking-normal text-slate-400 normal-case">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

const TABS = [
  ["hero", "Hero"],
  ["stats", "Stats"],
  ["why", "Why HTTPS"],
  ["included", "Included"],
  ["pricing", "SSL plans"],
  ["steps", "Steps"],
  ["types", "Cert types"],
  ["security", "Risk / fix"],
  ["reviews", "Reviews"],
  ["faq", "FAQs"],
  ["closing", "Closing"],
] as const;

type TabId = (typeof TABS)[number][0];

export function SslPageEditor({
  value,
  onChange,
  onPersist,
  saving,
}: {
  value: CmsSslPageContent;
  onChange: (v: CmsSslPageContent) => void;
  onPersist: (v: CmsSslPageContent) => void;
  saving?: boolean;
}) {
  const [tab, setTab] = useState<TabId>("hero");

  function patch(next: Partial<CmsSslPageContent>, persist = false) {
    const merged = { ...value, ...next };
    onChange(merged);
    if (persist) onPersist(merged);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-violet-50 px-3 py-2 text-[11px] leading-relaxed text-violet-900">
        <span>
          Full control of{" "}
          <a href="/web-hosting/ssl" className="font-semibold underline">
            /web-hosting/ssl
          </a>
          . No images used — every visual is CSS.
        </span>
        <a
          href="/web-hosting/ssl"
          target="_blank"
          rel="noreferrer"
          className="rounded-md bg-violet-600 px-2.5 py-1 text-[11px] font-semibold text-white"
        >
          Preview page
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map(([id, label]) => (
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
            label="Badge"
            value={value.heroBadge}
            onChange={(v) => patch({ heroBadge: v })}
          />
          <Field
            label="Guarantee line"
            value={value.heroGuarantee}
            onChange={(v) => patch({ heroGuarantee: v })}
          />
          <Field
            label="Title"
            value={value.heroTitle}
            onChange={(v) => patch({ heroTitle: v })}
          />
          <Field
            label="Title accent (gradient)"
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

          <div className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:col-span-2 sm:grid-cols-2">
            <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase sm:col-span-2">
              Certificate card (right side, CSS only)
            </p>
            <Field
              label="Card badge"
              value={value.heroVisualTitle}
              onChange={(v) => patch({ heroVisualTitle: v })}
            />
            <Field
              label="Domain shown"
              value={value.heroVisualDomain}
              onChange={(v) => patch({ heroVisualDomain: v })}
            />
            <Field
              label="Issuer line"
              value={value.heroVisualIssuer}
              onChange={(v) => patch({ heroVisualIssuer: v })}
            />
            <Field
              label="Expiry label"
              value={value.heroVisualExpiryLabel}
              onChange={(v) => patch({ heroVisualExpiryLabel: v })}
            />
            <Field
              label="Expiry value"
              value={value.heroVisualExpiryValue}
              onChange={(v) => patch({ heroVisualExpiryValue: v })}
            />
            <Field
              label="Score label"
              value={value.heroVisualScoreLabel}
              onChange={(v) => patch({ heroVisualScoreLabel: v })}
            />
            <Field
              label="Score value"
              value={value.heroVisualScoreValue}
              onChange={(v) => patch({ heroVisualScoreValue: v })}
            />
          </div>
        </div>
      ) : null}

      {tab === "stats" ? (
        <div className="space-y-3">
          <Field
            label="Section label (screen readers + orbit only)"
            value={value.statsHeading}
            onChange={(v) => patch({ statsHeading: v })}
          />
          {value.stats.map((stat, index) => (
            <div
              key={stat.id}
              className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-3"
            >
              <Field
                label="Value"
                value={stat.value}
                onChange={(v) => {
                  const stats = [...value.stats];
                  stats[index] = { ...stat, value: v };
                  patch({ stats });
                }}
              />
              <Field
                label="Label"
                value={stat.label}
                onChange={(v) => {
                  const stats = [...value.stats];
                  stats[index] = { ...stat, label: v };
                  patch({ stats });
                }}
              />
              <label className="mt-6 flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={stat.visible !== false}
                  onChange={(e) => {
                    const stats = [...value.stats];
                    stats[index] = { ...stat, visible: e.target.checked };
                    patch({ stats });
                  }}
                />
                Visible
              </label>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "why" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Eyebrow"
              value={value.whyEyebrow}
              onChange={(v) => patch({ whyEyebrow: v })}
            />
            <Field
              label="Heading"
              value={value.whyHeading}
              onChange={(v) => patch({ whyHeading: v })}
            />
            <Field
              label="Heading accent"
              value={value.whyHeadingAccent}
              onChange={(v) => patch({ whyHeadingAccent: v })}
            />
            <div className="sm:col-span-2">
              <Field
                label="Description"
                value={value.whyDescription}
                onChange={(v) => patch({ whyDescription: v })}
                multiline
              />
            </div>
          </div>
          {value.features.map((feat, index) => (
            <div
              key={feat.id}
              className="rounded-xl border border-slate-200 p-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
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
                  label="Icon"
                  value={feat.icon}
                  hint="shield | lock | zap | search | globe | refresh"
                  onChange={(icon) => {
                    const features = [...value.features];
                    features[index] = {
                      ...feat,
                      icon: icon as CmsSslFeature["icon"],
                    };
                    patch({ features });
                  }}
                />
              </div>
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

      {tab === "included" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Eyebrow"
              value={value.includedEyebrow}
              onChange={(v) => patch({ includedEyebrow: v })}
            />
            <Field
              label="Heading"
              value={value.includedHeading}
              onChange={(v) => patch({ includedHeading: v })}
            />
            <Field
              label="Heading accent"
              value={value.includedHeadingAccent}
              onChange={(v) => patch({ includedHeadingAccent: v })}
            />
            <Field
              label="Footnote"
              value={value.includedFootnote}
              onChange={(v) => patch({ includedFootnote: v })}
            />
            <div className="sm:col-span-2">
              <Field
                label="Description"
                value={value.includedDescription}
                onChange={(v) => patch({ includedDescription: v })}
                multiline
              />
            </div>
          </div>
          {value.includedGroups.map((group, index) => (
            <div
              key={group.id}
              className="rounded-xl border border-slate-200 p-3"
            >
              <Field
                label="Card title"
                value={group.title}
                onChange={(title) => {
                  const groups = [...value.includedGroups];
                  groups[index] = { ...group, title };
                  patch({ includedGroups: groups });
                }}
              />
              <Field
                label="Card description"
                value={group.description}
                onChange={(description) => {
                  const groups = [...value.includedGroups];
                  groups[index] = { ...group, description };
                  patch({ includedGroups: groups });
                }}
                multiline
              />
              <Field
                label="Bullets (one per line)"
                value={group.items.join("\n")}
                onChange={(raw) => {
                  const groups = [...value.includedGroups];
                  groups[index] = {
                    ...group,
                    items: raw.split("\n").filter(Boolean),
                  };
                  patch({ includedGroups: groups });
                }}
                multiline
              />
              <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={group.visible !== false}
                  onChange={(e) => {
                    const groups = [...value.includedGroups];
                    groups[index] = {
                      ...(group as CmsSslIncludedGroup),
                      visible: e.target.checked,
                    };
                    patch({ includedGroups: groups });
                  }}
                />
                Visible on page
              </label>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "pricing" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Eyebrow"
              value={value.pricingEyebrow}
              onChange={(v) => patch({ pricingEyebrow: v })}
            />
            <Field
              label="Save badge"
              value={value.pricingSaveBadge}
              onChange={(v) => patch({ pricingSaveBadge: v })}
            />
            <Field
              label="Heading"
              value={value.pricingHeading}
              onChange={(v) => patch({ pricingHeading: v })}
            />
            <Field
              label="Heading accent"
              value={value.pricingHeadingAccent}
              onChange={(v) => patch({ pricingHeadingAccent: v })}
            />
            <Field
              label="Trust chip 1"
              value={value.pricingTrust1}
              onChange={(v) => patch({ pricingTrust1: v })}
            />
            <Field
              label="Trust chip 2"
              value={value.pricingTrust2}
              onChange={(v) => patch({ pricingTrust2: v })}
            />
            <Field
              label="Trust chip 3"
              value={value.pricingTrust3}
              onChange={(v) => patch({ pricingTrust3: v })}
            />
            <Field
              label="Footnote"
              value={value.pricingNote}
              onChange={(v) => patch({ pricingNote: v })}
            />
            <div className="sm:col-span-2">
              <Field
                label="Description"
                value={value.pricingDescription}
                onChange={(v) => patch({ pricingDescription: v })}
                multiline
              />
            </div>
          </div>

          {value.plans.map((plan, index) => (
            <div
              key={plan.id}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
            >
              <p className="mb-2 text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                {plan.id}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Name"
                  value={plan.name}
                  onChange={(name) => {
                    const plans = [...value.plans];
                    plans[index] = { ...plan, name };
                    patch({ plans });
                  }}
                />
                <Field
                  label="Best for"
                  value={plan.bestFor}
                  onChange={(bestFor) => {
                    const plans = [...value.plans];
                    plans[index] = { ...plan, bestFor };
                    patch({ plans });
                  }}
                />
                <Field
                  label="Badge"
                  value={plan.badge}
                  onChange={(badge) => {
                    const plans = [...value.plans];
                    plans[index] = { ...plan, badge };
                    patch({ plans });
                  }}
                />
                <Field
                  label="Discount tag"
                  value={plan.off}
                  onChange={(off) => {
                    const plans = [...value.plans];
                    plans[index] = { ...plan, off };
                    patch({ plans });
                  }}
                />
                <Field
                  label="Price — 1 year (USD)"
                  value={plan.price1}
                  onChange={(price1) => {
                    const plans = [...value.plans];
                    plans[index] = { ...plan, price1 };
                    patch({ plans });
                  }}
                />
                <Field
                  label="Price — 2 years"
                  value={plan.price2}
                  onChange={(price2) => {
                    const plans = [...value.plans];
                    plans[index] = { ...plan, price2 };
                    patch({ plans });
                  }}
                />
                <Field
                  label="Price — 3 years"
                  value={plan.price3}
                  onChange={(price3) => {
                    const plans = [...value.plans];
                    plans[index] = { ...plan, price3 };
                    patch({ plans });
                  }}
                />
                <Field
                  label="Renewal (per year)"
                  value={plan.renew}
                  onChange={(renew) => {
                    const plans = [...value.plans];
                    plans[index] = { ...plan, renew };
                    patch({ plans });
                  }}
                />
                <Field
                  label="CTA label"
                  value={plan.ctaLabel}
                  onChange={(ctaLabel) => {
                    const plans = [...value.plans];
                    plans[index] = { ...plan, ctaLabel };
                    patch({ plans });
                  }}
                />
                <Field
                  label="CTA URL"
                  value={plan.ctaHref}
                  onChange={(ctaHref) => {
                    const plans = [...value.plans];
                    plans[index] = { ...plan, ctaHref };
                    patch({ plans });
                  }}
                />
              </div>
              <Field
                label="Features (one per line)"
                value={plan.features.join("\n")}
                onChange={(raw) => {
                  const plans = [...value.plans];
                  plans[index] = {
                    ...(plan as CmsSslPlan),
                    features: raw.split("\n").filter(Boolean),
                  };
                  patch({ plans });
                }}
                multiline
              />
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(plan.popular)}
                    onChange={(e) => {
                      const plans = [...value.plans];
                      plans[index] = { ...plan, popular: e.target.checked };
                      patch({ plans });
                    }}
                  />
                  Most popular
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={plan.visible !== false}
                    onChange={(e) => {
                      const plans = [...value.plans];
                      plans[index] = { ...plan, visible: e.target.checked };
                      patch({ plans });
                    }}
                  />
                  Visible on page
                </label>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "steps" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Eyebrow"
              value={value.stepsEyebrow}
              onChange={(v) => patch({ stepsEyebrow: v })}
            />
            <Field
              label="Heading"
              value={value.stepsHeading}
              onChange={(v) => patch({ stepsHeading: v })}
            />
            <div className="sm:col-span-2">
              <Field
                label="Description"
                value={value.stepsDescription}
                onChange={(v) => patch({ stepsDescription: v })}
                multiline
              />
            </div>
          </div>
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

      {tab === "types" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Eyebrow"
              value={value.typesEyebrow}
              onChange={(v) => patch({ typesEyebrow: v })}
            />
            <Field
              label="Heading"
              value={value.typesHeading}
              onChange={(v) => patch({ typesHeading: v })}
            />
            <div className="sm:col-span-2">
              <Field
                label="Description"
                value={value.typesDescription}
                onChange={(v) => patch({ typesDescription: v })}
                multiline
              />
            </div>
          </div>
          {value.certTypes.map((type, index) => (
            <div
              key={type.id}
              className="rounded-xl border border-slate-200 p-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Tab label"
                  value={type.label}
                  onChange={(label) => {
                    const certTypes = [...value.certTypes];
                    certTypes[index] = { ...type, label };
                    patch({ certTypes });
                  }}
                />
                <Field
                  label="Title"
                  value={type.title}
                  onChange={(title) => {
                    const certTypes = [...value.certTypes];
                    certTypes[index] = { ...type, title };
                    patch({ certTypes });
                  }}
                />
                <Field
                  label="Validation"
                  value={type.validation}
                  onChange={(validation) => {
                    const certTypes = [...value.certTypes];
                    certTypes[index] = { ...type, validation };
                    patch({ certTypes });
                  }}
                />
                <Field
                  label="Issuance time"
                  value={type.issueTime}
                  onChange={(issueTime) => {
                    const certTypes = [...value.certTypes];
                    certTypes[index] = { ...type, issueTime };
                    patch({ certTypes });
                  }}
                />
                <Field
                  label="Best for"
                  value={type.bestFor}
                  onChange={(bestFor) => {
                    const certTypes = [...value.certTypes];
                    certTypes[index] = { ...type, bestFor };
                    patch({ certTypes });
                  }}
                />
              </div>
              <Field
                label="Description"
                value={type.description}
                onChange={(description) => {
                  const certTypes = [...value.certTypes];
                  certTypes[index] = { ...type, description };
                  patch({ certTypes });
                }}
                multiline
              />
              <Field
                label="Points (one per line)"
                value={type.points.join("\n")}
                onChange={(raw) => {
                  const certTypes = [...value.certTypes];
                  certTypes[index] = {
                    ...type,
                    points: raw.split("\n").filter(Boolean),
                  };
                  patch({ certTypes });
                }}
                multiline
              />
              <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={type.visible !== false}
                  onChange={(e) => {
                    const certTypes = [...value.certTypes];
                    certTypes[index] = { ...type, visible: e.target.checked };
                    patch({ certTypes });
                  }}
                />
                Visible on page
              </label>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "security" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Eyebrow"
            value={value.securityEyebrow}
            onChange={(v) => patch({ securityEyebrow: v })}
          />
          <Field
            label="Heading"
            value={value.securityHeading}
            onChange={(v) => patch({ securityHeading: v })}
          />
          <div className="sm:col-span-2">
            <Field
              label="Description"
              value={value.securityDescription}
              onChange={(v) => patch({ securityDescription: v })}
              multiline
            />
          </div>
          <Field
            label="Without HTTPS (one per line)"
            value={value.securityProblems.join("\n")}
            onChange={(raw) =>
              patch({ securityProblems: raw.split("\n").filter(Boolean) })
            }
            multiline
          />
          <Field
            label="With HostingBeyond SSL (one per line)"
            value={value.securityFixes.join("\n")}
            onChange={(raw) =>
              patch({ securityFixes: raw.split("\n").filter(Boolean) })
            }
            multiline
          />
        </div>
      ) : null}

      {tab === "reviews" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Heading"
              value={value.reviewsHeading}
              onChange={(v) => patch({ reviewsHeading: v })}
            />
            <Field
              label="Description"
              value={value.reviewsDescription}
              onChange={(v) => patch({ reviewsDescription: v })}
            />
          </div>
          {value.reviews.map((review, index) => (
            <div
              key={review.id}
              className="rounded-xl border border-slate-200 p-3"
            >
              <Field
                label="Quote"
                value={review.quote}
                onChange={(quote) => {
                  const reviews = [...value.reviews];
                  reviews[index] = { ...review, quote };
                  patch({ reviews });
                }}
                multiline
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Name"
                  value={review.name}
                  onChange={(name) => {
                    const reviews = [...value.reviews];
                    reviews[index] = { ...review, name };
                    patch({ reviews });
                  }}
                />
                <Field
                  label="Role / company"
                  value={review.role}
                  onChange={(role) => {
                    const reviews = [...value.reviews];
                    reviews[index] = { ...review, role };
                    patch({ reviews });
                  }}
                />
              </div>
              <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={review.visible !== false}
                  onChange={(e) => {
                    const reviews = [...value.reviews];
                    reviews[index] = { ...review, visible: e.target.checked };
                    patch({ reviews });
                  }}
                />
                Visible on page
              </label>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "faq" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
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
          </div>
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
            label="CTA label"
            value={value.closingCtaLabel}
            onChange={(v) => patch({ closingCtaLabel: v })}
          />
          <Field
            label="CTA URL"
            value={value.closingCtaHref}
            onChange={(v) => patch({ closingCtaHref: v })}
          />
          <Field
            label="Footnote"
            value={value.closingFootnote}
            onChange={(v) => patch({ closingFootnote: v })}
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

      <button
        type="button"
        disabled={saving}
        onClick={() => onPersist(value)}
        className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save SSL page"}
      </button>
    </div>
  );
}
