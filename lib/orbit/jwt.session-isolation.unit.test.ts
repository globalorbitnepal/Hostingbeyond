import assert from "node:assert/strict";
import { SignJWT } from "jose";
import { describe, it } from "node:test";

import { signCustomerJwt, verifyCustomerJwt } from "@/lib/customer/session";
import { sessionSecret, signOrbitJwt, verifyOrbitJwt } from "@/lib/orbit/jwt";

describe("orbit vs customer JWT isolation", () => {
  it("does not treat a customer JWT as an Orbit admin session", async () => {
    const customer = await signCustomerJwt({
      sid: "cust-sid",
      customerUserId: "customer-user-1",
      ttlMs: 60_000,
    });
    assert.equal(await verifyOrbitJwt(customer), null);
    const verifiedCustomer = await verifyCustomerJwt(customer);
    assert.equal(verifiedCustomer?.customerUserId, "customer-user-1");
  });

  it("does not treat an Orbit staff JWT as a customer session", async () => {
    const orbit = await signOrbitJwt({
      sid: "orbit-sid",
      adminUserId: "admin-user-1",
    });
    assert.equal(await verifyCustomerJwt(orbit), null);
    const verifiedOrbit = await verifyOrbitJwt(orbit);
    assert.equal(verifiedOrbit?.adminUserId, "admin-user-1");
  });

  it("rejects expired Orbit JWTs", async () => {
    const token = await new SignJWT({
      sid: "expired-sid",
      sub: "admin-user-1",
      kind: "orbit",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("0s")
      .sign(sessionSecret());
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(await verifyOrbitJwt(token), null);
  });

  it("rejects foreign kind claims even with sid and sub", async () => {
    const token = await new SignJWT({
      sid: "sid",
      sub: "admin-user-1",
      kind: "impersonate",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(sessionSecret());
    assert.equal(await verifyOrbitJwt(token), null);
  });
});
