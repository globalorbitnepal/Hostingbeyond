import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  applyLiveSslPrices,
  NAMESILO_SSL_FALLBACK,
  parseNameSiloSslStoreHtml,
} from "@/lib/panel/namesilo-ssl-catalog";

describe("NameSilo SSL catalog", () => {
  it("parses store HTML prices without inventing SKUs", () => {
    const html = `
      <h3>Positive SSL Certificate</h3>
      <p>$9.59/Year</p>
      <h3>Essential SSL Certificate</h3>
      <p>$15.00/Year</p>
      <h3>Extended Validation (EV) SSL</h3>
      <p>$99.99/Year</p>
    `;
    assert.deepEqual(parseNameSiloSslStoreHtml(html), [
      { id: "positive-ssl", priceUsd: 9.59 },
      { id: "essential-ssl", priceUsd: 15 },
      { id: "ev-ssl", priceUsd: 99.99 },
    ]);
  });

  it("keeps fallback prices when the store returns nothing", () => {
    const products = applyLiveSslPrices([]);
    assert.equal(products[0]?.source, "namesilo-fallback");
    assert.equal(
      products.find((row) => row.id === "positive-ssl")?.priceUsd,
      NAMESILO_SSL_FALLBACK[0]?.priceUsd,
    );
  });
});
