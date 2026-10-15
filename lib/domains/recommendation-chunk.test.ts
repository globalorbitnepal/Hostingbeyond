import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  alternativeProviderParallelLimit,
  alternativeProviderSubChunkSize,
  FAST_CUSTOMER_TLD_ORDER,
  fastChunk1TldCount,
  splitAlternativeTldWaves,
} from "@/lib/domains/recommendation-tlds";

describe("fast alternative chunk sizing", () => {
  it("defaults chunk 1 to seven TLDs (tunable via DOMAIN_FAST_CHUNK1_TLDS)", () => {
    assert.equal(fastChunk1TldCount(), 7);
    assert.ok(fastChunk1TldCount() <= 25);
  });

  it("defaults to single provider bulk for alternatives unless sub-chunk env set", () => {
    const prevSub = process.env.DOMAIN_ALT_SUB_CHUNK_SIZE;
    const prevPar = process.env.DOMAIN_ALT_PROVIDER_PARALLEL;
    delete process.env.DOMAIN_ALT_SUB_CHUNK_SIZE;
    delete process.env.DOMAIN_ALT_PROVIDER_PARALLEL;
    try {
      assert.equal(alternativeProviderSubChunkSize(), 0);
      assert.equal(alternativeProviderParallelLimit(), 1);
    } finally {
      if (prevSub !== undefined) {
        process.env.DOMAIN_ALT_SUB_CHUNK_SIZE = prevSub;
      }
      if (prevPar !== undefined) {
        process.env.DOMAIN_ALT_PROVIDER_PARALLEL = prevPar;
      }
    }
  });

  it("splits chunk-1 TLDs into two progressive waves", () => {
    const [a, b] = splitAlternativeTldWaves([
      ".com",
      ".net",
      ".org",
      ".io",
      ".co",
      ".shop",
      ".online",
    ]);
    assert.equal(a.length, 4);
    assert.equal(b.length, 3);
    assert.deepEqual(a, [".com", ".net", ".org", ".io"]);
    assert.deepEqual(b, [".co", ".shop", ".online"]);
  });

  it("orders .in, .org, .pro before .net in customer fast pool", () => {
    const inIdx = FAST_CUSTOMER_TLD_ORDER.indexOf(".in");
    const orgIdx = FAST_CUSTOMER_TLD_ORDER.indexOf(".org");
    const proIdx = FAST_CUSTOMER_TLD_ORDER.indexOf(".pro");
    const netIdx = FAST_CUSTOMER_TLD_ORDER.indexOf(".net");
    assert.ok(
      inIdx >= 0 && orgIdx > inIdx && proIdx > orgIdx && netIdx > proIdx,
    );
  });
});
