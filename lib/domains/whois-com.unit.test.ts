import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { whoisComLookupUrl } from "@/lib/domains/whois-com";

describe("whoisComLookupUrl", () => {
  it("builds the whois.com lookup URL for a registered domain", () => {
    assert.equal(
      whoisComLookupUrl("xtend.com"),
      "https://www.whois.com/whois/xtend.com",
    );
    assert.equal(
      whoisComLookupUrl("HTTPS://WWW.Xtend.COM/path"),
      "https://www.whois.com/whois/xtend.com",
    );
  });

  it("rejects empty or invalid names", () => {
    assert.equal(whoisComLookupUrl(""), null);
    assert.equal(whoisComLookupUrl("not a domain"), null);
    assert.equal(whoisComLookupUrl("javascript:alert(1)"), null);
  });
});
