import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  googleCloudTranslateCredentialsPath,
  inspectGoogleCloudTranslateSetup,
  isGoogleCloudTranslateConfigured,
  isGoogleCloudTranslateEnabled,
} from "@/lib/integrations/translation/config";

describe("google cloud translate config", () => {
  it("prefers GOOGLE_TRANSLATE_CREDENTIALS_PATH over ADC path", () => {
    assert.equal(
      googleCloudTranslateCredentialsPath({
        GOOGLE_TRANSLATE_CREDENTIALS_PATH: "/secure/dedicated.json",
        GOOGLE_APPLICATION_CREDENTIALS: "/secure/adc.json",
      }),
      "/secure/dedicated.json",
    );
  });

  it("treats a path as configuration without reading the file", () => {
    assert.equal(
      isGoogleCloudTranslateConfigured({
        GOOGLE_CLOUD_PROJECT: "hostingbeyond-513017",
        GOOGLE_APPLICATION_CREDENTIALS: "/secure/translate-sa.json",
      }),
      true,
    );
    assert.equal(isGoogleCloudTranslateConfigured({}), false);
  });

  it("requires the exact enable flag", () => {
    const env = {
      GOOGLE_TRANSLATE_ENABLED: "1",
      GOOGLE_CLOUD_PROJECT: "hostingbeyond-513017",
      GOOGLE_APPLICATION_CREDENTIALS: "/secure/translate-sa.json",
    };
    assert.equal(isGoogleCloudTranslateEnabled(env), false);
    assert.equal(
      isGoogleCloudTranslateEnabled({
        ...env,
        GOOGLE_TRANSLATE_ENABLED: "true",
      }),
      true,
    );
  });

  it("inspects setup without claiming a live translation", () => {
    const setup = inspectGoogleCloudTranslateSetup({
      GOOGLE_TRANSLATE_ENABLED: "true",
      GOOGLE_CLOUD_PROJECT: "hostingbeyond-513017",
      GOOGLE_APPLICATION_CREDENTIALS: "/secure/missing-translate-sa.json",
    });
    assert.equal(setup.enabledFlag, true);
    assert.equal(setup.projectId, "hostingbeyond-513017");
    assert.equal(setup.credentialsPathConfigured, true);
    assert.equal(setup.credentialsFilePresent, false);
    assert.equal(setup.liveTranslationVerified, false);
  });
});
