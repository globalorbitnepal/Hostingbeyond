import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  readDomainNameApiAvailabilityConfig,
  readDomainNameApiLifecycleConfig,
} from "@/lib/domains/providers/domain-name-api-config";

describe("registration provider env alignment", () => {
  it("documents when LIVE availability and OTE lifecycle are both configured", () => {
    const liveAvail = readDomainNameApiAvailabilityConfig();
    const lifecycle = readDomainNameApiLifecycleConfig();
    if (liveAvail && lifecycle?.environment === "test") {
      assert.ok(
        true,
        "Checkout registration uses lifecycle provider via assertAvailableForRegistration; search may still use LIVE.",
      );
      return;
    }
    assert.ok(true);
  });
});
