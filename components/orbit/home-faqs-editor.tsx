"use client";

import type {
  CmsFaqGroup,
  CmsFaqItem,
  CmsHomeFaqsContent,
} from "@/lib/orbit/defaults";

type Props = {
  value: CmsHomeFaqsContent;
  onChange: (value: CmsHomeFaqsContent) => void;
  onPersist?: (value: CmsHomeFaqsContent) => void;
};

export function HomeFaqsEditor({ value, onChange, onPersist }: Props) {
  function patch(next: Partial<CmsHomeFaqsContent>, persist = false) {
    const merged = { ...value, ...next };
    onChange(merged);
    if (persist) onPersist?.(merged);
  }

  function updateGroups(groups: CmsFaqGroup[], persist = false) {
    patch({ groups }, persist);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">FAQs section</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Hosting and SEO questions under Why Choose. Homepage shows the
            preview count; View All reveals the rest. Full answers are stored
            for SEO.
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
          label="CTA label"
          value={value.ctaLabel}
          onChange={(ctaLabel) => patch({ ctaLabel })}
        />
        <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Preview count (per column)
          <input
            type="number"
            min={1}
            max={20}
            value={value.previewCount}
            onChange={(event) =>
              patch({ previewCount: Number(event.target.value) || 5 }, true)
            }
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
          />
        </label>
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
          FAQ groups
        </p>
        <button
          type="button"
          onClick={() =>
            updateGroups(
              [
                ...value.groups,
                {
                  id: `faq-group-${Date.now()}`,
                  visible: true,
                  order: value.groups.length,
                  title: "New FAQ group",
                  icon: "layers",
                  items: [],
                },
              ],
              true,
            )
          }
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
        >
          Add group
        </button>
      </div>

      <div className="space-y-4">
        {value.groups.map((group, groupIndex) => (
          <div
            key={group.id}
            className="rounded-xl border border-slate-200 p-3"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-600">
                Group {groupIndex + 1}
              </p>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-1 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={group.visible}
                    onChange={(event) => {
                      const groups = [...value.groups];
                      groups[groupIndex] = {
                        ...group,
                        visible: event.target.checked,
                      };
                      updateGroups(groups, true);
                    }}
                  />
                  Active
                </label>
                <button
                  type="button"
                  onClick={() =>
                    updateGroups(
                      value.groups.filter((_, i) => i !== groupIndex),
                      true,
                    )
                  }
                  className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600"
                >
                  Delete group
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Group title"
                value={group.title}
                onChange={(title) => {
                  const groups = [...value.groups];
                  groups[groupIndex] = { ...group, title };
                  updateGroups(groups);
                }}
              />
              <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Icon
                <select
                  value={group.icon}
                  onChange={(event) => {
                    const groups = [...value.groups];
                    groups[groupIndex] = {
                      ...group,
                      icon: event.target.value === "chart" ? "chart" : "layers",
                    };
                    updateGroups(groups, true);
                  }}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                >
                  <option value="layers">layers (hosting)</option>
                  <option value="chart">chart (SEO)</option>
                </select>
              </label>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Questions
              </p>
              <button
                type="button"
                onClick={() => {
                  const groups = [...value.groups];
                  const items: CmsFaqItem[] = [
                    ...group.items,
                    {
                      id: `faq-${Date.now()}`,
                      visible: true,
                      order: group.items.length,
                      question: "New question?",
                      answer:
                        "Write a full answer visitors and search engines can use.",
                    },
                  ];
                  groups[groupIndex] = { ...group, items };
                  updateGroups(groups, true);
                }}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                Add question
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {group.items.map((item, itemIndex) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-slate-500">Q{itemIndex + 1}</p>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1 text-xs text-slate-500">
                        <input
                          type="checkbox"
                          checked={item.visible}
                          onChange={(event) => {
                            const groups = [...value.groups];
                            const items = [...group.items];
                            items[itemIndex] = {
                              ...item,
                              visible: event.target.checked,
                            };
                            groups[groupIndex] = { ...group, items };
                            updateGroups(groups, true);
                          }}
                        />
                        Active
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (itemIndex === 0) return;
                          const items = [...group.items];
                          [items[itemIndex - 1], items[itemIndex]] = [
                            items[itemIndex],
                            items[itemIndex - 1],
                          ];
                          const groups = [...value.groups];
                          groups[groupIndex] = {
                            ...group,
                            items: items.map((entry, order) => ({
                              ...entry,
                              order,
                            })),
                          };
                          updateGroups(groups, true);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (itemIndex === group.items.length - 1) return;
                          const items = [...group.items];
                          [items[itemIndex + 1], items[itemIndex]] = [
                            items[itemIndex],
                            items[itemIndex + 1],
                          ];
                          const groups = [...value.groups];
                          groups[groupIndex] = {
                            ...group,
                            items: items.map((entry, order) => ({
                              ...entry,
                              order,
                            })),
                          };
                          updateGroups(groups, true);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const groups = [...value.groups];
                          groups[groupIndex] = {
                            ...group,
                            items: group.items.filter(
                              (_, i) => i !== itemIndex,
                            ),
                          };
                          updateGroups(groups, true);
                        }}
                        className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <Field
                    label="Question"
                    value={item.question}
                    onChange={(question) => {
                      const groups = [...value.groups];
                      const items = [...group.items];
                      items[itemIndex] = { ...item, question };
                      groups[groupIndex] = { ...group, items };
                      updateGroups(groups);
                    }}
                  />
                  <label className="mt-3 block text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Answer
                    <textarea
                      value={item.answer}
                      onChange={(event) => {
                        const groups = [...value.groups];
                        const items = [...group.items];
                        items[itemIndex] = {
                          ...item,
                          answer: event.target.value,
                        };
                        groups[groupIndex] = { ...group, items };
                        updateGroups(groups);
                      }}
                      rows={5}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                    />
                  </label>
                </div>
              ))}
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
