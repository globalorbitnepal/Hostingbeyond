"use client";

import type { CmsContactPageContent } from "@/lib/orbit/contact-page-content";
import {
  newContactChannel,
  newContactFaq,
  newContactOffice,
} from "@/lib/orbit/contact-page-content";

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

export function ContactPageEditor({
  value,
  onChange,
}: {
  value: CmsContactPageContent;
  onChange: (next: CmsContactPageContent) => void;
}) {
  return (
    <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6">
      <section className="space-y-3">
        <h2 className="text-lg font-bold">SEO & hero</h2>
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
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Hero title">
            <input
              className={inputClass}
              value={value.heroTitle}
              onChange={(e) =>
                onChange({ ...value, heroTitle: e.target.value })
              }
            />
          </Field>
          <Field label="Hero accent">
            <input
              className={inputClass}
              value={value.heroTitleAccent}
              onChange={(e) =>
                onChange({ ...value, heroTitleAccent: e.target.value })
              }
            />
          </Field>
        </div>
        <Field label="Hero description">
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
        <h2 className="text-lg font-bold">Intro & form copy</h2>
        <Field label="Intro title">
          <input
            className={inputClass}
            value={value.introTitle}
            onChange={(e) => onChange({ ...value, introTitle: e.target.value })}
          />
        </Field>
        <Field label="Intro body">
          <textarea
            className={inputClass}
            rows={4}
            value={value.introBody}
            onChange={(e) => onChange({ ...value, introBody: e.target.value })}
          />
        </Field>
        <Field label="Form success message">
          <textarea
            className={inputClass}
            rows={2}
            value={value.formSuccessMessage}
            onChange={(e) =>
              onChange({ ...value, formSuccessMessage: e.target.value })
            }
          />
        </Field>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Contact channels</h2>
        {value.channels.map((ch, i) => (
          <div
            key={ch.id}
            className="space-y-2 rounded-xl border border-slate-100 p-4"
          >
            <Field label="Title">
              <input
                className={inputClass}
                value={ch.title}
                onChange={(e) => {
                  const channels = [...value.channels];
                  channels[i] = { ...ch, title: e.target.value };
                  onChange({ ...value, channels });
                }}
              />
            </Field>
            <Field label="Description">
              <textarea
                className={inputClass}
                rows={2}
                value={ch.description}
                onChange={(e) => {
                  const channels = [...value.channels];
                  channels[i] = { ...ch, description: e.target.value };
                  onChange({ ...value, channels });
                }}
              />
            </Field>
            <Field label="Link URL">
              <input
                className={inputClass}
                value={ch.href}
                onChange={(e) => {
                  const channels = [...value.channels];
                  channels[i] = { ...ch, href: e.target.value };
                  onChange({ ...value, channels });
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
              channels: [...value.channels, newContactChannel()],
            })
          }
        >
          + Add channel
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Offices</h2>
        {value.offices.map((office, i) => (
          <div
            key={office.id}
            className="space-y-2 rounded-xl border border-violet-50 bg-violet-50/30 p-4"
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="City">
                <input
                  className={inputClass}
                  value={office.city}
                  onChange={(e) => {
                    const offices = [...value.offices];
                    offices[i] = { ...office, city: e.target.value };
                    onChange({ ...value, offices });
                  }}
                />
              </Field>
              <Field label="Country">
                <input
                  className={inputClass}
                  value={office.country}
                  onChange={(e) => {
                    const offices = [...value.offices];
                    offices[i] = { ...office, country: e.target.value };
                    onChange({ ...value, offices });
                  }}
                />
              </Field>
            </div>
            <Field label="Address line 1">
              <input
                className={inputClass}
                value={office.addressLine1}
                onChange={(e) => {
                  const offices = [...value.offices];
                  offices[i] = { ...office, addressLine1: e.target.value };
                  onChange({ ...value, offices });
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
              offices: [...value.offices, newContactOffice()],
            })
          }
        >
          + Add office
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Media & FAQ</h2>
        <Field label="Press email">
          <input
            className={inputClass}
            value={value.mediaEmail}
            onChange={(e) => onChange({ ...value, mediaEmail: e.target.value })}
          />
        </Field>
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
            onChange({ ...value, faqs: [...value.faqs, newContactFaq()] })
          }
        >
          + Add FAQ
        </button>
      </section>
    </div>
  );
}
