import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripeWebhookSecret(): string | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  return secret || null;
}

export function getAppBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.ORBIT_ORIGIN?.trim() ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("stripe_not_configured");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, { typescript: true });
  }
  return stripeClient;
}

export function constructStripeWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string,
): Stripe.Event {
  return Stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
