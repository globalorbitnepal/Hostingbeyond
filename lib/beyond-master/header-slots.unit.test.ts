import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { beyondMasterHeaderVisibility } from "@/lib/beyond-master/header-slots";

describe("header assistant slots", () => {
  it("shows the assistant on the public header and hides it during checkout", () => {
    assert.deepEqual(beyondMasterHeaderVisibility(false), {
      launcher: true,
      panel: true,
    });
    assert.deepEqual(beyondMasterHeaderVisibility(true), {
      launcher: false,
      panel: false,
    });
  });

  it("keeps production navigation and mounts the assistant in desktop, mobile, and menu slots", () => {
    const source = readFileSync("components/layout/header.tsx", "utf8");
    assert.equal(source.split("<BeyondMasterHeaderLauncher").length - 1, 3);
    assert.equal(
      source.includes("BeyondMasterHeaderLauncher checkout={checkoutBar} />"),
      true,
    );
    assert.equal(
      source.includes(
        "<BeyondMasterHeaderLauncher checkout={checkoutBar} compact />",
      ),
      true,
    );
    assert.match(
      source,
      /<BeyondMasterHeaderLauncher\s+checkout=\{checkoutBar\}\s+menu/,
    );
    assert.equal(
      source.includes("<BeyondMasterHeaderHost checkout={checkoutBar} />"),
      true,
    );
    assert.equal(source.includes('aria-label="Primary navigation"'), true);
    assert.equal(
      source.includes('aria-label={open ? "Close menu" : "Open menu"}'),
      true,
    );
    assert.equal(source.includes('checkoutBar && "lg:gap-2 xl:gap-3"'), true);
    assert.equal(source.includes("<DomainCartHeaderLink />"), true);
    assert.equal(source.includes("<DomainCartHeaderLink compact />"), true);
  });

  it("labels the public launcher with the Beyond Master AI brand", () => {
    const launcher = readFileSync(
      "components/beyond-master/beyond-master-launcher.tsx",
      "utf8",
    );
    assert.equal(launcher.includes("BEYOND_MASTER_BRAND_NAME"), true);
    assert.equal(launcher.includes("BEYOND_MASTER_LAUNCHER_LABEL"), false);
    assert.equal(launcher.includes("BEYOND MASTER AI"), false);
    assert.equal(launcher.includes("hb-bmai-ai-chip"), true);
  });
});
