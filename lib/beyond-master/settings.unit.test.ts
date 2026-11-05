import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  beyondMasterAdminStatus,
  readBeyondMasterRuntimeConfig,
} from "@/lib/beyond-master/settings";

describe("beyond master settings", () => {
  it("rejects a non-Google provider even when credentials are present", () => {
    const config = readBeyondMasterRuntimeConfig({
      BEYOND_MASTER_AI_PROVIDER: "openai",
      BEYOND_MASTER_AI_MODEL: "gpt-test",
      BEYOND_MASTER_AI_API_KEY: "sk-test",
    });
    assert.equal(config.configured, false);
    assert.equal(config.provider, "openai");
    assert.equal(config.apiKey, null);
    assert.equal(config.configurationError, "provider");
  });

  it("rejects openai-compatible providers for the live AI Agent", () => {
    const config = readBeyondMasterRuntimeConfig({
      BEYOND_MASTER_AI_PROVIDER: "openai-compatible",
      BEYOND_MASTER_AI_MODEL: "local",
      BEYOND_MASTER_AI_API_KEY: "local-key",
      BEYOND_MASTER_AI_BASE_URL: "http://127.0.0.1:8080/v1",
    });
    assert.equal(config.configured, false);
    assert.equal(config.configurationError, "provider");
  });

  it("rejects conflicting non-Google provider when GEMINI_API_KEY is present", () => {
    const config = readBeyondMasterRuntimeConfig({
      GEMINI_API_KEY: "gemini-test-key",
      BEYOND_MASTER_AI_PROVIDER: "anthropic",
      BEYOND_MASTER_AI_MODEL: "claude-test",
    });
    assert.equal(config.configured, false);
    assert.equal(config.configurationError, "provider");
  });

  it("never puts the API key on the Orbit status object", () => {
    const secret = "sk-test-super-secret-value";
    const status = beyondMasterAdminStatus({
      GEMINI_API_KEY: "gemini-test-key",
    });
    assert.equal(status.configured, true);
    assert.equal(status.credentialsPresent, true);
    assert.equal(JSON.stringify(status).includes(secret), false);
    assert.equal("apiKey" in status, false);
  });

  it("auto-configures Google Gemini when GEMINI_API_KEY is present", () => {
    const config = readBeyondMasterRuntimeConfig({
      GEMINI_API_KEY: "gemini-test-key",
    });
    assert.equal(config.configured, true);
    assert.equal(config.provider, "google");
    assert.equal(config.model, "gemini-flash-lite-latest");
    assert.equal(config.apiKey, "gemini-test-key");
    assert.equal(
      config.baseUrl,
      "https://generativelanguage.googleapis.com/v1beta",
    );
  });

  it("uses GEMINI_API_KEY only for Google and ignores BEYOND_MASTER_AI_API_KEY", () => {
    const config = readBeyondMasterRuntimeConfig({
      GEMINI_API_KEY: "gemini-test-key",
      BEYOND_MASTER_AI_PROVIDER: "google",
      BEYOND_MASTER_AI_API_KEY: "sk-should-not-be-used",
    });
    assert.equal(config.configured, true);
    assert.equal(config.apiKey, "gemini-test-key");
  });
});
