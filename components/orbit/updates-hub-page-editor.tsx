"use client";

import type {
  CmsUpdateKind,
  CmsUpdatesHubPageContent,
} from "@/lib/orbit/updates-hub-page-content";
import {
  newUpdateEntry,
  newUpdatesFaq,
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

export function UpdatesHubPageEditor({
  value,
  onChange,
}: {
  value: CmsUpdatesHubPageContent;
  onChange: (next: CmsUpdatesHubPageContent) => void;
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
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Intro copy</h2>
        <Field label="Title">
          <input
            className={inputClass}
            value={value.introTitle}
            onChange={(e) => onChange({ ...value, introTitle: e.target.value })}
          />
        </Field>
        <Field label="Body">
          <textarea
            className={inputClass}
            rows={4}
            value={value.introBody}
            onChange={(e) => onChange({ ...value, introBody: e.target.value })}
          />
        </Field>
        <Field label="Secondary card">
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

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Release notes</h2>
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
        {value.updates.length === 0 ? (
          <p className="text-sm text-slate-500">
            No entries yet. Add updates to populate the public timeline.
          </p>
        ) : null}
        {value.updates.map((entry, i) => (
          <div
            key={entry.id}
            className="space-y-2 rounded-xl border border-violet-100 bg-violet-50/30 p-4"
          >
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
                rows={3}
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
              <button
                type="button"
                className="text-red-600"
                onClick={() => {
                  const updates = value.updates.filter((_, j) => j !== i);
                  onChange({ ...value, updates });
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
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
                rows={2}
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
            onChange({ ...value, faqs: [...value.faqs, newUpdatesFaq()] })
          }
        >
          + Add FAQ
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Bottom CTA</h2>
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
      </section>
    </div>
  );
}
