"use client";

import { Mail, Server, ShieldCheck } from "lucide-react";

import type {
  DomainCheckoutServiceOffer,
  DomainCheckoutServiceSelection,
} from "@/lib/domains/domain-checkout-offers";
import {
  EMAIL_BILLING_TERM_OPTIONS,
  type EmailBillingTerm,
} from "@/lib/hosting/business-email-term-pricing";
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
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:gap-5">
              <span
                className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ede9fe] to-[#dbeafe] text-[var(--hb-co-primary)]"
                aria-hidden
              >
                <ShieldCheck className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold tracking-[0.12em] text-[var(--hb-co-primary)] uppercase">
                  Extra
                </p>
                <p className="mt-0.5 text-[18px] font-extrabold tracking-tight text-[var(--hb-co-text)]">
                  {offer.label}
                </p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--hb-co-text-muted)]">
                  {offer.description}
                </p>
                <p className="mt-3 text-[16px] font-extrabold text-[var(--hb-co-text)]">
                  {formatPrice(offer.amount)}
                  <span className="ml-1.5 text-[13px] font-semibold text-[var(--hb-co-text-muted)]">
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
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:gap-5">
              <span
                className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ede9fe] to-[#dbeafe] text-[var(--hb-co-primary)]"
                aria-hidden
              >
                <Server className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold tracking-[0.12em] text-[var(--hb-co-primary)] uppercase">
                  Web hosting
                </p>
                <p className="mt-0.5 text-[18px] font-extrabold tracking-tight text-[var(--hb-co-text)]">
                  {group.planName}
                </p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--hb-co-text-muted)]">
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
                {activeOffer ? (
                  <p className="mt-3 text-[16px] font-extrabold text-[var(--hb-co-text)]">
                    {formatPrice(activeOffer.amount)}
                    <span className="ml-1.5 text-[13px] font-semibold text-[var(--hb-co-text-muted)]">
                      {activeOffer.periodLabel}
                    </span>
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
                      "border-2 border-[var(--hb-co-success)] bg-[var(--hb-co-success)]",
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
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:gap-5">
              <span
                className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ede9fe] to-[#dbeafe] text-[var(--hb-co-primary)]"
                aria-hidden
              >
                <Mail className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold tracking-[0.12em] text-[var(--hb-co-primary)] uppercase">
                  Business email
                </p>
                <p className="mt-0.5 text-[18px] font-extrabold tracking-tight">
                  {group.planName}
                </p>
                <p className="mt-1 text-[13px] font-semibold text-[var(--hb-co-primary)]">
                  {exampleEmail}
                </p>
                <p className="mt-1.5 text-[14px] text-[var(--hb-co-text-muted)]">
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
                {activeOffer ? (
                  <p className="mt-3 text-[16px] font-extrabold text-[var(--hb-co-text)]">
                    {formatPrice(activeOffer.amount)}
                    <span className="ml-1.5 text-[13px] font-semibold text-[var(--hb-co-text-muted)]">
                      / mo
                    </span>
                    <span className="mt-0.5 block text-[12px] font-medium text-[var(--hb-co-text-muted)]">
                      {activeOffer.periodLabel}
                    </span>
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
                      "border-2 border-[var(--hb-co-success)] bg-[var(--hb-co-success)]",
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
    </ul>
  );
}
