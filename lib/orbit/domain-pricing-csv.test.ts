import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DOMAIN_PRICING_CSV_HEADERS,
  buildDomainPricingCsv,
} from "@/lib/orbit/domain-pricing-csv";

describe("domain pricing CSV", () => {
  it("never labels DNA prices as NameSilo columns", () => {
    const csv = buildDomainPricingCsv([
      {
        tld: ".com",
        retailPriceLocked: false,
        retailRegister: 14.99,
        retailRenew: 16.99,
        retailTransfer: 12.99,
        supplierRegister: 99.01,
        supplierRenew: 88.02,
        supplierTransfer: 77.03,
        supplierSyncedAt: "2026-01-01T00:00:00.000Z",
        namesiloRegister: 10.05,
        namesiloRenew: 9.05,
        namesiloTransfer: 8.05,
        namesiloSyncedAt: new Date().toISOString(),
        namesiloPriceStatus: "verified",
        lifecycleProvider: null,
      },
    ]);
    const [header, line] = csv.split("\n");
    assert.equal(header, DOMAIN_PRICING_CSV_HEADERS.join(","));
    assert.ok(header?.includes("namesilo_register"));
    assert.ok(header?.includes("legacy_dna_register"));
    assert.ok(!header?.includes("dna_register,namesilo"));
    assert.ok(line?.includes("10.05"));
    assert.ok(line?.includes("99.01"));
    const cells = line?.split(",") ?? [];
    const nsReg =
      cells[DOMAIN_PRICING_CSV_HEADERS.indexOf("namesilo_register")];
    const dnaReg =
      cells[DOMAIN_PRICING_CSV_HEADERS.indexOf("legacy_dna_register")];
    assert.equal(nsReg, "10.05");
    assert.equal(dnaReg, "99.01");
    assert.notEqual(nsReg, dnaReg);
  });

  it("does not copy DNA into NameSilo columns when NameSilo is missing", () => {
    const csv = buildDomainPricingCsv([
      {
        tld: ".net",
        retailPriceLocked: false,
        retailRegister: 14.99,
        retailRenew: 16.99,
        retailTransfer: 12.99,
        supplierRegister: 5.5,
        supplierRenew: 5.5,
        supplierTransfer: 5.5,
        supplierSyncedAt: "2026-01-01T00:00:00.000Z",
        namesiloRegister: null,
        namesiloRenew: null,
        namesiloTransfer: null,
        namesiloSyncedAt: null,
        namesiloPriceStatus: "missing",
        lifecycleProvider: null,
      },
    ]);
    const line = csv.split("\n")[1]!;
    const cells = line.split(",");
    assert.equal(
      cells[DOMAIN_PRICING_CSV_HEADERS.indexOf("namesilo_register")],
      "",
    );
    assert.equal(
      cells[DOMAIN_PRICING_CSV_HEADERS.indexOf("register_gross_profit")],
      "N/A",
    );
    assert.equal(
      cells[DOMAIN_PRICING_CSV_HEADERS.indexOf("legacy_dna_register")],
      "5.5",
    );
    assert.equal(
      cells[DOMAIN_PRICING_CSV_HEADERS.indexOf("proposed_register")],
      "",
    );
  });
});
