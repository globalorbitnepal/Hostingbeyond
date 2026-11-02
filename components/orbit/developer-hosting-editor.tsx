"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Plus, Save, Trash2 } from "lucide-react";

import type {
  CmsDeveloperHostingContent,
  DeveloperFaq,
  DeveloperFeature,
  DeveloperUseCase,
} from "@/lib/orbit/developer-hosting-content";
import { readResponseError } from "@/lib/orbit/read-response-error";

const STACKS: Array<{ key: string; label: string; path: string }> = [
  { key: "nodejs-hosting", label: "Node.js", path: "/nodejs-hosting" },
  { key: "python-hosting", label: "Python", path: "/web-hosting/python" },
  { key: "laravel-hosting", label: "Laravel", path: "/laravel-hosting" },
  { key: "django-hosting", label: "Django", path: "/django-hosting" },
  { key: "nestjs-hosting", label: "NestJS", path: "/nestjs-hosting" },
];

const TABS = [
  "Hero",
  "Benefits",
  "Features",
  "Use cases",
  "Pricing",
  "FAQ",
  "CTA",
] as const;
type Tab = (typeof TABS)[number];

function Field({
  label,
  value,
  onChange,
  rows,
  hint,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase">
      {label}
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
        />
      )}
      {hint ? (
        <span className="mt-1 block text-[10px] font-normal text-slate-400 normal-case">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function DeveloperHostingEditor({ stack }: { stack: string }) {
  const [activeStack, setActiveStack] = useState(stack);
  const [tab, setTab] = useState<Tab>("Hero");
  const [content, setContent] = useState<CmsDeveloperHostingContent | null>(
    null,
  );
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (key: string) => {
    setStatus("");
    setError("");
    setContent(null);
    const res = await fetch(`/api/orbit/developer-hosting?stack=${key}`);
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Could not load page content.");
      return;
    }
    setContent(json.content as CmsDeveloperHostingContent);
  }, []);

  useEffect(() => {
    void load(activeStack);
  }, [activeStack, load]);

  function patch(partial: Partial<CmsDeveloperHostingContent>) {
    setContent((current) => (current ? { ...current, ...partial } : current));
  }

  async function save() {
    if (!content) return;
    setSaving(true);
    setError("");
    setStatus("Saving…");
    try {
      const res = await fetch("/api/orbit/developer-hosting", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stack: activeStack, content }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        throw new Error(parsed.text);
      }
      setStatus("Saved — the public page updates within seconds.");
    } catch (err) {
      setStatus("");
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const meta = STACKS.find((entry) => entry.key === activeStack);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Developer Hosting</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Edit the technology-specific content for the five developer hosting
          pages. Plan prices and resources come from Hosting Plans and are not
          duplicated here.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STACKS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            onClick={() => setActiveStack(entry.key)}
            className={
              activeStack === entry.key
                ? "rounded-full bg-[#2f1c6a] px-3 py-1.5 text-xs font-semibold text-white"
                : "rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
            }
          >
            {entry.label}
          </button>
        ))}
      </div>

      {meta ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
          <a
            href={meta.path}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[var(--hb-blue)]"
          >
            {meta.path}
            <ExternalLink className="size-3.5" />
          </a>
          <Link
            href={`/orbit/hosting-products?search=${encodeURIComponent(activeStack)}`}
            className="text-slate-600 underline"
          >
            Edit {meta.label} plans & pricing
          </Link>
          <Link href="/orbit/pages" className="text-slate-600 underline">
            SEO settings
          </Link>
          <button
            type="button"
            disabled={saving || !content}
            onClick={() => void save()}
            className="ml-auto inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Save className="size-4" />
            {saving ? "Saving…" : "Save page"}
          </button>
        </div>
      ) : null}

      {status ? (
        <p className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <CheckCircle2 className="size-4" />
          {status}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {TABS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setTab(label)}
            className={
              tab === label
                ? "rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white"
                : "rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {!content ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          {tab === "Hero" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Eyebrow"
                value={content.heroEyebrow}
                onChange={(v) => patch({ heroEyebrow: v })}
              />
              <Field
                label="Promo pill"
                value={content.heroPromo}
                onChange={(v) => patch({ heroPromo: v })}
              />
              <Field
                label="H1 title"
                value={content.heroTitle}
                onChange={(v) => patch({ heroTitle: v })}
              />
              <Field
                label="H1 accent"
                value={content.heroTitleAccent}
                onChange={(v) => patch({ heroTitleAccent: v })}
              />
              <div className="sm:col-span-2">
                <Field
                  label="Hero description"
                  rows={3}
                  value={content.heroDescription}
                  onChange={(v) => patch({ heroDescription: v })}
                />
              </div>
              <Field
                label="Primary CTA label"
                value={content.heroPrimaryLabel}
                onChange={(v) => patch({ heroPrimaryLabel: v })}
              />
              <Field
                label="Primary CTA link"
                value={content.heroPrimaryHref}
                onChange={(v) => patch({ heroPrimaryHref: v })}
              />
              <Field
                label="Secondary CTA label"
                value={content.heroSecondaryLabel}
                onChange={(v) => patch({ heroSecondaryLabel: v })}
              />
              <Field
                label="Secondary CTA link"
                value={content.heroSecondaryHref}
                onChange={(v) => patch({ heroSecondaryHref: v })}
              />
              <div className="sm:col-span-2">
                <Field
                  label="Hero highlights (one per line)"
                  rows={4}
                  value={content.heroHighlights.join("\n")}
                  onChange={(v) =>
                    patch({
                      heroHighlights: v
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  hint="Only list capabilities that are actually available."
                />
              </div>
            </div>
          ) : null}

          {tab === "Benefits" ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Eyebrow"
                  value={content.benefitsEyebrow}
                  onChange={(v) => patch({ benefitsEyebrow: v })}
                />
                <Field
                  label="Heading"
                  value={content.benefitsHeading}
                  onChange={(v) => patch({ benefitsHeading: v })}
                />
              </div>
              <Field
                label="Description"
                rows={2}
                value={content.benefitsDescription}
                onChange={(v) => patch({ benefitsDescription: v })}
              />
              {content.benefits.map((item: DeveloperUseCase, index) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <Field
                    label={`Benefit ${index + 1} title`}
                    value={item.title}
                    onChange={(v) => {
                      const benefits = [...content.benefits];
                      benefits[index] = { ...item, title: v };
                      patch({ benefits });
                    }}
                  />
                  <div className="mt-2">
                    <Field
                      label="Description"
                      rows={2}
                      value={item.description}
                      onChange={(v) => {
                        const benefits = [...content.benefits];
                        benefits[index] = { ...item, description: v };
                        patch({ benefits });
                      }}
                    />
                  </div>
                </div>
              ))}
            </>
          ) : null}

          {tab === "Features" ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Eyebrow"
                  value={content.featuresEyebrow}
                  onChange={(v) => patch({ featuresEyebrow: v })}
                />
                <Field
                  label="Heading"
                  value={content.featuresHeading}
                  onChange={(v) => patch({ featuresHeading: v })}
                />
              </div>
              <Field
                label="Description"
                rows={2}
                value={content.featuresDescription}
                onChange={(v) => patch({ featuresDescription: v })}
              />
              {content.features.map((item: DeveloperFeature, index) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Field
                      label={`Feature ${index + 1} title`}
                      value={item.title}
                      onChange={(v) => {
                        const features = [...content.features];
                        features[index] = { ...item, title: v };
                        patch({ features });
                      }}
                    />
                    <label className="mt-6 flex shrink-0 items-center gap-1.5 text-xs font-semibold text-slate-600">
                      <input
                        type="checkbox"
                        checked={item.available !== false}
                        onChange={(e) => {
                          const features = [...content.features];
                          features[index] = {
                            ...item,
                            available: e.target.checked,
                          };
                          patch({ features });
                        }}
                      />
                      Available
                    </label>
                  </div>
                  <div className="mt-2">
                    <Field
                      label="Description"
                      rows={2}
                      value={item.description}
                      onChange={(v) => {
                        const features = [...content.features];
                        features[index] = { ...item, description: v };
                        patch({ features });
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Unchecked features render in the “Not available yet” panel.
                  </p>
                </div>
              ))}
            </>
          ) : null}

          {tab === "Use cases" ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Eyebrow"
                  value={content.useCasesEyebrow}
                  onChange={(v) => patch({ useCasesEyebrow: v })}
                />
                <Field
                  label="Heading"
                  value={content.useCasesHeading}
                  onChange={(v) => patch({ useCasesHeading: v })}
                />
              </div>
              <Field
                label="Description"
                rows={2}
                value={content.useCasesDescription}
                onChange={(v) => patch({ useCasesDescription: v })}
              />
              {content.useCases.map((item: DeveloperUseCase, index) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <Field
                    label={`Use case ${index + 1} title`}
                    value={item.title}
                    onChange={(v) => {
                      const useCases = [...content.useCases];
                      useCases[index] = { ...item, title: v };
                      patch({ useCases });
                    }}
                  />
                  <div className="mt-2">
                    <Field
                      label="Description"
                      rows={2}
                      value={item.description}
                      onChange={(v) => {
                        const useCases = [...content.useCases];
                        useCases[index] = { ...item, description: v };
                        patch({ useCases });
                      }}
                    />
                  </div>
                </div>
              ))}
            </>
          ) : null}

          {tab === "Pricing" ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Eyebrow"
                  value={content.pricingEyebrow}
                  onChange={(v) => patch({ pricingEyebrow: v })}
                />
                <Field
                  label="Title"
                  value={content.pricingTitle}
                  onChange={(v) => patch({ pricingTitle: v })}
                />
                <Field
                  label="Title accent"
                  value={content.pricingTitleAccent}
                  onChange={(v) => patch({ pricingTitleAccent: v })}
                />
                <Field
                  label="Comparison eyebrow"
                  value={content.comparisonEyebrow}
                  onChange={(v) => patch({ comparisonEyebrow: v })}
                />
              </div>
              <Field
                label="Pricing description"
                rows={2}
                value={content.pricingDescription}
                onChange={(v) => patch({ pricingDescription: v })}
              />
              <Field
                label="Pricing footnote"
                rows={2}
                value={content.pricingNote}
                onChange={(v) => patch({ pricingNote: v })}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Comparison heading"
                  value={content.comparisonHeading}
                  onChange={(v) => patch({ comparisonHeading: v })}
                />
                <Field
                  label="Comparison description"
                  value={content.comparisonDescription}
                  onChange={(v) => patch({ comparisonDescription: v })}
                />
              </div>
              <Field
                label="Plan selection bullets (one per line)"
                rows={5}
                value={content.comparisonBullets.join("\n")}
                onChange={(v) =>
                  patch({
                    comparisonBullets: v
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                Prices and resource limits are read live from Hosting Plans —
                edit them there so every page and checkout stays consistent.
              </p>
            </>
          ) : null}

          {tab === "FAQ" ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="FAQ heading"
                  value={content.faqHeading}
                  onChange={(v) => patch({ faqHeading: v })}
                />
                <Field
                  label="FAQ description"
                  value={content.faqDescription}
                  onChange={(v) => patch({ faqDescription: v })}
                />
              </div>
              {content.faqs.map((item: DeveloperFaq, index) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <Field
                        label={`Question ${index + 1}`}
                        value={item.question}
                        onChange={(v) => {
                          const faqs = [...content.faqs];
                          faqs[index] = { ...item, question: v };
                          patch({ faqs });
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        patch({
                          faqs: content.faqs.filter((_, i) => i !== index),
                        })
                      }
                      className="mt-6 rounded-lg p-1.5 text-slate-400 hover:text-red-600"
                      aria-label="Remove question"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-2">
                    <Field
                      label="Answer"
                      rows={3}
                      value={item.answer}
                      onChange={(v) => {
                        const faqs = [...content.faqs];
                        faqs[index] = { ...item, answer: v };
                        patch({ faqs });
                      }}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  patch({
                    faqs: [
                      ...content.faqs,
                      {
                        id: `faq-${Date.now()}`,
                        visible: true,
                        question: "",
                        answer: "",
                      },
                    ],
                  })
                }
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--hb-blue)]"
              >
                <Plus className="size-3.5" />
                Add question
              </button>
            </>
          ) : null}

          {tab === "CTA" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field
                  label="Closing heading"
                  value={content.closingHeading}
                  onChange={(v) => patch({ closingHeading: v })}
                />
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="Closing description"
                  rows={2}
                  value={content.closingDescription}
                  onChange={(v) => patch({ closingDescription: v })}
                />
              </div>
              <Field
                label="CTA label"
                value={content.closingCtaLabel}
                onChange={(v) => patch({ closingCtaLabel: v })}
              />
              <Field
                label="CTA link"
                value={content.closingCtaHref}
                onChange={(v) => patch({ closingCtaHref: v })}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
