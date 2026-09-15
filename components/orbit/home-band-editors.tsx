"use client";

import { OrbitImageField } from "@/components/orbit/image-field";
import type {
  CmsCloseCtaContent,
  CmsProofContent,
  CmsProofQuote,
  CmsStoryBandContent,
  CmsStorySlide,
} from "@/lib/orbit/defaults";

export function StoryBandEditor({
  title,
  hint,
  value,
  onChange,
  onPersist,
}: {
  title: string;
  hint: string;
  value: CmsStoryBandContent;
  onChange: (value: CmsStoryBandContent) => void;
  onPersist?: (value: CmsStoryBandContent) => void;
}) {
  function patch(next: Partial<CmsStoryBandContent>, persist = false) {
    const merged = { ...value, ...next };
    onChange(merged);
    if (persist) onPersist?.(merged);
  }

  function updateSlide(
    index: number,
    next: Partial<CmsStorySlide>,
    persist = false,
  ) {
    const slides = [...value.slides];
    slides[index] = { ...slides[index], ...next };
    patch({ slides }, persist);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={value.imageFirst}
              onChange={(event) =>
                patch({ imageFirst: event.target.checked }, true)
              }
            />
            Image on left
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={value.visible}
              onChange={(event) =>
                patch({ visible: event.target.checked }, true)
              }
            />
            Visible
          </label>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Eyebrow"
          value={value.eyebrow}
          onChange={(eyebrow) => patch({ eyebrow })}
        />
        <Field
          label="Heading"
          value={value.heading}
          onChange={(heading) => patch({ heading })}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Slides
        </p>
        <button
          type="button"
          onClick={() =>
            patch(
              {
                slides: [
                  ...value.slides,
                  {
                    id: `slide-${Date.now()}`,
                    visible: true,
                    order: value.slides.length,
                    label: "New",
                    title: "Headline",
                    body: "Body copy.",
                    ctaLabel: "Learn more",
                    ctaHref: "/",
                    image: "",
                    alt: "",
                  },
                ],
              },
              true,
            )
          }
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
        >
          Add slide
        </button>
      </div>
      {value.slides.map((slide, index) => (
        <div key={slide.id} className="rounded-xl border border-slate-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-600">
              Slide {index + 1} · {slide.label}
            </p>
            <div className="flex gap-2">
              <label className="flex items-center gap-1 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={slide.visible}
                  onChange={(event) =>
                    updateSlide(index, { visible: event.target.checked }, true)
                  }
                />
                Active
              </label>
              <button
                type="button"
                onClick={() =>
                  patch(
                    { slides: value.slides.filter((_, i) => i !== index) },
                    true,
                  )
                }
                className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Tab label"
              value={slide.label}
              onChange={(label) => updateSlide(index, { label })}
            />
            <Field
              label="Headline"
              value={slide.title}
              onChange={(title) => updateSlide(index, { title })}
            />
            <Field
              label="Body"
              value={slide.body}
              onChange={(body) => updateSlide(index, { body })}
            />
            <Field
              label="Link label"
              value={slide.ctaLabel}
              onChange={(ctaLabel) => updateSlide(index, { ctaLabel })}
            />
            <Field
              label="Link URL"
              value={slide.ctaHref}
              onChange={(ctaHref) => updateSlide(index, { ctaHref })}
            />
            <Field
              label="Image alt"
              value={slide.alt}
              onChange={(alt) => updateSlide(index, { alt })}
            />
          </div>
          <div className="mt-3">
            <OrbitImageField
              label="Slide image"
              value={slide.image}
              onChange={(image) => updateSlide(index, { image })}
              onCommit={(image) => updateSlide(index, { image }, true)}
            />
          </div>
        </div>
      ))}
    </section>
  );
}

export function ProofEditor({
  value,
  onChange,
  onPersist,
}: {
  value: CmsProofContent;
  onChange: (value: CmsProofContent) => void;
  onPersist?: (value: CmsProofContent) => void;
}) {
  function patch(next: Partial<CmsProofContent>, persist = false) {
    const merged = { ...value, ...next };
    onChange(merged);
    if (persist) onPersist?.(merged);
  }

  function updateQuote(
    index: number,
    next: Partial<CmsProofQuote>,
    persist = false,
  ) {
    const quotes = [...value.quotes];
    quotes[index] = { ...quotes[index], ...next };
    patch({ quotes }, persist);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Customer proof slider</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Quotes, names, roles, and photos.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={value.visible}
            onChange={(event) => patch({ visible: event.target.checked }, true)}
          />
          Visible
        </label>
      </div>
      <Field
        label="Title"
        value={value.title}
        onChange={(title) => patch({ title })}
      />
      {value.quotes.map((quote, index) => (
        <div key={quote.id} className="rounded-xl border border-slate-200 p-3">
          <p className="mb-2 text-xs font-medium text-slate-600">
            Quote {index + 1} · {quote.name}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Name"
              value={quote.name}
              onChange={(name) => updateQuote(index, { name })}
            />
            <Field
              label="Role"
              value={quote.role}
              onChange={(role) => updateQuote(index, { role })}
            />
          </div>
          <label className="mt-3 block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Quote
            <textarea
              value={quote.quote}
              onChange={(event) =>
                updateQuote(index, { quote: event.target.value })
              }
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
            />
          </label>
          <div className="mt-3">
            <OrbitImageField
              label="Photo"
              value={quote.image}
              onChange={(image) => updateQuote(index, { image })}
              onCommit={(image) => updateQuote(index, { image }, true)}
            />
          </div>
        </div>
      ))}
    </section>
  );
}

export function CloseCtaEditor({
  value,
  onChange,
  onPersist,
}: {
  value: CmsCloseCtaContent;
  onChange: (value: CmsCloseCtaContent) => void;
  onPersist?: (value: CmsCloseCtaContent) => void;
}) {
  function patch(next: Partial<CmsCloseCtaContent>, persist = false) {
    const merged = { ...value, ...next };
    onChange(merged);
    if (persist) onPersist?.(merged);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Closing CTA band</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Purple-blue closer above FAQs.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={value.visible}
            onChange={(event) => patch({ visible: event.target.checked }, true)}
          />
          Visible
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Title"
          value={value.title}
          onChange={(title) => patch({ title })}
        />
        <Field
          label="Button label"
          value={value.ctaLabel}
          onChange={(ctaLabel) => patch({ ctaLabel })}
        />
        <Field
          label="Button URL"
          value={value.ctaHref}
          onChange={(ctaHref) => patch({ ctaHref })}
        />
        <Field
          label="Trust line"
          value={value.trust}
          onChange={(trust) => patch({ trust })}
        />
      </div>
      <Field
        label="Description"
        value={value.description}
        onChange={(description) => patch({ description })}
      />
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none"
      />
    </label>
  );
}
