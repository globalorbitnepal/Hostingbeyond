"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { CatalogPrice } from "@/components/i18n/localized-text";
import { PanelTldSalePrice } from "@/components/panel/panel-tld-sale-price";
import { routes } from "@/config/routes";
import type { LiveDomainTld } from "@/lib/panel/featured-domain-tld-types";

export function PanelTldCatalog({
  liveTlds,
  previewLimit,
  onPickTld,
  heading = "Live TLD prices",
}: {
  liveTlds: LiveDomainTld[];
  previewLimit?: number;
  onPickTld?: (tld: string) => void;
  heading?: string;
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(!previewLimit);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase().replace(/^\./, "");
    if (!needle) return liveTlds;
    return liveTlds.filter((row) =>
      row.tld.replace(/^\./, "").includes(needle),
    );
  }, [liveTlds, query]);

  const visible =
    previewLimit && !expanded ? filtered.slice(0, previewLimit) : filtered;
  const hiddenCount =
    previewLimit && !expanded
      ? Math.max(filtered.length - visible.length, 0)
      : 0;

  return (
    <section className="hb-ds-catalog">
      <div className="hb-ds-catalog__head">
        <div>
          <p className="hb-ds-catalog__kicker">Orbit live catalogue</p>
          <h2 className="font-heading text-2xl font-extrabold tracking-tight">
            {heading}
          </h2>
          <p className="mt-1 text-sm text-[var(--hb-p-muted)]">
            {liveTlds.length} verified extensions. 1st year is the sale price;
            renewal is the ongoing rate.
          </p>
        </div>
        <label className="hb-ds-catalog__search">
          <Search className="h-4 w-4 shrink-0 opacity-60" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter TLDs, e.g. com"
            aria-label="Filter TLD list"
          />
        </label>
      </div>

      <div className="hb-ds-catalog__cols" aria-hidden="true">
        <span>Extension</span>
        <span>1st year</span>
        <span>Renewal</span>
        <span>Transfer</span>
      </div>

      {visible.length ? (
        <ul className="hb-ds-catalog__list">
          {visible.map((row) => {
            const sale = row.register < row.renew;
            const inner = (
              <>
                <span className="hb-ds-catalog__tld">
                  {row.tld}
                  {sale ? <span className="hb-ds-sale-badge">SALE</span> : null}
                </span>
                <span>
                  <PanelTldSalePrice
                    register={row.register}
                    renew={row.renew}
                    compact
                  />
                </span>
                <span className="hb-ds-catalog__renew">
                  <CatalogPrice usd={row.renew} />
                  <span className="hb-ds-catalog__unit">/ yr</span>
                </span>
                <span className="hb-ds-catalog__transfer">
                  {row.transfer != null ? (
                    <>
                      <CatalogPrice usd={row.transfer} />
                      <span className="hb-ds-catalog__unit">/ yr</span>
                    </>
                  ) : (
                    "—"
                  )}
                </span>
              </>
            );
            return (
              <li key={row.tld}>
                {onPickTld ? (
                  <button
                    type="button"
                    className="hb-ds-catalog__row"
                    onClick={() => onPickTld(row.tld)}
                  >
                    {inner}
                  </button>
                ) : (
                  <Link
                    href={`${routes.accountDomainFind}?q=example${row.tld}`}
                    className="hb-ds-catalog__row"
                  >
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-1 py-8 text-center text-sm text-[var(--hb-p-muted)]">
          No live TLD matches that filter.
        </p>
      )}

      {previewLimit ? (
        <div className="hb-ds-catalog__more">
          {hiddenCount > 0 && !expanded ? (
            <button
              type="button"
              className="hb-ds-viewall"
              onClick={() => setExpanded(true)}
            >
              View all TLDs
            </button>
          ) : null}
          <Link
            href={routes.accountDomainTlds}
            className="hb-ds-viewall hb-ds-viewall--ghost"
          >
            Open TLD list
          </Link>
        </div>
      ) : null}
    </section>
  );
}
