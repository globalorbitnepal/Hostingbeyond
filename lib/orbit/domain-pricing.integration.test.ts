import { config as loadDotenv } from "dotenv";

loadDotenv();

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { prisma } from "@/lib/prisma";

function shouldRunDbTests(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

const runDb = shouldRunDbTests();
const TEST_TLD = ".hb-price-audit-test";

function isMissingTermColumns(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("supplierMinRegistrationPeriod") ||
    msg.includes("retailRegisterTermYears") ||
    msg.includes("does not exist")
  );
}

describe("Orbit domain pricing persistence", { skip: !runDb }, () => {
  it("partial retail update preserves other columns", async (t) => {
    try {
      await prisma.$queryRawUnsafe(
        'SELECT "supplierMinRegistrationPeriod", "retailRegisterTermYears" FROM "DomainTldPrice" LIMIT 1',
      );
    } catch (error) {
      if (isMissingTermColumns(error)) {
        t.skip(
          "Apply prisma migration 20261015120000_domain_term_aware_pricing",
        );
        return;
      }
      throw error;
    }

    await prisma.domainTldPrice.upsert({
      where: { tld: TEST_TLD },
      create: {
        tld: TEST_TLD,
        retailRegister: 10,
        retailRenew: 20,
        retailTransfer: 15,
        enabled: false,
      },
      update: {
        retailRegister: 10,
        retailRenew: 20,
        retailTransfer: 15,
        enabled: false,
      },
    });

    await prisma.domainTldPrice.update({
      where: { tld: TEST_TLD },
      data: { retailRenew: 21 },
    });
    const mid = await prisma.domainTldPrice.findUnique({
      where: { tld: TEST_TLD },
    });
    assert.equal(Number(mid!.retailRegister), 10);
    assert.equal(Number(mid!.retailRenew), 21);

    await prisma.domainTldPrice.delete({ where: { tld: TEST_TLD } });
  });
});
