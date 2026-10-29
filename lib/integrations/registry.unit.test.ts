import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { integrationStatuses } from "@/lib/integrations/registry";

describe("integrationStatuses", () => {
  it("reports NameSilo lifecycle off unless both flags are exactly true", () => {
    const rows = integrationStatuses({
      NAMESILO_API_KEY: "ns_example",
      NAMESILO_LIFECYCLE_ENABLED: "1",
      NAMESILO_ALLOW_BILLABLE: "1",
    });
    const lifecycle = rows.find((row) => row.id === "namesilo-lifecycle");
    assert.equal(lifecycle?.configured, true);
    assert.equal(lifecycle?.enabled, false);
  });

  it("enables NameSilo lifecycle only with strict true flags", () => {
    const rows = integrationStatuses({
      NAMESILO_API_KEY: "ns_example",
      NAMESILO_LIFECYCLE_ENABLED: "true",
      NAMESILO_ALLOW_BILLABLE: "true",
    });
    const lifecycle = rows.find((row) => row.id === "namesilo-lifecycle");
    assert.equal(lifecycle?.enabled, true);
    const serialized = JSON.stringify(rows);
    assert.equal(serialized.includes("ns_example"), false);
  });

  it("keeps Google Cloud Translate disabled without the exact enable flag", () => {
    const rows = integrationStatuses({
      GOOGLE_CLOUD_PROJECT: "hostingbeyond-513017",
      GOOGLE_APPLICATION_CREDENTIALS: "/secure/translate-sa.json",
    });
    const cloud = rows.find((row) => row.id === "google-cloud-translate");
    assert.equal(cloud?.configured, true);
    assert.equal(cloud?.enabled, false);
    assert.equal(cloud?.implemented, "live");
  });

  it("enables Google Cloud Translate only with the exact true flag", () => {
    const rows = integrationStatuses({
      GOOGLE_TRANSLATE_ENABLED: "true",
      GOOGLE_CLOUD_PROJECT: "hostingbeyond-513017",
      GOOGLE_APPLICATION_CREDENTIALS: "/secure/translate-sa.json",
    });
    const cloud = rows.find((row) => row.id === "google-cloud-translate");
    assert.equal(cloud?.enabled, true);
  });
});
