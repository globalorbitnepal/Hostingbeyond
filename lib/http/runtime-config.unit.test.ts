import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { runtimeConfigFlags } from "@/lib/http/runtime-config";

describe("runtimeConfigFlags", () => {
  it("reports presence without echoing secret values", () => {
    const flags = runtimeConfigFlags({
      DATABASE_URL: "postgresql://example.invalid/db",
      STRIPE_SECRET_KEY: "sk_test_example",
      STRIPE_WEBHOOK_SECRET: "whsec_example",
      NAMESILO_API_KEY: "ns_example",
      NAMESILO_ALLOW_BILLABLE: "true",
      NAMESILO_LIFECYCLE_ENABLED: "true",
    });
    assert.deepEqual(flags, {
      databaseUrlPresent: true,
      stripeSecretPresent: true,
      stripeWebhookPresent: true,
      namesiloKeyPresent: true,
      namesiloBillableEnabled: true,
      namesiloLifecycleEnabled: true,
      smtpHostPresent: false,
      emailDeliveryEnabled: false,
      googleCloudTranslateEnabled: false,
    });
    const serialized = JSON.stringify(flags);
    assert.equal(serialized.includes("postgresql://"), false);
    assert.equal(serialized.includes("sk_test"), false);
    assert.equal(serialized.includes("whsec_"), false);
    assert.equal(serialized.includes("ns_example"), false);
  });

  it("does not treat 1 as NameSilo billable or lifecycle enablement", () => {
    const flags = runtimeConfigFlags({
      NAMESILO_ALLOW_BILLABLE: "1",
      NAMESILO_LIFECYCLE_ENABLED: "1",
    });
    assert.equal(flags.namesiloBillableEnabled, false);
    assert.equal(flags.namesiloLifecycleEnabled, false);
  });

  it("treats missing keys as absent and billable as off", () => {
    const flags = runtimeConfigFlags({});
    assert.equal(flags.databaseUrlPresent, false);
    assert.equal(flags.namesiloBillableEnabled, false);
    assert.equal(flags.googleCloudTranslateEnabled, false);
  });

  it("enables Cloud Translate only with true flag, project, and path", () => {
    const flags = runtimeConfigFlags({
      GOOGLE_TRANSLATE_ENABLED: "true",
      GOOGLE_CLOUD_PROJECT: "hostingbeyond-513017",
      GOOGLE_APPLICATION_CREDENTIALS: "/secure/translate-sa.json",
    });
    assert.equal(flags.googleCloudTranslateEnabled, true);
    assert.equal(
      JSON.stringify(flags).includes("/secure/translate-sa.json"),
      false,
    );
  });
});
