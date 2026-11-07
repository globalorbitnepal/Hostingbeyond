import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { customerCookieOptions } from "@/lib/customer/session";

/**
 * Cookie-authenticated JSON APIs rely on SameSite=Lax: cross-site POSTs do not
 * include the session cookie in modern browsers, which mitigates CSRF for
 * “classic” cross-origin form posts. Dangerous GET mutations should still be avoided.
 */
describe("customer session cookie (CSRF-related attributes)", () => {
  it("uses HttpOnly and SameSite=lax", () => {
    const opts = customerCookieOptions(new Date(Date.now() + 3_600_000));
    assert.equal(opts.sameSite, "lax");
    assert.equal(opts.httpOnly, true);
    assert.equal(opts.path, "/");
  });
});
