import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PANEL_NAV, panelTitleForPath } from "@/lib/panel/navigation";

describe("panel navigation", () => {
  it("links only real routes or marks soon", () => {
    for (const section of PANEL_NAV) {
      for (const item of section.items) {
        if (item.soon) {
          assert.equal(item.href, undefined);
        } else {
          assert.ok(item.href);
        }
      }
    }
  });

  it("resolves titles for account paths", () => {
    assert.equal(panelTitleForPath("/account"), "Dashboard");
    assert.equal(panelTitleForPath("/account/wallet"), "Wallet");
    assert.equal(panelTitleForPath("/account/billing"), "Transactions");
    assert.equal(panelTitleForPath("/account/orders"), "Domain orders");
    assert.equal(
      panelTitleForPath("/account/hosting-orders"),
      "Hosting orders",
    );
    assert.equal(panelTitleForPath("/account/my-domains"), "Domain portfolio");
    assert.equal(
      panelTitleForPath("/account/my-domains/example.com"),
      "Domain details",
    );
    assert.equal(panelTitleForPath("/account/domains/find"), "Domain search");
    assert.equal(panelTitleForPath("/account/domains/transfer"), "Transfers");
    assert.equal(panelTitleForPath("/account/hosting"), "Hosting plans");
    assert.equal(panelTitleForPath("/account/email"), "Business email");
    assert.equal(panelTitleForPath("/account/support"), "Support");
  });

  it("keeps every nav link inside the customer panel", () => {
    for (const section of PANEL_NAV) {
      for (const item of section.items) {
        if (!item.href) continue;
        assert.ok(
          item.href.startsWith("/account"),
          `${item.label} leaves the panel: ${item.href}`,
        );
      }
    }
  });
});
