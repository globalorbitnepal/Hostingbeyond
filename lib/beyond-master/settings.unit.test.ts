import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  beyondMasterAdminStatus,
  readBeyondMasterRuntimeConfig,
} from "@/lib/beyond-master/settings";

describe("beyond master settings", () => {
  it("stays unconfigured and hides the key when credentials are missing", () => {
    const env = {
      BEYOND_MASTER_AI_PROVIDER: "openai",
      BEYOND_MASTER_AI_MODEL: "gpt-test",
      BEYOND_MASTER_AI_API_KEY: "",
    };
    const config = readBeyondMasterRuntimeConfig(env);
    assert.equal(config.configured, false);
    assert.equal(config.apiKey, null);
    assert.equal(config.configurationError, "credentials");
  });

  it("never puts the API key on the Orbit status object", () => {
    const secret = "sk-test-super-secret-value";
    const status = beyondMasterAdminStatus({
      BEYOND_MASTER_AI_PROVIDER: "openai",
      BEYOND_MASTER_AI_MODEL: "gpt-test",
      BEYOND_MASTER_AI_API_KEY: secret,
    });
    assert.equal(status.configured, true);
    assert.equal(status.credentialsPresent, true);
    assert.equal(JSON.stringify(status).includes(secret), false);
    assert.equal("apiKey" in status, false);
  });

  it("rejects a non-local http base URL", () => {
    const config = readBeyondMasterRuntimeConfig({
      BEYOND_MASTER_AI_PROVIDER: "openai-compatible",
      BEYOND_MASTER_AI_MODEL: "local",
      BEYOND_MASTER_AI_API_KEY: "local-key",
      BEYOND_MASTER_AI_BASE_URL: "http://example.com/v1",
    });
    assert.equal(config.configured, false);
    assert.equal(config.configurationError, "base_url");
  });
});
