"use client";

import type {
  DomainCheckoutServiceOffer,
  DomainCheckoutServiceSelection,
} from "@/lib/domains/domain-checkout-offers";
import {
  EMAIL_BILLING_TERM_OPTIONS,
  type EmailBillingTerm,
} from "@/lib/hosting/business-email-term-pricing";
import { CatalogPrice } from "@/components/i18n/localized-text";
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
  if (offer.kind === "domain-protection") {
    return { kind: "domain-protection" };
  }
  return {
    kind: "business-email",
    planId: offer.planId,
    term: offer.term,
  };
}

export function offerKey(offer: DomainCheckoutServiceOffer): string {
  if (offer.kind === "hosting") {
    return `hosting:${offer.productSlug}:${offer.planKey}:${offer.billing}`;
  }
  if (offer.kind === "domain-protection") {
    return "domain-protection";
  }
  return `email:${offer.planId}:${offer.term}`;
}

export function hostingGroupKey(offer: DomainCheckoutServiceOffer): string {
  if (offer.kind !== "hosting") return "";
  return `hosting:${offer.productSlug}:${offer.planKey}`;
}

export function emailGroupKey(planId: string): string {
  return `email:${planId}`;
}

export type HostingOfferGroup = {
  groupKey: string;
  planName: string;
  label: string;
  description: string;
  monthly?: DomainCheckoutServiceOffer & { kind: "hosting" };
  annually?: DomainCheckoutServiceOffer & { kind: "hosting" };
};

export type EmailOfferGroup = {
  groupKey: string;
  planId: string;
  planName: string;
  description: string;
  mailboxesLabel: string;
  storageLabel: string;
  byTerm: Partial<
    Record<
      EmailBillingTerm,
      DomainCheckoutServiceOffer & { kind: "business-email" }
    >
  >;
};

export function groupCheckoutOffers(optional: DomainCheckoutServiceOffer[]) {
  const hostingGroups = new Map<string, HostingOfferGroup>();
  const emailGroups = new Map<string, EmailOfferGroup>();
  const protectionOffers: Array<
    DomainCheckoutServiceOffer & { kind: "domain-protection" }
  > = [];

  for (const offer of optional) {
    if (offer.kind === "domain-protection") {
      protectionOffers.push(offer);
    } else if (offer.kind === "hosting") {
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
      const gk = emailGroupKey(offer.planId);
      const existing = emailGroups.get(gk) ?? {
        groupKey: gk,
        planId: offer.planId,
        planName: offer.planName,
        description: offer.description,
        mailboxesLabel: offer.mailboxesLabel,
        storageLabel: offer.storageLabel,
        byTerm: {},
      };
      existing.byTerm[offer.term] = offer;
      emailGroups.set(gk, existing);
    }
  }

  return {
    hostingGroups: [...hostingGroups.values()],
    emailGroups: [...emailGroups.values()],
    protectionOffers,
  };
}

type AddonListProps = {
  optional: DomainCheckoutServiceOffer[];
  selectedKeys: Set<string>;
  hostingBilling: Record<string, "monthly" | "annually">;
  emailBilling: Record<string, EmailBillingTerm>;
  onHostingBillingChange: (
    groupKey: string,
    billing: "monthly" | "annually",
  ) => void;
  onEmailBillingChange: (groupKey: string, term: EmailBillingTerm) => void;
  onToggleOffer: (offer: DomainCheckoutServiceOffer) => void;
  exampleEmail?: string;
  className?: string;
};

function AddonSwitch({
  checked,
  label,
  onClick,
}: {
  checked: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="hb-checkout-premium__switch mt-1"
      onClick={onClick}
    />
  );
}

