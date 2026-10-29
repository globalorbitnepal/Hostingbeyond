import {
  isEnvFlagOne,
  isEnvPresent,
  isEnvStrictTrue,
} from "@/lib/integrations/env-flags";
import type { IntegrationSlot } from "@/lib/integrations/types";

function env(
  record: Record<string, string | undefined> | undefined = process.env,
): Record<string, string | undefined> {
  return record;
}

/**
 * One slot per vendor API. Add Google Cloud Translate, extra registrars,
 * or a new payment processor here without mixing them into another vendor.
 */
export const INTEGRATION_CATALOG: readonly IntegrationSlot[] = [
  {
    id: "postgres",
    kind: "database",
    vendor: "PostgreSQL",
    summary: "Application data. Move with pg_dump of hostingbeyond_db only.",
    envKeys: ["DATABASE_URL"],
    implemented: "live",
    failClosed: true,
    isConfigured: (record) => isEnvPresent(env(record).DATABASE_URL),
  },
  {
    id: "orbit-uploads",
    kind: "storage",
    vendor: "filesystem",
    summary:
      "Media and private invoice files. Copy ORBIT_UPLOAD_DIR on server move.",
    envKeys: ["ORBIT_UPLOAD_DIR"],
    implemented: "live",
    failClosed: true,
    isConfigured: (record) => isEnvPresent(env(record).ORBIT_UPLOAD_DIR),
  },
  {
    id: "orbit-admin",
    kind: "orbit",
    vendor: "HostingBeyond",
    summary: "Orbit passkey admin. Re-enroll passkeys if ORBIT_RP_ID changes.",
    envKeys: [
      "ORBIT_ENROLLMENT_SECRET",
      "ORBIT_SESSION_SECRET",
      "ORBIT_RP_ID",
      "ORBIT_ORIGIN",
    ],
    implemented: "live",
    failClosed: true,
    isConfigured: (record) =>
      isEnvPresent(env(record).ORBIT_SESSION_SECRET) &&
      isEnvPresent(env(record).ORBIT_RP_ID),
  },
  {
    id: "namesilo-search",
    kind: "registrar",
    vendor: "NameSilo",
    summary:
      "Customer domain search when NAMESILO_API_KEY is set (unless DNA is forced).",
    envKeys: [
      "NAMESILO_API_KEY",
      "NAMESILO_API_URL",
      "NAMESILO_BATCH_URL",
      "DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER",
    ],
    implemented: "live",
    failClosed: true,
    isConfigured: (record) => isEnvPresent(env(record).NAMESILO_API_KEY),
    isEnabled: (record) => {
      const e = env(record);
      if (
        e.DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER?.trim().toLowerCase() ===
        "dna"
      ) {
        return false;
      }
      return isEnvPresent(e.NAMESILO_API_KEY);
    },
  },
  {
    id: "namesilo-lifecycle",
    kind: "registrar",
    vendor: "NameSilo",
    summary:
      "Register/renew/transfer. Both flags must be exactly true (never 1).",
    envKeys: ["NAMESILO_LIFECYCLE_ENABLED", "NAMESILO_ALLOW_BILLABLE"],
    implemented: "live",
    failClosed: true,
    isConfigured: (record) => isEnvPresent(env(record).NAMESILO_API_KEY),
    isEnabled: (record) => {
      const e = env(record);
      return (
        isEnvPresent(e.NAMESILO_API_KEY) &&
        isEnvStrictTrue(e.NAMESILO_LIFECYCLE_ENABLED) &&
        isEnvStrictTrue(e.NAMESILO_ALLOW_BILLABLE)
      );
    },
  },
  {
    id: "domain-name-api",
    kind: "registrar",
    vendor: "Domain Name API",
    summary: "Independent registrar from NameSilo. Lifecycle defaults to OTE.",
    envKeys: [
      "DOMAIN_API_RESELLER_ID",
      "DOMAIN_API_TEST_KEY",
      "DOMAIN_API_LIVE_KEY",
      "DOMAIN_API_ENV",
      "DOMAIN_AVAILABILITY_ENV",
      "DOMAIN_LOOKUP_URL",
      "DOMAIN_LOOKUP_TOKEN",
    ],
    implemented: "live",
    failClosed: true,
    isConfigured: (record) => {
      const e = env(record);
      return (
        isEnvPresent(e.DOMAIN_API_RESELLER_ID) &&
        (isEnvPresent(e.DOMAIN_API_TEST_KEY) ||
          isEnvPresent(e.DOMAIN_API_LIVE_KEY) ||
          isEnvPresent(e.DOMAIN_LOOKUP_URL))
      );
    },
  },
  {
    id: "stripe",
    kind: "payments",
    vendor: "Stripe",
    summary: "Wallet top-up and hosting checkout. Independent of registrars.",
    envKeys: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    implemented: "live",
    failClosed: true,
    isConfigured: (record) =>
      isEnvPresent(env(record).STRIPE_SECRET_KEY) &&
      isEnvPresent(env(record).STRIPE_WEBHOOK_SECRET),
  },
  {
    id: "google-oauth",
    kind: "oauth",
    vendor: "Google",
    summary: "Customer login only. Not Google Translate.",
    envKeys: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    implemented: "live",
    failClosed: false,
    isConfigured: (record) =>
      isEnvPresent(env(record).GOOGLE_CLIENT_ID) &&
      isEnvPresent(env(record).GOOGLE_CLIENT_SECRET),
  },
  {
    id: "github-oauth",
    kind: "oauth",
    vendor: "GitHub",
    summary: "Customer login. Independent of Google.",
    envKeys: ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
    implemented: "live",
    failClosed: false,
    isConfigured: (record) =>
      isEnvPresent(env(record).GITHUB_CLIENT_ID) &&
      isEnvPresent(env(record).GITHUB_CLIENT_SECRET),
  },
  {
    id: "facebook-oauth",
    kind: "oauth",
    vendor: "Facebook",
    summary: "Customer login. Uses FACEBOOK_APP_ID / FACEBOOK_APP_SECRET.",
    envKeys: ["FACEBOOK_APP_ID", "FACEBOOK_APP_SECRET"],
    implemented: "live",
    failClosed: false,
    isConfigured: (record) =>
      isEnvPresent(env(record).FACEBOOK_APP_ID) &&
      isEnvPresent(env(record).FACEBOOK_APP_SECRET),
  },
  {
    id: "google-website-translate",
    kind: "translation",
    vendor: "Google",
    summary:
      "Website widget unused. Storefront uses Cloud Translation instead.",
    envKeys: [],
    implemented: "widget",
    failClosed: false,
    isConfigured: () => false,
  },
  {
    id: "google-cloud-translate",
    kind: "translation",
    vendor: "Google",
    summary:
      "Cloud Translation v3 via service-account file path. Fail closed until enabled. Live API not verified in this pass.",
    envKeys: [
      "GOOGLE_TRANSLATE_ENABLED",
      "GOOGLE_CLOUD_PROJECT",
      "GOOGLE_APPLICATION_CREDENTIALS",
      "GOOGLE_TRANSLATE_CREDENTIALS_PATH",
    ],
    implemented: "live",
    failClosed: true,
    isConfigured: (record) => {
      const e = env(record);
      return (
        isEnvPresent(e.GOOGLE_CLOUD_PROJECT) &&
        (isEnvPresent(e.GOOGLE_APPLICATION_CREDENTIALS) ||
          isEnvPresent(e.GOOGLE_TRANSLATE_CREDENTIALS_PATH))
      );
    },
    isEnabled: (record) => {
      const e = env(record);
      return (
        isEnvStrictTrue(e.GOOGLE_TRANSLATE_ENABLED) &&
        isEnvPresent(e.GOOGLE_CLOUD_PROJECT) &&
        (isEnvPresent(e.GOOGLE_APPLICATION_CREDENTIALS) ||
          isEnvPresent(e.GOOGLE_TRANSLATE_CREDENTIALS_PATH))
      );
    },
  },
  {
    id: "transactional-mail",
    kind: "mail",
    vendor: "SMTP",
    summary: "Transactional mail. Fail closed unless EMAIL_DELIVERY_ENABLED=1.",
    envKeys: [
      "EMAIL_DELIVERY_ENABLED",
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_USER",
      "SMTP_PASSWORD",
      "SMTP_FROM",
      "TRANSACTIONAL_EMAIL_API_KEY",
    ],
    implemented: "live",
    failClosed: true,
    isConfigured: (record) => {
      const e = env(record);
      if (!isEnvFlagOne(e.EMAIL_DELIVERY_ENABLED)) return false;
      return (
        (isEnvPresent(e.SMTP_HOST) && isEnvPresent(e.SMTP_FROM)) ||
        isEnvPresent(e.TRANSACTIONAL_EMAIL_API_KEY)
      );
    },
  },
  {
    id: "hosting-provisioner",
    kind: "hosting",
    vendor: "HostingBeyond panel",
    summary: "Hosting provision API. Independent of domain registrars.",
    envKeys: [
      "HOSTING_PROVISIONER_ENABLED",
      "HOSTING_PROVISIONER_BASE_URL",
      "HOSTING_PROVISIONER_API_TOKEN",
      "HOSTING_PROVISIONER_WEBHOOK_SECRET",
    ],
    implemented: "live",
    failClosed: true,
    isConfigured: (record) => {
      const e = env(record);
      return (
        isEnvFlagOne(e.HOSTING_PROVISIONER_ENABLED) &&
        isEnvPresent(e.HOSTING_PROVISIONER_BASE_URL) &&
        isEnvPresent(e.HOSTING_PROVISIONER_API_TOKEN)
      );
    },
  },
];

export function envKeysByIntegrationId(): Record<string, readonly string[]> {
  return Object.fromEntries(
    INTEGRATION_CATALOG.map((slot) => [slot.id, slot.envKeys]),
  );
}

export function allCatalogEnvKeys(): string[] {
  const keys = new Set<string>();
  for (const slot of INTEGRATION_CATALOG) {
    for (const key of slot.envKeys) keys.add(key);
  }
  return [...keys].sort();
}
