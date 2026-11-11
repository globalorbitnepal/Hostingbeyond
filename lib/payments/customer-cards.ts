import type Stripe from "stripe";

import {
  customerStripeStoreId,
  readCustomerJsonBag,
  writeCustomerJsonBag,
} from "@/lib/panel/customer-json-store";
import {
  getAppBaseUrl,
  getStripeClient,
  isStripeConfigured,
} from "@/lib/payments/stripe-config";

type StripeBag = { customerId?: string };

export type CustomerCard = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

async function ensureStripeCustomer(input: {
  userId: string;
  email: string;
}): Promise<Stripe.Customer> {
  const stripe = getStripeClient();
  const bag = await readCustomerJsonBag<StripeBag>(
    customerStripeStoreId(input.userId),
    {},
  );
  if (bag.customerId) {
    const existing = await stripe.customers.retrieve(bag.customerId);
    if (!("deleted" in existing && existing.deleted)) {
      return existing;
    }
  }
  const listed = await stripe.customers.list({
    email: input.email,
    limit: 10,
  });
  const match =
    listed.data.find(
      (row) => row.metadata?.hostingbeyondUserId === input.userId,
    ) ?? listed.data[0];
  if (match) {
    await writeCustomerJsonBag(customerStripeStoreId(input.userId), {
      customerId: match.id,
    });
    return match;
  }
  const created = await stripe.customers.create({
    email: input.email,
    metadata: { hostingbeyondUserId: input.userId },
  });
  await writeCustomerJsonBag(customerStripeStoreId(input.userId), {
    customerId: created.id,
  });
  return created;
}

export async function listCustomerCards(input: {
  userId: string;
  email: string;
}): Promise<{ configured: boolean; cards: CustomerCard[] }> {
  if (!isStripeConfigured()) {
    return { configured: false, cards: [] };
  }
  const stripe = getStripeClient();
  const customer = await ensureStripeCustomer(input);
  const [methods, fresh] = await Promise.all([
    stripe.paymentMethods.list({ customer: customer.id, type: "card" }),
    stripe.customers.retrieve(customer.id),
  ]);
  const defaultId =
    !("deleted" in fresh && fresh.deleted) &&
    typeof fresh.invoice_settings?.default_payment_method === "string"
      ? fresh.invoice_settings.default_payment_method
      : null;
  return {
    configured: true,
    cards: methods.data.map((method) => ({
      id: method.id,
      brand: method.card?.brand ?? "card",
      last4: method.card?.last4 ?? "••••",
      expMonth: method.card?.exp_month ?? 0,
      expYear: method.card?.exp_year ?? 0,
      isDefault: method.id === defaultId,
    })),
  };
}

export async function createCardSetupCheckout(input: {
  userId: string;
  email: string;
}): Promise<
  | { ok: true; checkoutUrl: string }
  | { ok: false; status: number; message: string }
> {
  if (!isStripeConfigured()) {
    return {
      ok: false,
      status: 503,
      message: "Card checkout is not configured.",
    };
  }
  const stripe = getStripeClient();
  const customer = await ensureStripeCustomer(input);
  const base = getAppBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "setup",
    customer: customer.id,
    payment_method_types: ["card"],
    metadata: {
      kind: "customer_card_setup",
      userId: input.userId,
    },
    success_url: `${base}/account/billing/cards?setup=success`,
    cancel_url: `${base}/account/billing/cards?setup=cancelled`,
  });
  if (!session.url) {
    return { ok: false, status: 503, message: "Could not start card setup." };
  }
  return { ok: true, checkoutUrl: session.url };
}

export async function detachCustomerCard(input: {
  userId: string;
  email: string;
  paymentMethodId: string;
}): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  if (!isStripeConfigured()) {
    return {
      ok: false,
      status: 503,
      message: "Card checkout is not configured.",
    };
  }
  const stripe = getStripeClient();
  const customer = await ensureStripeCustomer(input);
  const method = await stripe.paymentMethods.retrieve(input.paymentMethodId);
  if (method.customer !== customer.id) {
    return { ok: false, status: 404, message: "Card not found." };
  }
  await stripe.paymentMethods.detach(input.paymentMethodId);
  return { ok: true };
}
