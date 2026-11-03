import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mergeOrbitMediaCatalog } from "@/lib/orbit/media-catalog-merge";

describe("mergeOrbitMediaCatalog", () => {
  it("includes disk files without requiring database inserts", () => {
    const merged = mergeOrbitMediaCatalog({
      dbAssets: [],
      diskFiles: [
        {
          filename: "abc.jpg",
          url: "/uploads/abc.jpg",
          size: 100,
          mimeType: "image/jpeg",
          mtimeMs: 1_700_000_000_000,
        },
      ],
      bundledFiles: [],
    });
    assert.equal(merged.length, 1);
    assert.equal(merged[0].filename, "abc.jpg");
    assert.equal(merged[0].source, "upload");
  });

  it("does not duplicate db assets already known", () => {
    const merged = mergeOrbitMediaCatalog({
      dbAssets: [
        {
          id: "row1",
          filename: "abc.jpg",
          originalName: "abc.jpg",
          mimeType: "image/jpeg",
          size: 100,
          width: null,
          height: null,
          alt: "",
          url: "/uploads/abc.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      diskFiles: [
        {
          filename: "abc.jpg",
          url: "/uploads/abc.jpg",
          size: 100,
          mimeType: "image/jpeg",
          mtimeMs: 1_700_000_000_000,
        },
      ],
      bundledFiles: [],
    });
    assert.equal(merged.length, 1);
    assert.equal(merged[0].id, "row1");
  });
});
