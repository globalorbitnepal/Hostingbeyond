import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { sanitizeCustomerRedirectPath } from "@/lib/customer/safe-redirect";
import { routes } from "@/config/routes";

describe("sanitizeCustomerRedirectPath", () => {
  it("allows safe internal paths and query strings", () => {
    assert.equal(sanitizeCustomerRedirectPath("/get-started"), "/get-started");
    assert.equal(sanitizeCustomerRedirectPath("/cart?step=3"), "/cart?step=3");
    assert.equal(
      sanitizeCustomerRedirectPath("/account/wallet"),
      "/account/wallet",
    );
  });

  it("rejects open redirects and dangerous paths", () => {
    assert.equal(sanitizeCustomerRedirectPath("//evil.com"), routes.account);
    assert.equal(
      sanitizeCustomerRedirectPath("https://evil.com"),
      routes.account,
    );
    assert.equal(sanitizeCustomerRedirectPath("/\\evil"), routes.account);
    assert.equal(sanitizeCustomerRedirectPath("/@evil.com"), routes.account);
    assert.equal(
      sanitizeCustomerRedirectPath("/account/../wallet"),
      routes.account,
    );
    assert.equal(sanitizeCustomerRedirectPath(null), routes.account);
    assert.equal(sanitizeCustomerRedirectPath("   "), routes.account);
    assert.equal(
      sanitizeCustomerRedirectPath("/%2f%2fevil.com"),
      routes.account,
    );
    assert.equal(
      sanitizeCustomerRedirectPath("/%2F%2Fevil.com"),
      routes.account,
    );
  });
});
