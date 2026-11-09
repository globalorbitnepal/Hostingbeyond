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

  it("docks the public launcher as a branded orb without a prompt bubble", () => {
    const launcher = readFileSync(
      "components/beyond-master/beyond-master-launcher.tsx",
      "utf8",
    );
    assert.equal(launcher.includes("BEYOND_MASTER_BRAND_NAME"), true);
    assert.equal(launcher.includes("hostingbeyond-ai-robot.png"), true);
    assert.equal(launcher.includes("hb-bmai-launch--mascot"), true);
    // The old rotating prompt bubble leaked marketing copy onto dashboards.
    assert.equal(launcher.includes("hb-bmai-dock-bubble"), false);
    assert.equal(launcher.includes("BEYOND_MASTER_DOCK_PROMPTS"), false);
    assert.equal(launcher.includes("hb-bmai-dock-wait"), false);
    assert.equal(launcher.includes("Can I help you"), false);
    assert.equal(launcher.includes("Fix your website"), false);
    assert.equal(launcher.includes("Beyond Master AI"), false);
    assert.equal(launcher.includes("AiAgentBadge"), false);
  });

  it("keeps hero search chrome free of backdrop-filter lighting seams", () => {
    const hero = readFileSync("components/home/hero.tsx", "utf8");
    assert.equal(hero.includes("backdrop-blur"), false);
    assert.equal(hero.includes("hb-search-pill"), true);
    const css = readFileSync("app/globals.css", "utf8");
    assert.equal(css.includes(".hb-search-pill"), true);
    assert.equal(css.includes("background-attachment: fixed"), false);
  });

  it("keeps the Orbit chrome header opaque so scroll cannot band", () => {
    const shell = readFileSync("components/orbit/shell.tsx", "utf8");
    const headerLine = shell
      .split("\n")
      .find((line) => line.includes("sticky top-0"));
    assert.ok(headerLine, "Orbit sticky header line must exist");
    assert.equal(headerLine.includes("backdrop-blur"), false);
    assert.equal(headerLine.includes("bg-white/70"), false);
    assert.equal(headerLine.includes("bg-white"), true);
  });

  it("keeps the header pill opaque with no backdrop blur banding", () => {
    const header = readFileSync("components/layout/header.tsx", "utf8");
    assert.equal(header.includes("hb-header-bar"), true);
    const barLine = header
      .split("\n")
      .find((line) => line.includes("hb-header-bar"));
    assert.ok(barLine, "header pill class line must exist");
    assert.equal(barLine.includes("backdrop-blur"), false);
    assert.equal(barLine.includes("bg-white/[0.92]"), false);
    assert.equal(barLine.includes("bg-white"), false);
    const css = readFileSync("app/globals.css", "utf8");
    assert.equal(css.includes(".hb-header-bar"), true);
    assert.equal(css.includes("backdrop-filter: none"), true);
  });

  it("reserves the SSR locale chip box so hydration cannot shift the header", () => {
    const lang = readFileSync(
      "components/locale/country-language-selector.tsx",
      "utf8",
    );
    assert.equal(lang.includes("size-[26px]"), true);
    assert.equal(lang.includes("shrink-0 rounded-full"), true);
    const currency = readFileSync(
      "components/locale/currency-selector.tsx",
      "utf8",
    );
    assert.equal(currency.includes("aria-hidden"), true);
  });
});
