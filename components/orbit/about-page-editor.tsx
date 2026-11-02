"use client";

import { useState } from "react";

import type {
  CmsAboutFaq,
  CmsAboutPageContent,
  CmsAboutProduct,
  CmsAboutValue,
} from "@/lib/orbit/about-page-content";
import {
  newAboutFact,
  newAboutFaq,
  newAboutGovernanceItem,
  newAboutMilestone,
  newAboutProduct,
  newAboutTeamMember,
  newAboutTrustItem,
  newAboutValue,
} from "@/lib/orbit/about-page-content";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
      {label}
      {children}
      {hint ? (
        <span className="mt-1 block text-[11px] font-normal tracking-normal text-slate-400 normal-case">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function Text({
  label,
  value,
  onChange,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        className={inputClass}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

function Input({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

function Lines({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  hint?: string;
}) {
  return (
    <Text
      label={label}
      value={value.join("\n")}
      onChange={(raw) => onChange(raw.split("\n"))}
      rows={Math.min(12, Math.max(3, value.length + 1))}
      hint={hint ?? "One per line"}
    />
  );
}

const TABS = [
  ["seo", "SEO"],
  ["hero", "Hero"],
  ["company", "Company card"],
  ["stats", "Stats"],
  ["mission", "Mission & vision"],
  ["usa", "USA company"],
  ["story", "Our story"],
  ["values", "Principles"],
  ["products", "Products"],
  ["trust", "Why customers stay"],
  ["governance", "Governance"],
  ["milestones", "Timeline"],
  ["legal", "Legal entity"],
  ["support", "Support promise"],
  ["team", "Team"],
  ["commitment", "Commitment"],
  ["faq", "FAQs"],
  ["cta", "Bottom CTA"],
] as const;

type TabId = (typeof TABS)[number][0];

export function AboutPageEditor({
  value,
  onChange,
}: {
  value: CmsAboutPageContent;
  onChange: (next: CmsAboutPageContent) => void;
}) {
  const [tab, setTab] = useState<TabId>("hero");

  function patch(next: Partial<CmsAboutPageContent>) {
    onChange({ ...value, ...next });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-violet-50 px-3 py-2 text-[11px] leading-relaxed text-violet-900">
        <span>
          Full control of the public{" "}
          <a href="/about" className="font-semibold underline">
            /about
          </a>{" "}
          page. No images are used — every visual is CSS and icons.
        </span>
        <a
          href="/about"
          target="_blank"
          rel="noreferrer"
          className="rounded-md bg-violet-600 px-2.5 py-1 text-[11px] font-semibold text-white"
        >
          Preview page
        </a>
      </div>

      <div className="flex flex-wrap gap-1.5">
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

      {tab === "seo" ? (
        <div className="grid gap-3">
          <Input
            label="SEO title"
            value={value.seoTitle}
            onChange={(v) => patch({ seoTitle: v })}
          />
          <Text
            label="Meta description"
            value={value.seoDescription}
            onChange={(v) => patch({ seoDescription: v })}
          />
        </div>
      ) : null}

      {tab === "hero" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Eyebrow"
            value={value.heroEyebrow}
            onChange={(v) => patch({ heroEyebrow: v })}
          />
          <Input
            label="Guarantee line"
            value={value.heroGuarantee}
            onChange={(v) => patch({ heroGuarantee: v })}
          />
          <Input
            label="Title"
            value={value.heroTitle}
            onChange={(v) => patch({ heroTitle: v })}
          />
          <Input
            label="Title accent (gradient)"
            value={value.heroTitleAccent}
            onChange={(v) => patch({ heroTitleAccent: v })}
          />
          <Input
            label="Primary CTA label"
            value={value.heroPrimaryLabel}
            onChange={(v) => patch({ heroPrimaryLabel: v })}
          />
          <Input
            label="Primary CTA URL"
            value={value.heroPrimaryHref}
            onChange={(v) => patch({ heroPrimaryHref: v })}
          />
          <Input
            label="Secondary CTA label"
            value={value.heroSecondaryLabel}
            onChange={(v) => patch({ heroSecondaryLabel: v })}
          />
          <Input
            label="Secondary CTA URL"
            value={value.heroSecondaryHref}
            onChange={(v) => patch({ heroSecondaryHref: v })}
          />
          <div className="sm:col-span-2">
            <Text
              label="Hero description"
              value={value.heroDescription}
              onChange={(v) => patch({ heroDescription: v })}
              rows={4}
            />
          </div>
          <div className="sm:col-span-2">
            <Lines
              label="Hero bullets"
              value={value.heroBullets}
              onChange={(heroBullets) => patch({ heroBullets })}
            />
          </div>
        </div>
      ) : null}

      {tab === "company" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Legal entity name"
              value={value.companyLegalName}
              onChange={(v) => patch({ companyLegalName: v })}
            />
            <Input
              label="Entity type"
              value={value.companyEntityType}
              onChange={(v) => patch({ companyEntityType: v })}
            />
            <Input
              label="Founded line"
              value={value.companyFoundedLine}
              onChange={(v) => patch({ companyFoundedLine: v })}
            />
            <Input
              label="Headquarters line"
              value={value.headquartersLine}
              onChange={(v) => patch({ headquartersLine: v })}
            />
            <Input
              label="Serving line"
              value={value.servingLine}
              onChange={(v) => patch({ servingLine: v })}
            />
            <Input
              label="Card title"
              value={value.heroCardTitle}
              onChange={(v) => patch({ heroCardTitle: v })}
            />
          </div>
          <Text
            label="Card note"
            value={value.heroCardNote}
            onChange={(v) => patch({ heroCardNote: v })}
          />
          <div className="space-y-2">
            <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
              Card facts
            </p>
            {value.heroCardFacts.map((fact, i) => (
              <div
                key={fact.id}
                className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Input
                  label="Label"
                  value={fact.label}
                  onChange={(label) => {
                    const heroCardFacts = [...value.heroCardFacts];
                    heroCardFacts[i] = { ...fact, label };
                    patch({ heroCardFacts });
                  }}
                />
                <Input
                  label="Value"
                  value={fact.value}
                  onChange={(val) => {
                    const heroCardFacts = [...value.heroCardFacts];
                    heroCardFacts[i] = { ...fact, value: val };
                    patch({ heroCardFacts });
                  }}
                />
                <button
                  type="button"
                  className="mt-5 h-9 self-start rounded-lg bg-rose-50 px-3 text-xs font-semibold text-rose-700"
                  onClick={() =>
                    patch({
                      heroCardFacts: value.heroCardFacts.filter(
                        (_, j) => j !== i,
                      ),
                    })
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-sm font-semibold text-violet-600"
              onClick={() =>
                patch({
                  heroCardFacts: [...value.heroCardFacts, newAboutFact()],
                })
              }
            >
              + Add fact
            </button>
          </div>
        </div>
      ) : null}

      {tab === "stats" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Section label"
              value={value.statsHeading}
              onChange={(v) => patch({ statsHeading: v })}
            />
            <Input
              label="Section intro"
              value={value.statsIntro}
              onChange={(v) => patch({ statsIntro: v })}
            />
          </div>
          {value.stats.map((stat, i) => (
            <div
              key={stat.id}
              className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-4"
            >
              <Input
                label="Value"
                value={stat.value}
                onChange={(val) => {
                  const stats = [...value.stats];
                  stats[i] = { ...stat, value: val };
                  patch({ stats });
                }}
              />
              <Input
                label="Label"
                value={stat.label}
                onChange={(label) => {
                  const stats = [...value.stats];
                  stats[i] = { ...stat, label };
                  patch({ stats });
                }}
              />
              <Input
                label="Hint"
                value={stat.hint ?? ""}
                onChange={(hint) => {
                  const stats = [...value.stats];
                  stats[i] = { ...stat, hint };
                  patch({ stats });
                }}
              />
              <button
                type="button"
                className="mt-5 h-9 self-start rounded-lg bg-rose-50 px-3 text-xs font-semibold text-rose-700"
                onClick={() =>
                  patch({ stats: value.stats.filter((_, j) => j !== i) })
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "mission" ? (
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Mission title"
              value={value.missionTitle}
              onChange={(v) => patch({ missionTitle: v })}
            />
            <Input
              label="Vision title"
              value={value.visionTitle}
              onChange={(v) => patch({ visionTitle: v })}
            />
          </div>
          <Text
            label="Mission body"
            value={value.missionBody}
            onChange={(v) => patch({ missionBody: v })}
            rows={4}
          />
          <Lines
            label="Mission points"
            value={value.missionPoints}
            onChange={(missionPoints) => patch({ missionPoints })}
          />
          <Text
            label="Vision body"
            value={value.visionBody}
            onChange={(v) => patch({ visionBody: v })}
            rows={4}
          />
          <Lines
            label="Vision points"
            value={value.visionPoints}
            onChange={(visionPoints) => patch({ visionPoints })}
          />
        </div>
      ) : null}

      {tab === "usa" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Eyebrow"
              value={value.usaEyebrow}
              onChange={(v) => patch({ usaEyebrow: v })}
            />
            <Input
              label="Title"
              value={value.usaTitle}
              onChange={(v) => patch({ usaTitle: v })}
            />
          </div>
          <Text
            label="Body"
            value={value.usaBody}
            onChange={(v) => patch({ usaBody: v })}
            rows={4}
          />
          <Text
            label="Body secondary"
            value={value.usaBodySecondary}
            onChange={(v) => patch({ usaBodySecondary: v })}
            rows={3}
          />
          <Lines
            label="Bullets"
            value={value.usaBullets}
            onChange={(usaBullets) => patch({ usaBullets })}
          />
          <div className="space-y-2">
            <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
              Registry facts
            </p>
            {value.usaFacts.map((fact, i) => (
              <div
                key={fact.id}
                className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Input
                  label="Label"
                  value={fact.label}
                  onChange={(label) => {
                    const usaFacts = [...value.usaFacts];
                    usaFacts[i] = { ...fact, label };
                    patch({ usaFacts });
                  }}
                />
                <Input
                  label="Value"
                  value={fact.value}
                  onChange={(val) => {
                    const usaFacts = [...value.usaFacts];
                    usaFacts[i] = { ...fact, value: val };
                    patch({ usaFacts });
                  }}
                />
                <button
                  type="button"
                  className="mt-5 h-9 self-start rounded-lg bg-rose-50 px-3 text-xs font-semibold text-rose-700"
                  onClick={() =>
                    patch({
                      usaFacts: value.usaFacts.filter((_, j) => j !== i),
                    })
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-sm font-semibold text-violet-600"
              onClick={() =>
                patch({ usaFacts: [...value.usaFacts, newAboutFact()] })
              }
            >
              + Add fact
            </button>
          </div>
        </div>
      ) : null}

      {tab === "story" ? (
        <div className="space-y-3">
          <Input
            label="Story title"
            value={value.storyTitle}
            onChange={(v) => patch({ storyTitle: v })}
          />
          <Text
            label="Story intro"
            value={value.storyIntro}
            onChange={(v) => patch({ storyIntro: v })}
          />
          <Lines
            label="Story paragraphs"
            value={value.storyParagraphs}
            onChange={(storyParagraphs) => patch({ storyParagraphs })}
            hint="One paragraph per line — each renders as a numbered step"
          />
          <Lines
            label="Story highlights"
            value={value.storyHighlights}
            onChange={(storyHighlights) => patch({ storyHighlights })}
          />
        </div>
      ) : null}

      {tab === "values" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Eyebrow"
              value={value.valuesEyebrow}
              onChange={(v) => patch({ valuesEyebrow: v })}
            />
            <Input
              label="Title"
              value={value.valuesTitle}
              onChange={(v) => patch({ valuesTitle: v })}
            />
          </div>
          <Text
            label="Intro"
            value={value.valuesIntro}
            onChange={(v) => patch({ valuesIntro: v })}
          />
          {value.values.map((item, i) => (
            <div
              key={item.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Title"
                  value={item.title}
                  onChange={(title) => {
                    const values = [...value.values];
                    values[i] = { ...item, title };
                    patch({ values });
                  }}
                />
                <Input
                  label="Icon"
                  value={item.icon ?? "shield"}
                  hint="shield | scale | handshake | spark | gauge | compass"
                  onChange={(icon) => {
                    const values = [...value.values];
                    values[i] = {
                      ...item,
                      icon: icon as CmsAboutValue["icon"],
                    };
                    patch({ values });
                  }}
                />
              </div>
              <Text
                label="Description"
                value={item.description}
                onChange={(description) => {
                  const values = [...value.values];
                  values[i] = { ...item, description };
                  patch({ values });
                }}
              />
              <button
                type="button"
                className="text-xs text-rose-600"
                onClick={() =>
                  patch({ values: value.values.filter((_, j) => j !== i) })
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-sm font-semibold text-violet-600"
            onClick={() =>
              patch({ values: [...value.values, newAboutValue()] })
            }
          >
            + Add principle
          </button>
        </div>
      ) : null}

      {tab === "products" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Eyebrow"
              value={value.productsEyebrow}
              onChange={(v) => patch({ productsEyebrow: v })}
            />
            <Input
              label="Title"
              value={value.productsTitle}
              onChange={(v) => patch({ productsTitle: v })}
            />
          </div>
          <Text
            label="Intro"
            value={value.productsIntro}
            onChange={(v) => patch({ productsIntro: v })}
          />
          {value.products.map((item, i) => (
            <div
              key={item.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Title"
                  value={item.title}
                  onChange={(title) => {
                    const products = [...value.products];
                    products[i] = { ...item, title };
                    patch({ products });
                  }}
                />
                <Input
                  label="Link URL"
                  value={item.href}
                  onChange={(href) => {
                    const products = [...value.products];
                    products[i] = { ...item, href };
                    patch({ products });
                  }}
                />
                <Input
                  label="Icon"
                  value={item.icon ?? "hosting"}
                  hint="hosting | domains | email | cloud | migration | ai | ssl"
                  onChange={(icon) => {
                    const products = [...value.products];
                    products[i] = {
                      ...item,
                      icon: icon as CmsAboutProduct["icon"],
                    };
                    patch({ products });
                  }}
                />
              </div>
              <Text
                label="Description"
                value={item.description}
                onChange={(description) => {
                  const products = [...value.products];
                  products[i] = { ...item, description };
                  patch({ products });
                }}
              />
              <button
                type="button"
                className="text-xs text-rose-600"
                onClick={() =>
                  patch({ products: value.products.filter((_, j) => j !== i) })
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-sm font-semibold text-violet-600"
            onClick={() =>
              patch({ products: [...value.products, newAboutProduct()] })
            }
          >
            + Add product
          </button>
        </div>
      ) : null}

      {tab === "trust" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Eyebrow"
              value={value.trustEyebrow}
              onChange={(v) => patch({ trustEyebrow: v })}
            />
            <Input
              label="Title"
              value={value.trustTitle}
              onChange={(v) => patch({ trustTitle: v })}
            />
          </div>
          <Text
            label="Intro"
            value={value.trustIntro}
            onChange={(v) => patch({ trustIntro: v })}
          />
          {value.trustItems.map((item, i) => (
            <div
              key={item.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3"
            >
              <Input
                label="Title"
                value={item.title}
                onChange={(title) => {
                  const trustItems = [...value.trustItems];
                  trustItems[i] = { ...item, title };
                  patch({ trustItems });
                }}
              />
              <Text
                label="Description"
                value={item.description}
                onChange={(description) => {
                  const trustItems = [...value.trustItems];
                  trustItems[i] = { ...item, description };
                  patch({ trustItems });
                }}
              />
              <button
                type="button"
                className="text-xs text-rose-600"
                onClick={() =>
                  patch({
                    trustItems: value.trustItems.filter((_, j) => j !== i),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-sm font-semibold text-violet-600"
            onClick={() =>
              patch({ trustItems: [...value.trustItems, newAboutTrustItem()] })
            }
          >
            + Add reason
          </button>
        </div>
      ) : null}

      {tab === "governance" ? (
        <div className="space-y-3">
          <Input
            label="Title"
            value={value.governanceTitle}
            onChange={(v) => patch({ governanceTitle: v })}
          />
          <Text
            label="Intro"
            value={value.governanceIntro}
            onChange={(v) => patch({ governanceIntro: v })}
          />
          {value.governanceItems.map((item, i) => (
            <div
              key={item.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3"
            >
              <Input
                label="Title"
                value={item.title}
                onChange={(title) => {
                  const governanceItems = [...value.governanceItems];
                  governanceItems[i] = { ...item, title };
                  patch({ governanceItems });
                }}
              />
              <Text
                label="Description"
                value={item.description}
                onChange={(description) => {
                  const governanceItems = [...value.governanceItems];
                  governanceItems[i] = { ...item, description };
                  patch({ governanceItems });
                }}
              />
              <button
                type="button"
                className="text-xs text-rose-600"
                onClick={() =>
                  patch({
                    governanceItems: value.governanceItems.filter(
                      (_, j) => j !== i,
                    ),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-sm font-semibold text-violet-600"
            onClick={() =>
              patch({
                governanceItems: [
                  ...value.governanceItems,
                  newAboutGovernanceItem(),
                ],
              })
            }
          >
            + Add control
          </button>
          <Text
            label="Footnote"
            value={value.governanceFootnote}
            onChange={(v) => patch({ governanceFootnote: v })}
          />
        </div>
      ) : null}

      {tab === "milestones" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Title"
              value={value.milestonesTitle}
              onChange={(v) => patch({ milestonesTitle: v })}
            />
            <Input
              label="Intro"
              value={value.milestonesIntro}
              onChange={(v) => patch({ milestonesIntro: v })}
            />
          </div>
          {value.milestones.map((item, i) => (
            <div
              key={item.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3"
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <Input
                  label="Year"
                  value={item.year}
                  onChange={(year) => {
                    const milestones = [...value.milestones];
                    milestones[i] = { ...item, year };
                    patch({ milestones });
                  }}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Title"
                    value={item.title}
                    onChange={(title) => {
                      const milestones = [...value.milestones];
                      milestones[i] = { ...item, title };
                      patch({ milestones });
                    }}
                  />
                </div>
              </div>
              <Text
                label="Description"
                value={item.description}
                onChange={(description) => {
                  const milestones = [...value.milestones];
                  milestones[i] = { ...item, description };
                  patch({ milestones });
                }}
              />
              <button
                type="button"
                className="text-xs text-rose-600"
                onClick={() =>
                  patch({
                    milestones: value.milestones.filter((_, j) => j !== i),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-sm font-semibold text-violet-600"
            onClick={() =>
              patch({
                milestones: [...value.milestones, newAboutMilestone()],
              })
            }
          >
            + Add milestone
          </button>
        </div>
      ) : null}

      {tab === "legal" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Eyebrow"
              value={value.legalEyebrow}
              onChange={(v) => patch({ legalEyebrow: v })}
            />
            <Input
              label="Title"
              value={value.legalTitle}
              onChange={(v) => patch({ legalTitle: v })}
            />
            <Input
              label="Entity name"
              value={value.legalEntityName}
              onChange={(v) => patch({ legalEntityName: v })}
            />
            <Input
              label="Entity type"
              value={value.legalEntityType}
              onChange={(v) => patch({ legalEntityType: v })}
            />
            <Input
              label="Registered line"
              value={value.legalRegisteredLine}
              onChange={(v) => patch({ legalRegisteredLine: v })}
            />
            <Input
              label="Support email"
              value={value.legalContactEmail}
              onChange={(v) => patch({ legalContactEmail: v })}
            />
            <Input
              label="Phone line"
              value={value.legalContactPhone}
              onChange={(v) => patch({ legalContactPhone: v })}
            />
            <Input
              label="Website"
              value={value.legalWebsite}
              onChange={(v) => patch({ legalWebsite: v })}
            />
          </div>
          <Text
            label="Intro"
            value={value.legalIntro}
            onChange={(v) => patch({ legalIntro: v })}
          />
          <Lines
            label="Address lines"
            value={value.legalAddressLines}
            onChange={(legalAddressLines) => patch({ legalAddressLines })}
          />
          <Lines
            label="Notes"
            value={value.legalNotes}
            onChange={(legalNotes) => patch({ legalNotes })}
          />
        </div>
      ) : null}

      {tab === "support" ? (
        <div className="space-y-3">
          <Input
            label="Title"
            value={value.supportTitle}
            onChange={(v) => patch({ supportTitle: v })}
          />
          <Text
            label="Body"
            value={value.supportBody}
            onChange={(v) => patch({ supportBody: v })}
          />
          <Lines
            label="Bullets"
            value={value.supportBullets}
            onChange={(supportBullets) => patch({ supportBullets })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="CTA label"
              value={value.supportCtaLabel}
              onChange={(v) => patch({ supportCtaLabel: v })}
            />
            <Input
              label="CTA URL"
              value={value.supportCtaHref}
              onChange={(v) => patch({ supportCtaHref: v })}
            />
          </div>
        </div>
      ) : null}

      {tab === "team" ? (
        <div className="space-y-3">
          <Input
            label="Section title"
            value={value.teamSectionTitle}
            onChange={(v) => patch({ teamSectionTitle: v })}
          />
          <Text
            label="Section intro"
            value={value.teamSectionIntro}
            onChange={(v) => patch({ teamSectionIntro: v })}
          />
          {value.team.map((member, i) => (
            <div
              key={member.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Name"
                  value={member.name}
                  onChange={(name) => {
                    const team = [...value.team];
                    team[i] = { ...member, name };
                    patch({ team });
                  }}
                />
                <Input
                  label="Role"
                  value={member.role}
                  onChange={(role) => {
                    const team = [...value.team];
                    team[i] = { ...member, role };
                    patch({ team });
                  }}
                />
              </div>
              <Text
                label="Bio"
                value={member.bio}
                onChange={(bio) => {
                  const team = [...value.team];
                  team[i] = { ...member, bio };
                  patch({ team });
                }}
              />
              <button
                type="button"
                className="text-xs text-rose-600"
                onClick={() =>
                  patch({ team: value.team.filter((_, j) => j !== i) })
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-sm font-semibold text-violet-600"
            onClick={() =>
              patch({ team: [...value.team, newAboutTeamMember()] })
            }
          >
            + Add team member
          </button>
          <p className="text-[11px] text-slate-500">
            Team section only renders on the live page when at least one named
            person exists.
          </p>
        </div>
      ) : null}

      {tab === "commitment" ? (
        <div className="space-y-3">
          <Input
            label="Eyebrow"
            value={value.commitmentEyebrow}
            onChange={(v) => patch({ commitmentEyebrow: v })}
          />
          <Input
            label="Title"
            value={value.commitmentTitle}
            onChange={(v) => patch({ commitmentTitle: v })}
          />
          <Text
            label="Body"
            value={value.commitmentBody}
            onChange={(v) => patch({ commitmentBody: v })}
            rows={4}
          />
          <Input
            label="Signature"
            value={value.commitmentSignature}
            onChange={(v) => patch({ commitmentSignature: v })}
          />
        </div>
      ) : null}

      {tab === "faq" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Eyebrow"
              value={value.faqEyebrow}
              onChange={(v) => patch({ faqEyebrow: v })}
            />
            <Input
              label="Title"
              value={value.faqTitle}
              onChange={(v) => patch({ faqTitle: v })}
            />
          </div>
          <Text
            label="Intro"
            value={value.faqIntro}
            onChange={(v) => patch({ faqIntro: v })}
          />
          {value.faqs.map((faq, i) => (
            <div
              key={faq.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3"
            >
              <Input
                label="Question"
                value={faq.question}
                onChange={(question) => {
                  const faqs = [...value.faqs];
                  faqs[i] = { ...faq, question };
                  patch({ faqs });
                }}
              />
              <Text
                label="Answer"
                value={faq.answer}
                onChange={(answer) => {
                  const faqs = [...value.faqs];
                  faqs[i] = { ...faq, answer };
                  patch({ faqs });
                }}
                rows={3}
              />
              <button
                type="button"
                className="text-xs text-rose-600"
                onClick={() =>
                  patch({ faqs: value.faqs.filter((_, j) => j !== i) })
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-sm font-semibold text-violet-600"
            onClick={() => patch({ faqs: [...value.faqs, newAboutFaq()] })}
          >
            + Add FAQ
          </button>
        </div>
      ) : null}

      {tab === "cta" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Eyebrow"
            value={value.ctaEyebrow}
            onChange={(v) => patch({ ctaEyebrow: v })}
          />
          <Input
            label="Title"
            value={value.ctaTitle}
            onChange={(v) => patch({ ctaTitle: v })}
          />
          <div className="sm:col-span-2">
            <Text
              label="Description"
              value={value.ctaDescription}
              onChange={(v) => patch({ ctaDescription: v })}
            />
          </div>
          <Input
            label="Primary label"
            value={value.ctaPrimaryLabel}
            onChange={(v) => patch({ ctaPrimaryLabel: v })}
          />
          <Input
            label="Primary URL"
            value={value.ctaPrimaryHref}
            onChange={(v) => patch({ ctaPrimaryHref: v })}
          />
          <Input
            label="Secondary label"
            value={value.ctaSecondaryLabel}
            onChange={(v) => patch({ ctaSecondaryLabel: v })}
          />
          <Input
            label="Secondary URL"
            value={value.ctaSecondaryHref}
            onChange={(v) => patch({ ctaSecondaryHref: v })}
          />
        </div>
      ) : null}
    </div>
  );
}

export type { CmsAboutFaq };
