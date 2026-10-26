import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  deriveNameSiloCatalogueStatus,
  mergeNameSiloCostField,
  mergeNameSiloCosts,
} from "@/lib/domains/namesilo-price-status";

describe("NameSilo price status", () => {
  it("preserves previous cost when incoming is null", () => {
    assert.equal(mergeNameSiloCostField(11.05, null), 11.05);
    assert.equal(mergeNameSiloCostField(11.05, 10.5), 10.5);
  });

  it("merges all operations independently", () => {
    const merged = mergeNameSiloCosts(
      { register: 10, renew: 9, transfer: 8 },
      { register: null, renew: 9.5, transfer: null },
    );
    assert.deepEqual(merged, { register: 10, renew: 9.5, transfer: 8 });
  });

  it("marks verified when all three costs present", () => {
    assert.equal(
      deriveNameSiloCatalogueStatus({
        register: 1,
        renew: 2,
        transfer: 3,
      }),
      "verified",
    );
  });

  it("marks invalid when API had invalid fields", () => {
    assert.equal(
      deriveNameSiloCatalogueStatus(
        { register: 1, renew: null, transfer: null },
        { hadInvalidField: true, onApi: true },
      ),
      "invalid",
    );
  });

  it("marks missing when TLD not on API", () => {
    assert.equal(
      deriveNameSiloCatalogueStatus(
        { register: 10, renew: 10, transfer: 10 },
        { onApi: false },
      ),
      "missing",
    );
  });
});
