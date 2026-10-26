import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  addDomainsToCart,
  clearDomainCart,
  getDomainCartForUser,
} from "@/lib/domains/domain-cart-service";
import { BULK_LIMIT_EXCEEDED_CODE } from "@/lib/domains/bulk-search-limit";
import { prisma } from "@/lib/prisma";
import { isIntegrationDatabaseConfigured } from "@/lib/test/integration-gate";

const TEST_EMAIL = "domain-cart-bulk-test@hostingbeyond.local";

describe(
  "addDomainsToCart bulk limits (database)",
  { skip: !isIntegrationDatabaseConfigured(), concurrency: 1 },
  () => {
    let userId = "";

    it("prepares isolated customer cart", async () => {
      const user = await prisma.customerUser.upsert({
        where: { email: TEST_EMAIL },
        create: { email: TEST_EMAIL, name: "Cart Bulk Test" },
        update: {},
      });
      userId = user.id;
      await clearDomainCart(userId);
    });

    it("rejects 11 unique domains without truncation or cart mutation", async () => {
      const before = await getDomainCartForUser(userId);
      const walletBefore = await prisma.walletTransaction.count({
        where: { userId },
      });
      const domains = Array.from(
        { length: 11 },
        (_, i) => `bulklim${i}.example`,
      );
      const result = await addDomainsToCart(userId, domains);
      assert.equal(result.ok, false);
      if (result.ok) return;
      assert.equal(result.body.code, BULK_LIMIT_EXCEEDED_CODE);
      const after = await getDomainCartForUser(userId);
      assert.equal(after.count, before.count);
      const walletAfter = await prisma.walletTransaction.count({
        where: { userId },
      });
      assert.equal(walletAfter, walletBefore);
    });

    it("allows 10 unique domains in one request (validation may reject unavailable)", async () => {
      await clearDomainCart(userId);
      const domains = Array.from({ length: 10 }, (_, i) => `ten${i}.example`);
      const result = await addDomainsToCart(userId, domains);
      assert.equal(result.ok, true);
      if (!result.ok) return;
      assert.equal(result.added.length + result.rejected.length, 10);
      assert.equal(
        result.added.length + result.rejected.length,
        domains.length,
      );
    });

    it("deduplicates duplicate inputs in one request without counting as 11 unique", async () => {
      await clearDomainCart(userId);
      const base = Array.from({ length: 10 }, (_, i) => `dup${i}.example`);
      const withDupes = [...base, base[0]!, base[1]!.toUpperCase()];
      const result = await addDomainsToCart(userId, withDupes);
      assert.equal(result.ok, true);
    });

    it("rejects invalid domain strings without wallet side effects", async () => {
      await clearDomainCart(userId);
      const walletBefore = await prisma.walletTransaction.count({
        where: { userId },
      });
      const result = await addDomainsToCart(userId, ["not-a-valid-domain"]);
      assert.equal(result.ok, true);
      if (!result.ok) return;
      assert.equal(result.added.length, 0);
      assert.equal(result.rejected.length, 1);
      const walletAfter = await prisma.walletTransaction.count({
        where: { userId },
      });
      assert.equal(walletAfter, walletBefore);
    });

    it("merges with existing cart items when under bulk limit", async () => {
      await clearDomainCart(userId);
      const cart = await prisma.domainCart.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });
      await prisma.domainCartItem.create({
        data: {
          cartId: cart.id,
          domain: "existing-cart-item.com",
          tld: ".com",
          periodYears: 1,
          status: "available",
          register: 12,
          renew: 14,
          currency: "USD",
        },
      });
      const result = await addDomainsToCart(userId, [
        "another-candidate.example",
      ]);
      assert.equal(result.ok, true);
      if (!result.ok) return;
      const snapshot = await getDomainCartForUser(userId);
      assert.ok(snapshot.count >= 1);
      assert.ok(
        snapshot.items.some((i) => i.domain === "existing-cart-item.com"),
      );
    });
  },
);
