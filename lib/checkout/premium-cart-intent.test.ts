import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import { HOSTING_CART_STORAGE_KEY } from "@/lib/hosting/cart/types";

import {
  PREMIUM_CART_SERVICES_KEY,
  readPremiumCartServices,
  writePremiumCartServices,
  clearPremiumCartServices,
  hostingContinueHrefAfterDomain,
} from "./premium-cart-intent";

function installSessionStorage() {
  const store = new Map<string, string>();
  (globalThis as { window?: typeof globalThis }).window = globalThis;
  (globalThis as { sessionStorage?: Storage }).sessionStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  } as Storage;
}

describe("premium-cart-intent", () => {
  beforeEach(() => {
    installSessionStorage();
    clearPremiumCartServices();
  });

  it("round-trips service selections in sessionStorage", () => {
    const selections = [
      {
        kind: "hosting" as const,
        productSlug: "web-hosting",
        planKey: "essential",
        billing: "monthly" as const,
      },
    ];
    writePremiumCartServices(selections);
    assert.ok(sessionStorage.getItem(PREMIUM_CART_SERVICES_KEY));
    assert.deepEqual(readPremiumCartServices(), selections);

    writePremiumCartServices([
      { kind: "business-email", planId: "starter", term: "48" },
      { kind: "domain-protection" },
    ]);
    assert.deepEqual(readPremiumCartServices()[0], {
      kind: "business-email",
      planId: "starter",
      term: "48",
    });
    assert.deepEqual(readPremiumCartServices()[1], {
      kind: "domain-protection",
    });
  });

  it("returns empty array for invalid JSON", () => {
    sessionStorage.setItem(PREMIUM_CART_SERVICES_KEY, "not-json");
    assert.deepEqual(readPremiumCartServices(), []);
  });

  it("builds hosting checkout continue URL and prefills cart storage", () => {
    writePremiumCartServices([
      {
        kind: "hosting",
        productSlug: "web-hosting",
        planKey: "essential",
        billing: "monthly",
      },
      { kind: "business-email", planId: "starter", term: "monthly" },
    ]);
    const href = hostingContinueHrefAfterDomain({
      domain: "xtendreviews.com",
    });
    assert.equal(
      href,
      "/checkout/hosting?product=web-hosting&plan=essential&billing=monthly&step=review",
    );
    const stored = JSON.parse(
      sessionStorage.getItem(HOSTING_CART_STORAGE_KEY) ?? "{}",
    ) as {
      domainName?: string;
      domainChoice?: string;
      addons?: Array<{ addonSlug: string; optionId: string }>;
    };
    assert.equal(stored.domainName, "xtendreviews.com");
    assert.equal(stored.domainChoice, "existing");
    assert.equal(stored.addons?.[0]?.addonSlug, "business-email");
    assert.equal(stored.addons?.[0]?.optionId, "starter");
  });

  it("returns null when no hosting add-on is selected", () => {
    writePremiumCartServices([
      { kind: "business-email", planId: "starter", term: "monthly" },
    ]);
    assert.equal(
      hostingContinueHrefAfterDomain({ domain: "xtendreviews.com" }),
      null,
    );
  });
});
