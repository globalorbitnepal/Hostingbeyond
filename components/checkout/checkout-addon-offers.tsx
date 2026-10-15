"use client";

import { Mail, Server } from "lucide-react";

import type {
  DomainCheckoutServiceOffer,
  DomainCheckoutServiceSelection,
} from "@/lib/domains/domain-checkout-offers";
import { formatPrice } from "@/lib/domains/tlds";
import { cn } from "@/lib/utils";

export function offerToSelection(
  offer: DomainCheckoutServiceOffer,
): DomainCheckoutServiceSelection {
  if (offer.kind === "hosting") {
    return {
      kind: "hosting",
      productSlug: offer.productSlug,
      planKey: offer.planKey,
      billing: offer.billing,
    };
  }
  return { kind: "business-email", planId: offer.planId };
}

export function offerKey(offer: DomainCheckoutServiceOffer): string {
  if (offer.kind === "hosting") {
    return `hosting:${offer.productSlug}:${offer.planKey}:${offer.billing}`;
  }
  return `email:${offer.planId}`;
}

export function hostingGroupKey(offer: DomainCheckoutServiceOffer): string {
  if (offer.kind !== "hosting") return "";
  return `hosting:${offer.productSlug}:${offer.planKey}`;
}

export type HostingOfferGroup = {
  groupKey: string;
  planName: string;
  label: string;
  description: string;
  monthly?: DomainCheckoutServiceOffer & { kind: "hosting" };
  annually?: DomainCheckoutServiceOffer & { kind: "hosting" };
};

export function groupCheckoutOffers(optional: DomainCheckoutServiceOffer[]) {
  const hostingGroups = new Map<string, HostingOfferGroup>();
  const emailOffers: Array<
    DomainCheckoutServiceOffer & { kind: "business-email" }
  > = [];

  for (const offer of optional) {
    if (offer.kind === "hosting") {
      const gk = hostingGroupKey(offer);
      const existing = hostingGroups.get(gk) ?? {
        groupKey: gk,
        planName: offer.planName,
        label: offer.label,
        description: offer.description,
      };
      if (offer.billing === "monthly") existing.monthly = offer;
      else existing.annually = offer;
      hostingGroups.set(gk, existing);
    } else if (offer.kind === "business-email") {
      emailOffers.push(offer);
    }
  }

  return {
    hostingGroups: [...hostingGroups.values()],
    emailOffers,
  };
}

type AddonListProps = {
  optional: DomainCheckoutServiceOffer[];
  selectedKeys: Set<string>;
  hostingBilling: Record<string, "monthly" | "annually">;
  onHostingBillingChange: (
    groupKey: string,
    billing: "monthly" | "annually",
  ) => void;
  onToggleOffer: (offer: DomainCheckoutServiceOffer) => void;
  exampleEmail?: string;
  className?: string;
};

