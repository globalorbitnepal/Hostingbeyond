import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  EXTRA_STORAGE_SLUG,
  EXTRA_STORAGE_TIERS,
  isStorageAddonSlug,
  LEGACY_STORAGE_SLUGS,
} from "@/lib/hosting/addons/storage-tiers";

describe("extra storage add-on", () => {
  it("is one product with 10–100 GB options", () => {
    assert.equal(EXTRA_STORAGE_SLUG, "extra-storage");
    assert.deepEqual(
      EXTRA_STORAGE_TIERS.map((tier) => tier.label),
      ["10 GB", "25 GB", "50 GB", "100 GB"],
    );
    assert.equal(LEGACY_STORAGE_SLUGS.length, 4);
    assert.equal(isStorageAddonSlug("storage-10gb"), true);
    assert.equal(isStorageAddonSlug("extra-storage"), true);
    assert.equal(isStorageAddonSlug("business-email"), false);
  });
});
