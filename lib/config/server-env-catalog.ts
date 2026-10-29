/**
 * Server-only environment names by integration slot (never log values).
 * Browser-safe vars are listed separately — do not add secrets here.
 */

import { envKeysByIntegrationId } from "@/lib/integrations/catalog";

export const ENV_SERVER_ONLY = envKeysByIntegrationId();

/** Features that fail closed when required server env is absent. */
export const ENV_FAIL_CLOSED_FEATURES = [
  "Wallet Stripe top-up (STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET)",
  "Hosting Stripe checkout (same)",
  "Live registrar registration (NameSilo or Domain Name API keys)",
  "Transactional email (EMAIL_DELIVERY_ENABLED=1 + SMTP or API key)",
  "Hosting provisioning (HOSTING_PROVISIONER_ENABLED=1 + base URL + token)",
  "Google Cloud Translate (GOOGLE_TRANSLATE_ENABLED=true + GOOGLE_CLOUD_PROJECT + credentials path)",
  "Integration DB tests (isolated DATABASE_URL — NOT PROVEN locally)",
] as const;

export const ENV_BROWSER_SAFE_EXAMPLES = [
  "NEXT_PUBLIC_* marketing URLs only (verify per variable before exposing)",
] as const;