export function CheckoutAddonOfferList({
  optional,
  selectedKeys,
  hostingBilling,
  onHostingBillingChange,
  onToggleOffer,
  exampleEmail = "info@yourdomain.com",
  className,
}: AddonListProps) {
  const { hostingGroups, emailOffers } = groupCheckoutOffers(optional);

  if (hostingGroups.length === 0 && emailOffers.length === 0) {
    return (
      <p className="text-[13px] text-[var(--hb-co-text-muted)]">
        No additional services are available for checkout right now.
      </p>
    );
  }

  return (
    <ul className={cn("space-y-4", className)}>
      {hostingGroups.map((group) => {
        const billing =
          hostingBilling[group.groupKey] ??
          (group.monthly ? "monthly" : "annually");
        const activeOffer =
          billing === "monthly" ? group.monthly : group.annually;
        const altOffer = billing === "monthly" ? group.annually : group.monthly;
        const added = activeOffer
          ? selectedKeys.has(offerKey(activeOffer))
          : false;

        return (
          <li
            key={group.groupKey}
            className="hb-checkout-premium__card overflow-hidden p-0"
          >
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:gap-5">
              <span
                className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--hb-co-surface)] text-[var(--hb-co-primary)] shadow-inner"
                aria-hidden
              >
                <Server className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold tracking-wide text-[var(--hb-co-primary)] uppercase">
                  Web hosting
                </p>
                <p className="mt-0.5 text-[17px] font-extrabold tracking-tight text-[var(--hb-co-text)]">
                  {group.planName}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--hb-co-text-muted)]">
                  {group.description}
                </p>
                {group.monthly && group.annually ? (
                  <div
                    className="mt-4 inline-flex rounded-full border border-[var(--hb-co-border)] bg-[var(--hb-co-bg-subtle)] p-1"
                    role="group"
                    aria-label="Billing period"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        onHostingBillingChange(group.groupKey, "monthly")
                      }
                      className={cn(
                        "min-h-10 rounded-full px-4 text-[12px] font-bold transition",
                        billing === "monthly"
                          ? "bg-[var(--hb-co-primary)] text-white shadow-sm"
                          : "text-[var(--hb-co-text-muted)] hover:text-[var(--hb-co-text)]",
                      )}
                      aria-pressed={billing === "monthly"}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onHostingBillingChange(group.groupKey, "annually")
                      }
                      className={cn(
                        "min-h-10 rounded-full px-4 text-[12px] font-bold transition",
                        billing === "annually"
                          ? "bg-[var(--hb-co-primary)] text-white shadow-sm"
                          : "text-[var(--hb-co-text-muted)] hover:text-[var(--hb-co-text)]",
                      )}
                      aria-pressed={billing === "annually"}
                    >
                      Annual
                    </button>
                  </div>
                ) : null}
                {activeOffer ? (
                  <p className="mt-3 text-[15px] font-extrabold text-[var(--hb-co-text)]">
                    {formatPrice(activeOffer.amount)}
                    <span className="ml-1 text-[12px] font-semibold text-[var(--hb-co-text-muted)]">
                      {activeOffer.periodLabel}
                    </span>
                    {altOffer && billing === "annually" && group.monthly ? (
                      <span className="mt-1 block text-[11px] font-medium text-[var(--hb-co-text-muted)]">
                        vs {formatPrice(group.monthly.amount)}/month billed
                        monthly
                      </span>
                    ) : null}
                  </p>
                ) : null}
              </div>
              {activeOffer ? (
                <button
                  type="button"
                  onClick={() => onToggleOffer(activeOffer)}
                  className={cn(
                    "hb-checkout-premium__btn-primary min-h-11 shrink-0 px-6 sm:self-center",
                    added &&
                      "border-2 border-[var(--hb-co-success)] bg-[var(--hb-co-success)] hover:shadow-none",
                  )}
                  aria-pressed={added}
                >
                  {added ? "Added" : "Add"}
                </button>
              ) : null}
            </div>
          </li>
        );
      })}

      {emailOffers.map((offer) => {
        const key = offerKey(offer);
        const added = selectedKeys.has(key);
        return (
          <li key={key} className="hb-checkout-premium__card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <span
                className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--hb-co-surface)] text-[var(--hb-co-primary)]"
                aria-hidden
              >
                <Mail className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold tracking-wide text-[var(--hb-co-primary)] uppercase">
                  Business email
                </p>
                <p className="mt-0.5 text-[17px] font-extrabold">
                  {offer.planName}
                </p>
                <p className="mt-1.5 text-[13px] text-[var(--hb-co-text-muted)]">
                  {offer.description}
                </p>
                <p className="mt-1 text-[12px] font-semibold text-[var(--hb-co-primary)]">
                  {exampleEmail}
                </p>
                <p className="mt-2 text-[15px] font-extrabold">
                  {formatPrice(offer.amount)}
                  <span className="ml-1 text-[12px] font-semibold text-[var(--hb-co-text-muted)]">
                    {offer.periodLabel}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleOffer(offer)}
                className={cn(
                  "hb-checkout-premium__btn-primary min-h-11 shrink-0 px-6 sm:self-center",
                  added &&
                    "border-2 border-[var(--hb-co-success)] bg-[var(--hb-co-success)]",
                )}
                aria-pressed={added}
              >
                {added ? "Added" : "Add"}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
