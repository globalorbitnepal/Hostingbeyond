"use client";

import { OrbitImageField } from "@/components/orbit/image-field";
import type { CmsAiAssistantContent } from "@/lib/orbit/defaults";

type Props = {
  value: CmsAiAssistantContent;
  onChange: (value: CmsAiAssistantContent) => void;
  onPersist?: (value: CmsAiAssistantContent) => void;
};

export function AiAssistantEditor({ value, onChange, onPersist }: Props) {
  function patch(next: Partial<CmsAiAssistantContent>, persist = false) {
    const merged = { ...value, ...next };
    onChange(merged);
    if (persist) onPersist?.(merged);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">AI Assistant section</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Homepage block under Business Email — chat preview and portrait.
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
          label="Bot name"
          value={value.botName}
          onChange={(botName) => patch({ botName })}
        />
        <Field
          label="Hello title"
          value={value.helloTitle}
          onChange={(helloTitle) => patch({ helloTitle })}
        />
        <Field
          label="Hello subtitle"
          value={value.helloSubtitle}
          onChange={(helloSubtitle) => patch({ helloSubtitle })}
        />
        <Field
          label="Primary CTA"
          value={value.primaryCtaLabel}
          onChange={(primaryCtaLabel) => patch({ primaryCtaLabel })}
        />
        <Field
          label="Primary CTA URL"
          value={value.primaryCtaHref}
          onChange={(primaryCtaHref) => patch({ primaryCtaHref })}
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
