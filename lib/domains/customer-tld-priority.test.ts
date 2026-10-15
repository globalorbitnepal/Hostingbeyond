import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  GLOBAL_ALTERNATIVE_TLD_ORDER,
  localTldCandidatesForCountry,
  mergeTldPriorityOrder,
} from "@/lib/domains/customer-tld-priority";

describe("customer-tld-priority", () => {
  it("orders global alternatives with .in before .org before .pro before .net", () => {
    const inIdx = GLOBAL_ALTERNATIVE_TLD_ORDER.indexOf(".in");
    const orgIdx = GLOBAL_ALTERNATIVE_TLD_ORDER.indexOf(".org");
    const proIdx = GLOBAL_ALTERNATIVE_TLD_ORDER.indexOf(".pro");
    const netIdx = GLOBAL_ALTERNATIVE_TLD_ORDER.indexOf(".net");
    assert.ok(
      inIdx >= 0 && orgIdx > inIdx && proIdx > orgIdx && netIdx > proIdx,
    );
  });

  it("places Nepal local TLDs ahead of global when catalogue supports them", () => {
    const searchable = new Set([".com.np", ".np", ".in", ".org", ".com"]);
    const order = mergeTldPriorityOrder("NP", searchable);
    assert.deepEqual(order.slice(0, 2), [".com.np", ".np"]);
    assert.ok(order.includes(".in"));
  });

  it("does not duplicate .in for India when already in global list", () => {
    const searchable = new Set([".in", ".org", ".com"]);
    const order = mergeTldPriorityOrder("IN", searchable);
    assert.equal(order.filter((t) => t === ".in").length, 1);
    assert.equal(order[0], ".in");
  });

  it("returns empty local list for unknown country", () => {
    assert.deepEqual(localTldCandidatesForCountry("ZZ"), []);
  });
});
