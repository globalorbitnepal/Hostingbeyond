import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildBulkSearchOverLimitRedirect,
  bulkSearchLimitRedirectMessage,
  businessEmailBookingHref,
  domainTldSearchHref,
  parseBulkSearchHubParams,
  parseDomainListFromSearchParams,
  shouldRedirectCheckoutDomainsToBulkSearch,
} from "@/lib/domains/domain-purchase-intent";
import { MAX_BULK_DOMAIN_SEARCH } from "@/lib/domains/bulk-search-limit";

describe("domain purchase intent URL helpers", () => {
  it("parses unique domains from search params with duplicates removed", () => {
    const list = parseDomainListFromSearchParams({
      domains: "a.com, b.com\na.com",
    });
    assert.equal(list.length, 2);
    assert.deepEqual(list, ["a.com", "b.com"]);
  });

  it("detects when checkout URL exceeds bulk search limit", () => {
    const ten = Array.from({ length: 10 }, (_, i) => `u${i}.com`);
    const eleven = Array.from({ length: 11 }, (_, i) => `v${i}.com`);
    assert.equal(shouldRedirectCheckoutDomainsToBulkSearch(ten), false);
    assert.equal(shouldRedirectCheckoutDomainsToBulkSearch(eleven), true);
    assert.equal(
      shouldRedirectCheckoutDomainsToBulkSearch([
        ...ten,
        ten[0]!,
        ten[0]!.toUpperCase(),
      ]),
      false,
    );
  });

  it("builds bulk search redirect preserving all unique domains", () => {
    const domains = Array.from({ length: 12 }, (_, i) => `keep${i}.com`);
    const url = buildBulkSearchOverLimitRedirect(domains);
    assert.match(url, /bulk_limit=1/);
    assert.match(url, /bulk-domain-search/);
    const query = url.split("?")[1] ?? "";
    const params = new URLSearchParams(query);
    const restored = parseDomainListFromSearchParams({
      domains: params.get("domains") ?? "",
    });
    assert.equal(restored.length, 12);
    assert.equal(restored[0], "keep0.com");
    assert.equal(restored[11], "keep11.com");
  });

  it("parseBulkSearchHubParams surfaces limit message and prefilled bulk text", () => {
    const domains = Array.from({ length: 11 }, (_, i) => `p${i}.io`);
    const text = domains.join("\n");
    const { initialBulkText, bulkLimitMessage } = parseBulkSearchHubParams({
      bulk_limit: "1",
      domains: text,
    });
    assert.equal(initialBulkText, text);
    assert.ok(bulkLimitMessage);
    assert.match(bulkLimitMessage!, /10/);
  });

  it("bulkSearchLimitRedirectMessage references configured limit", () => {
    assert.match(
      bulkSearchLimitRedirectMessage(),
      new RegExp(String(MAX_BULK_DOMAIN_SEARCH)),
    );
  });

  it("sends TLD register into domain search; email plans into business email checkout", () => {
    assert.equal(
      domainTldSearchHref(".com"),
      "/domain-name-search?q=yourname.com",
    );
    assert.equal(
      businessEmailBookingHref("premium", "12"),
      "/checkout/business-email?plan=premium&term=12&step=plan",
    );
  });
});
