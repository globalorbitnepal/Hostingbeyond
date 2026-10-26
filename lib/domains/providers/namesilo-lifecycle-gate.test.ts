import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DomainProviderError } from "@/lib/domains/providers/types";
import { assertNameSiloLifecycleEnabled } from "@/lib/domains/providers/namesilo-registrar";

describe("NameSilo lifecycle gate", () => {
  it("stays disabled unless NAMESILO_LIFECYCLE_ENABLED is exactly true", () => {
    const previous = process.env.NAMESILO_LIFECYCLE_ENABLED;
    delete process.env.NAMESILO_LIFECYCLE_ENABLED;
    assert.throws(() => assertNameSiloLifecycleEnabled(), DomainProviderError);
    process.env.NAMESILO_LIFECYCLE_ENABLED = "1";
    assert.throws(() => assertNameSiloLifecycleEnabled(), DomainProviderError);
    process.env.NAMESILO_LIFECYCLE_ENABLED = "true";
    assert.doesNotThrow(() => assertNameSiloLifecycleEnabled());
    if (previous === undefined) delete process.env.NAMESILO_LIFECYCLE_ENABLED;
    else process.env.NAMESILO_LIFECYCLE_ENABLED = previous;
  });
});
