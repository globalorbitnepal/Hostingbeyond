"use client";

import { useRef } from "react";

import { OrbitImageField } from "@/components/orbit/image-field";
import type {
  CmsBeyondAiContent,
  CmsBeyondAiFeature,
  CmsBeyondAiHighlight,
  CmsBeyondAiSite,
} from "@/lib/orbit/defaults";

const HIGHLIGHT_ICONS: CmsBeyondAiHighlight["icon"][] = [
  "zap",
  "cloud",
  "globe",
  "rocket",
];

const FEATURE_ICONS: CmsBeyondAiFeature["icon"][] = [
  "wand",
  "layers",
  "users",
  "gauge",
];

type Props = {
  value: CmsBeyondAiContent;
  onChange: (value: CmsBeyondAiContent) => void;
  onPersist?: (value: CmsBeyondAiContent) => void;
};

export function BeyondAiEditor({ value, onChange, onPersist }: Props) {
  const latest = useRef(value);
  latest.current = value;

  function patch(next: Partial<CmsBeyondAiContent>, persistNow = false) {
    const merged = { ...latest.current, ...next };
    latest.current = merged;
    onChange(merged);
    if (persistNow) onPersist?.(merged);
  }

  function persist() {
    onPersist?.(latest.current);
  }

  function updateSite(
    index: number,
    nextSite: Partial<CmsBeyondAiSite>,
    persistNow = false,
  ) {
    const sites = [...value.sites];
    sites[index] = { ...sites[index], ...nextSite };
    patch(
      { sites: sites.map((site, order) => ({ ...site, order })) },
      persistNow,
    );
  }

  function updateHighlight(
    index: number,
    nextHighlight: Partial<CmsBeyondAiHighlight>,
  ) {
    const highlights = [...value.highlights];
    highlights[index] = { ...highlights[index], ...nextHighlight };
    patch({ highlights });
  }

  function updateFeature(
    index: number,
    nextFeature: Partial<CmsBeyondAiFeature>,
  ) {
    const features = [...value.features];
    features[index] = { ...features[index], ...nextFeature };
    patch({ features });
  }

  function moveSite(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.sites.length) return;
    const sites = [...value.sites];
    const [item] = sites.splice(index, 1);
    sites.splice(target, 0, item);
    patch({ sites: sites.map((site, order) => ({ ...site, order })) });
  }

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Beyond AI section</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Full homepage block: badges, copy, CTAs, workspace photo, highlight
            tiles, and the four bottom features. Save home after text edits;
            photo uploads save immediately.
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

      <OrbitImageField
        label="Right-side workspace photo"
        value={value.workspaceImageUrl ?? ""}
        onChange={(workspaceImageUrl) => patch({ workspaceImageUrl })}
        onCommit={(workspaceImageUrl) => patch({ workspaceImageUrl }, true)}
      />
      <Field
        label="Workspace photo alt text"
        value={value.workspaceImageAlt ?? ""}
        onChange={(workspaceImageAlt) => patch({ workspaceImageAlt })}
        onBlur={persist}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Badge"
          value={value.badge}
          onChange={(badge) => patch({ badge })}
          onBlur={persist}
        />
        <Field
          label="Secondary badge"
          value={value.badgeSecondary}
          onChange={(badgeSecondary) => patch({ badgeSecondary })}
          onBlur={persist}
        />
        <Field
          label="Title (use a new line before “with”)"
          value={value.title}
          onChange={(title) => patch({ title })}
          onBlur={persist}
        />
        <Field
          label="Title accent"
          value={value.titleAccent}
          onChange={(titleAccent) => patch({ titleAccent })}
          onBlur={persist}
        />
        <Field
          label="Primary CTA label"
          value={value.primaryCtaLabel}
          onChange={(primaryCtaLabel) => patch({ primaryCtaLabel })}
          onBlur={persist}
        />
        <Field
          label="Primary CTA URL"
          value={value.primaryCtaHref}
          onChange={(primaryCtaHref) => patch({ primaryCtaHref })}
          onBlur={persist}
        />
        <Field
          label="Secondary CTA label"
          value={value.secondaryCtaLabel}
          onChange={(secondaryCtaLabel) => patch({ secondaryCtaLabel })}
          onBlur={persist}
        />
        <Field
          label="Secondary CTA URL"
          value={value.secondaryCtaHref}
          onChange={(secondaryCtaHref) => patch({ secondaryCtaHref })}
          onBlur={persist}
        />
        <Field
          label="Trust line 1"
          value={value.trust1}
          onChange={(trust1) => patch({ trust1 })}
          onBlur={persist}
        />
        <Field
          label="Trust line 2"
          value={value.trust2}
          onChange={(trust2) => patch({ trust2 })}
          onBlur={persist}
        />
        <Field
          label="Trust line 3"
          value={value.trust3}
          onChange={(trust3) => patch({ trust3 })}
          onBlur={persist}
        />
      </div>

      <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
        Description
        <textarea
          value={value.description}
          onChange={(event) => patch({ description: event.target.value })}
          onBlur={persist}
          rows={4}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal tracking-normal text-slate-900 normal-case outline-none"
        />
      </label>

      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-800">
            Highlight tiles
          </h3>
          <button
            type="button"
            onClick={() =>
              patch({
                highlights: [
                  ...value.highlights,
                  {
                    id: `highlight-${Date.now()}`,
                    title: "New highlight",
                    subtitle: "",
                    icon: "zap",
                  },
                ],
              })
            }
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900"
          >
            + Add highlight
          </button>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {value.highlights.map((item, index) => (
            <div
              key={item.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3"
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    patch({
                      highlights: value.highlights.filter(
                        (_, highlightIndex) => highlightIndex !== index,
                      ),
                    })
                  }
                  className="rounded-lg border border-red-100 px-2 py-1 text-xs text-red-500"
                >
                  Remove
                </button>
              </div>
              <Field
                label="Title"
                value={item.title}
                onChange={(title) => updateHighlight(index, { title })}
                onBlur={persist}
              />
              <Field
                label="Subtitle"
                value={item.subtitle}
                onChange={(subtitle) => updateHighlight(index, { subtitle })}
                onBlur={persist}
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
                  onBlur={persist}
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

      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-800">
            Bottom features (no glass — same as Business Email)
          </h3>
          <button
            type="button"
            onClick={() =>
              patch({
                features: [
                  ...value.features,
                  {
                    id: `feature-${Date.now()}`,
                    title: "New feature",
                    description: "",
                    icon: "wand",
                  },
                ],
              })
            }
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900"
          >
            + Add feature
          </button>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {value.features.map((item, index) => (
            <div
              key={item.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3"
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    patch({
                      features: value.features.filter(
                        (_, featureIndex) => featureIndex !== index,
                      ),
                    })
                  }
                  className="rounded-lg border border-red-100 px-2 py-1 text-xs text-red-500"
                >
                  Remove
                </button>
              </div>
              <Field
                label="Title"
                value={item.title}
                onChange={(title) => updateFeature(index, { title })}
                onBlur={persist}
              />
              <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Description
                <textarea
                  value={item.description}
                  onChange={(event) =>
                    updateFeature(index, { description: event.target.value })
                  }
                  onBlur={persist}
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal tracking-normal text-slate-900 normal-case outline-none"
                />
              </label>
              <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Icon
                <select
                  value={item.icon}
                  onChange={(event) =>
                    updateFeature(index, {
                      icon: event.target.value as CmsBeyondAiFeature["icon"],
                    })
                  }
                  onBlur={persist}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal tracking-normal text-slate-900 normal-case outline-none"
                >
                  {FEATURE_ICONS.map((icon) => (
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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">
            Extra site images
          </h3>
          <button
            type="button"
            onClick={() =>
              patch({
                sites: [
                  ...value.sites,
                  {
                    id: `site-${Date.now()}`,
                    visible: true,
                    order: value.sites.length,
                    name: "New website",
                    domain: "example.com",
                    imageUrl: "",
                    imageAlt: "",
                    status: "Live",
                    headline: "",
                    subhead: "",
                    cta: "",
                    country: "",
                    city: "",
                    flag: "",
                    nav: "Home  About  Contact",
                  },
                ],
              })
            }
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900"
          >
            + Add site
          </button>
        </div>
        {value.sites.map((site, index) => (
          <div
            key={site.id}
            className="grid gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-2"
          >
            <div className="flex flex-wrap items-center gap-2 md:col-span-2">
              <label className="flex items-center gap-2 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={site.visible}
                  onChange={(event) =>
                    updateSite(index, { visible: event.target.checked })
                  }
                />
                Visible
              </label>
              <button
                type="button"
                onClick={() => moveSite(index, -1)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500"
              >
                Up
              </button>
              <button
                type="button"
                onClick={() => moveSite(index, 1)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500"
              >
                Down
              </button>
              <button
                type="button"
                onClick={() =>
                  patch({
                    sites: value.sites.filter(
                      (_, siteIndex) => siteIndex !== index,
                    ),
                  })
                }
                className="ml-auto rounded-lg border border-red-100 px-2 py-1 text-xs text-red-500"
              >
                Remove
              </button>
            </div>
            <Field
              label="Site name"
              value={site.name}
              onChange={(name) => updateSite(index, { name })}
              onBlur={persist}
            />
            <Field
              label="Domain"
              value={site.domain}
              onChange={(domain) => updateSite(index, { domain })}
              onBlur={persist}
            />
            <Field
              label="Status"
              value={site.status}
              onChange={(status) => updateSite(index, { status })}
              onBlur={persist}
            />
            <Field
              label="Headline on photo"
              value={site.headline ?? ""}
              onChange={(headline) => updateSite(index, { headline })}
              onBlur={persist}
            />
            <Field
              label="Subhead"
              value={site.subhead ?? ""}
              onChange={(subhead) => updateSite(index, { subhead })}
              onBlur={persist}
            />
            <Field
              label="Photo CTA"
              value={site.cta ?? ""}
              onChange={(cta) => updateSite(index, { cta })}
              onBlur={persist}
            />
            <Field
              label="Country"
              value={site.country ?? ""}
              onChange={(country) => updateSite(index, { country })}
              onBlur={persist}
            />
            <Field
              label="City"
              value={site.city ?? ""}
              onChange={(city) => updateSite(index, { city })}
              onBlur={persist}
            />
            <Field
              label="Flag emoji"
              value={site.flag ?? ""}
              onChange={(flag) => updateSite(index, { flag })}
              onBlur={persist}
            />
            <Field
              label="Nav items"
              value={site.nav ?? ""}
              onChange={(nav) => updateSite(index, { nav })}
              onBlur={persist}
            />
            <Field
              label="Image alt"
              value={site.imageAlt}
              onChange={(imageAlt) => updateSite(index, { imageAlt })}
              onBlur={persist}
            />
            <div className="md:col-span-2">
              <OrbitImageField
                label={`Site image: ${site.name}`}
                value={site.imageUrl}
                onChange={(imageUrl) => updateSite(index, { imageUrl })}
                onCommit={(imageUrl) => updateSite(index, { imageUrl }, true)}
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
