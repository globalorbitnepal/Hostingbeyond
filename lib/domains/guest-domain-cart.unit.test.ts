import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

const memory = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
  },
  configurable: true,
});

import {
  addGuestDomainLine,
  clearGuestDomainCart,
  guestCartSnapshot,
  readGuestDomainCart,
  removeGuestDomainLine,
} from "@/lib/domains/guest-domain-cart";

describe("guest domain cart", () => {
  beforeEach(() => {
    clearGuestDomainCart();
  });

  it("adds and deduplicates domains", () => {
    const first = addGuestDomainLine({
      domain: "example.com",
      status: "available",
      register: 9.99,
      renew: 19.99,
      currency: "USD",
    });
    assert.equal(first.duplicate, false);
    assert.equal(first.count, 1);

    const second = addGuestDomainLine({
      domain: "example.com",
      status: "available",
      register: 9.99,
      renew: 19.99,
      currency: "USD",
    });
    assert.equal(second.duplicate, true);
    assert.equal(readGuestDomainCart().length, 1);
  });

  it("removes a line", () => {
    addGuestDomainLine({
      domain: "a.com",
      status: "available",
      register: 1,
      renew: 2,
      currency: "USD",
    });
    addGuestDomainLine({
      domain: "b.com",
      status: "available",
      register: 3,
      renew: 4,
      currency: "USD",
    });
    assert.equal(removeGuestDomainLine("a.com"), 1);
    assert.equal(guestCartSnapshot().count, 1);
  });
});
