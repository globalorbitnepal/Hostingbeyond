import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isUsableSupplierCost,
  nameSiloParsedToNullable,
  parseNameSiloSupplierPrice,
} from "@/lib/domains/providers/namesilo-price-parse";
import { parseNameSiloGetPricesReply } from "@/lib/domains/providers/namesilo-pricing";

describe("parseNameSiloSupplierPrice", () => {
  it("treats null and empty as missing", () => {
    assert.equal(parseNameSiloSupplierPrice(null).kind, "missing");
    assert.equal(parseNameSiloSupplierPrice("").kind, "missing");
    assert.equal(parseNameSiloSupplierPrice(undefined).kind, "missing");
  });

  it("parses valid numeric strings and numbers", () => {
    assert.deepEqual(parseNameSiloSupplierPrice("11.05"), {
      kind: "valid",
      amount: 11.05,
    });
    assert.deepEqual(parseNameSiloSupplierPrice(0), {
      kind: "valid",
      amount: 0,
    });
  });

  it("rejects NaN and objects without coercing to zero", () => {
    assert.equal(parseNameSiloSupplierPrice(NaN).kind, "invalid");
    assert.equal(parseNameSiloSupplierPrice({}).kind, "invalid");
    assert.equal(
      nameSiloParsedToNullable(parseNameSiloSupplierPrice({})),
      null,
    );
  });

  it("rejects negative amounts", () => {
    assert.equal(parseNameSiloSupplierPrice(-1).kind, "invalid");
  });
});

describe("parseNameSiloGetPricesReply malformed TLD costs", () => {
  it("maps invalid premium placeholders to null register", () => {
    const rows = parseNameSiloGetPricesReply({
      code: "300",
      auto: { registration: "N/A", renew: "12", transfer: "10" },
      car: { registration: {}, renew: null, transfer: null },
      com: { registration: "11.05", renew: "11.05", transfer: "10.80" },
    });
    const auto = rows.find((r) => r.tld === ".auto");
    const car = rows.find((r) => r.tld === ".car");
    const com = rows.find((r) => r.tld === ".com");
    assert.equal(auto?.register, null);
    assert.equal(auto?.renew, 12);
    assert.equal(car?.register, null);
    assert.equal(com?.register, 11.05);
    assert.equal(
      isUsableSupplierCost(parseNameSiloSupplierPrice("N/A")),
      false,
    );
  });
});
