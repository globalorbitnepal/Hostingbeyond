"use client";

import { useEffect } from "react";

import { writePremiumCartServices } from "@/lib/checkout/premium-cart-intent";
import type { EmailBillingTerm } from "@/lib/hosting/business-email-term-pricing";

const TERMS: readonly EmailBillingTerm[] = ["monthly", "12", "24", "36", "48"];

function parseTerm(raw: string | undefined): EmailBillingTerm {
  if (raw && (TERMS as readonly string[]).includes(raw)) {
    return raw as EmailBillingTerm;
  }
  return "monthly";
}

/** Prefill domain checkout add-ons when the visitor arrived from an email plan CTA. */
export function PersistEmailBookingIntent({
  planId,
  term,
}: {
  planId?: string;
  term?: string;
}) {
  useEffect(() => {
    const id = planId?.trim();
    if (!id) return;
    writePremiumCartServices([
      { kind: "business-email", planId: id, term: parseTerm(term) },
    ]);
  }, [planId, term]);
  return null;
}
