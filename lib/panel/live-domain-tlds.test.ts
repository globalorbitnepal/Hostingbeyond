import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  mapLiveOrbitTld,
  pickFeaturedLiveTlds,
  sortLiveDomainTlds,
  type OrbitTldPriceRow,
} from "@/lib/panel/live-domain-tlds";

function row(overrides: Partial<OrbitTldPriceRow> = {}): OrbitTldPriceRow {
  return {
    tld: ".com",
    enabled: true,
    retailRegister: 9.99,
    retailRenew: 17.99,
    retailTransfer: 12.99,
    promoRegister: null,
    promoEndsAt: null,
    namesiloPriceStatus: "verified",
    ...overrides,
  };
}

describe("live Orbit TLD catalogue", () => {
  it("maps verified Orbit 1st-year and renewal prices", () => {
    const live = mapLiveOrbitTld(row());
    assert.deepEqual(live, {
      tld: ".com",
      register: 9.99,
      renew: 17.99,
      transfer: 12.99,
      isPromo: true,
    });
  });

  it("uses an active promo as the 1st-year sale price", () => {
    const live = mapLiveOrbitTld(
      row({
        retailRegister: 17.99,
        promoRegister: 0.99,
        promoEndsAt: new Date("2099-01-01T00:00:00.000Z"),
      }),
    );
    assert.equal(live?.register, 0.99);
    assert.equal(live?.renew, 17.99);
    assert.equal(live?.isPromo, true);
  });

  it("drops missing, invalid, and disabled rows", () => {
    assert.equal(
      mapLiveOrbitTld(row({ namesiloPriceStatus: "missing" })),
      null,
    );
    assert.equal(
      mapLiveOrbitTld(row({ namesiloPriceStatus: "invalid" })),
      null,
    );
    assert.equal(mapLiveOrbitTld(row({ enabled: false })), null);
    assert.equal(mapLiveOrbitTld(row({ retailRegister: 0 })), null);
  });

  it("picks five preferred live chips and skips missing TLDs", () => {
    const live = sortLiveDomainTlds(
      [
        mapLiveOrbitTld(row()),
        mapLiveOrbitTld(
          row({ tld: ".net", retailRegister: 11.99, retailRenew: 17.49 }),
        ),
        mapLiveOrbitTld(row({ tld: ".org", retailRegister: 7.99 })),
        mapLiveOrbitTld(
          row({ tld: ".online", retailRegister: 0.99, retailRenew: 35.99 }),
        ),
        mapLiveOrbitTld(
          row({ tld: ".shop", retailRegister: 0.99, retailRenew: 39.99 }),
        ),
        mapLiveOrbitTld(
          row({ tld: ".io", retailRegister: 31.99, retailRenew: 74.99 }),
        ),
      ].filter((item) => item != null),
    );
    const featured = pickFeaturedLiveTlds(live);
    assert.deepEqual(
      featured.map((item) => item.tld),
      [".com", ".net", ".org", ".online", ".shop"],
    );
  });
});
