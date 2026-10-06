import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { filterRegisterableRecommendations } from "@/lib/domains/recommendation-tlds";
import { shouldFetchTier2 } from "@/lib/domains/search-orchestrator";
import type { DomainResult } from "@/lib/domains/availability";

function row(
  domain: string,
  status: DomainResult["status"],
  register: number | null = null,
): DomainResult {
  const tld = domain.includes(".") ? `.${domain.split(".").pop()}` : ".com";
  return {
    domain,
    name: domain.split(".")[0] ?? domain,
    tld,
    status,
    register,
    renew: null,
    transfer: null,
  };
}

describe("search-orchestrator", () => {
  it("shouldFetchTier2 when tier1 registerable count is below minimum", () => {
    assert.equal(shouldFetchTier2(0, true), true);
    assert.equal(shouldFetchTier2(9, true), true);
    assert.equal(shouldFetchTier2(10, true), false);
    assert.equal(shouldFetchTier2(0, false), false);
  });

  it("filterRegisterableRecommendations keeps available and priced premium only", () => {
    const filtered = filterRegisterableRecommendations([
      row("a.com", "available"),
      row("b.com", "taken"),
      row("c.com", "unknown"),
      row("d.com", "premium", 99),
      row("e.com", "premium", null),
    ]);
    assert.deepEqual(
      filtered.map((r) => r.domain),
      ["a.com", "d.com"],
    );
  });
});
