import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ENV_SERVER_ONLY } from "@/lib/config/server-env-catalog";

describe("ENV_SERVER_ONLY", () => {
  it("tracks real Orbit and Facebook variable names", () => {
    assert.ok(ENV_SERVER_ONLY["orbit-admin"]?.includes("ORBIT_SESSION_SECRET"));
    assert.ok(ENV_SERVER_ONLY["facebook-oauth"]?.includes("FACEBOOK_APP_ID"));
    assert.ok(
      ENV_SERVER_ONLY["google-cloud-translate"]?.includes(
        "GOOGLE_APPLICATION_CREDENTIALS",
      ),
    );
  });
});
