import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { generateTotpSecret, totpUri, verifyTotpCode } from "@/lib/panel/totp";

describe("totp", () => {
  it("builds an otpauth URI and rejects junk codes", () => {
    const secret = generateTotpSecret();
    assert.match(secret, /^[A-Z2-7]+$/);
    assert.match(totpUri(secret, "a@b.com"), /^otpauth:\/\/totp\//);
    assert.equal(verifyTotpCode(secret, "000000"), false);
    assert.equal(verifyTotpCode(secret, "abc"), false);
  });
});
