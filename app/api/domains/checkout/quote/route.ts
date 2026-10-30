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
      const term = String((item as { term?: string }).term ?? "monthly").trim();
      const allowed = new Set(["monthly", "12", "24", "36", "48"]);
      if (!planId || !allowed.has(term)) continue;
      out.push({
        kind: "business-email",
        planId,
        term: term as "monthly" | "12" | "24" | "36" | "48",
      });
    } else if (kind === "domain-protection") {
      out.push({ kind: "domain-protection" });
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
  const domainCount = cart.items.length;
  const serviceLines = quoted.lines.map((line) => {
    if (line.key !== "domain-protection" || domainCount <= 1) return line;
    return {
      ...line,
      amount: Math.round(line.amount * domainCount * 100) / 100,
      detail: `${line.detail} · ${domainCount} domains`,
    };
  });
  const servicesSubtotal =
    Math.round(serviceLines.reduce((sum, line) => sum + line.amount, 0) * 100) /
    100;
  const protectionToday =
    serviceLines.find((line) => line.key === "domain-protection")?.amount ?? 0;
  const taxes = 0;
  const total =
    Math.round((domainsSubtotal + servicesSubtotal + taxes) * 100) / 100;
  const walletChargeToday =
    Math.round((domainsSubtotal + protectionToday) * 100) / 100;

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
    serviceLines,
    servicesSubtotal,
    taxes,
    total,
    walletChargeToday,
    serviceErrors: quoted.errors,
    paymentNote:
      "The order total on this page matches the pay button. Domain registration (and Domain Protection, if added) is charged from your wallet now. Hosting and email continue on the next checkout with your new domain. WHOIS privacy is included free.",
  });
}
