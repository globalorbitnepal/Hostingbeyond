"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { CmsEditorialPageContent } from "@/lib/orbit/editorial-page-content";
import {
  editorialPageBySlug,
  type EditorialSlug,
} from "@/lib/orbit/editorial-page-content";
import { readResponseError } from "@/lib/orbit/read-response-error";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none";

export function EditorialPageEditor({ slug }: { slug: EditorialSlug }) {
  const meta = editorialPageBySlug(slug);
  const [content, setContent] = useState<CmsEditorialPageContent | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/orbit/content/editorial?slug=${slug}`);
      const json = await res.json();
      if (res.ok && json.content) setContent(json.content);
    })();
  }, [slug]);

  async function save() {
    if (!content) return;
    setSaving(true);
    setStatus("Saving…");
    try {
      const res = await fetch(`/api/orbit/content/editorial?slug=${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        throw new Error(parsed.text);
      }
      const json = (await res.json()) as { content?: CmsEditorialPageContent };
      if (json.content) setContent(json.content);
      setStatus(`Saved — live on ${meta?.path ?? slug}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!content) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-16">
      <div>
        <h1 className="text-2xl font-bold">{meta?.label}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Public URL:{" "}
          <Link
            href={meta?.path ?? "/"}
            className="font-semibold text-[#673de6]"
          >
            {meta?.path}
          </Link>
        </p>
      </div>
      {(
        [
          ["seoTitle", "SEO title"],
          ["seoDescription", "SEO description"],
          ["keywords", "Keywords"],
          ["eyebrow", "Eyebrow"],
          ["heroTitle", "Hero title"],
          ["heroLead", "Hero lead"],
        ] as const
      ).map(([key, label]) => (
        <label
          key={key}
          className="block text-xs font-semibold tracking-wide text-slate-500 uppercase"
        >
          {label}
          {key === "seoDescription" || key === "heroLead" ? (
            <textarea
              className={inputClass}
              rows={key === "heroLead" ? 4 : 3}
              value={content[key]}
              onChange={(e) =>
                setContent({ ...content, [key]: e.target.value })
              }
            />
          ) : (
            <input
              className={inputClass}
              value={content[key]}
              onChange={(e) =>
                setContent({ ...content, [key]: e.target.value })
              }
            />
          )}
        </label>
      ))}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Primary CTA label
          <input
            className={inputClass}
            value={content.primaryCta.label}
            onChange={(e) =>
              setContent({
                ...content,
                primaryCta: { ...content.primaryCta, label: e.target.value },
              })
            }
          />
        </label>
        <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Primary CTA href
          <input
            className={inputClass}
            value={content.primaryCta.href}
            onChange={(e) =>
              setContent({
                ...content,
                primaryCta: { ...content.primaryCta, href: e.target.value },
              })
            }
          />
        </label>
        <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Secondary CTA label
          <input
            className={inputClass}
            value={content.secondaryCta.label}
            onChange={(e) =>
              setContent({
                ...content,
                secondaryCta: {
                  ...content.secondaryCta,
                  label: e.target.value,
                },
              })
            }
          />
        </label>
        <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Secondary CTA href
          <input
            className={inputClass}
            value={content.secondaryCta.href}
            onChange={(e) =>
              setContent({
                ...content,
                secondaryCta: { ...content.secondaryCta, href: e.target.value },
              })
            }
          />
        </label>
      </div>
      {content.sections.map((section, index) => (
        <div
          key={section.id}
          className="rounded-2xl border border-slate-200 bg-white p-4"
        >
          <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
            Section {index + 1}
          </p>
          <input
            className={inputClass}
            value={section.title}
            onChange={(e) => {
              const sections = content.sections.slice();
              sections[index] = { ...section, title: e.target.value };
              setContent({ ...content, sections });
            }}
          />
          <textarea
            className={inputClass}
            rows={6}
            value={section.body}
            onChange={(e) => {
              const sections = content.sections.slice();
              sections[index] = { ...section, body: e.target.value };
              setContent({ ...content, sections });
            }}
          />
          <textarea
            className={inputClass}
            rows={3}
            placeholder="One bullet per line"
            value={section.bullets.join("\n")}
            onChange={(e) => {
              const sections = content.sections.slice();
              sections[index] = {
                ...section,
                bullets: e.target.value.split("\n"),
              };
              setContent({ ...content, sections });
            }}
          />
        </div>
      ))}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
          FAQs
        </p>
        {content.faqs.map((faq, index) => (
          <div key={faq.id} className="mt-3">
            <input
              className={inputClass}
              value={faq.question}
              onChange={(e) => {
                const faqs = content.faqs.slice();
                faqs[index] = { ...faq, question: e.target.value };
                setContent({ ...content, faqs });
              }}
            />
            <textarea
              className={inputClass}
              rows={3}
              value={faq.answer}
              onChange={(e) => {
                const faqs = content.faqs.slice();
                faqs[index] = { ...faq, answer: e.target.value };
                setContent({ ...content, faqs });
              }}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={saving}
        onClick={() => void save()}
        className="rounded-xl bg-[#2f1c6a] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        Save page
      </button>
      {status ? <p className="text-sm text-slate-600">{status}</p> : null}
    </div>
  );
}
