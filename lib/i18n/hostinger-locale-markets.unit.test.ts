import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getLocaleMarket,
  publicLocaleMarkets,
  searchLocaleMarkets,
} from "@/lib/i18n/hostinger-locale-markets";

describe("public locale markets (English-only)", () => {
  it("hides Hindi from the location list", () => {
    const ids = publicLocaleMarkets().map((m) => m.id);
    assert.ok(!ids.includes("IN-hi"));
    assert.ok(ids.includes("IN-en"));
    assert.ok(ids.includes("US-en"));
    assert.ok(publicLocaleMarkets().every((m) => m.triggerCode === "EN"));
  });

  it("does not return Hindi in search", () => {
    const hindi = searchLocaleMarkets("hindi");
    assert.equal(hindi.length, 0);
    const india = searchLocaleMarkets("india");
    assert.ok(india.every((m) => m.googleTargetLang === "en"));
  });

  it("maps IN-hi to India English", () => {
    const market = getLocaleMarket("IN-hi");
    assert.equal(market.id, "IN-en");
    assert.equal(market.triggerCode, "EN");
  });
});
