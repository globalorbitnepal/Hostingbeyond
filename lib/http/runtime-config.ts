/**
 * Presence flags only. Never return secret values or connection strings.
 * Do not expose this object from the public /api/health payload.
 */
import {
  isEnvFlagOne,
  isEnvPresent,
  isEnvStrictTrue,
} from "@/lib/integrations/env-flags";

export type RuntimeConfigFlags = {
  databaseUrlPresent: boolean;
  stripeSecretPresent: boolean;
  stripeWebhookPresent: boolean;
  namesiloKeyPresent: boolean;
  namesiloBillableEnabled: boolean;
  namesiloLifecycleEnabled: boolean;
  smtpHostPresent: boolean;
  emailDeliveryEnabled: boolean;
  googleCloudTranslateEnabled: boolean;
};

export function runtimeConfigFlags(
  env: Record<string, string | undefined> = process.env,
): RuntimeConfigFlags {
  return {
    databaseUrlPresent: isEnvPresent(env.DATABASE_URL),
    stripeSecretPresent: isEnvPresent(env.STRIPE_SECRET_KEY),
    stripeWebhookPresent: isEnvPresent(env.STRIPE_WEBHOOK_SECRET),
    namesiloKeyPresent: isEnvPresent(env.NAMESILO_API_KEY),
    namesiloBillableEnabled: isEnvStrictTrue(env.NAMESILO_ALLOW_BILLABLE),
    namesiloLifecycleEnabled: isEnvStrictTrue(env.NAMESILO_LIFECYCLE_ENABLED),
    smtpHostPresent: isEnvPresent(env.SMTP_HOST),
    emailDeliveryEnabled: isEnvFlagOne(env.EMAIL_DELIVERY_ENABLED),
    googleCloudTranslateEnabled:
      isEnvStrictTrue(env.GOOGLE_TRANSLATE_ENABLED) &&
      isEnvPresent(env.GOOGLE_CLOUD_PROJECT) &&
      (isEnvPresent(env.GOOGLE_APPLICATION_CREDENTIALS) ||
        isEnvPresent(env.GOOGLE_TRANSLATE_CREDENTIALS_PATH)),
  };
}
