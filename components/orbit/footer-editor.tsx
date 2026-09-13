"use client";

import type { ReactNode } from "react";
import type {
  CmsFooterContent,
  CmsFooterLink,
  CmsFooterPayment,
  CmsFooterPerk,
  CmsFooterSocial,
  CmsFooterTrustItem,
} from "@/lib/orbit/defaults";

const PERK_ICONS: CmsFooterPerk["icon"][] = ["tag", "list", "bell"];
const TRUST_ICONS: CmsFooterTrustItem["icon"][] = [
  "shield",
  "globe",
  "headphones",
];
const SOCIAL: CmsFooterSocial["network"][] = [
  "facebook",
  "instagram",
  "x",
  "linkedin",
  "youtube",
];
const BRANDS: CmsFooterPayment["brand"][] = [
  "visa",
  "mastercard",
  "amex",
  "discover",
  "jcb",
  "diners",
  "unionpay",
  "applepay",
  "googlepay",
  "stripe",
];

type Props = {
  value: CmsFooterContent;
  onChange: (value: CmsFooterContent) => void;
  onPersist?: (value: CmsFooterContent) => void;
};

export function FooterEditor({ value, onChange, onPersist }: Props) {
  function patch(next: Partial<CmsFooterContent>, persist = false) {
    const merged = { ...value, ...next };
    onChange(merged);
    if (persist) onPersist?.(merged);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Footer</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Newsletter, brand, link columns, Stripe payment marks, trust bar and
            legal line. Add, edit, reorder, or hide any item.
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
          label="Newsletter eyebrow"
          value={value.newsletterEyebrow}
          onChange={(newsletterEyebrow) => patch({ newsletterEyebrow })}
        />
        <Field
          label="Newsletter title"
          value={value.newsletterTitle}
          onChange={(newsletterTitle) => patch({ newsletterTitle })}
        />
        <Field
          label="Title accent"
          value={value.newsletterTitleAccent}
          onChange={(newsletterTitleAccent) => patch({ newsletterTitleAccent })}
        />
        <Field
          label="Email placeholder"
          value={value.newsletterPlaceholder}
          onChange={(newsletterPlaceholder) => patch({ newsletterPlaceholder })}
        />
        <Field
          label="Subscribe button"
          value={value.newsletterCta}
          onChange={(newsletterCta) => patch({ newsletterCta })}
        />
        <Field
          label="Privacy line"
          value={value.newsletterPrivacy}
          onChange={(newsletterPrivacy) => patch({ newsletterPrivacy })}
        />
        <Field
          label="Brand tagline"
          value={value.brandTagline}
          onChange={(brandTagline) => patch({ brandTagline })}
        />
        <Field
          label="Handwritten note"
          value={value.handwrittenNote}
          onChange={(handwrittenNote) => patch({ handwrittenNote })}
        />
        <Field
          label="Payments title"
          value={value.paymentsTitle}
          onChange={(paymentsTitle) => patch({ paymentsTitle })}
        />
        <Field
          label="Copyright"
          value={value.copyright}
          onChange={(copyright) => patch({ copyright })}
        />
      </div>
      <TextArea
        label="Newsletter description"
        value={value.newsletterDescription}
        onChange={(newsletterDescription) => patch({ newsletterDescription })}
      />
      <TextArea
        label="Brand description"
        value={value.brandDescription}
        onChange={(brandDescription) => patch({ brandDescription })}
      />
      <Field
        label="Payments description"
        value={value.paymentsDescription}
        onChange={(paymentsDescription) => patch({ paymentsDescription })}
      />

      <ListHeader
        title="Newsletter perks"
        onAdd={() =>
          patch(
            {
              newsletterPerks: [
                ...value.newsletterPerks,
                {
                  id: `perk-${Date.now()}`,
                  visible: true,
                  order: value.newsletterPerks.length,
                  title: "New perk",
                  icon: "bell",
                },
              ],
            },
            true,
          )
        }
      />
      {value.newsletterPerks.map((item, index) => (
        <Row
          key={item.id}
          onMove={move("newsletterPerks", index)}
          onDelete={() => remove("newsletterPerks", index)}
        >
          <Field
            label="Title"
            value={item.title}
            onChange={(title) => {
              const newsletterPerks = [...value.newsletterPerks];
              newsletterPerks[index] = { ...item, title };
              patch({ newsletterPerks });
            }}
          />
          <Select
            label="Icon"
            value={item.icon}
            options={PERK_ICONS}
            onChange={(icon) => {
              const newsletterPerks = [...value.newsletterPerks];
              newsletterPerks[index] = {
                ...item,
                icon: icon as CmsFooterPerk["icon"],
              };
              patch({ newsletterPerks }, true);
            }}
          />
          <Active
            checked={item.visible}
            onChange={(visible) => {
              const newsletterPerks = [...value.newsletterPerks];
              newsletterPerks[index] = { ...item, visible };
              patch({ newsletterPerks }, true);
            }}
          />
        </Row>
      ))}

      <ListHeader
        title="Social links"
        onAdd={() =>
          patch(
            {
              social: [
                ...value.social,
                {
                  id: `social-${Date.now()}`,
                  visible: true,
                  order: value.social.length,
                  network: "facebook",
                  href: "https://",
                },
              ],
            },
            true,
          )
        }
      />
      {value.social.map((item, index) => (
        <Row
          key={item.id}
          onMove={move("social", index)}
          onDelete={() => remove("social", index)}
        >
          <Select
            label="Network"
            value={item.network}
            options={SOCIAL}
            onChange={(network) => {
              const social = [...value.social];
              social[index] = {
                ...item,
                network: network as CmsFooterSocial["network"],
              };
              patch({ social }, true);
            }}
          />
          <Field
            label="URL"
            value={item.href}
            onChange={(href) => {
              const social = [...value.social];
              social[index] = { ...item, href };
              patch({ social });
            }}
          />
          <Active
            checked={item.visible}
            onChange={(visible) => {
              const social = [...value.social];
              social[index] = { ...item, visible };
              patch({ social }, true);
            }}
          />
        </Row>
      ))}

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Link columns
        </p>
        <button
          type="button"
          onClick={() =>
            patch(
              {
                columns: [
                  ...value.columns,
                  {
                    id: `col-${Date.now()}`,
                    visible: true,
                    order: value.columns.length,
                    title: "New column",
                    links: [],
                  },
                ],
              },
              true,
            )
          }
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
        >
          Add column
        </button>
      </div>
      {value.columns.map((column, columnIndex) => (
        <div key={column.id} className="rounded-xl border border-slate-200 p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-slate-600">
              Column {columnIndex + 1}
            </p>
            <div className="flex flex-wrap gap-2">
              <Active
                checked={column.visible}
                onChange={(visible) => {
                  const columns = [...value.columns];
                  columns[columnIndex] = { ...column, visible };
                  patch({ columns }, true);
                }}
              />
              <button
                type="button"
                onClick={() =>
                  patch(
                    {
                      columns: value.columns.filter(
                        (_, i) => i !== columnIndex,
                      ),
                    },
                    true,
                  )
                }
                className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600"
              >
                Delete column
              </button>
            </div>
          </div>
          <Field
            label="Column title"
            value={column.title}
            onChange={(title) => {
              const columns = [...value.columns];
              columns[columnIndex] = { ...column, title };
              patch({ columns });
            }}
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Links</p>
            <button
              type="button"
              onClick={() => {
                const columns = [...value.columns];
                const links: CmsFooterLink[] = [
                  ...column.links,
                  {
                    id: `link-${Date.now()}`,
                    visible: true,
                    order: column.links.length,
                    label: "New link",
                    href: "/",
                  },
                ];
                columns[columnIndex] = { ...column, links };
                patch({ columns }, true);
              }}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
            >
              Add link
            </button>
          </div>
          {column.links.map((link, linkIndex) => (
            <div
              key={link.id}
              className="mt-2 grid gap-2 rounded-lg border border-slate-100 p-2 sm:grid-cols-2"
            >
              <Field
                label="Label"
                value={link.label}
                onChange={(label) =>
                  updateLink(columnIndex, linkIndex, { label })
                }
              />
              <Field
                label="URL"
                value={link.href}
                onChange={(href) =>
                  updateLink(columnIndex, linkIndex, { href })
                }
              />
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <Active
                  checked={link.visible}
                  onChange={(visible) =>
                    updateLink(columnIndex, linkIndex, { visible }, true)
                  }
                />
                <button
                  type="button"
                  onClick={() => {
                    const columns = [...value.columns];
                    columns[columnIndex] = {
                      ...column,
                      links: column.links.filter((_, i) => i !== linkIndex),
                    };
                    patch({ columns }, true);
                  }}
                  className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      <ListHeader
        title="Payment marks"
        onAdd={() =>
          patch(
            {
              payments: [
                ...value.payments,
                {
                  id: `pay-${Date.now()}`,
                  visible: true,
                  order: value.payments.length,
                  brand: "visa",
                },
              ],
            },
            true,
          )
        }
      />
      {value.payments.map((item, index) => (
        <Row
          key={item.id}
          onMove={move("payments", index)}
          onDelete={() => remove("payments", index)}
        >
          <Select
            label="Brand"
            value={item.brand}
            options={BRANDS}
            onChange={(brand) => {
              const payments = [...value.payments];
              payments[index] = {
                ...item,
                brand: brand as CmsFooterPayment["brand"],
              };
              patch({ payments }, true);
            }}
          />
          <Active
            checked={item.visible}
            onChange={(visible) => {
              const payments = [...value.payments];
              payments[index] = { ...item, visible };
              patch({ payments }, true);
            }}
          />
        </Row>
      ))}

      <ListHeader
        title="Payment benefits"
        onAdd={() =>
          patch(
            {
              paymentBenefits: [
                ...value.paymentBenefits,
                {
                  id: `benefit-${Date.now()}`,
                  visible: true,
                  order: value.paymentBenefits.length,
                  label: "New benefit",
                },
              ],
            },
            true,
          )
        }
      />
      {value.paymentBenefits.map((item, index) => (
        <Row
          key={item.id}
          onMove={move("paymentBenefits", index)}
          onDelete={() => remove("paymentBenefits", index)}
        >
          <Field
            label="Label"
            value={item.label}
            onChange={(label) => {
              const paymentBenefits = [...value.paymentBenefits];
              paymentBenefits[index] = { ...item, label };
              patch({ paymentBenefits });
            }}
          />
          <Active
            checked={item.visible}
            onChange={(visible) => {
              const paymentBenefits = [...value.paymentBenefits];
              paymentBenefits[index] = { ...item, visible };
              patch({ paymentBenefits }, true);
            }}
          />
        </Row>
      ))}

      <ListHeader
        title="Trust bar"
        onAdd={() =>
          patch(
            {
              trustItems: [
                ...value.trustItems,
                {
                  id: `trust-${Date.now()}`,
                  visible: true,
                  order: value.trustItems.length,
                  title: "New trust item",
                  subtitle: "Short supporting line",
                  icon: "shield",
                },
              ],
            },
            true,
          )
        }
      />
      {value.trustItems.map((item, index) => (
        <Row
          key={item.id}
          onMove={move("trustItems", index)}
          onDelete={() => remove("trustItems", index)}
        >
          <Field
            label="Title"
            value={item.title}
            onChange={(title) => {
              const trustItems = [...value.trustItems];
              trustItems[index] = { ...item, title };
              patch({ trustItems });
            }}
          />
          <Field
            label="Subtitle"
            value={item.subtitle}
            onChange={(subtitle) => {
              const trustItems = [...value.trustItems];
              trustItems[index] = { ...item, subtitle };
              patch({ trustItems });
            }}
          />
          <Select
            label="Icon"
            value={item.icon}
            options={TRUST_ICONS}
            onChange={(icon) => {
              const trustItems = [...value.trustItems];
              trustItems[index] = {
                ...item,
                icon: icon as CmsFooterTrustItem["icon"],
              };
              patch({ trustItems }, true);
            }}
          />
        </Row>
      ))}

      <ListHeader
        title="Legal links"
        onAdd={() =>
          patch(
            {
              legalLinks: [
                ...value.legalLinks,
                {
                  id: `legal-${Date.now()}`,
                  visible: true,
                  order: value.legalLinks.length,
                  label: "New policy",
                  href: "/legal",
                },
              ],
            },
            true,
          )
        }
      />
      {value.legalLinks.map((item, index) => (
        <Row
          key={item.id}
          onMove={move("legalLinks", index)}
          onDelete={() => remove("legalLinks", index)}
        >
          <Field
            label="Label"
            value={item.label}
            onChange={(label) => {
              const legalLinks = [...value.legalLinks];
              legalLinks[index] = { ...item, label };
              patch({ legalLinks });
            }}
          />
          <Field
            label="URL"
            value={item.href}
            onChange={(href) => {
              const legalLinks = [...value.legalLinks];
              legalLinks[index] = { ...item, href };
              patch({ legalLinks });
            }}
          />
        </Row>
      ))}
    </section>
  );

  function updateLink(
    columnIndex: number,
    linkIndex: number,
    next: Partial<CmsFooterLink>,
    persist = false,
  ) {
    const columns = [...value.columns];
    const column = columns[columnIndex];
    const links = [...column.links];
    links[linkIndex] = { ...links[linkIndex], ...next };
    columns[columnIndex] = { ...column, links };
    patch({ columns }, persist);
  }

  function move(key: keyof CmsFooterContent, index: number) {
    return (dir: -1 | 1) => {
      const list = [...(value[key] as Array<{ order: number }>)];
      const next = index + dir;
      if (next < 0 || next >= list.length) return;
      [list[index], list[next]] = [list[next], list[index]];
      patch(
        {
          [key]: list.map((entry, order) => ({ ...entry, order })),
        } as Partial<CmsFooterContent>,
        true,
      );
    };
  }

  function remove(key: keyof CmsFooterContent, index: number) {
    const list = [...(value[key] as unknown[])];
    list.splice(index, 1);
    patch({ [key]: list } as Partial<CmsFooterContent>, true);
  }
}

function ListHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {title}
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
      >
        Add
      </button>
    </div>
  );
}

function Row({
  children,
  onMove,
  onDelete,
}: {
  children: ReactNode;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-2">
      {children}
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button
          type="button"
          onClick={() => onMove(-1)}
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
        >
          Move up
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
        >
          Move down
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function Active({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-1 text-xs text-slate-500">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      Active
    </label>
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

function TextArea({
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
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
