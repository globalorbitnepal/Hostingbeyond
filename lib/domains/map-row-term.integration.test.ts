import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ProviderAvailabilityRow } from "@/lib/domains/providers/types";
import {
  buildRetailPricingContext,
  mapRowToCustomerResult,
} from "@/lib/domains/domain-service";
import {
  buildStandardRegistrationQuote,
  tldTermContextFromRow,
} from "@/lib/domains/registration-term";
import { prisma } from "@/lib/prisma";

const TEST_AI = ".hb-term-ai-test";
const TEST_COM = ".hb-term-com-test";

async function migrationApplied(): Promise<boolean> {
  try {
    await prisma.$queryRawUnsafe(
      'SELECT "supplierMinRegistrationPeriod", "retailRegisterTermYears" FROM "DomainTldPrice" LIMIT 1',
    );
    return true;
  } catch {
    return false;
  }
}

describe(
  "mapRowToCustomerResult term alignment",
  { skip: !process.env.DATABASE_URL },
  () => {
    it("blocks 1-year .ai quote when min term is 2 and retail is 1-year only", async (t) => {
      if (!(await migrationApplied())) {
        t.skip("Migration 20261015120000 not applied");
        return;
      }

      await prisma.domainTldPrice.upsert({
        where: { tld: TEST_AI },
        create: {
          tld: TEST_AI,
          retailRegister: 89.99,
          retailRenew: 109.99,
          retailTransfer: 179.99,
          retailRegisterTermYears: 1,
          supplierMinRegistrationPeriod: 2,
          supplierRegister: 199.8,
          enabled: true,
        },
        update: {
          retailRegister: 89.99,
          retailRenew: 109.99,
          retailRegisterTermYears: 1,
          supplierMinRegistrationPeriod: 2,
          supplierRegister: 199.8,
          enabled: true,
        },
      });

      const row = await prisma.domainTldPrice.findUnique({
        where: { tld: TEST_AI },
      });
      const ctx = tldTermContextFromRow(row!);
      assert.equal(buildStandardRegistrationQuote(ctx, 2), null);

      const providerRow: ProviderAvailabilityRow = {
        domain: "example.ai",
        name: "example",
        tld: TEST_AI,
        status: "available",
        supplier: {
          register: 199.8,
          renew: null,
          transfer: null,
          currency: "USD",
          registrationPeriodYears: 2,
        },
      };
      const pricingCtx = await buildRetailPricingContext([TEST_AI]);
      const mapped = await mapRowToCustomerResult(providerRow, pricingCtx);
      assert.equal(mapped?.register, null);
      assert.equal(mapped?.registerTermYears, 2);
      assert.equal(mapped?.status, "unknown");

      await prisma.domainTldPrice.delete({ where: { tld: TEST_AI } });
    });

    it("quotes 1-year .com when supplier min is 1", async (t) => {
      if (!(await migrationApplied())) {
        t.skip("Migration 20261015120000 not applied");
        return;
      }

      await prisma.domainTldPrice.upsert({
        where: { tld: TEST_COM },
        create: {
          tld: TEST_COM,
          retailRegister: 9.99,
          retailRenew: 17.99,
          retailTransfer: 12.99,
          retailRegisterTermYears: 1,
          supplierMinRegistrationPeriod: 1,
          supplierRegister: 11.31,
          enabled: true,
        },
        update: {
          retailRegister: 9.99,
          retailRenew: 17.99,
          supplierMinRegistrationPeriod: 1,
          enabled: true,
        },
      });

      const providerRow: ProviderAvailabilityRow = {
        domain: "example.com",
        name: "example",
        tld: TEST_COM,
        status: "available",
        supplier: {
          register: 11.31,
          renew: null,
          transfer: null,
          currency: "USD",
          registrationPeriodYears: 1,
        },
      };
      const pricingCtx = await buildRetailPricingContext([TEST_COM]);
      const mapped = await mapRowToCustomerResult(providerRow, pricingCtx);
      assert.equal(mapped?.register, 9.99);
      assert.equal(mapped?.registerTermYears, 1);
      assert.equal(mapped?.status, "available");

      await prisma.domainTldPrice.delete({ where: { tld: TEST_COM } });
    });
  },
);