function TermPillGroup<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      className="mt-4 flex w-full max-w-full [scrollbar-width:none] overflow-x-auto rounded-2xl border border-[var(--hb-co-border)] bg-[var(--hb-co-bg-subtle)] p-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "min-h-10 min-w-[4.5rem] flex-1 touch-manipulation rounded-xl px-2 text-[11px] font-extrabold whitespace-nowrap transition sm:px-3 sm:text-[12px]",
            value === opt.value
              ? "bg-gradient-to-r from-[#6025c5] to-[#3730a3] text-white shadow-sm"
              : "text-[var(--hb-co-text-muted)] hover:text-[var(--hb-co-text)]",
          )}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function CheckoutAddonOfferList({
  optional,
  selectedKeys,
  hostingBilling,
  emailBilling,
  onHostingBillingChange,
  onEmailBillingChange,
  onToggleOffer,
  exampleEmail = "info@yourdomain.com",
  className,
}: AddonListProps) {
  const { hostingGroups, emailGroups, protectionOffers } =
    groupCheckoutOffers(optional);

  if (
    hostingGroups.length === 0 &&
    emailGroups.length === 0 &&
    protectionOffers.length === 0
  ) {
    return (
      <p className="text-[13px] text-[var(--hb-co-text-muted)]">
        No additional services are available for checkout right now.
      </p>
    );
  }

  return (
    <ul className={cn("space-y-4", className)}>
      {protectionOffers.map((offer) => {
        const added = selectedKeys.has(offerKey(offer));
        return (
          <li
            key={offerKey(offer)}
            className="hb-checkout-premium__card overflow-hidden p-0"
          >
            <div className="flex items-start gap-4 p-5">
              <AddonSwitch
                checked={added}
                label={offer.label}
                onClick={() => onToggleOffer(offer)}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[17px] font-extrabold tracking-tight text-[var(--hb-co-text)]">
                  {offer.label}
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-[var(--hb-co-text-muted)]">
                  {offer.description}
                </p>
              </div>
              <p className="shrink-0 text-right text-[15px] font-extrabold text-[var(--hb-co-text)]">
                <CatalogPrice usd={offer.amount} />
                <span className="mt-0.5 block text-[12px] font-semibold text-[var(--hb-co-text-muted)]">
                  {offer.periodLabel}
                </span>
              </p>
            </div>
          </li>
        );
      })}
      {hostingGroups.map((group) => {
        const billing =
          hostingBilling[group.groupKey] ??
          (group.monthly ? "monthly" : "annually");
        const activeOffer =
          billing === "monthly" ? group.monthly : group.annually;
        const added = activeOffer
          ? selectedKeys.has(offerKey(activeOffer))
          : false;

        return (
          <li
            key={group.groupKey}
            className="hb-checkout-premium__card overflow-hidden p-0"
          >
            <div className="flex items-start gap-4 p-5">
              {activeOffer ? (
                <AddonSwitch
                  checked={added}
                  label={group.planName}
                  onClick={() => onToggleOffer(activeOffer)}
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-[17px] font-extrabold tracking-tight text-[var(--hb-co-text)]">
                  Web Hosting
                </p>
                <p className="text-[13px] font-semibold text-[var(--hb-co-primary)]">
                  {group.planName}
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-[var(--hb-co-text-muted)]">
                  {group.description}
                </p>
                {group.monthly && group.annually ? (
                  <TermPillGroup
                    ariaLabel="Hosting billing period"
                    options={[
                      { value: "monthly" as const, label: "Monthly" },
                      { value: "annually" as const, label: "Annual" },
                    ]}
                    value={billing}
                    onChange={(v) => onHostingBillingChange(group.groupKey, v)}
                  />
                ) : null}
              </div>
              {activeOffer ? (
                <p className="shrink-0 text-right text-[15px] font-extrabold text-[var(--hb-co-text)]">
                  <CatalogPrice usd={activeOffer.amount} />
                  <span className="mt-0.5 block text-[12px] font-semibold text-[var(--hb-co-text-muted)]">
                    {activeOffer.periodLabel}
                  </span>
                </p>
              ) : null}
            </div>
          </li>
        );
      })}

      {emailGroups.map((group) => {
        const availableTerms = EMAIL_BILLING_TERM_OPTIONS.filter(
          (o) => group.byTerm[o.value],
        );
        const term =
          emailBilling[group.groupKey] ?? availableTerms[0]?.value ?? "monthly";
        const activeOffer = group.byTerm[term];
        const added = activeOffer
          ? selectedKeys.has(offerKey(activeOffer))
          : false;

        return (
          <li
            key={group.groupKey}
            className="hb-checkout-premium__card overflow-hidden p-0"
          >
            <div className="flex items-start gap-4 p-5">
              {activeOffer ? (
                <AddonSwitch
                  checked={added}
                  label="Professional Email"
                  onClick={() => onToggleOffer(activeOffer)}
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-[17px] font-extrabold tracking-tight">
                  Professional Email
                  <span className="ml-2 inline-flex rounded-full border border-[var(--hb-co-border)] px-2 py-0.5 align-middle text-[11px] font-bold text-[var(--hb-co-text-muted)]">
                    Recommended
                  </span>
                </p>
                <p className="mt-1 text-[13px] font-semibold text-[var(--hb-co-primary)]">
                  {exampleEmail}
                </p>
                <p className="mt-1 text-[14px] text-[var(--hb-co-text-muted)]">
                  {group.mailboxesLabel} · {group.storageLabel}
                </p>
                {availableTerms.length > 0 ? (
                  <TermPillGroup
                    ariaLabel="Email billing term"
                    options={availableTerms}
                    value={term}
                    onChange={(v) => onEmailBillingChange(group.groupKey, v)}
                  />
                ) : null}
              </div>
              {activeOffer ? (
                <p className="shrink-0 text-right text-[15px] font-extrabold text-[var(--hb-co-text)]">
                  {activeOffer.firstMonthFree ? (
                    <>
                      <CatalogPrice usd={0} />
                      <span className="mt-1 block text-[12px] font-semibold text-[var(--hb-co-text-muted)]">
                        Renews at{" "}
                        <CatalogPrice usd={activeOffer.renewalPerMonth} />
                        /mo
                      </span>
                      <span className="mt-2 inline-flex rounded-md bg-[#f5c518] px-2 py-0.5 text-[11px] font-extrabold text-[#1a1035]">
                        1 Month Free
                      </span>
                    </>
                  ) : (
                    <>
                      <CatalogPrice usd={activeOffer.amount} />
                      <span className="mt-0.5 block text-[12px] font-semibold text-[var(--hb-co-text-muted)]">
                        {activeOffer.prepaidMonths > 1
                          ? `${activeOffer.prepaidMonths} months prepaid`
                          : "/ mo"}
                      </span>
                    </>
                  )}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
