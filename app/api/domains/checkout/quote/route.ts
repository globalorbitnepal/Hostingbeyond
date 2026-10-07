import { NextResponse } from "next/server";

import { requireCustomerSession } from "@/lib/domains/require-customer";
import {
  quoteDomainCheckoutServices,
  type DomainCheckoutServiceSelection,
} from "@/lib/domains/domain-checkout-offers";
import { getDomainCartForUser } from "@/lib/domains/domain-cart-service";

function parseSelections(raw: unknown): DomainCheckoutServiceSelection[] {
  if (!Array.isArray(raw)) return [];
  const out: DomainCheckoutServiceSelection[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const kind = (item as { kind?: string }).kind;
    if (kind === "hosting") {
      const productSlug = String(
        (item as { productSlug?: string }).productSlug ?? "",
      ).trim();
      const planKey = String(
        (item as { planKey?: string }).planKey ?? "",
      ).trim();
      const billing = (item as { billing?: string }).billing;
      if (
        !productSlug ||
        !planKey ||
        (billing !== "monthly" && billing !== "annually")
      ) {
        continue;
      }
      out.push({ kind: "hosting", productSlug, planKey, billing });
    } else if (kind === "business-email") {
      const planId = String((item as { planId?: string }).planId ?? "").trim();
      if (!planId) continue;
      out.push({ kind: "business-email", planId });
    }
  }
  return out;
}

export async function POST(request: Request) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: { services?: unknown } = {};
  try {
    body = (await request.json()) as { services?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const cart = await getDomainCartForUser(user.id);
  const selections = parseSelections(body.services);
  const quoted = await quoteDomainCheckoutServices(selections);

  const domainsSubtotal = cart.total;
  const servicesSubtotal = quoted.servicesTotal;
  const taxes = 0;
  const total =
    Math.round((domainsSubtotal + servicesSubtotal + taxes) * 100) / 100;
  const walletChargeToday = domainsSubtotal;

  return NextResponse.json({
    currency: cart.currency,
    domains: cart.items.map((item) => ({
      domain: item.domain,
      register: item.register,
      renew: item.renew,
      periodYears: item.periodYears,
      currency: item.currency,
    })),
    domainsSubtotal,
    serviceLines: quoted.lines,
    servicesSubtotal,
    taxes,
    total,
    walletChargeToday,
    serviceErrors: quoted.errors,
    paymentNote:
      "Today's wallet charge covers domain registration only. Selected hosting and email plans are activated on their own checkout after your domains are registered.",
  });
}
