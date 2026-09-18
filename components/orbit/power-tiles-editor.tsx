"use client";

import { useRef } from "react";

import { OrbitImageField } from "@/components/orbit/image-field";
import type { CmsMediaCard, CmsPowerTilesContent } from "@/lib/orbit/defaults";

type Props = {
  value: CmsPowerTilesContent;
  onChange: (value: CmsPowerTilesContent) => void;
  onPersist?: (value: CmsPowerTilesContent) => void;
};

export function PowerTilesEditor({ value, onChange, onPersist }: Props) {
  const latest = useRef(value);
  latest.current = value;

  function patch(next: Partial<CmsPowerTilesContent>, persistNow = false) {
    const merged = { ...latest.current, ...next };
    latest.current = merged;
    onChange(merged);
    if (persistNow) onPersist?.(merged);
  }

  function persist() {
    onPersist?.(latest.current);
  }

  function updateTile(
    index: number,
    next: Partial<CmsMediaCard>,
    persistNow = false,
  ) {
    const tiles = [...latest.current.tiles];
    tiles[index] = { ...tiles[index], ...next };
    patch(
      { tiles: tiles.map((tile, order) => ({ ...tile, order })) },
      persistNow,
    );
  }

  function moveTile(index: number, direction: -1 | 1) {
    const target = index + direction;
    const tiles = [...latest.current.tiles];
    if (target < 0 || target >= tiles.length) return;
    const [item] = tiles.splice(index, 1);
    tiles.splice(target, 0, item);
    patch({ tiles: tiles.map((tile, order) => ({ ...tile, order })) }, true);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Power tiles</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            “More power when you need it” — section title, description, and the
            four cards (VPS, Cloud, Web app, Agency). Photo uploads save
            immediately; text saves on blur or Save home.
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
          label="Section title"
          value={value.title}
          onChange={(title) => patch({ title })}
          onBlur={persist}
        />
        <Field
          label="Description"
          value={value.description}
          onChange={(description) => patch({ description })}
          onBlur={persist}
        />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Cards</h3>
        <button
          type="button"
          onClick={() =>
            patch({
              tiles: [
                ...value.tiles,
                {
                  id: `tile-${Date.now()}`,
                  visible: true,
                  order: value.tiles.length,
                  title: "New card",
                  body: "Describe this product.",
                  image: "",
                  alt: "",
                  ctaLabel: "Explore",
                  ctaHref: "/",
                },
              ],
            })
          }
          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900"
        >
          + Add card
        </button>
      </div>

      <div className="space-y-3">
        {value.tiles.map((tile, index) => (
          <div
            key={tile.id}
            className="grid gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-2"
          >
            <div className="flex flex-wrap items-center gap-2 md:col-span-2">
              <p className="text-xs font-medium text-slate-600">
                Card {index + 1} · {tile.title}
              </p>
              <label className="flex items-center gap-1 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={tile.visible}
                  onChange={(event) =>
                    updateTile(index, { visible: event.target.checked }, true)
                  }
                />
                Visible
              </label>
              <button
                type="button"
                onClick={() => moveTile(index, -1)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500"
              >
                Up
              </button>
              <button
                type="button"
                onClick={() => moveTile(index, 1)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500"
              >
                Down
              </button>
              <button
                type="button"
                onClick={() =>
                  patch({
                    tiles: value.tiles.filter((_, i) => i !== index),
                  })
                }
                className="ml-auto rounded-lg border border-red-100 px-2 py-1 text-xs text-red-500"
              >
                Remove
              </button>
            </div>
            <Field
              label="Title"
              value={tile.title}
              onChange={(title) => updateTile(index, { title })}
              onBlur={persist}
            />
            <Field
              label="Body"
              value={tile.body}
              onChange={(body) => updateTile(index, { body })}
              onBlur={persist}
            />
            <Field
              label="Link label"
              value={tile.ctaLabel}
              onChange={(ctaLabel) => updateTile(index, { ctaLabel })}
              onBlur={persist}
            />
            <Field
              label="Link URL"
              value={tile.ctaHref}
              onChange={(ctaHref) => updateTile(index, { ctaHref })}
              onBlur={persist}
            />
            <Field
              label="Image alt"
              value={tile.alt}
              onChange={(alt) => updateTile(index, { alt })}
              onBlur={persist}
            />
            <div className="md:col-span-2">
              <OrbitImageField
                label={`Card image: ${tile.title}`}
                value={tile.image}
                onChange={(image) => updateTile(index, { image })}
                onCommit={(image) => updateTile(index, { image }, true)}
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
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}) {
  return (
    <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal tracking-normal text-slate-900 normal-case outline-none"
      />
    </label>
  );
}
