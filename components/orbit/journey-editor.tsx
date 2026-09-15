"use client";

import { OrbitImageField } from "@/components/orbit/image-field";
import type { CmsJourneyContent, CmsJourneySlide } from "@/lib/orbit/defaults";

type Props = {
  value: CmsJourneyContent;
  onChange: (value: CmsJourneyContent) => void;
  onPersist?: (value: CmsJourneyContent) => void;
};

export function JourneyEditor({ value, onChange, onPersist }: Props) {
  function patch(next: Partial<CmsJourneyContent>, persist = false) {
    const merged = { ...value, ...next };
    onChange(merged);
    if (persist) onPersist?.(merged);
  }

  function updateSlides(slides: CmsJourneySlide[], persist = false) {
    patch({ slides }, persist);
  }

  function updateSlide(
    index: number,
    next: Partial<CmsJourneySlide>,
    persist = false,
  ) {
    const slides = [...value.slides];
    slides[index] = { ...slides[index], ...next };
    updateSlides(slides, persist);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.slides.length) return;
    const slides = [...value.slides];
    [slides[index], slides[target]] = [slides[target], slides[index]];
    updateSlides(
      slides.map((slide, order) => ({ ...slide, order })),
      true,
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Journey strip (under hero)</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Glass stage under the hero (Build / domain / shop / AI). Tab labels,
            copy, links, and optional photos for the first two cards.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-500">
            Autoplay seconds
            <input
              type="number"
              min={1.5}
              step={0.2}
              value={value.autoplaySeconds}
              onChange={(event) =>
                patch({ autoplaySeconds: Number(event.target.value) })
              }
              onBlur={() => onPersist?.(value)}
              className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-900 outline-none"
            />
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

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Slides
        </p>
        <button
          type="button"
          onClick={() =>
            updateSlides(
              [
                ...value.slides,
                {
                  id: `journey-${Date.now()}`,
                  visible: true,
                  order: value.slides.length,
                  label: "New step",
                  title: "Headline for this step.",
                  body: "One line that explains the step.",
                  badge: "",
                  image: "",
                  imagePosition: "50% 50%",
                  alt: "HostingBeyond customers at work",
                  ctaLabel: "Learn more",
                  ctaHref: "/hosting",
                },
              ],
              true,
            )
          }
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
        >
          Add slide
        </button>
      </div>

      <div className="space-y-3">
        {value.slides.map((slide, index) => (
          <div
            key={slide.id}
            className="rounded-xl border border-slate-200 p-3"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-600">
                Slide {index + 1} · {slide.label}
              </p>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-1 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={slide.visible}
                    onChange={(event) =>
                      updateSlide(
                        index,
                        { visible: event.target.checked },
                        true,
                      )
                    }
                  />
                  Active
                </label>
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                >
                  Move up
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                >
                  Move down
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateSlides(
                      value.slides.filter((_, i) => i !== index),
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
                label="Badge on image (optional)"
                value={slide.badge}
                onChange={(badge) => updateSlide(index, { badge })}
              />
              <Field
                label="Headline"
                value={slide.title}
                onChange={(title) => updateSlide(index, { title })}
              />
              <Field
                label="Body line"
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
                label="Image alt text"
                value={slide.alt}
                onChange={(alt) => updateSlide(index, { alt })}
              />
              <Field
                label="Image crop position (e.g. 50% 40%)"
                value={slide.imagePosition}
                onChange={(imagePosition) =>
                  updateSlide(index, { imagePosition })
                }
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
      </div>
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
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
      />
    </label>
  );
}
