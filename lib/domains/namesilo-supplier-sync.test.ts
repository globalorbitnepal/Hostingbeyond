import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  normalizeCatalogueTld,
  planRowUpdate,
} from "@/lib/domains/namesilo-supplier-sync";

describe("NameSilo supplier sync plan", () => {
  it("normalizes TLD keys with leading dot and case", () => {
    assert.equal(normalizeCatalogueTld("COM"), ".com");
    assert.equal(normalizeCatalogueTld(".Com"), ".com");
  });

  const baseRow = {
    id: "1",
    tld: ".com",
    enabled: true,
    retailPriceLocked: false,
    namesiloRegister: 10,
    namesiloRenew: 9,
    namesiloTransfer: 8,
    namesiloPriceStatus: "verified",
    namesiloSyncedAt: new Date("2020-01-01"),
  };

  it("does not wipe register when API returns null register", () => {
    const syncedAt = new Date("2026-01-01");
    const plan = planRowUpdate(
      baseRow,
      {
        tld: ".com",
        register: null,
        renew: 9.2,
        transfer: null,
        invalidFields: [],
      },
      syncedAt,
    );
    assert.equal(plan.data.namesiloRegister, 10);
    assert.equal(plan.data.namesiloRenew, 9.2);
    assert.equal(plan.data.namesiloTransfer, 8);
  });

  it("never includes retail fields in planned supplier update", () => {
    const syncedAt = new Date("2026-01-01");
    const plan = planRowUpdate(
      baseRow,
      {
        tld: ".com",
        register: 11,
        renew: 11,
        transfer: 10,
        invalidFields: [],
      },
      syncedAt,
    );
    const keys = Object.keys(plan.data);
    assert.ok(!keys.some((k) => k.startsWith("retail")));
  });

  it("updates status to missing without clearing costs when absent from API", () => {
    const syncedAt = new Date("2026-01-01");
    const plan = planRowUpdate(baseRow, undefined, syncedAt);
    assert.equal(plan.data.namesiloPriceStatus, "missing");
    assert.equal(plan.data.namesiloRegister, undefined);
  });
});
