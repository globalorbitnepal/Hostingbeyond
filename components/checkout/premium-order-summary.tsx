"use client";

import { formatPrice } from "@/lib/domains/tlds";
import { cn } from "@/lib/utils";

export type SummaryLine = {
  key: string;
  label: string;
  detail?: string;
  amount: number;
};

type Props = {
  domainLines: SummaryLine[];
  serviceLines: SummaryLine[];
  domainsSubtotal: number;
  servicesSubtotal: number;
  total: number;
  currency: string;
  taxes?: number;
  compact?: boolean;
  className?: string;
};

export function PremiumOrderSummary({
  domainLines,
  serviceLines,
  domainsSubtotal,
  servicesSubtotal,
  total,
  currency,
  taxes = 0,
  compact = false,
  className,
}: Props) {
  const fmt = (n: number) =>
    currency === "USD" ? formatPrice(n) : `${n.toFixed(2)} ${currency}`;

  return (
    <aside
      className={cn(
        "hb-checkout-premium__card p-5",
        !compact && "lg:sticky lg:top-6",
        className,
      )}
      aria-label="Order summary"
    >
      <h2 className="text-[12px] font-bold tracking-wide text-[var(--hb-co-text-muted)] uppercase">
        Order summary
      </h2>
      <ul className="mt-4 space-y-2.5 border-b border-[var(--hb-co-border)] pb-4">
        {domainLines.map((line) => (
          <li key={line.key} className="flex justify-between gap-2 text-[13px]">
            <span className="min-w-0 font-medium text-[var(--hb-co-text)]">
              {line.label}
              {line.detail ? (
                <span className="mt-0.5 block text-[11px] font-normal text-[var(--hb-co-text-muted)]">
                  {line.detail}
                </span>
              ) : null}
            </span>
            <span className="shrink-0 font-semibold">{fmt(line.amount)}</span>
          </li>
        ))}
        {serviceLines.map((line) => (
          <li key={line.key} className="flex justify-between gap-2 text-[13px]">
            <span className="min-w-0 font-medium text-[var(--hb-co-text)]">
              {line.label}
              {line.detail ? (
                <span className="mt-0.5 block text-[11px] font-normal text-[var(--hb-co-text-muted)]">
                  {line.detail}
                </span>
              ) : null}
            </span>
            <span className="shrink-0 font-semibold">{fmt(line.amount)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-1.5 text-[13px]">
        <div className="flex justify-between text-[var(--hb-co-text-muted)]">
          <span>Domains</span>
          <span>{fmt(domainsSubtotal)}</span>
        </div>
        {servicesSubtotal > 0 ? (
          <div className="flex justify-between text-[var(--hb-co-text-muted)]">
            <span>Add-ons</span>
            <span>{fmt(servicesSubtotal)}</span>
          </div>
        ) : null}
        {taxes > 0 ? (
          <div className="flex justify-between text-[var(--hb-co-text-muted)]">
            <span>Tax</span>
            <span>{fmt(taxes)}</span>
          </div>
        ) : (
          <div className="flex justify-between text-[var(--hb-co-text-muted)]">
            <span>Taxes / fees</span>
            <span>Calculated at payment</span>
          </div>
        )}
        <div className="flex justify-between pt-2 text-[17px] font-extrabold text-[var(--hb-co-text)]">
          <span>Estimated total</span>
          <span>{fmt(total)}</span>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-snug text-[var(--hb-co-text-muted)]">
        Domain registration is charged from your HostingBeyond wallet today.
        Add-on plans follow their own checkout when applicable.
      </p>
    </aside>
  );
}
