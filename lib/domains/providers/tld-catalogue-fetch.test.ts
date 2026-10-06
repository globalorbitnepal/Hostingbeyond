import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  fetchAllTldCataloguePages,
  parseProductTldListDto,
} from "@/lib/domains/providers/tld-catalogue-fetch";

describe("tld-catalogue-fetch", () => {
  it("parses ProductTldListDto register/renew arrays", () => {
    const row = parseProductTldListDto({
      name: "com",
      maxRegistrationPeriod: 10,
      prices: [
        {
          register: [{ period: 1, price: 12.34, currency: "USD" }],
          renew: [{ period: 1, price: 14.5, currency: "USD" }],
          transfer: [{ period: 1, price: 12.34, currency: "USD" }],
        },
      ],
    });
    assert.ok(row);
    assert.equal(row.tld, ".com");
    assert.equal(row.register, 12.34);
    assert.equal(row.renew, 14.5);
    assert.equal(row.transfer, 12.34);
    assert.equal(row.maxRegisterYears, 10);
  });

  it("paginates until totalCount is reached", async () => {
    const pages: Record<number, { items: unknown[]; totalCount: number }> = {
      0: {
        totalCount: 3,
        items: [
          { name: "com", prices: [{ register: [{ period: 1, price: 1 }] }] },
          { name: "net", prices: [{ register: [{ period: 1, price: 2 }] }] },
        ],
      },
      2: {
        totalCount: 3,
        items: [
          { name: "org", prices: [{ register: [{ period: 1, price: 3 }] }] },
        ],
      },
    };
    let calls = 0;
    const result = await fetchAllTldCataloguePages(
      async (skip, pageSize) => {
        calls += 1;
        const page = pages[skip] ?? { items: [], totalCount: 3 };
        assert.equal(pageSize, 2);
        return page;
      },
      { pageSize: 2 },
    );

    assert.equal(calls, 2);
    assert.equal(result.pagesFetched, 2);
    assert.equal(result.totalCount, 3);
    assert.equal(result.items.length, 3);
    assert.equal(
      result.items
        .map((i) => i.tld)
        .sort()
        .join(","),
      ".com,.net,.org",
    );
  });

  it("deduplicates TLDs across pages", async () => {
    const result = await fetchAllTldCataloguePages(async (skip) => {
      if (skip > 0) return { items: [], totalCount: 1 };
      return {
        totalCount: 2,
        items: [
          { name: "io", prices: [{ register: [{ period: 1, price: 9 }] }] },
          { name: "io", prices: [{ register: [{ period: 1, price: 10 }] }] },
        ],
      };
    });
    assert.equal(result.items.length, 1);
    assert.equal(result.duplicateTlds, 1);
  });

  it("detects .in and .pk in parsed catalogue", () => {
    const inRow = parseProductTldListDto({
      name: "in",
      prices: [{ register: [{ period: 1, price: 5 }] }],
    });
    const pkRow = parseProductTldListDto({
      name: "pk",
      prices: [{ register: [{ period: 1, price: 6 }] }],
    });
    assert.equal(inRow?.tld, ".in");
    assert.equal(pkRow?.tld, ".pk");
  });
});
