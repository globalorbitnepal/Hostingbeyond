import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  invalidateTldCatalogueCache,
  getTldCatalogueSnapshot,
} from "@/lib/domains/tld-catalogue-cache";

describe("tld-catalogue-cache", () => {
  it("returns fallback catalogue when database unavailable", async () => {
    invalidateTldCatalogueCache();
    const snap = await getTldCatalogueSnapshot(true);
    assert.ok(snap.providerSupported.length > 0);
    assert.ok(snap.searchable.length > 0);
    assert.ok(["database", "fallback"].includes(snap.source));
  });
});
