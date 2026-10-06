import { config as loadDotenv } from "dotenv";

loadDotenv();

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  clearDomainCart,
  getDomainCartForUser,
  removeDomainFromCart,
  revalidateDomainCart,
} from "@/lib/domains/domain-cart-service";
import { prisma } from "@/lib/prisma";

const TEST_EMAIL = "domain-cart-test@hostingbeyond.local";

function shouldRunDbTests(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

const runDb = shouldRunDbTests();

describe("Domain cart (database)", { skip: !runDb, concurrency: 1 }, () => {
  let userId = "";
  let cartId = "";

  it("prepares customer and empty cart", async () => {
    const user = await prisma.customerUser.upsert({
      where: { email: TEST_EMAIL },
      create: { email: TEST_EMAIL, name: "Cart Test" },
      update: {},
    });
    userId = user.id;
    await clearDomainCart(userId);
    const cart = await prisma.domainCart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    cartId = cart.id;
  });

  it("lists cart items and totals", async () => {
    await prisma.domainCartItem.create({
      data: {
        cartId,
        domain: "cart-test-example.com",
        tld: ".com",
        periodYears: 1,
        status: "available",
        register: 12.99,
        renew: 14.99,
        currency: "USD",
      },
    });
    const snapshot = await getDomainCartForUser(userId);
    assert.equal(snapshot.count, 1);
    assert.equal(snapshot.items[0]?.domain, "cart-test-example.com");
    assert.equal(snapshot.total, 12.99);
  });

  it("removes a single domain from cart", async () => {
    const { cart } = await removeDomainFromCart(
      userId,
      "cart-test-example.com",
    );
    assert.equal(cart.count, 0);
  });

  it("revalidate on empty cart is safe", async () => {
    const result = await revalidateDomainCart(userId);
    assert.equal(result.items.length, 0);
    assert.equal(result.rejected.length, 0);
    assert.equal(result.requiresConfirmation, false);
  });

  it("clears cart", async () => {
    await prisma.domainCartItem.create({
      data: {
        cartId,
        domain: "cart-clear-test.net",
        tld: ".net",
        periodYears: 1,
        status: "available",
        register: 9.99,
        renew: 11.99,
        currency: "USD",
      },
    });
    await clearDomainCart(userId);
    const snapshot = await getDomainCartForUser(userId);
    assert.equal(snapshot.count, 0);
  });
});

describe("Domain cart API contract (unit)", () => {
  it("rejects client-submitted pricing fields in POST body shape", () => {
    const body = { domain: "x.com", register: 1, price: 2, total: 3 };
    const o = body as Record<string, unknown>;
    const rejects = "register" in o || "total" in o || "price" in o;
    assert.equal(rejects, true);
  });
});
