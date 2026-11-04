import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatPlansForAgent } from "@/lib/beyond-master/grounded";

describe("agent plan formatting", () => {
  const base = {
    product: "Web Hosting",
    path: "/web-hosting",
    planName: "Beyond Essential",
    monthly: "7.99",
    yearly: "28.8",
    currency: "USD",
    storage: "10 GB NVMe SSD Storage",
    emailAccounts: null,
  };

  it("does not duplicate the noun the catalog already stores", () => {
    const text = formatPlansForAgent([{ ...base, websiteLimit: "1 Website" }]);
    assert.match(text, /1 Website\b/);
    assert.equal(text.includes("1 Website sites"), false);
    assert.equal(text.includes("Website sites"), false);
  });

  it("keeps plural catalog values as-is", () => {
    const text = formatPlansForAgent([{ ...base, websiteLimit: "5 Websites" }]);
    assert.match(text, /5 Websites\b/);
    assert.equal(text.includes("Websites sites"), false);
  });

  it("normalises unlimited wording", () => {
    const text = formatPlansForAgent([
      { ...base, websiteLimit: "Unlimited Websites" },
    ]);
    assert.match(text, /unlimited sites/);
    assert.equal(text.toLowerCase().includes("websites sites"), false);
  });

  it("omits the site clause when the catalog has no value", () => {
    const text = formatPlansForAgent([{ ...base, websiteLimit: null }]);
    assert.equal(text.includes("site"), false);
  });
});
