import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { beyondMasterHeaderVisibility } from "@/lib/beyond-master/header-slots";

describe("header assistant slots", () => {
  it("shows the assistant on the public site and hides it during checkout", () => {
    assert.deepEqual(beyondMasterHeaderVisibility(false), {
      launcher: true,
      panel: true,
    });
    assert.deepEqual(beyondMasterHeaderVisibility(true), {
      launcher: false,
      panel: false,
    });
  });

  it("keeps production navigation and mounts the assistant host without a header badge", () => {
    const source = readFileSync("components/layout/header.tsx", "utf8");
    assert.equal(source.split("<BeyondMasterHeaderLauncher").length - 1, 0);
    assert.equal(source.includes("BeyondMasterHeaderLauncher"), false);
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

  it("docks the public launcher as an orbit agent with Can I help you", () => {
    const launcher = readFileSync(
      "components/beyond-master/beyond-master-launcher.tsx",
      "utf8",
    );
    assert.equal(launcher.includes("BEYOND_MASTER_BRAND_NAME"), true);
    assert.equal(launcher.includes("BEYOND_MASTER_DOCK_PROMPT"), true);
    assert.equal(launcher.includes("BEYOND_MASTER_DOCK_PROMPTS"), true);
    assert.equal(launcher.includes("hb-bmai-dock-wait"), true);
    assert.equal(launcher.includes("---"), true);
    assert.equal(launcher.includes("BeyondMasterIcon"), true);
    assert.equal(launcher.includes("BEYOND_MASTER_MASCOT_SRC"), false);
    assert.equal(launcher.includes("Can I help you"), false);
    assert.equal(launcher.includes("Beyond Master AI"), false);
    assert.equal(launcher.includes("AiAgentBadge"), false);
  });
});
