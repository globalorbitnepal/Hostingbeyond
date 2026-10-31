"use client";

import { useState } from "react";

import type {
  CmsGrowthPlaybookKind,
  CmsGrowthHubPageContent,
} from "@/lib/orbit/growth-hub-page-content";
import {
  newGrowthCategory,
  newGrowthFaq,
  newGrowthPillar,
  newGrowthPlaybook,
  newGrowthStage,
  newGrowthStat,
} from "@/lib/orbit/growth-hub-page-content";

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

const KINDS: CmsGrowthPlaybookKind[] = ["PLAYBOOK", "CHECKLIST", "FRAMEWORK"];

const TABS = [
  ["seo", "SEO"],
  ["hero", "Hero"],
  ["intro", "Intro & stats"],
  ["stages", "Stages"],
  ["categories", "Categories"],
  ["playbooks", "Playbooks"],
  ["principles", "Principles"],
  ["pillars", "Pillars"],
  ["faq", "FAQ"],
  ["cta", "CTA"],
] as const;

type TabId = (typeof TABS)[number][0];

export function GrowthHubPageEditor({
  value,
  onChange,
}: {
  value: CmsGrowthHubPageContent;
  onChange: (next: CmsGrowthHubPageContent) => void;
}) {
  const [tab, setTab] = useState<TabId>("playbooks");

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
                    stats: [...value.stats, newGrowthStat()],
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
                  categories: [...value.categories, newGrowthCategory()],
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

      {tab === "playbooks" ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold">Growth playbooks</h2>
            <button
              type="button"
              className="text-sm font-semibold text-[#673de6]"
              onClick={() =>
                onChange({
                  ...value,
                  playbooks: [newGrowthPlaybook(), ...value.playbooks],
                })
              }
            >
              + Add playbook
            </button>
          </div>
          {value.playbooks.map((entry, i) => (
            <div
              key={entry.id}
              className="space-y-2 rounded-xl border border-violet-100 bg-violet-50/30 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-800">Playbook {i + 1}</p>
                <button
                  type="button"
                  className="text-sm font-semibold text-red-600"
                  onClick={() => {
                    const playbooks = value.playbooks.filter((_, j) => j !== i);
                    onChange({ ...value, playbooks });
                  }}
                >
                  Remove
                </button>
              </div>
              <Field label="Category slug">
                <input
                  className={inputClass}
                  value={entry.category}
                  placeholder="launch, performance, email…"
                  onChange={(e) => {
                    const playbooks = [...value.playbooks];
                    playbooks[i] = { ...entry, category: e.target.value };
                    onChange({ ...value, playbooks });
                  }}
                />
              </Field>
              <Field label="Kind">
                <select
                  className={inputClass}
                  value={entry.kind}
                  onChange={(e) => {
                    const playbooks = [...value.playbooks];
                    playbooks[i] = {
                      ...entry,
                      kind: e.target.value as CmsGrowthPlaybookKind,
                    };
                    onChange({ ...value, playbooks });
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
                    const playbooks = [...value.playbooks];
                    playbooks[i] = { ...entry, title: e.target.value };
                    onChange({ ...value, playbooks });
                  }}
                />
              </Field>
              <Field label="Excerpt">
                <textarea
                  className={inputClass}
                  rows={2}
                  value={entry.excerpt}
                  onChange={(e) => {
                    const playbooks = [...value.playbooks];
                    playbooks[i] = { ...entry, excerpt: e.target.value };
                    onChange({ ...value, playbooks });
                  }}
                />
              </Field>
              <Field label="Body">
                <textarea
                  className={inputClass}
                  rows={4}
                  value={entry.body ?? ""}
                  onChange={(e) => {
                    const playbooks = [...value.playbooks];
                    playbooks[i] = { ...entry, body: e.target.value };
                    onChange({ ...value, playbooks });
                  }}
                />
              </Field>
              <Field label="Action link URL">
                <input
                  className={inputClass}
                  value={entry.href ?? ""}
                  onChange={(e) => {
                    const playbooks = [...value.playbooks];
                    playbooks[i] = { ...entry, href: e.target.value };
                    onChange({ ...value, playbooks });
                  }}
                />
              </Field>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(entry.featured)}
                    onChange={(e) => {
                      const playbooks = [...value.playbooks];
                      playbooks[i] = { ...entry, featured: e.target.checked };
                      onChange({ ...value, playbooks });
                    }}
                  />
                  Featured in hero
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={entry.visible !== false}
                    onChange={(e) => {
                      const playbooks = [...value.playbooks];
                      playbooks[i] = { ...entry, visible: e.target.checked };
                      onChange({ ...value, playbooks });
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
                pillars: [...value.pillars, newGrowthPillar()],
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

      {tab === "stages" ? (
        <section className="space-y-3">
          <Field label="Section title">
            <input
              className={inputClass}
              value={value.stagesTitle}
              onChange={(e) =>
                onChange({ ...value, stagesTitle: e.target.value })
              }
            />
          </Field>
          <Field label="Subtitle">
            <input
              className={inputClass}
              value={value.stagesSubtitle}
              onChange={(e) =>
                onChange({ ...value, stagesSubtitle: e.target.value })
              }
            />
          </Field>
          <button
            type="button"
            className="text-sm font-semibold text-[#673de6]"
            onClick={() =>
              onChange({
                ...value,
                stages: [...value.stages, newGrowthStage()],
              })
            }
          >
            + Add stage
          </button>
          {value.stages.map((stage, i) => (
            <div
              key={stage.id}
              className="space-y-2 rounded-xl border border-slate-100 p-4"
            >
              <div className="grid gap-2 sm:grid-cols-3">
                <Field label="Step label">
                  <input
                    className={inputClass}
                    value={stage.step}
                    onChange={(e) => {
                      const stages = [...value.stages];
                      stages[i] = { ...stage, step: e.target.value };
                      onChange({ ...value, stages });
                    }}
                  />
                </Field>
                <Field label="Title">
                  <input
                    className={inputClass}
                    value={stage.title}
                    onChange={(e) => {
                      const stages = [...value.stages];
                      stages[i] = { ...stage, title: e.target.value };
                      onChange({ ...value, stages });
                    }}
                  />
                </Field>
              </div>
              <Field label="Description">
                <textarea
                  className={inputClass}
                  rows={3}
                  value={stage.description}
                  onChange={(e) => {
                    const stages = [...value.stages];
                    stages[i] = { ...stage, description: e.target.value };
                    onChange({ ...value, stages });
                  }}
                />
              </Field>
            </div>
          ))}
        </section>
      ) : null}

      {tab === "principles" ? (
        <section className="space-y-3">
          <Field label="Title">
            <input
              className={inputClass}
              value={value.principlesTitle}
              onChange={(e) =>
                onChange({ ...value, principlesTitle: e.target.value })
              }
            />
          </Field>
          <Field label="Body">
            <textarea
              className={inputClass}
              rows={5}
              value={value.principlesBody}
              onChange={(e) =>
                onChange({ ...value, principlesBody: e.target.value })
              }
            />
          </Field>
          <Field label="Secondary body">
            <textarea
              className={inputClass}
              rows={4}
              value={value.principlesBodySecondary}
              onChange={(e) =>
                onChange({
                  ...value,
                  principlesBodySecondary: e.target.value,
                })
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
              onChange({ ...value, faqs: [...value.faqs, newGrowthFaq()] })
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
