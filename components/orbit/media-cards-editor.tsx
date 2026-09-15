"use client";

import { OrbitImageField } from "@/components/orbit/image-field";
import type { CmsMediaCard } from "@/lib/orbit/defaults";

export function MediaCardsEditor({
  title,
  hint,
  visible,
  heading,
  description,
  cards,
  onVisible,
  onHeading,
  onDescription,
  onCards,
  addLabel = "Add card",
}: {
  title: string;
  hint: string;
  visible: boolean;
  heading: string;
  description: string;
  cards: CmsMediaCard[];
  onVisible: (visible: boolean) => void;
  onHeading: (value: string) => void;
  onDescription: (value: string) => void;
  onCards: (cards: CmsMediaCard[], persist?: boolean) => void;
  addLabel?: string;
}) {
  function update(index: number, next: Partial<CmsMediaCard>, persist = false) {
    const copy = [...cards];
    copy[index] = { ...copy[index], ...next };
    onCards(copy, persist);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= cards.length) return;
    const copy = [...cards];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onCards(
      copy.map((card, order) => ({ ...card, order })),
      true,
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={visible}
            onChange={(event) => onVisible(event.target.checked)}
          />
          Visible
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Section title
          <input
            value={heading}
            onChange={(event) => onHeading(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none"
          />
        </label>
        <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Description
          <input
            value={description}
            onChange={(event) => onDescription(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none"
          />
        </label>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Cards
        </p>
        <button
          type="button"
          onClick={() =>
            onCards(
              [
                ...cards,
                {
                  id: `card-${Date.now()}`,
                  visible: true,
                  order: cards.length,
                  title: "New card",
                  body: "Describe this card.",
                  image: "",
                  alt: "",
                  ctaLabel: "Learn more",
                  ctaHref: "/",
                },
              ],
              true,
            )
          }
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
        >
          {addLabel}
        </button>
      </div>
      <div className="space-y-3">
        {cards.map((card, index) => (
          <div key={card.id} className="rounded-xl border border-slate-200 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-600">
                Card {index + 1} · {card.title}
              </p>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-1 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={card.visible}
                    onChange={(event) =>
                      update(index, { visible: event.target.checked }, true)
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
                    onCards(
                      cards.filter((_, i) => i !== index),
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
                value={card.title}
                onChange={(title) => update(index, { title })}
              />
              <Field
                label="Body"
                value={card.body}
                onChange={(body) => update(index, { body })}
              />
              <Field
                label="Link label"
                value={card.ctaLabel}
                onChange={(ctaLabel) => update(index, { ctaLabel })}
              />
              <Field
                label="Link URL"
                value={card.ctaHref}
                onChange={(ctaHref) => update(index, { ctaHref })}
              />
              <Field
                label="Image alt"
                value={card.alt}
                onChange={(alt) => update(index, { alt })}
              />
            </div>
            <div className="mt-3">
              <OrbitImageField
                label="Card image"
                value={card.image}
                onChange={(image) => update(index, { image })}
                onCommit={(image) => update(index, { image }, true)}
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
        className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none"
      />
    </label>
  );
}
