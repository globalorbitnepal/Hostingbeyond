import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  authorizeBeyondMasterModel,
  beyondMasterOrbitModelStatus,
  listBeyondMasterPublicModels,
} from "@/lib/beyond-master/model-registry";

describe("beyond master model registry", () => {
  it("does not invent models when nothing is configured", () => {
    const catalog = listBeyondMasterPublicModels({});
    assert.equal(catalog.configured, false);
    assert.deepEqual(catalog.models, []);
  });

  it("exposes only the env-configured Google model and never the API key", () => {
    const env = {
      GEMINI_API_KEY: "gemini-secret-value",
      BEYOND_MASTER_AI_MODEL: "gemini-flash-lite-latest",
    };
    const catalog = listBeyondMasterPublicModels(env);
    assert.equal(catalog.models.length, 1);
    assert.equal(catalog.models[0]?.id, "gemini-flash-lite-latest");
    assert.equal(catalog.models[0]?.available, true);
    assert.equal(catalog.models[0]?.liveVerified, false);
    const orbit = beyondMasterOrbitModelStatus(env);
    assert.equal(JSON.stringify(orbit).includes("gemini-secret-value"), false);
    assert.equal("apiKey" in orbit, false);
  });

  it("rejects a model the server did not configure", () => {
    const env = {
      GEMINI_API_KEY: "gemini-secret-value",
    };
    const denied = authorizeBeyondMasterModel("other-model", env);
    assert.equal(denied.ok, false);
    const allowed = authorizeBeyondMasterModel("gemini-flash-lite-latest", env);
    assert.equal(allowed.ok, true);
  });

  it("does not activate a non-Google provider from env", () => {
    const catalog = listBeyondMasterPublicModels({
      BEYOND_MASTER_AI_PROVIDER: "openai",
      BEYOND_MASTER_AI_MODEL: "gpt-test",
      BEYOND_MASTER_AI_API_KEY: "sk-secret-value",
    });
    assert.equal(catalog.configured, false);
    assert.equal(catalog.models[0]?.available, false);
  });
});
