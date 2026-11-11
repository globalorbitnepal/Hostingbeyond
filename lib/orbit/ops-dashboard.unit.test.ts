import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  countMailBags,
  countSslBags,
  decimalToNumber,
  money,
  renewalBucket,
} from "@/lib/orbit/ops-dashboard-math";

describe("orbit ops dashboard math", () => {
  it("formats money without inventing a currency symbol for bad numbers", () => {
    assert.equal(money(16.5), "$16.50");
    assert.equal(money(Number.NaN), "$0.00");
  });

  it("reads decimals and ignores junk", () => {
    assert.equal(decimalToNumber({ toString: () => "12.40" }), 12.4);
    assert.equal(decimalToNumber(null), 0);
    assert.equal(decimalToNumber({ toString: () => "nope" }), 0);
  });

  it("buckets domain expiry", () => {
    const now = new Date("2026-11-11T12:00:00.000Z");
    assert.equal(renewalBucket(null, now), "none");
    assert.equal(
      renewalBucket(new Date("2026-11-01T12:00:00.000Z"), now),
      "expired",
    );
    assert.equal(
      renewalBucket(new Date("2026-11-20T12:00:00.000Z"), now),
      "due",
    );
    assert.equal(
      renewalBucket(new Date("2027-06-01T12:00:00.000Z"), now),
      "ok",
    );
  });

  it("counts stored SSL and mail bags", () => {
    const now = new Date("2026-11-11T12:00:00.000Z");
    const ssl = countSslBags(
      [
        {
          data: {
            certificates: [
              {
                kind: "PREMIUM",
                status: "ACTIVE",
                expiresAt: "2026-11-20T00:00:00.000Z",
              },
              { kind: "FREE", status: "EXPIRED", expiresAt: "2026-01-01" },
            ],
          },
        },
        { data: null },
      ],
      now,
    );
    assert.deepEqual(ssl, { total: 2, active: 1, expiring: 2, premium: 1 });
    assert.equal(
      countMailBags([{ data: { messages: [{}, {}] } }, { data: {} }]),
      2,
    );
  });
});
