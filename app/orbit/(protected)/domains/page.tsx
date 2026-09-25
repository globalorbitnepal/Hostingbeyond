"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  AddButton,
  AreaField,
  NumberField,
  OrbitCard,
  RowTools,
  TextField,
} from "@/components/orbit/domain-editor-fields";
import { OrbitImageField } from "@/components/orbit/image-field";
import { routes } from "@/config/routes";
import {
  defaultDomainContent,
  type DomainContent,
  type DomainIconCard,
  type DomainPageCopy,
  type DomainSceneItem,
  type DomainSharedContent,
  type DomainTldRow,
} from "@/lib/domains/content";
import type { TldCategory } from "@/lib/domains/tlds";

type PageKey = "single" | "bulk";
type Tab = PageKey | "shared";

const TABS: Array<{ id: Tab; label: string; hint: string }> = [
  {
    id: "single",
    label: "Domain name search",
    hint: routes.domainSearch,
  },
  {
    id: "bulk",
    label: "Bulk domain search",
    hint: routes.bulkDomainSearch,
  },
  { id: "shared", label: "Shared blocks", hint: "Used by both pages" },
];

const CATEGORIES: TldCategory[] = [
  "popular",
  "business",
  "technology",
  "ecommerce",
  "creative",
];

const TRUST_ICONS = ["shield", "server", "clock", "headphones"];
const INCLUDED_ICONS = [
  "mail",
  "badge",
  "layers",
  "wallet",
  "refresh",
  "globe",
];

