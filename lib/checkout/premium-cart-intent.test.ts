import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import {
  PREMIUM_CART_SERVICES_KEY,
  readPremiumCartServices,
  writePremiumCartServices,
  clearPremiumCartServices,
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
  });

  it("returns empty array for invalid JSON", () => {
    sessionStorage.setItem(PREMIUM_CART_SERVICES_KEY, "not-json");
    assert.deepEqual(readPremiumCartServices(), []);
  });
});
