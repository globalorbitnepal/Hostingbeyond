import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  extraLiveOnlyTlds,
  overlayRowWithLiveNameSilo,
} from "@/lib/domains/namesilo-live-display";

describe("overlayRowWithLiveNameSilo", () => {
  const stored = {
    namesiloRegister: 10,
    namesiloRenew: 9,
    namesiloTransfer: 8,
    namesiloSyncedAt: new Date("2020-01-01"),
    namesiloPriceStatus: "stale",
  };

  it("uses live NameSilo fields without writing stored values", () => {
    const liveAt = new Date("2026-10-28T00:00:00.000Z");
    const overlaid = overlayRowWithLiveNameSilo(
      stored,
      {
        tld: ".com",
        register: 11.05,
        renew: 12.1,
        transfer: 11.05,
        invalidFields: [],
      },
      liveAt,
    );
    assert.equal(overlaid.namesiloPriceSource, "live_api");
    assert.equal(overlaid.namesiloRegister, 11.05);
    assert.equal(overlaid.storedNamesiloRegister, 10);
    assert.equal(overlaid.namesiloPriceStatus, "verified");
    assert.equal(
      overlaid.namesiloSyncedAt?.toISOString(),
      liveAt.toISOString(),
    );
  });

  it("keeps a stored cost when the live field is missing", () => {
    const overlaid = overlayRowWithLiveNameSilo(
      stored,
      {
        tld: ".com",
        register: 11.05,
        renew: null,
        transfer: 11.05,
        invalidFields: [],
      },
      new Date(),
    );
    assert.equal(overlaid.namesiloRenew, 9);
    assert.equal(overlaid.namesiloRegister, 11.05);
    assert.equal(overlaid.namesiloPriceSource, "live_api");
  });

  it("falls back to stored catalogue when live TLD is absent", () => {
    const overlaid = overlayRowWithLiveNameSilo(stored, undefined, null);
    assert.equal(overlaid.namesiloPriceSource, "stored_catalogue");
    assert.equal(overlaid.namesiloRegister, 10);
    assert.equal(overlaid.namesiloPriceStatus, "stale");
  });

  it("lists live NameSilo TLDs that are not in the catalogue", () => {
    const extra = extraLiveOnlyTlds(
      [".com"],
      new Map([
        [
          ".com",
          {
            tld: ".com",
            register: 11,
            renew: 11,
            transfer: 11,
            invalidFields: [],
          },
        ],
        [
          ".xyz",
          {
            tld: ".xyz",
            register: 1,
            renew: 2,
            transfer: 1,
            maxRegisterYears: 10,
            invalidFields: [],
          },
        ],
      ]),
    );
    assert.equal(extra.length, 1);
    assert.equal(extra[0]?.tld, ".xyz");
  });
});
