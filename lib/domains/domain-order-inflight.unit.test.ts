import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  inflightDomainOrderFilter,
  isInflightDomainOrderStatus,
} from "@/lib/domains/domain-order-inflight";

describe("domain order inflight guard", () => {
  it("treats processing, registering, and reconciliation as inflight", () => {
    assert.equal(isInflightDomainOrderStatus("PROCESSING"), true);
    assert.equal(isInflightDomainOrderStatus("REGISTERING"), true);
    assert.equal(isInflightDomainOrderStatus("RECONCILIATION_REQUIRED"), true);
    assert.equal(isInflightDomainOrderStatus("REGISTERED"), false);
    assert.equal(isInflightDomainOrderStatus("FAILED"), false);
  });

  it("scopes renewal inflight by user, domain, and order type", () => {
    const where = inflightDomainOrderFilter({
      domain: "example.com",
      userId: "user_1",
      orderType: "renew",
    });
    assert.deepEqual(where.domain, {
      equals: "example.com",
      mode: "insensitive",
    });
    assert.equal(where.userId, "user_1");
    assert.equal(where.orderType, "renew");
    assert.deepEqual(where.status, {
      in: ["PROCESSING", "REGISTERING", "RECONCILIATION_REQUIRED"],
    });
  });

  it("registration inflight is global per domain when user omitted", () => {
    const where = inflightDomainOrderFilter({ domain: "example.com" });
    assert.equal(where.userId, undefined);
    assert.deepEqual(where.domain, {
      equals: "example.com",
      mode: "insensitive",
    });
  });
});
