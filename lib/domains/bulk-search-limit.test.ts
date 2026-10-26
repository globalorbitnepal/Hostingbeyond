import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { bulkInputExceedsLimit } from "@/lib/domains/bulk-input";
import {
  BULK_SEARCH_LIMIT_MESSAGE,
  countUniqueDomainInputs,
  domainListExceedsBulkLimit,
  MAX_BULK_DOMAIN_SEARCH,
} from "@/lib/domains/bulk-search-limit";

describe("bulk search limit policy", () => {
  it("enforces 10 unique domains maximum", () => {
    assert.equal(MAX_BULK_DOMAIN_SEARCH, 10);
    const ok = Array.from({ length: 10 }, (_, i) => `a${i}.com`).join("\n");
    const over = Array.from({ length: 11 }, (_, i) => `b${i}.com`).join("\n");
    assert.equal(bulkInputExceedsLimit(ok, MAX_BULK_DOMAIN_SEARCH), false);
    assert.equal(bulkInputExceedsLimit(over, MAX_BULK_DOMAIN_SEARCH), true);
    assert.match(BULK_SEARCH_LIMIT_MESSAGE, /10/);
  });

  it("counts unique domains in string arrays for cart APIs", () => {
    const ten = Array.from({ length: 10 }, (_, i) => `c${i}.com`);
    const eleven = Array.from({ length: 11 }, (_, i) => `d${i}.com`);
    assert.equal(countUniqueDomainInputs(ten), 10);
    assert.equal(domainListExceedsBulkLimit(ten), false);
    assert.equal(countUniqueDomainInputs(eleven), 11);
    assert.equal(domainListExceedsBulkLimit(eleven), true);
    assert.equal(countUniqueDomainInputs(["A.com", "a.com", "", "  "]), 1);
  });
});
