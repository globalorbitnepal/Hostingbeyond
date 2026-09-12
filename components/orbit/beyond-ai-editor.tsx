"use client";

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
  function patch(next: Partial<CmsBeyondAiContent>, persist = false) {
    const merged = { ...value, ...next };
    onChange(merged);
    if (persist) onPersist?.(merged);
  }

  function updateSite(
    index: number,
    nextSite: Partial<CmsBeyondAiSite>,
    persist = false,
  ) {
    const sites = [...value.sites];
    sites[index] = { ...sites[index], ...nextSite };
    patch({ sites: sites.map((site, order) => ({ ...site, order })) }, persist);
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
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Beyond AI Builder section</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Homepage block under Hosting Plans — copy, CTAs, site slider images
            and feature cards.
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
          label="Badge (header-style animation)"
          value={value.badge}
          onChange={(badge) => patch({ badge })}
        />
        <Field
          label="Secondary badge"
          value={value.badgeSecondary}
          onChange={(badgeSecondary) => patch({ badgeSecondary })}
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
        <Field
          label="Dashboard title"
          value={value.dashboardTitle}
          onChange={(dashboardTitle) => patch({ dashboardTitle })}
        />
        <Field
          label="Toast title"
          value={value.toastTitle}
          onChange={(toastTitle) => patch({ toastTitle })}
        />
        <Field
          label="Toast subtitle"
          value={value.toastSubtitle}
          onChange={(toastSubtitle) => patch({ toastSubtitle })}
        />
        <Field
          label="Stats label"
          value={value.statsLabel}
          onChange={(statsLabel) => patch({ statsLabel })}
        />
        <Field
          label="Stats value"
          value={value.statsValue}
          onChange={(statsValue) => patch({ statsValue })}
        />
        <Field
          label="Stats hint"
          value={value.statsHint}
          onChange={(statsHint) => patch({ statsHint })}
        />
        <Field
          label="SaaS card title"
          value={value.saasTitle}
          onChange={(saasTitle) => patch({ saasTitle })}
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

      <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
        SaaS card items (one per line)
        <textarea
          value={value.saasItems.join("\n")}
          onChange={(event) =>
            patch({ saasItems: event.target.value.split("\n") })
          }
          rows={5}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal tracking-normal text-slate-900 normal-case outline-none"
        />
      </label>

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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">
            Site slider images
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
            />
            <Field
              label="Domain"
              value={site.domain}
              onChange={(domain) => updateSite(index, { domain })}
            />
            <Field
              label="Status"
              value={site.status}
              onChange={(status) => updateSite(index, { status })}
            />
            <Field
              label="Image alt"
              value={site.imageAlt}
              onChange={(imageAlt) => updateSite(index, { imageAlt })}
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

      <div>
        <h3 className="text-sm font-semibold text-slate-800">Feature cards</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {value.features.map((item, index) => (
            <div
              key={item.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3"
            >
              <Field
                label="Title"
                value={item.title}
                onChange={(title) => updateFeature(index, { title })}
              />
              <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Description
                <textarea
                  value={item.description}
                  onChange={(event) =>
                    updateFeature(index, { description: event.target.value })
                  }
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
