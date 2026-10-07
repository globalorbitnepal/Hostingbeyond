import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("get-started checkout page", () => {
  it("does not redirect guests away before rendering checkout", () => {
    const source = readFileSync(
      new URL("../../app/get-started/page.tsx", import.meta.url),
      "utf8",
    );
    assert.equal(source.includes("redirect(routes.domainSearch)"), false);
    assert.equal(source.includes("loginPathForDomainCheckout"), false);
    assert.equal(source.includes("isAuthenticated={false}"), true);
  });
});
