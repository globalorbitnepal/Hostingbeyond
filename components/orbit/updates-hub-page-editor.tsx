"use client";

import { useState } from "react";

import type {
  CmsUpdateKind,
  CmsUpdatesHubPageContent,
} from "@/lib/orbit/updates-hub-page-content";
import {
  newUpdateEntry,
  newUpdatesCategory,
  newUpdatesFaq,
  newUpdatesPillar,
  newUpdatesStat,
} from "@/lib/orbit/updates-hub-page-content";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const KINDS: CmsUpdateKind[] = ["NEW", "IMPROVEMENT", "FIX", "ANNOUNCEMENT"];

const TABS = [
  ["seo", "SEO"],
  ["hero", "Hero"],
  ["intro", "Intro & stats"],
  ["categories", "Categories"],
  ["updates", "Release notes"],
  ["pillars", "Pillars"],
  ["roadmap", "Roadmap"],
  ["faq", "FAQ"],
  ["cta", "CTA"],
] as const;

type TabId = (typeof TABS)[number][0];

export function UpdatesHubPageEditor({
  value,
  onChange,
}: {
  value: CmsUpdatesHubPageContent;
  onChange: (next: CmsUpdatesHubPageContent) => void;
}) {
  const [tab, setTab] = useState<TabId>("updates");

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
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

      {tab === "seo" ? (
        <section className="space-y-3">
          <Field label="SEO title">
            <input
              className={inputClass}
              value={value.seoTitle}
              onChange={(e) => onChange({ ...value, seoTitle: e.target.value })}
            />
          </Field>
          <Field label="Meta description">
            <textarea
              className={inputClass}
              rows={4}
              value={value.seoDescription}
              onChange={(e) =>
                onChange({ ...value, seoDescription: e.target.value })
              }
            />
          </Field>
        </section>
      ) : null}

      {tab === "hero" ? (
        <section className="space-y-3">
          <Field label="Eyebrow">
            <input
              className={inputClass}
              value={value.heroEyebrow}
              onChange={(e) =>
                onChange({ ...value, heroEyebrow: e.target.value })
              }
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title">
              <input
                className={inputClass}
                value={value.heroTitle}
                onChange={(e) =>
                  onChange({ ...value, heroTitle: e.target.value })
                }
              />
            </Field>
            <Field label="Accent">
              <input
                className={inputClass}
                value={value.heroTitleAccent}
                onChange={(e) =>
                  onChange({ ...value, heroTitleAccent: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              className={inputClass}
              rows={4}
              value={value.heroDescription}
              onChange={(e) =>
                onChange({ ...value, heroDescription: e.target.value })
              }
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Primary button label">
              <input
                className={inputClass}
                value={value.heroPrimaryLabel}
                onChange={(e) =>
                  onChange({ ...value, heroPrimaryLabel: e.target.value })
                }
              />
            </Field>
            <Field label="Primary button URL">
              <input
                className={inputClass}
                value={value.heroPrimaryHref}
                onChange={(e) =>
                  onChange({ ...value, heroPrimaryHref: e.target.value })
                }
              />
            </Field>
            <Field label="Secondary button label">
              <input
                className={inputClass}
                value={value.heroSecondaryLabel}
                onChange={(e) =>
                  onChange({ ...value, heroSecondaryLabel: e.target.value })
                }
              />
            </Field>
            <Field label="Secondary button URL">
              <input
                className={inputClass}
                value={value.heroSecondaryHref}
                onChange={(e) =>
                  onChange({ ...value, heroSecondaryHref: e.target.value })
                }
              />
            </Field>
          </div>
        </section>
      ) : null}

      {tab === "intro" ? (
        <section className="space-y-3">
          <Field label="Intro title">
            <input
              className={inputClass}
              value={value.introTitle}
              onChange={(e) =>
                onChange({ ...value, introTitle: e.target.value })
              }
            />
          </Field>
          <Field label="Intro body">
            <textarea
              className={inputClass}
              rows={5}
              value={value.introBody}
              onChange={(e) =>
                onChange({ ...value, introBody: e.target.value })
              }
            />
          </Field>
          <Field label="Secondary card">
            <textarea
              className={inputClass}
              rows={5}
              value={value.introBodySecondary}
              onChange={(e) =>
                onChange({ ...value, introBodySecondary: e.target.value })
              }
            />
          </Field>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-slate-800">Stat chips</h3>
              <button
                type="button"
                className="text-sm font-semibold text-[#673de6]"
                onClick={() =>
                  onChange({
                    ...value,
                    stats: [...value.stats, newUpdatesStat()],
                  })
                }
              >
                + Add stat
              </button>
            </div>
            {value.stats.map((stat, i) => (
              <div
                key={stat.id}
                className="grid gap-2 rounded-lg border border-slate-100 p-3 sm:grid-cols-2"
              >
                <Field label="Label">
                  <input
                    className={inputClass}
                    value={stat.label}
                    onChange={(e) => {
                      const stats = [...value.stats];
                      stats[i] = { ...stat, label: e.target.value };
                      onChange({ ...value, stats });
                    }}
                  />
                </Field>
                <Field label="Value">
                  <input
                    className={inputClass}
                    value={stat.value}
                    onChange={(e) => {
                      const stats = [...value.stats];
                      stats[i] = { ...stat, value: e.target.value };
                      onChange({ ...value, stats });
                    }}
                  />
                </Field>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {tab === "categories" ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-slate-600">
              Filter pills on the public page. Use an empty slug for
              &ldquo;All&rdquo;.
            </p>
            <button
              type="button"
              className="text-sm font-semibold text-[#673de6]"
              onClick={() =>
                onChange({
                  ...value,
                  categories: [...value.categories, newUpdatesCategory()],
                })
              }
            >
              + Add category
            </button>
          </div>
          {value.categories.map((cat, i) => (
            <div
              key={cat.id}
              className="grid gap-2 rounded-xl border border-slate-100 p-4 sm:grid-cols-3"
            >
              <Field label="Label">
                <input
                  className={inputClass}
                  value={cat.label}
                  onChange={(e) => {
                    const categories = [...value.categories];
                    categories[i] = { ...cat, label: e.target.value };
                    onChange({ ...value, categories });
                  }}
                />
              </Field>
              <Field label="Slug (URL filter)">
                <input
                  className={inputClass}
                  value={cat.slug}
                  placeholder="hosting or empty for All"
                  onChange={(e) => {
                    const categories = [...value.categories];
                    categories[i] = { ...cat, slug: e.target.value };
                    onChange({ ...value, categories });
                  }}
                />
              </Field>
              <label className="flex items-end gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={cat.visible !== false}
                  onChange={(e) => {
                    const categories = [...value.categories];
                    categories[i] = { ...cat, visible: e.target.checked };
                    onChange({ ...value, categories });
                  }}
                />
                Visible
              </label>
            </div>
          ))}
        </section>
      ) : null}

      {tab === "updates" ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold">Release notes timeline</h2>
            <button
              type="button"
              className="text-sm font-semibold text-[#673de6]"
              onClick={() =>
                onChange({
                  ...value,
                  updates: [newUpdateEntry(), ...value.updates],
                })
              }
            >
              + Add update
            </button>
          </div>
          {value.updates.map((entry, i) => (
            <div
              key={entry.id}
              className="space-y-2 rounded-xl border border-violet-100 bg-violet-50/30 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-800">Entry {i + 1}</p>
                <button
                  type="button"
                  className="text-sm font-semibold text-red-600"
                  onClick={() => {
                    const updates = value.updates.filter((_, j) => j !== i);
                    onChange({ ...value, updates });
                  }}
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Date (YYYY-MM-DD)">
                  <input
                    className={inputClass}
                    value={entry.date}
                    onChange={(e) => {
                      const updates = [...value.updates];
                      updates[i] = { ...entry, date: e.target.value };
                      onChange({ ...value, updates });
                    }}
                  />
                </Field>
                <Field label="Category slug">
                  <input
                    className={inputClass}
                    value={entry.category}
                    placeholder="hosting, domains, platform…"
                    onChange={(e) => {
                      const updates = [...value.updates];
                      updates[i] = { ...entry, category: e.target.value };
                      onChange({ ...value, updates });
                    }}
                  />
                </Field>
              </div>
              <Field label="Kind">
                <select
                  className={inputClass}
                  value={entry.kind}
                  onChange={(e) => {
                    const updates = [...value.updates];
                    updates[i] = {
                      ...entry,
                      kind: e.target.value as CmsUpdateKind,
                    };
                    onChange({ ...value, updates });
                  }}
                >
                  {KINDS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Title">
                <input
                  className={inputClass}
                  value={entry.title}
                  onChange={(e) => {
                    const updates = [...value.updates];
                    updates[i] = { ...entry, title: e.target.value };
                    onChange({ ...value, updates });
                  }}
                />
              </Field>
              <Field label="Excerpt">
                <textarea
                  className={inputClass}
                  rows={2}
                  value={entry.excerpt}
                  onChange={(e) => {
                    const updates = [...value.updates];
                    updates[i] = { ...entry, excerpt: e.target.value };
                    onChange({ ...value, updates });
                  }}
                />
              </Field>
              <Field label="Extended body (optional)">
                <textarea
                  className={inputClass}
                  rows={4}
                  value={entry.body ?? ""}
                  onChange={(e) => {
                    const updates = [...value.updates];
                    updates[i] = { ...entry, body: e.target.value };
                    onChange({ ...value, updates });
                  }}
                />
              </Field>
              <Field label="Link URL (optional)">
                <input
                  className={inputClass}
                  value={entry.href ?? ""}
                  onChange={(e) => {
                    const updates = [...value.updates];
                    updates[i] = { ...entry, href: e.target.value };
                    onChange({ ...value, updates });
                  }}
                />
              </Field>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(entry.featured)}
                    onChange={(e) => {
                      const updates = [...value.updates];
                      updates[i] = { ...entry, featured: e.target.checked };
                      onChange({ ...value, updates });
                    }}
                  />
                  Featured in hero
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={entry.visible !== false}
                    onChange={(e) => {
                      const updates = [...value.updates];
                      updates[i] = { ...entry, visible: e.target.checked };
                      onChange({ ...value, updates });
                    }}
                  />
                  Visible
                </label>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {tab === "pillars" ? (
        <section className="space-y-3">
          <button
            type="button"
            className="text-sm font-semibold text-[#673de6]"
            onClick={() =>
              onChange({
                ...value,
                pillars: [...value.pillars, newUpdatesPillar()],
              })
            }
          >
            + Add pillar
          </button>
          {value.pillars.map((pillar, i) => (
            <div
              key={pillar.id}
              className="space-y-2 rounded-xl border border-slate-100 p-4"
            >
              <Field label="Title">
                <input
                  className={inputClass}
                  value={pillar.title}
                  onChange={(e) => {
                    const pillars = [...value.pillars];
                    pillars[i] = { ...pillar, title: e.target.value };
                    onChange({ ...value, pillars });
                  }}
                />
              </Field>
              <Field label="Description">
                <textarea
                  className={inputClass}
                  rows={3}
                  value={pillar.description}
                  onChange={(e) => {
                    const pillars = [...value.pillars];
                    pillars[i] = { ...pillar, description: e.target.value };
                    onChange({ ...value, pillars });
                  }}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={pillar.visible !== false}
                  onChange={(e) => {
                    const pillars = [...value.pillars];
                    pillars[i] = { ...pillar, visible: e.target.checked };
                    onChange({ ...value, pillars });
                  }}
                />
                Visible
              </label>
            </div>
          ))}
        </section>
      ) : null}

      {tab === "roadmap" ? (
        <section className="space-y-3">
          <Field label="Section title">
            <input
              className={inputClass}
              value={value.roadmapTitle}
              onChange={(e) =>
                onChange({ ...value, roadmapTitle: e.target.value })
              }
            />
          </Field>
          <Field label="Body">
            <textarea
              className={inputClass}
              rows={5}
              value={value.roadmapBody}
              onChange={(e) =>
                onChange({ ...value, roadmapBody: e.target.value })
              }
            />
          </Field>
        </section>
      ) : null}

      {tab === "faq" ? (
        <section className="space-y-3">
          <button
            type="button"
            className="text-sm font-semibold text-[#673de6]"
            onClick={() =>
              onChange({ ...value, faqs: [...value.faqs, newUpdatesFaq()] })
            }
          >
            + Add FAQ
          </button>
          {value.faqs.map((faq, i) => (
            <div
              key={faq.id}
              className="space-y-2 rounded-xl border border-slate-100 p-4"
            >
              <Field label="Question">
                <input
                  className={inputClass}
                  value={faq.question}
                  onChange={(e) => {
                    const faqs = [...value.faqs];
                    faqs[i] = { ...faq, question: e.target.value };
                    onChange({ ...value, faqs });
                  }}
                />
              </Field>
              <Field label="Answer">
                <textarea
                  className={inputClass}
                  rows={3}
                  value={faq.answer}
                  onChange={(e) => {
                    const faqs = [...value.faqs];
                    faqs[i] = { ...faq, answer: e.target.value };
                    onChange({ ...value, faqs });
                  }}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={faq.visible !== false}
                  onChange={(e) => {
                    const faqs = [...value.faqs];
                    faqs[i] = { ...faq, visible: e.target.checked };
                    onChange({ ...value, faqs });
                  }}
                />
                Visible
              </label>
            </div>
          ))}
        </section>
      ) : null}

      {tab === "cta" ? (
        <section className="space-y-3">
          <Field label="Eyebrow">
            <input
              className={inputClass}
              value={value.ctaEyebrow}
              onChange={(e) =>
                onChange({ ...value, ctaEyebrow: e.target.value })
              }
            />
          </Field>
          <Field label="Title">
            <input
              className={inputClass}
              value={value.ctaTitle}
              onChange={(e) => onChange({ ...value, ctaTitle: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <textarea
              className={inputClass}
              rows={3}
              value={value.ctaDescription}
              onChange={(e) =>
                onChange({ ...value, ctaDescription: e.target.value })
              }
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Primary label">
              <input
                className={inputClass}
                value={value.ctaPrimaryLabel}
                onChange={(e) =>
                  onChange({ ...value, ctaPrimaryLabel: e.target.value })
                }
              />
            </Field>
            <Field label="Primary URL">
              <input
                className={inputClass}
                value={value.ctaPrimaryHref}
                onChange={(e) =>
                  onChange({ ...value, ctaPrimaryHref: e.target.value })
                }
              />
            </Field>
            <Field label="Secondary label">
              <input
                className={inputClass}
                value={value.ctaSecondaryLabel}
                onChange={(e) =>
                  onChange({ ...value, ctaSecondaryLabel: e.target.value })
                }
              />
            </Field>
            <Field label="Secondary URL">
              <input
                className={inputClass}
                value={value.ctaSecondaryHref}
                onChange={(e) =>
                  onChange({ ...value, ctaSecondaryHref: e.target.value })
                }
              />
            </Field>
          </div>
        </section>
      ) : null}
    </div>
  );
}
