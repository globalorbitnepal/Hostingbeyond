import { CatalogPrice } from "@/components/i18n/localized-text";
import { cn } from "@/lib/utils";

export function PanelTldSalePrice({
  register,
  renew,
  compact = false,
  className,
}: {
  register: number;
  renew: number | null;
  compact?: boolean;
  className?: string;
}) {
  const sale = renew != null && renew > register;
  return (
    <span
      className={cn("hb-ds-price", className)}
      data-compact={compact ? "true" : "false"}
    >
      {sale ? (
        <span className="hb-ds-price__renew">
          <CatalogPrice usd={renew} />
        </span>
      ) : null}
      <span className="hb-ds-price__sale">
        <CatalogPrice usd={register} />
      </span>
    </span>
  );
}
