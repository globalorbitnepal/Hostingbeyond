"use client";

import { useState } from "react";

import { OrbitImageField } from "@/components/orbit/image-field";
import { BUSINESS_EMAIL_FRAME_SPECS } from "@/lib/business-email/frame-specs";
import type {
  CmsBusinessEmailPageContent,
  CmsBusinessEmailPlan,
} from "@/lib/orbit/business-email-page-content";

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
  value: CmsBusinessEmailPageContent;
  onChange: (value: CmsBusinessEmailPageContent) => void;
  onPersist: (value: CmsBusinessEmailPageContent) => void;
  saving?: boolean;
};

export function BusinessEmailProductPageEditor({
  value,
  onChange,
  onPersist,
}: Props) {
  const [tab, setTab] = useState<
    | "hero"
    | "impression"
    | "pricing"
    | "ai"
    | "bands"
    | "reviews"
    | "support"
    | "faq"
    | "closing"
  >("hero");

  function patch(next: Partial<CmsBusinessEmailPageContent>, persist = false) {
    const merged = { ...value, ...next };
    onChange(merged);
    if (persist) onPersist(merged);
  }

  const tabs = [
    ["hero", "Hero"],
    ["impression", "Impression"],
    ["pricing", "Pricing"],
    ["ai", "AI & integrations"],
    ["bands", "Migrate & marketing"],
    ["reviews", "Reviews"],
    ["support", "Support tiles"],
    ["faq", "FAQs"],
    ["closing", "Closing CTA"],
  ] as const;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
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
            onChange={(heroEyebrow) => patch({ heroEyebrow })}
          />
          <Field
            label="Title"
            value={value.heroTitle}
            onChange={(heroTitle) => patch({ heroTitle })}
          />
          <Field
            label="Bullet 1"
            value={value.heroBullet1}
            onChange={(heroBullet1) => patch({ heroBullet1 })}
          />
          <Field
            label="Bullet 2"
            value={value.heroBullet2}
            onChange={(heroBullet2) => patch({ heroBullet2 })}
          />
          <Field
            label="CTA label"
            value={value.heroCtaLabel}
            onChange={(heroCtaLabel) => patch({ heroCtaLabel })}
          />
          <Field
            label="CTA URL"
            value={value.heroCtaHref}
            onChange={(heroCtaHref) => patch({ heroCtaHref })}
          />
          <Field
            label="Guarantee line"
            value={value.heroGuarantee}
            onChange={(heroGuarantee) => patch({ heroGuarantee })}
          />
        </div>
      ) : null}

      {tab === "impression" ? (
        <div className="space-y-4">
          <Field
            label="Section heading"
            value={value.impressionHeading}
            onChange={(impressionHeading) => patch({ impressionHeading })}
          />
          <Field
            label="Section description"
            value={value.impressionDescription}
            onChange={(impressionDescription) =>
              patch({ impressionDescription })
            }
            multiline
          />
          {value.impressionTabs.map((tabItem, index) => (
            <div
              key={tabItem.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3"
            >
              <p className="text-sm font-semibold text-slate-800">
                Tab: {tabItem.label}
              </p>
              <Field
                label="Tab label"
                value={tabItem.label}
                onChange={(label) => {
                  const impressionTabs = [...value.impressionTabs];
                  impressionTabs[index] = { ...tabItem, label };
                  patch({ impressionTabs });
                }}
              />
              <Field
                label="Title"
                value={tabItem.title}
                onChange={(title) => {
                  const impressionTabs = [...value.impressionTabs];
                  impressionTabs[index] = { ...tabItem, title };
                  patch({ impressionTabs });
                }}
              />
              <Field
                label="Points (one per line)"
                value={tabItem.points.join("\n")}
                onChange={(raw) => {
                  const impressionTabs = [...value.impressionTabs];
                  impressionTabs[index] = {
                    ...tabItem,
                    points: raw.split("\n").filter(Boolean),
                  };
                  patch({ impressionTabs });
                }}
                multiline
              />
              <OrbitImageField
                label={`Photo — ${BUSINESS_EMAIL_FRAME_SPECS.impressionPhoto}`}
                value={tabItem.image}
                onChange={(image) => {
                  const impressionTabs = [...value.impressionTabs];
                  impressionTabs[index] = { ...tabItem, image };
                  patch({ impressionTabs });
                }}
                onCommit={(image) => {
                  const impressionTabs = [...value.impressionTabs];
                  impressionTabs[index] = { ...tabItem, image };
                  patch({ impressionTabs }, true);
                }}
              />
              <Field
                label="Image alt"
                value={tabItem.imageAlt}
                onChange={(imageAlt) => {
                  const impressionTabs = [...value.impressionTabs];
                  impressionTabs[index] = { ...tabItem, imageAlt };
                  patch({ impressionTabs });
                }}
              />
            </div>
          ))}
        </div>
      ) : null}

      {tab === "pricing" ? (
        <div className="space-y-4">
          <Field
            label="Pricing heading"
            value={value.pricingHeading}
            onChange={(pricingHeading) => patch({ pricingHeading })}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <Field
              label="Trust line 1"
              value={value.pricingTrust1}
              onChange={(pricingTrust1) => patch({ pricingTrust1 })}
            />
            <Field
              label="Trust line 2"
              value={value.pricingTrust2}
              onChange={(pricingTrust2) => patch({ pricingTrust2 })}
            />
            <Field
              label="Trust line 3"
              value={value.pricingTrust3}
              onChange={(pricingTrust3) => patch({ pricingTrust3 })}
            />
          </div>
          {value.plans.map((plan, index) => (
            <PlanEditor
              key={plan.id}
              plan={plan}
              onChange={(next) => {
                const plans = [...value.plans];
                plans[index] = next;
                patch({ plans });
              }}
            />
          ))}
          <Field
            label="Included section heading"
            value={value.includedHeading}
            onChange={(includedHeading) => patch({ includedHeading })}
          />
          <Field
            label="Included items (one per line)"
            value={value.included.join("\n")}
            onChange={(raw) =>
              patch({ included: raw.split("\n").filter(Boolean) })
            }
            multiline
          />
          <Field
            label="Included footnote"
            value={value.includedFootnote}
            onChange={(includedFootnote) => patch({ includedFootnote })}
            multiline
          />
        </div>
      ) : null}

      {tab === "ai" ? (
        <div className="space-y-4">
          <Field
            label="AI band eyebrow"
            value={value.aiBandEyebrow}
            onChange={(aiBandEyebrow) => patch({ aiBandEyebrow })}
          />
          <Field
            label="AI band heading"
            value={value.aiBandHeading}
            onChange={(aiBandHeading) => patch({ aiBandHeading })}
          />
          {value.aiFeatures.map((feat, index) => (
            <div
              key={feat.id}
              className="rounded-xl border border-slate-200 p-3"
            >
              <Field
                label={`Card ${index + 1} title`}
                value={feat.title}
                onChange={(title) => {
                  const aiFeatures = [...value.aiFeatures];
                  aiFeatures[index] = { ...feat, title };
                  patch({ aiFeatures });
                }}
              />
              <Field
                label="Description"
                value={feat.description}
                onChange={(description) => {
                  const aiFeatures = [...value.aiFeatures];
                  aiFeatures[index] = { ...feat, description };
                  patch({ aiFeatures });
                }}
                multiline
              />
            </div>
          ))}
          <Field
            label="Integrations heading"
            value={value.integrationsHeading}
            onChange={(integrationsHeading) => patch({ integrationsHeading })}
          />
          {value.integrations.map((card, index) => (
            <div
              key={card.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3"
            >
              <Field
                label="Eyebrow"
                value={card.eyebrow}
                onChange={(eyebrow) => {
                  const integrations = [...value.integrations];
                  integrations[index] = { ...card, eyebrow };
                  patch({ integrations });
                }}
              />
              <Field
                label="Title"
                value={card.title}
                onChange={(title) => {
                  const integrations = [...value.integrations];
                  integrations[index] = { ...card, title };
                  patch({ integrations });
                }}
              />
              <Field
                label="Description"
                value={card.description}
                onChange={(description) => {
                  const integrations = [...value.integrations];
                  integrations[index] = { ...card, description };
                  patch({ integrations });
                }}
                multiline
              />
              <Field
                label="Link label"
                value={card.linkLabel}
                onChange={(linkLabel) => {
                  const integrations = [...value.integrations];
                  integrations[index] = { ...card, linkLabel };
                  patch({ integrations });
                }}
              />
              <Field
                label="Link URL"
                value={card.linkHref}
                onChange={(linkHref) => {
                  const integrations = [...value.integrations];
                  integrations[index] = { ...card, linkHref };
                  patch({ integrations });
                }}
              />
            </div>
          ))}
        </div>
      ) : null}

      {tab === "bands" ? (
        <div className="space-y-6">
          <div className="space-y-2 rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-semibold">Migration band</p>
            <Field
              label="Heading"
              value={value.migrateHeading}
              onChange={(migrateHeading) => patch({ migrateHeading })}
            />
            <Field
              label="Description"
              value={value.migrateDescription}
              onChange={(migrateDescription) => patch({ migrateDescription })}
              multiline
            />
            <Field
              label="CTA label"
              value={value.migrateCtaLabel}
              onChange={(migrateCtaLabel) => patch({ migrateCtaLabel })}
            />
            <Field
              label="CTA URL"
              value={value.migrateCtaHref}
              onChange={(migrateCtaHref) => patch({ migrateCtaHref })}
            />
            <OrbitImageField
              label={`Image — ${BUSINESS_EMAIL_FRAME_SPECS.migrateImage}`}
              value={value.migrateImage}
              onChange={(migrateImage) => patch({ migrateImage })}
              onCommit={(migrateImage) => patch({ migrateImage }, true)}
            />
          </div>
          <div className="space-y-2 rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-semibold">Marketing band</p>
            <Field
              label="Heading"
              value={value.marketingHeading}
              onChange={(marketingHeading) => patch({ marketingHeading })}
            />
            <Field
              label="Description"
              value={value.marketingDescription}
              onChange={(marketingDescription) =>
                patch({ marketingDescription })
              }
              multiline
            />
            <Field
              label="CTA label"
              value={value.marketingCtaLabel}
              onChange={(marketingCtaLabel) => patch({ marketingCtaLabel })}
            />
            <Field
              label="CTA URL"
              value={value.marketingCtaHref}
              onChange={(marketingCtaHref) => patch({ marketingCtaHref })}
            />
            <OrbitImageField
              label={`Image — ${BUSINESS_EMAIL_FRAME_SPECS.marketingImage}`}
              value={value.marketingImage}
              onChange={(marketingImage) => patch({ marketingImage })}
              onCommit={(marketingImage) => patch({ marketingImage }, true)}
            />
          </div>
        </div>
      ) : null}

      {tab === "reviews" ? (
        <div className="space-y-4">
          <Field
            label="Reviews heading"
            value={value.reviewsHeading}
            onChange={(reviewsHeading) => patch({ reviewsHeading })}
          />
          {value.reviews.map((review, index) => (
            <div
              key={review.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3"
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
              <Field
                label="Name"
                value={review.name}
                onChange={(name) => {
                  const reviews = [...value.reviews];
                  reviews[index] = { ...review, name };
                  patch({ reviews });
                }}
              />
              <OrbitImageField
                label={`Avatar — ${BUSINESS_EMAIL_FRAME_SPECS.reviewAvatar}`}
                value={review.photo}
                onChange={(photo) => {
                  const reviews = [...value.reviews];
                  reviews[index] = { ...review, photo };
                  patch({ reviews });
                }}
                onCommit={(photo) => {
                  const reviews = [...value.reviews];
                  reviews[index] = { ...review, photo };
                  patch({ reviews }, true);
                }}
              />
            </div>
          ))}
        </div>
      ) : null}

      {tab === "support" ? (
        <div className="space-y-3">
          {value.supportTiles.map((tile, index) => (
            <div
              key={tile.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3"
            >
              <Field
                label="Title"
                value={tile.title}
                onChange={(title) => {
                  const supportTiles = [...value.supportTiles];
                  supportTiles[index] = { ...tile, title };
                  patch({ supportTiles });
                }}
              />
              <Field
                label="Body"
                value={tile.body}
                onChange={(body) => {
                  const supportTiles = [...value.supportTiles];
                  supportTiles[index] = { ...tile, body };
                  patch({ supportTiles });
                }}
                multiline
              />
              <Field
                label="Icon (sparkles|zap|clock|lock)"
                value={tile.icon}
                onChange={(icon) => {
                  const supportTiles = [...value.supportTiles];
                  supportTiles[index] = {
                    ...tile,
                    icon: icon as typeof tile.icon,
                  };
                  patch({ supportTiles });
                }}
              />
              <OrbitImageField
                label={`Background — ${BUSINESS_EMAIL_FRAME_SPECS.supportTile}`}
                value={tile.image}
                onChange={(image) => {
                  const supportTiles = [...value.supportTiles];
                  supportTiles[index] = { ...tile, image };
                  patch({ supportTiles });
                }}
                onCommit={(image) => {
                  const supportTiles = [...value.supportTiles];
                  supportTiles[index] = { ...tile, image };
                  patch({ supportTiles }, true);
                }}
              />
            </div>
          ))}
        </div>
      ) : null}

      {tab === "faq" ? (
        <div className="space-y-4">
          <Field
            label="FAQ heading"
            value={value.faqHeading}
            onChange={(faqHeading) => patch({ faqHeading })}
          />
          <Field
            label="FAQ description"
            value={value.faqDescription}
            onChange={(faqDescription) => patch({ faqDescription })}
          />
          {value.faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3"
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
            </div>
          ))}
        </div>
      ) : null}

      {tab === "closing" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Heading"
            value={value.closingHeading}
            onChange={(closingHeading) => patch({ closingHeading })}
          />
          <Field
            label="Description"
            value={value.closingDescription}
            onChange={(closingDescription) => patch({ closingDescription })}
            multiline
          />
          <Field
            label="CTA label"
            value={value.closingCtaLabel}
            onChange={(closingCtaLabel) => patch({ closingCtaLabel })}
          />
          <Field
            label="CTA URL"
            value={value.closingCtaHref}
            onChange={(closingCtaHref) => patch({ closingCtaHref })}
          />
        </div>
      ) : null}
    </div>
  );
}

function PlanEditor({
  plan,
  onChange,
}: {
  plan: CmsBusinessEmailPlan;
  onChange: (plan: CmsBusinessEmailPlan) => void;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 p-3">
      <p className="text-sm font-semibold">{plan.name} plan</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field
          label="Name"
          value={plan.name}
          onChange={(name) => onChange({ ...plan, name })}
        />
        <Field
          label="Best for"
          value={plan.bestFor}
          onChange={(bestFor) => onChange({ ...plan, bestFor })}
        />
        <Field
          label="48-mo price"
          value={plan.price}
          onChange={(price) => onChange({ ...plan, price })}
        />
        <Field
          label="24-mo price"
          value={plan.price24}
          onChange={(price24) => onChange({ ...plan, price24 })}
        />
        <Field
          label="Renew"
          value={plan.renew}
          onChange={(renew) => onChange({ ...plan, renew })}
        />
        <Field
          label="Discount badge"
          value={plan.off}
          onChange={(off) => onChange({ ...plan, off })}
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
    </div>
  );
}
