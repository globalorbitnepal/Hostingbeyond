import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PANEL_NAV, panelTitleForPath } from "@/lib/panel/navigation";

describe("panel navigation", () => {
  it("links only real routes or marks soon", () => {
    for (const section of PANEL_NAV) {
      for (const item of section.items) {
        if (item.soon) {
          assert.equal(item.href, undefined);
        } else if (item.hub && !item.href) {
          assert.ok(true);
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
    assert.equal(panelTitleForPath("/account/domains/dns"), "DNS");
    assert.equal(
      panelTitleForPath("/account/domains/contacts"),
      "Contact profiles",
    );
    assert.equal(panelTitleForPath("/account/domains/tlds"), "TLD list");
    assert.equal(panelTitleForPath("/account/hosting"), "Hosting plans");
    assert.equal(panelTitleForPath("/account/email"), "Business email");
    assert.equal(panelTitleForPath("/account/support"), "Support");
    assert.equal(panelTitleForPath("/account/ai-agent"), "AI Agent");
    assert.equal(panelTitleForPath("/account/ssl"), "SSL certificates");
    assert.equal(panelTitleForPath("/account/billing/cards"), "Payment cards");
  });

  it("nests domain tools under a Domains hub", () => {
    const domains = PANEL_NAV.find((section) => section.id === "domains");
    assert.ok(domains);
    assert.equal(domains.items[0]?.hub, true);
    assert.ok(domains.items.some((item) => item.id === "dns" && item.child));
    assert.ok(
      domains.items.some((item) => item.id === "contacts" && item.child),
    );
    assert.ok(domains.items.some((item) => item.id === "tlds" && item.child));
    assert.ok(!domains.items.some((item) => item.id === "ssl"));
  });

  it("places SSL and AI Agent after Domains and Hosting", () => {
    const ids = PANEL_NAV.map((section) => section.id);
    assert.deepEqual(ids.slice(0, 5), [
      "overview",
      "domains",
      "hosting",
      "ssl",
      "ai-agent",
    ]);
    const ssl = PANEL_NAV.find((section) => section.id === "ssl");
    assert.ok(ssl);
    assert.equal(ssl.items[0]?.hub, true);
    assert.ok(ssl.items.some((item) => item.id === "ssl-buy" && item.child));
    const overview = PANEL_NAV.find((section) => section.id === "overview");
    assert.ok(overview);
    assert.equal(
      overview.items.some((item) => item.id === "ai-agent"),
      false,
    );
  });

  it("nests hosting tools under a Hosting hub", () => {
    const hosting = PANEL_NAV.find((section) => section.id === "hosting");
    assert.ok(hosting);
    assert.equal(hosting.items[0]?.hub, true);
    assert.ok(
      hosting.items.some((item) => item.id === "my-websites" && item.child),
    );
    assert.ok(
      hosting.items.some((item) => item.id === "hosting-orders" && item.child),
    );
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
