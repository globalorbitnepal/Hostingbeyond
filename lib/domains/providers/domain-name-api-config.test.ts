import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  readDomainNameApiAvailabilityConfig,
  readDomainNameApiLifecycleConfig,
} from "@/lib/domains/providers/domain-name-api-config";

const envBackup = { ...process.env };

afterEach(() => {
  process.env = { ...envBackup };
});

describe("Domain Name API config separation", () => {
  it("lifecycle defaults to OTE test credentials", () => {
    process.env.DOMAIN_API_RESELLER_ID = "reseller-id";
    process.env.DOMAIN_API_TEST_KEY = "test-key";
    process.env.DOMAIN_API_LIVE_KEY = "live-key";
    process.env.DOMAIN_API_ENV = "test";
    process.env.DOMAIN_AVAILABILITY_ENV = "live";
    const lifecycle = readDomainNameApiLifecycleConfig();
    assert.ok(lifecycle);
    assert.equal(lifecycle.environment, "test");
    assert.match(lifecycle.baseUrl, /ote\.domainresellerapi\.com/);
    assert.equal(lifecycle.role, "lifecycle");
  });

  it("availability uses live API when DOMAIN_AVAILABILITY_ENV=live", () => {
    process.env.DOMAIN_API_RESELLER_ID = "reseller-id";
    process.env.DOMAIN_API_TEST_KEY = "test-key";
    process.env.DOMAIN_API_LIVE_KEY = "live-key";
    process.env.DOMAIN_API_ENV = "test";
    process.env.DOMAIN_AVAILABILITY_ENV = "live";
    const availability = readDomainNameApiAvailabilityConfig();
    assert.ok(availability);
    assert.equal(availability.environment, "live");
    assert.match(availability.baseUrl, /api\.domainresellerapi\.com/);
    assert.equal(availability.role, "availability");
  });

  it("returns null availability when live key missing", () => {
    process.env.DOMAIN_API_RESELLER_ID = "reseller-id";
    process.env.DOMAIN_API_TEST_KEY = "test-key";
    delete process.env.DOMAIN_API_LIVE_KEY;
    process.env.DOMAIN_AVAILABILITY_ENV = "live";
    assert.equal(readDomainNameApiAvailabilityConfig(), null);
  });
});