function move<T>(list: T[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

function reorder<T extends { order: number }>(list: T[]) {
  return list.map((item, order) => ({ ...item, order }));
}

export default function OrbitDomainsPage() {
  const [content, setContent] = useState<DomainContent | null>(null);
  const [tab, setTab] = useState<Tab>("single");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const latest = useRef<DomainContent | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/orbit/content/domains");
        if (!response.ok) {
          setContent(defaultDomainContent());
          setStatus("Showing defaults — could not load saved content.");
          return;
        }
        const json = (await response.json()) as { content?: DomainContent };
        setContent(json.content ?? defaultDomainContent());
      } catch {
        setContent(defaultDomainContent());
        setStatus("Showing defaults — network error.");
      }
    })();
  }, []);

  useEffect(() => {
    latest.current = content;
  }, [content]);

  const save = useCallback(async (next?: DomainContent) => {
    const payload = next ?? latest.current;
    if (!payload) return;
    setSaving(true);
    setStatus("Saving…");
    try {
      const response = await fetch("/api/orbit/content/domains", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: payload }),
      });
      const json = (await response.json()) as {
        content?: DomainContent;
        error?: string;
      };
      if (!response.ok) {
        setStatus(json.error || "Save failed.");
        return;
      }
      if (json.content) {
        setContent(json.content);
        latest.current = json.content;
      }
      setStatus("Saved — live pages updated.");
    } catch {
      setStatus("Network error while saving.");
    } finally {
      setSaving(false);
    }
  }, []);

  if (!content) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  function patchShared(next: Partial<DomainSharedContent>, persist = false) {
    const merged = {
      ...content!,
      shared: { ...content!.shared, ...next },
    };
    setContent(merged);
    latest.current = merged;
    if (persist) void save(merged);
  }

  function patchPage(
    key: PageKey,
    next: Partial<DomainPageCopy>,
    persist = false,
  ) {
    const merged = {
      ...content!,
      [key]: { ...content![key], ...next },
    } as DomainContent;
    setContent(merged);
    latest.current = merged;
    if (persist) void save(merged);
  }

  const pageKey: PageKey = tab === "bulk" ? "bulk" : "single";
  const page = content[pageKey];
  const shared = content.shared;

  return (
    <div className="space-y-5 pb-24">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-900">
            Domain search pages
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Every text, price and image on the two domain pages. Image uploads
            save instantly; text saves when you leave a field or press Save.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {status ? (
            <span className="text-xs font-semibold text-slate-500">
              {status}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-full bg-[#673de6] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </header>

      <nav className="flex flex-wrap gap-1.5 rounded-full bg-slate-100 p-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              tab === item.id
                ? "bg-white text-[#2f1c6a] shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {item.label}
            <span className="ml-2 hidden text-[11px] font-medium text-slate-400 sm:inline">
              {item.hint}
            </span>
          </button>
        ))}
      </nav>

      {tab !== "shared" ? (
        <div className="space-y-5">
          <OrbitCard
            title="SEO"
            hint="Title and description Google shows for this page."
          >
            <div className="grid gap-3">
              <TextField
                label="SEO title"
                value={page.seoTitle}
                onChange={(seoTitle) => patchPage(pageKey, { seoTitle })}
                onBlur={() => void save()}
              />
              <AreaField
                label="SEO description"
                value={page.seoDescription}
                rows={3}
                onChange={(seoDescription) =>
                  patchPage(pageKey, { seoDescription })
                }
                onBlur={() => void save()}
              />
              <AreaField
                label="SEO keywords"
                value={page.seoKeywords}
                rows={2}
                onChange={(seoKeywords) => patchPage(pageKey, { seoKeywords })}
                onBlur={() => void save()}
              />
              <TextField
                label="Open Graph title"
                value={page.ogTitle}
                onChange={(ogTitle) => patchPage(pageKey, { ogTitle })}
                onBlur={() => void save()}
              />
              <AreaField
                label="Open Graph description"
                value={page.ogDescription}
                rows={2}
                onChange={(ogDescription) =>
                  patchPage(pageKey, { ogDescription })
                }
                onBlur={() => void save()}
              />
              <TextField
                label="Open Graph image path"
                value={page.ogImage}
                onChange={(ogImage) => patchPage(pageKey, { ogImage })}
                onBlur={() => void save()}
              />
            </div>
          </OrbitCard>

          <OrbitCard title="Hero" hint="Badge, headline and intro copy.">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Badge / eyebrow"
                value={page.eyebrow}
                onChange={(eyebrow) => patchPage(pageKey, { eyebrow })}
                onBlur={() => void save()}
              />
              <TextField
                label="Heading"
                value={page.title}
                onChange={(title) => patchPage(pageKey, { title })}
                onBlur={() => void save()}
              />
              <TextField
                label="Heading accent (blue line)"
                value={page.titleAccent}
                onChange={(titleAccent) => patchPage(pageKey, { titleAccent })}
                onBlur={() => void save()}
              />
            </div>
            <AreaField
              label="Intro paragraph"
              value={page.description}
              rows={3}
              onChange={(description) => patchPage(pageKey, { description })}
              onBlur={() => void save()}
            />
          </OrbitCard>

          <OrbitCard
            title="Hero stats"
            hint="Three small numbers under the intro."
            action={
              <AddButton
                label="Add stat"
                onClick={() =>
                  patchPage(pageKey, {
                    stats: reorder([
                      ...page.stats,
                      {
                        id: `stat-${Date.now()}`,
                        visible: true,
                        order: page.stats.length,
                        value: "100+",
                        label: "New stat",
                      },
                    ]),
                  })
                }
              />
            }
          >
            <div className="space-y-3">
              {page.stats.map((stat, index) => (
                <div
                  key={stat.id}
                  className="grid gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-2"
                >
                  <RowTools
                    title={`Stat ${index + 1}`}
                    visible={stat.visible}
                    onVisible={(visible) => {
                      const stats = [...page.stats];
                      stats[index] = { ...stat, visible };
                      patchPage(pageKey, { stats }, true);
                    }}
                    onUp={() =>
                      patchPage(
                        pageKey,
                        { stats: reorder(move(page.stats, index, -1)) },
                        true,
                      )
                    }
                    onDown={() =>
                      patchPage(
                        pageKey,
                        { stats: reorder(move(page.stats, index, 1)) },
                        true,
                      )
                    }
                    onRemove={() =>
                      patchPage(
                        pageKey,
                        {
                          stats: reorder(
                            page.stats.filter((_, i) => i !== index),
                          ),
                        },
                        true,
                      )
                    }
                  />
                  <TextField
                    label="Value"
                    value={stat.value}
                    onChange={(value) => {
                      const stats = [...page.stats];
                      stats[index] = { ...stat, value };
                      patchPage(pageKey, { stats });
                    }}
                    onBlur={() => void save()}
                  />
                  <TextField
                    label="Label"
                    value={stat.label}
                    onChange={(label) => {
                      const stats = [...page.stats];
                      stats[index] = { ...stat, label };
                      patchPage(pageKey, { stats });
                    }}
                    onBlur={() => void save()}
                  />
                </div>
              ))}
            </div>
          </OrbitCard>

          <OrbitCard
            title="Pricing section copy"
            hint="Heading above the price table on this page."
          >
            <div className="grid gap-3">
              <TextField
                label="Heading"
                value={page.pricingHeading}
                onChange={(pricingHeading) =>
                  patchPage(pageKey, { pricingHeading })
                }
                onBlur={() => void save()}
              />
              <AreaField
                label="Paragraph"
                value={page.pricingCopy}
                rows={3}
                onChange={(pricingCopy) => patchPage(pageKey, { pricingCopy })}
                onBlur={() => void save()}
              />
            </div>
          </OrbitCard>

          <OrbitCard
            title="FAQs"
            hint="Also published as FAQ structured data for Google."
            action={
              <AddButton
                label="Add question"
                onClick={() =>
                  patchPage(pageKey, {
                    faqs: reorder([
                      ...page.faqs,
                      {
                        id: `faq-${Date.now()}`,
                        visible: true,
                        order: page.faqs.length,
                        question: "New question",
                        answer: "Answer text.",
                      },
                    ]),
                  })
                }
              />
            }
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <TextField
                label="Eyebrow"
                value={page.faqEyebrow}
                onChange={(faqEyebrow) => patchPage(pageKey, { faqEyebrow })}
                onBlur={() => void save()}
              />
              <TextField
                label="Heading"
                value={page.faqHeading}
                onChange={(faqHeading) => patchPage(pageKey, { faqHeading })}
                onBlur={() => void save()}
              />
              <TextField
                label="Sub copy"
                value={page.faqDescription}
                onChange={(faqDescription) =>
                  patchPage(pageKey, { faqDescription })
                }
                onBlur={() => void save()}
              />
            </div>

            <div className="mt-3 space-y-3">
              {page.faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className="grid gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-2"
                >
                  <RowTools
                    title={`Q${index + 1}`}
                    visible={faq.visible}
                    onVisible={(visible) => {
                      const faqs = [...page.faqs];
                      faqs[index] = { ...faq, visible };
                      patchPage(pageKey, { faqs }, true);
                    }}
                    onUp={() =>
                      patchPage(
                        pageKey,
                        { faqs: reorder(move(page.faqs, index, -1)) },
                        true,
                      )
                    }
                    onDown={() =>
                      patchPage(
                        pageKey,
                        { faqs: reorder(move(page.faqs, index, 1)) },
                        true,
                      )
                    }
                    onRemove={() =>
                      patchPage(
                        pageKey,
                        {
                          faqs: reorder(
                            page.faqs.filter((_, i) => i !== index),
                          ),
                        },
                        true,
                      )
                    }
                  />
                  <div className="md:col-span-2">
                    <TextField
                      label="Question"
                      value={faq.question}
                      onChange={(question) => {
                        const faqs = [...page.faqs];
                        faqs[index] = { ...faq, question };
                        patchPage(pageKey, { faqs });
                      }}
                      onBlur={() => void save()}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <AreaField
                      label="Answer"
                      value={faq.answer}
                      rows={3}
                      onChange={(answer) => {
                        const faqs = [...page.faqs];
                        faqs[index] = { ...faq, answer };
                        patchPage(pageKey, { faqs });
                      }}
                      onBlur={() => void save()}
                    />
                  </div>
                </div>
              ))}
            </div>
          </OrbitCard>

          <OrbitCard
            title="Closing CTA"
            hint="Button that sends visitors to the other domain page."
          >
            <div className="grid gap-3">
              <TextField
                label="Button label"
                value={page.crossLinkLabel}
                onChange={(crossLinkLabel) =>
                  patchPage(pageKey, { crossLinkLabel })
                }
                onBlur={() => void save()}
              />
              <AreaField
                label="Paragraph"
                value={page.crossLinkHelper}
                rows={2}
                onChange={(crossLinkHelper) =>
                  patchPage(pageKey, { crossLinkHelper })
                }
                onBlur={() => void save()}
              />
            </div>
          </OrbitCard>
        </div>
      ) : (
        <div className="space-y-5">
          <OrbitCard
            title="Images"
            hint="Hero art, the included-features photo and the transfer visual. Uploads save immediately."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <OrbitImageField
                  label="Hero background"
                  value={shared.heroImage}
                  onChange={(heroImage) => patchShared({ heroImage })}
                  onCommit={(heroImage) => patchShared({ heroImage }, true)}
                />
                <TextField
                  label="Hero image alt"
                  value={shared.heroImageAlt}
                  onChange={(heroImageAlt) => patchShared({ heroImageAlt })}
                  onBlur={() => void save()}
                />
              </div>
              <div className="space-y-2">
                <OrbitImageField
                  label="Included section image"
                  value={shared.brandImage}
                  onChange={(brandImage) => patchShared({ brandImage })}
                  onCommit={(brandImage) => patchShared({ brandImage }, true)}
                />
                <TextField
                  label="Alt text"
                  value={shared.brandImageAlt}
                  onChange={(brandImageAlt) => patchShared({ brandImageAlt })}
                  onBlur={() => void save()}
                />
              </div>
              <div className="space-y-2">
                <OrbitImageField
                  label="Transfer section image"
                  value={shared.transferImage}
                  onChange={(transferImage) => patchShared({ transferImage })}
                  onCommit={(transferImage) =>
                    patchShared({ transferImage }, true)
                  }
                />
                <TextField
                  label="Alt text"
                  value={shared.transferImageAlt}
                  onChange={(transferImageAlt) =>
                    patchShared({ transferImageAlt })
                  }
                  onBlur={() => void save()}
                />
              </div>
            </div>
            <TextField
              label="Hero price chips (comma separated extensions)"
              value={shared.heroChips}
              onChange={(heroChips) => patchShared({ heroChips })}
              onBlur={() => void save()}
            />
          </OrbitCard>

          <OrbitCard
            title="Domain prices"
            hint="First year, renewal and transfer for every extension shown in the table and the hero chips."
            action={
              <AddButton
                label="Add extension"
                onClick={() =>
                  patchShared({
                    pricing: reorder([
                      ...shared.pricing,
                      {
                        id: `tld-${Date.now()}`,
                        visible: true,
                        order: shared.pricing.length,
                        tld: ".new",
                        register: 9.99,
                        renew: 19.99,
                        transfer: 14.99,
                        categories: ["popular"],
                        note: "",
                      } satisfies DomainTldRow,
                    ]),
                  })
                }
              />
            }
          >
            <div className="space-y-3">
              {shared.pricing.map((row, index) => (
                <div
                  key={row.id}
                  className="grid gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-4"
                >
                  <div className="md:col-span-4">
                    <RowTools
                      title={row.tld}
                      visible={row.visible}
                      onVisible={(visible) => {
                        const pricing = [...shared.pricing];
                        pricing[index] = { ...row, visible };
                        patchShared({ pricing }, true);
                      }}
                      onUp={() =>
                        patchShared(
                          { pricing: reorder(move(shared.pricing, index, -1)) },
                          true,
                        )
                      }
                      onDown={() =>
                        patchShared(
                          { pricing: reorder(move(shared.pricing, index, 1)) },
                          true,
                        )
                      }
                      onRemove={() =>
                        patchShared(
                          {
                            pricing: reorder(
                              shared.pricing.filter((_, i) => i !== index),
                            ),
                          },
                          true,
                        )
                      }
                    />
                  </div>
                  <TextField
                    label="Extension"
                    value={row.tld}
                    onChange={(tld) => {
                      const pricing = [...shared.pricing];
                      pricing[index] = { ...row, tld };
                      patchShared({ pricing });
                    }}
                    onBlur={() => void save()}
                  />
                  <NumberField
                    label="First year"
                    value={row.register}
                    onChange={(register) => {
                      const pricing = [...shared.pricing];
                      pricing[index] = { ...row, register };
                      patchShared({ pricing });
                    }}
                    onBlur={() => void save()}
                  />
                  <NumberField
                    label="Renews at"
                    value={row.renew}
                    onChange={(renew) => {
                      const pricing = [...shared.pricing];
                      pricing[index] = { ...row, renew };
                      patchShared({ pricing });
                    }}
                    onBlur={() => void save()}
                  />
                  <NumberField
                    label="Transfer"
                    value={row.transfer}
                    onChange={(transfer) => {
                      const pricing = [...shared.pricing];
                      pricing[index] = { ...row, transfer };
                      patchShared({ pricing });
                    }}
                    onBlur={() => void save()}
                  />
                  <div className="md:col-span-2">
                    <TextField
                      label="Note (optional)"
                      value={row.note}
                      onChange={(note) => {
                        const pricing = [...shared.pricing];
                        pricing[index] = { ...row, note };
                        patchShared({ pricing });
                      }}
                      onBlur={() => void save()}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Categories
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {CATEGORIES.map((category) => {
                        const checked = row.categories.includes(category);
                        return (
                          <label
                            key={category}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) => {
                                const categories = event.target.checked
                                  ? [...row.categories, category]
                                  : row.categories.filter(
                                      (item) => item !== category,
                                    );
                                const pricing = [...shared.pricing];
                                pricing[index] = { ...row, categories };
                                patchShared({ pricing }, true);
                              }}
                            />
                            {category}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <AreaField
              label="Pricing footnote"
              value={shared.pricingFootnote}
              rows={2}
              onChange={(pricingFootnote) => patchShared({ pricingFootnote })}
              onBlur={() => void save()}
            />
          </OrbitCard>

          <OrbitCard
            title="Why buy domains"
            hint="Headline for the Hostinger-style benefits grid (uses trust strip items)."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <TextField
                label="Eyebrow"
                value={shared.whyBuyEyebrow}
                onChange={(whyBuyEyebrow) => patchShared({ whyBuyEyebrow })}
                onBlur={() => void save()}
              />
              <TextField
                label="Heading"
                value={shared.whyBuyHeading}
                onChange={(whyBuyHeading) => patchShared({ whyBuyHeading })}
                onBlur={() => void save()}
              />
              <TextField
                label="Description"
                value={shared.whyBuyDescription}
                onChange={(whyBuyDescription) =>
                  patchShared({ whyBuyDescription })
                }
                onBlur={() => void save()}
              />
            </div>
          </OrbitCard>

          <OrbitCard
            title="Trust strip"
            hint="Four items shown in the Why buy grid."
            action={
              <AddButton
                label="Add item"
                onClick={() =>
                  patchShared({
                    trust: reorder([
                      ...shared.trust,
                      {
                        id: `trust-${Date.now()}`,
                        visible: true,
                        order: shared.trust.length,
                        title: "New item",
                        description: "Short line",
                        icon: "shield",
                      } satisfies DomainIconCard,
                    ]),
                  })
                }
              />
            }
          >
            <div className="grid gap-3 md:grid-cols-2">
              {shared.trust.map((item, index) => (
                <div
                  key={item.id}
                  className="space-y-2 rounded-xl border border-slate-200 p-3"
                >
                  <RowTools
                    title={`Item ${index + 1}`}
                    visible={item.visible}
                    onVisible={(visible) => {
                      const trust = [...shared.trust];
                      trust[index] = { ...item, visible };
                      patchShared({ trust }, true);
                    }}
                    onUp={() =>
                      patchShared(
                        { trust: reorder(move(shared.trust, index, -1)) },
                        true,
                      )
                    }
                    onDown={() =>
                      patchShared(
                        { trust: reorder(move(shared.trust, index, 1)) },
                        true,
                      )
                    }
                    onRemove={() =>
                      patchShared(
                        {
                          trust: reorder(
                            shared.trust.filter((_, i) => i !== index),
                          ),
                        },
                        true,
                      )
                    }
                  />
                  <TextField
                    label="Title"
                    value={item.title}
                    onChange={(title) => {
                      const trust = [...shared.trust];
                      trust[index] = { ...item, title };
                      patchShared({ trust });
                    }}
                    onBlur={() => void save()}
                  />
                  <TextField
                    label="Sub line"
                    value={item.description}
                    onChange={(description) => {
                      const trust = [...shared.trust];
                      trust[index] = { ...item, description };
                      patchShared({ trust });
                    }}
                    onBlur={() => void save()}
                  />
                  <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Icon
                    <select
                      value={item.icon}
                      onChange={(event) => {
                        const trust = [...shared.trust];
                        trust[index] = { ...item, icon: event.target.value };
                        patchShared({ trust }, true);
                      }}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal tracking-normal text-slate-900 normal-case"
                    >
                      {TRUST_ICONS.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ))}
            </div>
          </OrbitCard>

          <OrbitCard
            title="Preview clip"
            hint="The looping box. Each scene is one image, caption, typed prompt and its chips."
            action={
              <AddButton
                label="Add scene"
                onClick={() =>
                  patchShared({
                    scenes: reorder([
                      ...shared.scenes,
                      {
                        id: `scene-${Date.now()}`,
                        visible: true,
                        order: shared.scenes.length,
                        label: "New step",
                        caption: "What happens in this step.",
                        prompt: "yourbrand.com",
                        chips: "First chip | Second chip",
                        image: "",
                      } satisfies DomainSceneItem,
                    ]),
                  })
                }
              />
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Eyebrow"
                value={shared.videoEyebrow}
                onChange={(videoEyebrow) => patchShared({ videoEyebrow })}
                onBlur={() => void save()}
              />
              <TextField
                label="Heading"
                value={shared.videoHeading}
                onChange={(videoHeading) => patchShared({ videoHeading })}
                onBlur={() => void save()}
              />
              <TextField
                label="CTA label"
                value={shared.videoCtaLabel}
                onChange={(videoCtaLabel) => patchShared({ videoCtaLabel })}
                onBlur={() => void save()}
              />
            </div>
            <AreaField
              label="Paragraph"
              value={shared.videoDescription}
              rows={2}
              onChange={(videoDescription) => patchShared({ videoDescription })}
              onBlur={() => void save()}
            />

            <div className="space-y-3">
              {shared.scenes.map((scene, index) => (
                <div
                  key={scene.id}
                  className="grid gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-2"
                >
                  <RowTools
                    title={`Scene ${index + 1}`}
                    visible={scene.visible}
                    onVisible={(visible) => {
                      const scenes = [...shared.scenes];
                      scenes[index] = { ...scene, visible };
                      patchShared({ scenes }, true);
                    }}
                    onUp={() =>
                      patchShared(
                        { scenes: reorder(move(shared.scenes, index, -1)) },
                        true,
                      )
                    }
                    onDown={() =>
                      patchShared(
                        { scenes: reorder(move(shared.scenes, index, 1)) },
                        true,
                      )
                    }
                    onRemove={() =>
                      patchShared(
                        {
                          scenes: reorder(
                            shared.scenes.filter((_, i) => i !== index),
                          ),
                        },
                        true,
                      )
                    }
                  />
                  <TextField
                    label="Step label"
                    value={scene.label}
                    onChange={(label) => {
                      const scenes = [...shared.scenes];
                      scenes[index] = { ...scene, label };
                      patchShared({ scenes });
                    }}
                    onBlur={() => void save()}
                  />
                  <TextField
                    label="Typed prompt"
                    value={scene.prompt}
                    onChange={(prompt) => {
                      const scenes = [...shared.scenes];
                      scenes[index] = { ...scene, prompt };
                      patchShared({ scenes });
                    }}
                    onBlur={() => void save()}
                  />
                  <div className="md:col-span-2">
                    <TextField
                      label="Caption"
                      value={scene.caption}
                      onChange={(caption) => {
                        const scenes = [...shared.scenes];
                        scenes[index] = { ...scene, caption };
                        patchShared({ scenes });
                      }}
                      onBlur={() => void save()}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <TextField
                      label="Chips (separate with |)"
                      value={scene.chips}
                      onChange={(chips) => {
                        const scenes = [...shared.scenes];
                        scenes[index] = { ...scene, chips };
                        patchShared({ scenes });
                      }}
                      onBlur={() => void save()}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <OrbitImageField
                      label={`Scene image: ${scene.label}`}
                      value={scene.image}
                      onChange={(image) => {
                        const scenes = [...shared.scenes];
                        scenes[index] = { ...scene, image };
                        patchShared({ scenes });
                      }}
                      onCommit={(image) => {
                        const scenes = [...shared.scenes];
                        scenes[index] = { ...scene, image };
                        patchShared({ scenes }, true);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </OrbitCard>

          <OrbitCard
            title="Included with every domain"
            hint="Feature cards beside the image."
            action={
              <AddButton
                label="Add card"
                onClick={() =>
                  patchShared({
                    included: reorder([
                      ...shared.included,
                      {
                        id: `included-${Date.now()}`,
                        visible: true,
                        order: shared.included.length,
                        title: "New feature",
                        description: "Describe the benefit.",
                        icon: "layers",
                      } satisfies DomainIconCard,
                    ]),
                  })
                }
              />
            }
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <TextField
                label="Eyebrow"
                value={shared.includedEyebrow}
                onChange={(includedEyebrow) => patchShared({ includedEyebrow })}
                onBlur={() => void save()}
              />
              <TextField
                label="Heading"
                value={shared.includedHeading}
                onChange={(includedHeading) => patchShared({ includedHeading })}
                onBlur={() => void save()}
              />
              <TextField
                label="Paragraph"
                value={shared.includedDescription}
                onChange={(includedDescription) =>
                  patchShared({ includedDescription })
                }
                onBlur={() => void save()}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {shared.included.map((item, index) => (
                <div
                  key={item.id}
                  className="space-y-2 rounded-xl border border-slate-200 p-3"
                >
                  <RowTools
                    title={`Card ${index + 1}`}
                    visible={item.visible}
                    onVisible={(visible) => {
                      const included = [...shared.included];
                      included[index] = { ...item, visible };
                      patchShared({ included }, true);
                    }}
                    onUp={() =>
                      patchShared(
                        { included: reorder(move(shared.included, index, -1)) },
                        true,
                      )
                    }
                    onDown={() =>
                      patchShared(
                        { included: reorder(move(shared.included, index, 1)) },
                        true,
                      )
                    }
                    onRemove={() =>
                      patchShared(
                        {
                          included: reorder(
                            shared.included.filter((_, i) => i !== index),
                          ),
                        },
                        true,
                      )
                    }
                  />
                  <TextField
                    label="Title"
                    value={item.title}
                    onChange={(title) => {
                      const included = [...shared.included];
                      included[index] = { ...item, title };
                      patchShared({ included });
                    }}
                    onBlur={() => void save()}
                  />
                  <AreaField
                    label="Description"
                    value={item.description}
                    rows={2}
                    onChange={(description) => {
                      const included = [...shared.included];
                      included[index] = { ...item, description };
                      patchShared({ included });
                    }}
                    onBlur={() => void save()}
                  />
                  <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Icon
                    <select
                      value={item.icon}
                      onChange={(event) => {
                        const included = [...shared.included];
                        included[index] = { ...item, icon: event.target.value };
                        patchShared({ included }, true);
                      }}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal tracking-normal text-slate-900 normal-case"
                    >
                      {INCLUDED_ICONS.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ))}
            </div>
          </OrbitCard>

          <OrbitCard
            title="Transfer section"
            hint="Steps shown next to the transfer visual."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <TextField
                label="Eyebrow"
                value={shared.transferEyebrow}
                onChange={(transferEyebrow) => patchShared({ transferEyebrow })}
                onBlur={() => void save()}
              />
              <TextField
                label="Heading"
                value={shared.transferHeading}
                onChange={(transferHeading) => patchShared({ transferHeading })}
                onBlur={() => void save()}
              />
              <TextField
                label="Button label"
                value={shared.transferCtaLabel}
                onChange={(transferCtaLabel) =>
                  patchShared({ transferCtaLabel })
                }
                onBlur={() => void save()}
              />
            </div>
            <AreaField
              label="Paragraph"
              value={shared.transferDescription}
              rows={2}
              onChange={(transferDescription) =>
                patchShared({ transferDescription })
              }
              onBlur={() => void save()}
            />
            <AreaField
              label="Steps"
              value={shared.transferSteps}
              rows={4}
              hint="One step per line."
              onChange={(transferSteps) => patchShared({ transferSteps })}
              onBlur={() => void save()}
            />
          </OrbitCard>

          <OrbitCard
            title="Closing band"
            hint="Shared heading and email button."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Heading"
                value={shared.ctaHeading}
                onChange={(ctaHeading) => patchShared({ ctaHeading })}
                onBlur={() => void save()}
              />
              <TextField
                label="Secondary button label"
                value={shared.ctaEmailLabel}
                onChange={(ctaEmailLabel) => patchShared({ ctaEmailLabel })}
                onBlur={() => void save()}
              />
            </div>
          </OrbitCard>
        </div>
      )}
    </div>
  );
}
