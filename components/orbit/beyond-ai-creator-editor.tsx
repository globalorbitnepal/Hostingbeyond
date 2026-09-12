"use client";

import { OrbitImageField } from "@/components/orbit/image-field";
import type {
  CmsBeyondAiCreatorContent,
  CmsBeyondAiHighlight,
} from "@/lib/orbit/defaults";

const HIGHLIGHT_ICONS: CmsBeyondAiHighlight["icon"][] = [
  "zap",
  "cloud",
  "globe",
  "rocket",
];

type Props = {
  value: CmsBeyondAiCreatorContent;
  onChange: (value: CmsBeyondAiCreatorContent) => void;
  onPersist?: (value: CmsBeyondAiCreatorContent) => void;
};

export function BeyondAiCreatorEditor({ value, onChange, onPersist }: Props) {
  function patch(next: Partial<CmsBeyondAiCreatorContent>, persist = false) {
    const merged = { ...value, ...next };
    onChange(merged);
    if (persist) onPersist?.(merged);
  }

  function updateHighlight(
    index: number,
    nextHighlight: Partial<CmsBeyondAiHighlight>,
  ) {
    const highlights = [...value.highlights];
    highlights[index] = { ...highlights[index], ...nextHighlight };
    patch({ highlights });
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Beyond AI creator portrait</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Section under the builder dashboard — real person photo, no box.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={value.visible}
            onChange={(event) => patch({ visible: event.target.checked })}
          />
          Visible
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Eyebrow"
          value={value.eyebrow}
          onChange={(eyebrow) => patch({ eyebrow })}
        />
        <Field
          label="Title"
          value={value.title}
          onChange={(title) => patch({ title })}
        />
        <Field
          label="Title accent"
          value={value.titleAccent}
          onChange={(titleAccent) => patch({ titleAccent })}
        />
        <Field
          label="Image alt"
          value={value.imageAlt}
          onChange={(imageAlt) => patch({ imageAlt })}
        />
        <Field
          label="Primary CTA label"
          value={value.primaryCtaLabel}
          onChange={(primaryCtaLabel) => patch({ primaryCtaLabel })}
        />
        <Field
          label="Primary CTA URL"
          value={value.primaryCtaHref}
          onChange={(primaryCtaHref) => patch({ primaryCtaHref })}
        />
        <Field
          label="Secondary CTA label"
          value={value.secondaryCtaLabel}
          onChange={(secondaryCtaLabel) => patch({ secondaryCtaLabel })}
        />
        <Field
          label="Secondary CTA URL"
          value={value.secondaryCtaHref}
          onChange={(secondaryCtaHref) => patch({ secondaryCtaHref })}
        />
        <Field
          label="Trust line 1"
          value={value.trust1}
          onChange={(trust1) => patch({ trust1 })}
        />
        <Field
          label="Trust line 2"
          value={value.trust2}
          onChange={(trust2) => patch({ trust2 })}
        />
        <Field
          label="Trust line 3"
          value={value.trust3}
          onChange={(trust3) => patch({ trust3 })}
        />
      </div>

      <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
        Description
        <textarea
          value={value.description}
          onChange={(event) => patch({ description: event.target.value })}
          rows={4}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal tracking-normal text-slate-900 normal-case outline-none"
        />
      </label>

      <OrbitImageField
        label="Portrait image"
        value={value.imageUrl}
        onChange={(imageUrl) => patch({ imageUrl })}
        onCommit={(imageUrl) => patch({ imageUrl }, true)}
      />

      <div>
        <h3 className="text-sm font-semibold text-slate-800">Highlights</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {value.highlights.map((item, index) => (
            <div
              key={item.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3"
            >
              <Field
                label="Title"
                value={item.title}
                onChange={(title) => updateHighlight(index, { title })}
              />
              <Field
                label="Subtitle"
                value={item.subtitle}
                onChange={(subtitle) => updateHighlight(index, { subtitle })}
              />
              <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Icon
                <select
                  value={item.icon}
                  onChange={(event) =>
                    updateHighlight(index, {
                      icon: event.target.value as CmsBeyondAiHighlight["icon"],
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal tracking-normal text-slate-900 normal-case outline-none"
                >
                  {HIGHLIGHT_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>
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
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal tracking-normal text-slate-900 normal-case outline-none"
      />
    </label>
  );
}
