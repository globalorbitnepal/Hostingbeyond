import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { orbitPageLinks } from "./page-editor-links";

describe("orbitPageLinks", () => {
  it("maps CMS slugs to the matching Orbit editor and public preview", () => {
    assert.deepEqual(orbitPageLinks("about-page"), {
      editor: "/orbit/about",
      preview: "/about",
    });
    assert.deepEqual(orbitPageLinks("pricing"), {
      editor: "/orbit/pricing",
      preview: "/pricing",
    });
    assert.deepEqual(orbitPageLinks("hosting-product"), {
      editor: "/orbit/hosting",
      preview: "/web-hosting",
    });
  });
});
