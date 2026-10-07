"use client";

import type { CmsTipsHubPageContent } from "@/lib/orbit/tips-hub-page-content";
import {
  newTipsHubFaq,
  newTipsHubPath,
  newTipsHubPillar,
} from "@/lib/orbit/tips-hub-page-content";

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

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm";

export function TipsHubPageEditor({
  value,
  onChange,
}: {
  value: CmsTipsHubPageContent;
  onChange: (next: CmsTipsHubPageContent) => void;
}) {
  return (
    <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6">
      <section className="space-y-3">
        <h2 className="text-lg font-bold">SEO</h2>
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
            rows={3}
            value={value.seoDescription}
            onChange={(e) =>
              onChange({ ...value, seoDescription: e.target.value })
            }
          />
        </Field>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Hero</h2>
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
          <Field label="Title accent (blue highlight)">
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

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Intro (SEO body)</h2>
        <Field label="Section title">
          <input
            className={inputClass}
            value={value.introTitle}
            onChange={(e) => onChange({ ...value, introTitle: e.target.value })}
          />
        </Field>
        <Field label="Primary paragraph">
          <textarea
            className={inputClass}
            rows={4}
            value={value.introBody}
            onChange={(e) => onChange({ ...value, introBody: e.target.value })}
          />
        </Field>
        <Field label="Secondary paragraph (card)">
          <textarea
            className={inputClass}
            rows={4}
            value={value.introBodySecondary}
            onChange={(e) =>
              onChange({ ...value, introBodySecondary: e.target.value })
            }
          />
        </Field>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Learning paths</h2>
        {value.learningPaths.map((path, i) => (
          <div
            key={path.id}
            className="space-y-2 rounded-xl border border-slate-100 p-4"
          >
            <Field label="Title">
              <input
                className={inputClass}
                value={path.title}
                onChange={(e) => {
                  const learningPaths = [...value.learningPaths];
                  learningPaths[i] = { ...path, title: e.target.value };
                  onChange({ ...value, learningPaths });
                }}
              />
            </Field>
            <Field label="Description">
              <input
                className={inputClass}
                value={path.description}
                onChange={(e) => {
                  const learningPaths = [...value.learningPaths];
                  learningPaths[i] = { ...path, description: e.target.value };
                  onChange({ ...value, learningPaths });
                }}
              />
            </Field>
            <Field label="Link URL">
              <input
                className={inputClass}
                value={path.href}
                onChange={(e) => {
                  const learningPaths = [...value.learningPaths];
                  learningPaths[i] = { ...path, href: e.target.value };
                  onChange({ ...value, learningPaths });
                }}
              />
            </Field>
          </div>
        ))}
        <button
          type="button"
          className="text-sm font-semibold text-[#673de6]"
          onClick={() =>
            onChange({
              ...value,
              learningPaths: [...value.learningPaths, newTipsHubPath()],
            })
          }
        >
          + Add path
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Topic pillars</h2>
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
                rows={2}
                value={pillar.description}
                onChange={(e) => {
                  const pillars = [...value.pillars];
                  pillars[i] = { ...pillar, description: e.target.value };
                  onChange({ ...value, pillars });
                }}
              />
            </Field>
            <Field label="Category slug (for filter link)">
              <input
                className={inputClass}
                value={pillar.categorySlug}
                onChange={(e) => {
                  const pillars = [...value.pillars];
                  pillars[i] = { ...pillar, categorySlug: e.target.value };
                  onChange({ ...value, pillars });
                }}
              />
            </Field>
          </div>
        ))}
        <button
          type="button"
          className="text-sm font-semibold text-[#673de6]"
          onClick={() =>
            onChange({
              ...value,
              pillars: [...value.pillars, newTipsHubPillar()],
            })
          }
        >
          + Add pillar
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">FAQs</h2>
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
          </div>
        ))}
        <button
          type="button"
          className="text-sm font-semibold text-[#673de6]"
          onClick={() =>
            onChange({ ...value, faqs: [...value.faqs, newTipsHubFaq()] })
          }
        >
          + Add FAQ
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Bottom CTA band</h2>
        <Field label="Eyebrow">
          <input
            className={inputClass}
            value={value.ctaEyebrow}
            onChange={(e) => onChange({ ...value, ctaEyebrow: e.target.value })}
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
            rows={2}
            value={value.ctaDescription}
            onChange={(e) =>
              onChange({ ...value, ctaDescription: e.target.value })
            }
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Primary CTA label">
            <input
              className={inputClass}
              value={value.ctaPrimaryLabel}
              onChange={(e) =>
                onChange({ ...value, ctaPrimaryLabel: e.target.value })
              }
            />
          </Field>
          <Field label="Primary CTA URL">
            <input
              className={inputClass}
              value={value.ctaPrimaryHref}
              onChange={(e) =>
                onChange({ ...value, ctaPrimaryHref: e.target.value })
              }
            />
          </Field>
          <Field label="Secondary CTA label">
            <input
              className={inputClass}
              value={value.ctaSecondaryLabel}
              onChange={(e) =>
                onChange({ ...value, ctaSecondaryLabel: e.target.value })
              }
            />
          </Field>
          <Field label="Secondary CTA URL">
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
    </div>
  );
}
