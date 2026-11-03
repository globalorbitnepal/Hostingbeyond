import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  MAX_RENEWAL_YEARS,
  MIN_RENEWAL_YEARS,
  parseRenewalPeriodYears,
  renewalTotalForPeriod,
} from "@/lib/domains/renewal-term";

describe("parseRenewalPeriodYears", () => {
  it("defaults to one year when the client omits the field", () => {
    assert.deepEqual(parseRenewalPeriodYears(undefined), {
      ok: true,
      periodYears: 1,
    });
    assert.deepEqual(parseRenewalPeriodYears(null), {
      ok: true,
      periodYears: 1,
    });
  });

  it("accepts whole years inside the registry limit", () => {
    for (let y = MIN_RENEWAL_YEARS; y <= MAX_RENEWAL_YEARS; y += 1) {
      assert.deepEqual(parseRenewalPeriodYears(y), {
        ok: true,
        periodYears: y,
      });
    }
  });

  it("rejects fractional, zero, negative, and out-of-range years", () => {
    for (const raw of [
      0,
      -1,
      1.5,
      10.5,
      11,
      99,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ]) {
      const result = parseRenewalPeriodYears(raw);
      assert.equal(result.ok, false, `${String(raw)} must be rejected`);
    }
  });

  it("rejects non-numeric client input instead of coercing it", () => {
    for (const raw of ["3", "1e9", "", true, {}, []]) {
      const result = parseRenewalPeriodYears(raw);
      assert.equal(result.ok, false, `${JSON.stringify(raw)} must be rejected`);
    }
  });

  it("reports a client-safe error message", () => {
    const result = parseRenewalPeriodYears(11);
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /between 1 and 10 years/);
  });
});

describe("renewalTotalForPeriod", () => {
  it("multiplies the per-year renewal price", () => {
    assert.equal(renewalTotalForPeriod(17.99, 1), 17.99);
    assert.equal(renewalTotalForPeriod(17.99, 3), 53.97);
    assert.equal(renewalTotalForPeriod(17.99, 10), 179.9);
  });

  it("rounds to cents", () => {
    assert.equal(renewalTotalForPeriod(9.999, 1), 10);
    assert.equal(renewalTotalForPeriod(0.335, 3), 1.01);
  });

  it("refuses invalid prices and terms", () => {
    assert.equal(renewalTotalForPeriod(0, 1), null);
    assert.equal(renewalTotalForPeriod(-5, 1), null);
    assert.equal(renewalTotalForPeriod(Number.NaN, 1), null);
    assert.equal(renewalTotalForPeriod(17.99, 1.5), null);
    assert.equal(renewalTotalForPeriod(17.99, 0), null);
    assert.equal(renewalTotalForPeriod(17.99, 11), null);
  });
});
