import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  beyondMasterCapabilityEnabled,
  beyondMasterCommerceEnabled,
  capabilityDisabledMessage,
  capabilityEnvName,
} from "@/lib/beyond-master/capabilities";

/**
 * Release gate for the limited support-assistant launch.
 *
 * Purchases, registrations, DNS writes, and provisioning must be OFF unless an
 * operator deliberately enables BOTH the global gate and the per-capability
 * gate. A single stray env var must never enable spending money.
 */
describe("beyond master consequential-operation gate", () => {
  it("is disabled with an empty environment", () => {
    assert.equal(beyondMasterCommerceEnabled({}), false);
    for (const capability of [
      "domain_register",
      "domain_transfer",
      "domain_renew",
      "dns_write",
      "nameserver_update",
      "hosting_checkout",
      "email_provision",
      "wallet_topup",
    ] as const) {
      assert.equal(
        beyondMasterCapabilityEnabled(capability, {}),
        false,
        `${capability} must default to disabled`,
      );
    }
  });

  it("stays disabled when only the per-capability gate is set", () => {
    assert.equal(
      beyondMasterCapabilityEnabled("domain_register", {
        BEYOND_MASTER_ALLOW_DOMAIN_REGISTER: "1",
      }),
      false,
    );
  });

  it("stays disabled when only the global gate is set", () => {
    assert.equal(
      beyondMasterCapabilityEnabled("domain_register", {
        BEYOND_MASTER_COMMERCE_ENABLED: "1",
      }),
      false,
    );
  });

  it("enables only the specific capability when both gates are set", () => {
    const env = {
      BEYOND_MASTER_COMMERCE_ENABLED: "1",
      BEYOND_MASTER_ALLOW_DOMAIN_REGISTER: "1",
    };
    assert.equal(beyondMasterCapabilityEnabled("domain_register", env), true);
    assert.equal(
      beyondMasterCapabilityEnabled("hosting_checkout", env),
      false,
      "enabling registration must not enable checkout",
    );
    assert.equal(beyondMasterCapabilityEnabled("dns_write", env), false);
  });

  it("rejects loose truthy values that are not explicit opt-ins", () => {
    const env = {
      BEYOND_MASTER_COMMERCE_ENABLED: "maybe",
      BEYOND_MASTER_ALLOW_DNS_WRITE: "2",
    };
    assert.equal(beyondMasterCapabilityEnabled("dns_write", env), false);
  });

  it("stays disabled for malformed, conflicting, and partial configuration", () => {
    assert.equal(
      beyondMasterCapabilityEnabled("wallet_topup", {
        BEYOND_MASTER_COMMERCE_ENABLED: "TRUE",
        BEYOND_MASTER_ALLOW_WALLET_TOPUP: "no",
      }),
      false,
    );
    assert.equal(
      beyondMasterCapabilityEnabled("email_provision", {
        BEYOND_MASTER_COMMERCE_ENABLED: "on",
        BEYOND_MASTER_ALLOW_EMAIL_PROVISION: "true",
      }),
      false,
    );
    assert.equal(
      beyondMasterCapabilityEnabled("domain_transfer", {
        BEYOND_MASTER_COMMERCE_ENABLED: "1",
        BEYOND_MASTER_ALLOW_DOMAIN_REGISTER: "1",
      }),
      false,
    );
    assert.equal(
      beyondMasterCapabilityEnabled("dns_write", {
        BEYOND_MASTER_COMMERCE_ENABLED: "1",
        BEYOND_MASTER_ALLOW_DNS_WRITE: "",
      }),
      false,
    );
  });

  it("documents an env var and a customer-safe message per capability", () => {
    for (const capability of [
      "domain_register",
      "domain_transfer",
      "domain_renew",
      "dns_write",
      "nameserver_update",
      "hosting_checkout",
      "email_provision",
      "wallet_topup",
    ] as const) {
      assert.match(capabilityEnvName(capability), /^BEYOND_MASTER_ALLOW_/);
      const message = capabilityDisabledMessage(capability);
      assert.ok(message.length > 20, `${capability} message must be useful`);
      assert.doesNotMatch(
        message,
        /error|failed|crash/i,
        `${capability} message must not look like a failure`,
      );
    }
  });
});
