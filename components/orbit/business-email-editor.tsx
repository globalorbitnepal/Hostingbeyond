"use client";

import { OrbitImageField } from "@/components/orbit/image-field";
import type {
  CmsBusinessEmailContent,
  CmsBusinessEmailFeature,
  CmsBusinessEmailHighlight,
  CmsBusinessEmailMessage,
  CmsBusinessEmailStat,
} from "@/lib/orbit/defaults";

type Props = {
  value: CmsBusinessEmailContent;
  onChange: (value: CmsBusinessEmailContent) => void;
  onPersist?: (value: CmsBusinessEmailContent) => void;
};

export function BusinessEmailEditor({ value, onChange, onPersist }: Props) {
  function patch(next: Partial<CmsBusinessEmailContent>, persist = false) {
    const merged = { ...value, ...next };
    onChange(merged);
    if (persist) onPersist?.(merged);
  }

  function updateHighlight(
    index: number,
    nextHighlight: Partial<CmsBusinessEmailHighlight>,
  ) {
    const highlights = [...value.highlights];
    highlights[index] = { ...highlights[index], ...nextHighlight };
    patch({ highlights });
  }

  function updateMessage(
    index: number,
    nextMessage: Partial<CmsBusinessEmailMessage>,
  ) {
    const messages = [...value.messages];
    messages[index] = { ...messages[index], ...nextMessage };
    patch({ messages });
  }

  function updateStat(index: number, nextStat: Partial<CmsBusinessEmailStat>) {
    const stats = [...value.stats];
    stats[index] = { ...stats[index], ...nextStat };
    patch({ stats });
  }

  function updateFeature(
    index: number,
    nextFeature: Partial<CmsBusinessEmailFeature>,
  ) {
    const features = [...value.features];
    features[index] = { ...features[index], ...nextFeature };
    patch({ features });
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Business Email section</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Homepage block under Beyond AI. The right collage (woman, world map,
            Global Mail) is the uploaded stage image.
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
          label="Badge"
          value={value.badge}
          onChange={(badge) => patch({ badge })}
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
          label="Toast email"
          value={value.toastEmail}
          onChange={(toastEmail) => patch({ toastEmail })}
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
          label="Mail app title"
          value={value.mailTitle}
          onChange={(mailTitle) => patch({ mailTitle })}
        />
        <Field
          label="Compose label"
          value={value.composeLabel}
          onChange={(composeLabel) => patch({ composeLabel })}
        />
        <Field
          label="Handwritten note"
          value={value.handwrittenNote}
          onChange={(handwrittenNote) => patch({ handwrittenNote })}
        />
        <Field
          label="Image alt"
          value={value.imageAlt}
          onChange={(imageAlt) => patch({ imageAlt })}
        />
      </div>

      <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
        Description
        <textarea
          value={value.description}
          onChange={(event) => patch({ description: event.target.value })}
          rows={3}
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
            <Field
              key={item.id}
              label={`Highlight ${index + 1}`}
              value={item.title}
              onChange={(title) => updateHighlight(index, { title })}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-800">Inbox messages</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {value.messages.map((item, index) => (
            <div
              key={item.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3"
            >
              <Field
                label="Sender"
                value={item.sender}
                onChange={(sender) => updateMessage(index, { sender })}
              />
              <Field
                label="Preview"
                value={item.preview}
                onChange={(preview) => updateMessage(index, { preview })}
              />
              <Field
                label="Time"
                value={item.time}
                onChange={(time) => updateMessage(index, { time })}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-800">Stat chips</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {value.stats.map((item, index) => (
            <div
              key={item.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3"
            >
              <Field
                label="Title"
                value={item.title}
                onChange={(title) => updateStat(index, { title })}
              />
              <Field
                label="Subtitle"
                value={item.subtitle}
                onChange={(subtitle) => updateStat(index, { subtitle })}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-800">Bottom bar</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {value.features.map((item, index) => (
            <Field
              key={item.id}
              label={`Feature ${index + 1}`}
              value={item.title}
              onChange={(title) => updateFeature(index, { title })}
            />
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
