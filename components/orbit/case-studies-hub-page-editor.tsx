"use client";

import { useState } from "react";

import { OrbitImageField } from "@/components/orbit/image-field";
import type { CmsCaseStudiesHubPageContent } from "@/lib/orbit/case-studies-hub-page-content";
import {
  newCaseStudiesFaq,
  newCaseStudyEntry,
  newCaseStudyMetric,
} from "@/lib/orbit/case-studies-hub-page-content";

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

const TABS = [
  ["seo", "SEO"],
  ["hero", "Hero"],
  ["intro", "Intro & stats"],
  ["methodology", "Methodology"],
  ["studies", "Case studies"],
  ["pillars", "Pillars"],
  ["faq", "FAQ"],
  ["cta", "CTA"],
] as const;

type TabId = (typeof TABS)[number][0];

export function CaseStudiesHubPageEditor({
  value,
  onChange,
}: {
  value: CmsCaseStudiesHubPageContent;
  onChange: (next: CmsCaseStudiesHubPageContent) => void;
}) {
  const [tab, setTab] = useState<TabId>("studies");

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
              rows={3}
              value={value.heroDescription}
              onChange={(e) =>
                onChange({ ...value, heroDescription: e.target.value })
              }
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Primary CTA label">
              <input
                className={inputClass}
                value={value.heroPrimaryLabel}
                onChange={(e) =>
                  onChange({ ...value, heroPrimaryLabel: e.target.value })
                }
              />
            </Field>
            <Field label="Primary CTA URL">
              <input
                className={inputClass}
                value={value.heroPrimaryHref}
                onChange={(e) =>
                  onChange({ ...value, heroPrimaryHref: e.target.value })
                }
              />
            </Field>
            <Field label="Secondary CTA label">
              <input
                className={inputClass}
                value={value.heroSecondaryLabel}
                onChange={(e) =>
                  onChange({ ...value, heroSecondaryLabel: e.target.value })
                }
              />
            </Field>
            <Field label="Secondary CTA URL">
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
        <section className="space-y-4">
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
          <Field label="Intro secondary card">
            <textarea
              className={inputClass}
              rows={4}
              value={value.introBodySecondary}
              onChange={(e) =>
                onChange({ ...value, introBodySecondary: e.target.value })
              }
            />
          </Field>
          <h3 className="text-sm font-bold">Stats band</h3>
          {value.stats.map((stat, i) => (
            <div key={stat.id} className="grid gap-2 sm:grid-cols-2">
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
            </div>
          ))}
        </section>
      ) : null}

      {tab === "methodology" ? (
        <section className="space-y-3">
          <Field label="Title">
            <input
              className={inputClass}
              value={value.methodologyTitle}
              onChange={(e) =>
                onChange({ ...value, methodologyTitle: e.target.value })
              }
            />
          </Field>
          <Field label="Body">
            <textarea
              className={inputClass}
              rows={5}
              value={value.methodologyBody}
              onChange={(e) =>
                onChange({ ...value, methodologyBody: e.target.value })
              }
            />
          </Field>
          <Field label="Secondary paragraph">
            <textarea
              className={inputClass}
              rows={4}
              value={value.methodologyBodySecondary}
              onChange={(e) =>
                onChange({ ...value, methodologyBodySecondary: e.target.value })
              }
            />
          </Field>
        </section>
      ) : null}

      {tab === "studies" ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold">Case study entries</h2>
            <button
              type="button"
              className="text-sm font-semibold text-[#673de6]"
              onClick={() =>
                onChange({
                  ...value,
                  caseStudies: [newCaseStudyEntry(), ...value.caseStudies],
                })
              }
            >
              + Add case study
            </button>
          </div>
          {value.caseStudies.map((study, index) => (
            <div
              key={study.id}
              className="space-y-3 rounded-xl border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-800">
                  Case study {index + 1}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={study.visible !== false}
                      onChange={(e) => {
                        const caseStudies = [...value.caseStudies];
                        caseStudies[index] = {
                          ...study,
                          visible: e.target.checked,
                        };
                        onChange({ ...value, caseStudies });
                      }}
                    />
                    Visible
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={Boolean(study.featured)}
                      onChange={(e) => {
                        const caseStudies = [...value.caseStudies];
                        caseStudies[index] = {
                          ...study,
                          featured: e.target.checked,
                        };
                        onChange({ ...value, caseStudies });
                      }}
                    />
                    Featured (hero)
                  </label>
                  <button
                    type="button"
                    className="font-semibold text-red-600"
                    onClick={() =>
                      onChange({
                        ...value,
                        caseStudies: value.caseStudies.filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
              <Field label="Headline title">
                <input
                  className={inputClass}
                  value={study.title}
                  onChange={(e) => {
                    const caseStudies = [...value.caseStudies];
                    caseStudies[index] = { ...study, title: e.target.value };
                    onChange({ ...value, caseStudies });
                  }}
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Client name">
                  <input
                    className={inputClass}
                    value={study.clientName}
                    onChange={(e) => {
                      const caseStudies = [...value.caseStudies];
                      caseStudies[index] = {
                        ...study,
                        clientName: e.target.value,
                      };
                      onChange({ ...value, caseStudies });
                    }}
                  />
                </Field>
                <Field label="Industry (filter chip)">
                  <input
                    className={inputClass}
                    value={study.industry}
                    onChange={(e) => {
                      const caseStudies = [...value.caseStudies];
                      caseStudies[index] = {
                        ...study,
                        industry: e.target.value,
                      };
                      onChange({ ...value, caseStudies });
                    }}
                  />
                </Field>
                <Field label="Location">
                  <input
                    className={inputClass}
                    value={study.location}
                    onChange={(e) => {
                      const caseStudies = [...value.caseStudies];
                      caseStudies[index] = {
                        ...study,
                        location: e.target.value,
                      };
                      onChange({ ...value, caseStudies });
                    }}
                  />
                </Field>
              </div>
              <Field label="Summary (SEO excerpt)">
                <textarea
                  className={inputClass}
                  rows={2}
                  value={study.summary}
                  onChange={(e) => {
                    const caseStudies = [...value.caseStudies];
                    caseStudies[index] = {
                      ...study,
                      summary: e.target.value,
                    };
                    onChange({ ...value, caseStudies });
                  }}
                />
              </Field>
              <Field label="Challenge">
                <textarea
                  className={inputClass}
                  rows={4}
                  value={study.challenge}
                  onChange={(e) => {
                    const caseStudies = [...value.caseStudies];
                    caseStudies[index] = {
                      ...study,
                      challenge: e.target.value,
                    };
                    onChange({ ...value, caseStudies });
                  }}
                />
              </Field>
              <Field label="Solution">
                <textarea
                  className={inputClass}
                  rows={4}
                  value={study.solution}
                  onChange={(e) => {
                    const caseStudies = [...value.caseStudies];
                    caseStudies[index] = {
                      ...study,
                      solution: e.target.value,
                    };
                    onChange({ ...value, caseStudies });
                  }}
                />
              </Field>
              <Field label="Services (comma-separated tags)">
                <input
                  className={inputClass}
                  value={study.services.join(", ")}
                  onChange={(e) => {
                    const caseStudies = [...value.caseStudies];
                    caseStudies[index] = {
                      ...study,
                      services: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    };
                    onChange({ ...value, caseStudies });
                  }}
                />
              </Field>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Results metrics</span>
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#673de6]"
                    onClick={() => {
                      const caseStudies = [...value.caseStudies];
                      caseStudies[index] = {
                        ...study,
                        results: [...study.results, newCaseStudyMetric()],
                      };
                      onChange({ ...value, caseStudies });
                    }}
                  >
                    + Metric
                  </button>
                </div>
                {study.results.map((m, mi) => (
                  <div key={m.id} className="grid gap-2 sm:grid-cols-2">
                    <input
                      className={inputClass}
                      placeholder="Label"
                      value={m.label}
                      onChange={(e) => {
                        const caseStudies = [...value.caseStudies];
                        const results = [...study.results];
                        results[mi] = { ...m, label: e.target.value };
                        caseStudies[index] = { ...study, results };
                        onChange({ ...value, caseStudies });
                      }}
                    />
                    <input
                      className={inputClass}
                      placeholder="Value"
                      value={m.value}
                      onChange={(e) => {
                        const caseStudies = [...value.caseStudies];
                        const results = [...study.results];
                        results[mi] = { ...m, value: e.target.value };
                        caseStudies[index] = { ...study, results };
                        onChange({ ...value, caseStudies });
                      }}
                    />
                  </div>
                ))}
              </div>
              <Field label="Quote">
                <textarea
                  className={inputClass}
                  rows={2}
                  value={study.quote}
                  onChange={(e) => {
                    const caseStudies = [...value.caseStudies];
                    caseStudies[index] = { ...study, quote: e.target.value };
                    onChange({ ...value, caseStudies });
                  }}
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Quote author">
                  <input
                    className={inputClass}
                    value={study.quoteAuthor}
                    onChange={(e) => {
                      const caseStudies = [...value.caseStudies];
                      caseStudies[index] = {
                        ...study,
                        quoteAuthor: e.target.value,
                      };
                      onChange({ ...value, caseStudies });
                    }}
                  />
                </Field>
                <Field label="Quote role">
                  <input
                    className={inputClass}
                    value={study.quoteRole}
                    onChange={(e) => {
                      const caseStudies = [...value.caseStudies];
                      caseStudies[index] = {
                        ...study,
                        quoteRole: e.target.value,
                      };
                      onChange({ ...value, caseStudies });
                    }}
                  />
                </Field>
              </div>
              <OrbitImageField
                label="Hero / featured image"
                value={study.image}
                onChange={(image) => {
                  const caseStudies = [...value.caseStudies];
                  caseStudies[index] = { ...study, image };
                  onChange({ ...value, caseStudies });
                }}
              />
              <Field label="Image alt text">
                <input
                  className={inputClass}
                  value={study.imageAlt}
                  onChange={(e) => {
                    const caseStudies = [...value.caseStudies];
                    caseStudies[index] = {
                      ...study,
                      imageAlt: e.target.value,
                    };
                    onChange({ ...value, caseStudies });
                  }}
                />
              </Field>
              <Field label="Related service link (CTA URL)">
                <input
                  className={inputClass}
                  value={study.href}
                  onChange={(e) => {
                    const caseStudies = [...value.caseStudies];
                    caseStudies[index] = { ...study, href: e.target.value };
                    onChange({ ...value, caseStudies });
                  }}
                />
              </Field>
            </div>
          ))}
        </section>
      ) : null}

      {tab === "pillars" ? (
        <section className="space-y-3">
          {value.pillars.map((p, i) => (
            <div key={p.id} className="rounded-xl border border-slate-200 p-3">
              <Field label="Title">
                <input
                  className={inputClass}
                  value={p.title}
                  onChange={(e) => {
                    const pillars = [...value.pillars];
                    pillars[i] = { ...p, title: e.target.value };
                    onChange({ ...value, pillars });
                  }}
                />
              </Field>
              <Field label="Description">
                <textarea
                  className={inputClass}
                  rows={2}
                  value={p.description}
                  onChange={(e) => {
                    const pillars = [...value.pillars];
                    pillars[i] = { ...p, description: e.target.value };
                    onChange({ ...value, pillars });
                  }}
                />
              </Field>
            </div>
          ))}
        </section>
      ) : null}

      {tab === "faq" ? (
        <section className="space-y-3">
          <button
            type="button"
            className="text-sm font-semibold text-[#673de6]"
            onClick={() =>
              onChange({ ...value, faqs: [...value.faqs, newCaseStudiesFaq()] })
            }
          >
            + Add FAQ
          </button>
          {value.faqs.map((faq, i) => (
            <div key={faq.id} className="space-y-2 rounded-xl border p-3">
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
