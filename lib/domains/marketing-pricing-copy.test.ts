import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { defaultDomainContent } from "@/lib/domains/content";
import { buildDomainSchema } from "@/lib/domains/seo";
import { TLD_PRICES } from "@/lib/domains/tlds";

const MISLEADING_COM_OFFER = /\$0\.01.*first year|0\.01 for year one/i;

describe("marketing pricing copy", () => {
  it("default domain FAQ does not advertise unverified $0.01 .com promo", () => {
    const content = defaultDomainContent();
    const text = JSON.stringify(content.single.faqs) + content.bulk.faqs;
    assert.equal(MISLEADING_COM_OFFER.test(text), false);
  });

  it("AggregateOffer uses real catalogue low price not 0.01 fallback", () => {
    const prices = TLD_PRICES.map((p, i) => ({
      id: p.tld,
      visible: true,
      order: i,
      tld: p.tld,
      register: p.register,
      renew: p.renew,
      transfer: p.transfer,
      categories: p.categories,
      note: "",
    }));
    const schema = buildDomainSchema({
      name: "Test",
      description: "Test",
      path: "/bulk-domain-search",
      breadcrumb: "Bulk",
      faqs: [],
      prices,
    });
    const product = schema.find((s) => s["@type"] === "Product") as {
      offers?: { lowPrice: number };
    };
    assert.ok(product?.offers);
    assert.ok(product.offers!.lowPrice > 0.5);
    assert.notEqual(product.offers!.lowPrice, 0.01);
  });
});
