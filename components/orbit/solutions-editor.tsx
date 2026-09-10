"use client";

import { useState } from "react";

import { OrbitImageField } from "@/components/orbit/image-field";
import type {
  CmsSolutionImage,
  CmsSolutionProduct,
  CmsSolutionsContent,
} from "@/lib/orbit/defaults";

const ICONS: CmsSolutionProduct["icon"][] = [
  "server",
  "cloud",
  "cart",
  "wordpress",
  "users",
  "mail",
  "cpu",
  "globe",
];

type Props = {
  value: CmsSolutionsContent;
  onChange: (value: CmsSolutionsContent) => void;
};

export function SolutionsEditor({ value, onChange }: Props) {
  const [openId, setOpenId] = useState<string | null>(value.products[0]?.id ?? null);
  const products = [...value.products].sort((a, b) => a.order - b.order);

  function patchSection(patch: Partial<CmsSolutionsContent>) {
    onChange({ ...value, ...patch });
  }

  function updateProduct(index: number, patch: Partial<CmsSolutionProduct>) {
    const next = [...products];
    next[index] = { ...next[index], ...patch };
    patchSection({
      products: next.map((product, order) => ({ ...product, order })),
    });
  }

  function moveProduct(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= products.length) return;
    const next = [...products];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    patchSection({
      products: next.map((product, order) => ({ ...product, order })),
    });
  }

  function updateImages(index: number, images: CmsSolutionImage[]) {
    updateProduct(index, {
      images: images.map((image, order) => ({ ...image, order })),
    });
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Solutions carousel</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Large product showcase directly below the hero. Each product can have
            multiple images.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={value.visible}
            onChange={(event) =>
              patchSection({ visible: event.target.checked })
            }
          />
          Visible
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Eyebrow"
          value={value.eyebrow}
          onChange={(eyebrow) => patchSection({ eyebrow })}
        />
        <Field
          label="Section CTA label"
          value={value.ctaLabel}
          onChange={(ctaLabel) => patchSection({ ctaLabel })}
        />
        <Field
          label="Heading"
          value={value.title}
          onChange={(title) => patchSection({ title })}
        />
        <Field
          label="Highlighted heading"
          value={value.titleAccent}
          onChange={(titleAccent) => patchSection({ titleAccent })}
        />
        <Field
          label="Section CTA URL"
          value={value.ctaHref}
          onChange={(ctaHref) => patchSection({ ctaHref })}
        />
      </div>
      <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
        Description
        <textarea
          value={value.description}
          onChange={(event) =>
            patchSection({ description: event.target.value })
          }
          rows={3}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal tracking-normal text-slate-900 normal-case outline-none"
        />
      </label>

      <div className="space-y-3">
        {products.map((product, index) => {
          const open = openId === product.id;
          return (
            <div
              key={product.id}
              className="overflow-hidden rounded-2xl border border-slate-200"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : product.id)}
                  className="text-left text-sm font-semibold text-slate-800"
                >
                  {product.name || "Untitled product"}
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    {open ? "Hide" : "Edit"}
                  </span>
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1 text-xs text-slate-500">
                    <input
                      type="checkbox"
                      checked={product.visible}
                      onChange={(event) =>
                        updateProduct(index, { visible: event.target.checked })
                      }
                    />
                    Active
                  </label>
                  <button
                    type="button"
                    onClick={() => moveProduct(index, -1)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveProduct(index, 1)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                  >
                    Move down
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      patchSection({
                        products: products.filter((_, i) => i !== index),
                      })
                    }
                    className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {open ? (
                <div className="space-y-6 p-4">
                  <div>
                    <p className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Content
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field
                        label="Category"
                        value={product.category}
                        onChange={(category) =>
                          updateProduct(index, { category })
                        }
                      />
                      <Field
                        label="Product name"
                        value={product.name}
                        onChange={(name) => updateProduct(index, { name })}
                      />
                      <Field
                        label="Badge"
                        value={product.badge}
                        onChange={(badge) => updateProduct(index, { badge })}
                      />
                      <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
                        Icon
                        <select
                          value={product.icon}
                          onChange={(event) =>
                            updateProduct(index, {
                              icon: event.target
                                .value as CmsSolutionProduct["icon"],
                            })
                          }
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal tracking-normal text-slate-900 normal-case"
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
                      Short description
                      <textarea
                        value={product.description}
                        onChange={(event) =>
                          updateProduct(index, {
                            description: event.target.value,
                          })
                        }
                        rows={3}
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal tracking-normal text-slate-900 normal-case outline-none"
                      />
                    </label>
                  </div>

                  <div>
                    <p className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      CTA
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field
                        label="CTA label"
                        value={product.ctaLabel}
                        onChange={(ctaLabel) =>
                          updateProduct(index, { ctaLabel })
                        }
                      />
                      <Field
                        label="CTA URL"
                        value={product.ctaHref}
                        onChange={(ctaHref) =>
                          updateProduct(index, { ctaHref })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                        Images
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          updateImages(index, [
                            ...product.images,
                            {
                              id: `img-${Date.now()}`,
                              url: "",
                              alt: product.name,
                              visible: true,
                              order: product.images.length,
                            },
                          ])
                        }
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                      >
                        Add image
                      </button>
                    </div>
                    <div className="space-y-3">
                      {product.images.map((image, imageIndex) => (
                        <div
                          key={image.id}
                          className="rounded-xl border border-slate-200 p-3"
                        >
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-medium text-slate-600">
                              Image {imageIndex + 1}
                            </p>
                            <div className="flex gap-2">
                              <label className="flex items-center gap-1 text-xs text-slate-500">
                                <input
                                  type="checkbox"
                                  checked={image.visible}
                                  onChange={(event) => {
                                    const images = [...product.images];
                                    images[imageIndex] = {
                                      ...image,
                                      visible: event.target.checked,
                                    };
                                    updateImages(index, images);
                                  }}
                                />
                                Active
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  if (imageIndex === 0) return;
                                  const images = [...product.images];
                                  [images[imageIndex - 1], images[imageIndex]] =
                                    [images[imageIndex], images[imageIndex - 1]];
                                  updateImages(index, images);
                                }}
                                className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                              >
                                Move up
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (imageIndex === product.images.length - 1)
                                    return;
                                  const images = [...product.images];
                                  [images[imageIndex + 1], images[imageIndex]] =
                                    [images[imageIndex], images[imageIndex + 1]];
                                  updateImages(index, images);
                                }}
                                className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                              >
                                Move down
                              </button>
                            </div>
                          </div>
                          <OrbitImageField
                            label={`${product.name} image ${imageIndex + 1}`}
                            value={image.url}
                            onChange={(url) => {
                              const images = [...product.images];
                              images[imageIndex] = { ...image, url };
                              updateImages(index, images);
                            }}
                            onDelete={() =>
                              updateImages(
                                index,
                                product.images.filter((_, i) => i !== imageIndex),
                              )
                            }
                          />
                          <Field
                            label="Alt text"
                            value={image.alt}
                            onChange={(alt) => {
                              const images = [...product.images];
                              images[imageIndex] = { ...image, alt };
                              updateImages(index, images);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() =>
          patchSection({
            products: [
              ...products,
              {
                id: `solution-${Date.now()}`,
                visible: true,
                order: products.length,
                category: "New product",
                name: "New product",
                description: "",
                badge: "",
                icon: "server",
                ctaLabel: "Explore",
                ctaHref: "/",
                images: [],
              },
            ],
          })
        }
        className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:text-slate-900"
      >
        + Add product
      </button>
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
