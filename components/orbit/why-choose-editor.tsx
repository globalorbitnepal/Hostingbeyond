"use client";

import type {
  CmsWhyChooseContent,
  CmsWhyChooseIcon,
  CmsWhyChooseItem,
} from "@/lib/orbit/defaults";

const ICONS: CmsWhyChooseIcon[] = [
  "zap",
  "shield",
  "database",
  "globe",
  "lock",
  "mouse",
  "wordpress",
  "chart",
  "mail",
  "cloud",
  "code",
  "secure",
  "layers",
  "headphones",
  "star",
];

type Props = {
  value: CmsWhyChooseContent;
  onChange: (value: CmsWhyChooseContent) => void;
  onPersist?: (value: CmsWhyChooseContent) => void;
};

export function WhyChooseEditor({ value, onChange, onPersist }: Props) {
  function patch(next: Partial<CmsWhyChooseContent>, persist = false) {
    const merged = { ...value, ...next };
    onChange(merged);
    if (persist) onPersist?.(merged);
  }

  function updateItems(items: CmsWhyChooseItem[], persist = false) {
    patch({ items }, persist);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Why Choose section</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Cards under AI Assistant — add, edit, reorder, or hide any item.
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
          label="Handwritten note"
          value={value.handwrittenNote}
          onChange={(handwrittenNote) => patch({ handwrittenNote })}
        />
      </div>
      <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
        Description
        <textarea
          value={value.description}
          onChange={(event) => patch({ description: event.target.value })}
          rows={2}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
        />
      </label>

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Cards
        </p>
        <button
          type="button"
          onClick={() =>
            updateItems(
              [
                ...value.items,
                {
                  id: `why-${Date.now()}`,
                  visible: true,
                  order: value.items.length,
                  title: "New reason",
                  description: "Describe this HostingBeyond advantage.",
                  icon: "star",
                },
              ],
              true,
            )
          }
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
        >
          Add card
        </button>
      </div>

      <div className="space-y-3">
        {value.items.map((item, index) => (
          <div key={item.id} className="rounded-xl border border-slate-200 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-600">
                Card {index + 1}
              </p>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-1 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={(event) => {
                      const items = [...value.items];
                      items[index] = {
                        ...item,
                        visible: event.target.checked,
                      };
                      updateItems(items, true);
                    }}
                  />
                  Active
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (index === 0) return;
                    const items = [...value.items];
                    [items[index - 1], items[index]] = [
                      items[index],
                      items[index - 1],
                    ];
                    updateItems(
                      items.map((entry, order) => ({ ...entry, order })),
                      true,
                    );
                  }}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                >
                  Move up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (index === value.items.length - 1) return;
                    const items = [...value.items];
                    [items[index + 1], items[index]] = [
                      items[index],
                      items[index + 1],
                    ];
                    updateItems(
                      items.map((entry, order) => ({ ...entry, order })),
                      true,
                    );
                  }}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                >
                  Move down
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateItems(
                      value.items.filter((_, i) => i !== index),
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
                label="Title"
                value={item.title}
                onChange={(title) => {
                  const items = [...value.items];
                  items[index] = { ...item, title };
                  updateItems(items);
                }}
              />
              <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Icon
                <select
                  value={item.icon}
                  onChange={(event) => {
                    const items = [...value.items];
                    items[index] = {
                      ...item,
                      icon: event.target.value as CmsWhyChooseIcon,
                    };
                    updateItems(items, true);
                  }}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                >
                  {ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="mt-3 block text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Description
              <textarea
                value={item.description}
                onChange={(event) => {
                  const items = [...value.items];
                  items[index] = { ...item, description: event.target.value };
                  updateItems(items);
                }}
                rows={3}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
              />
            </label>
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
