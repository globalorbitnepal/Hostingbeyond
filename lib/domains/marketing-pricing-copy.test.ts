import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  defaultDomainContent,
  mergeDomainContent,
  priceByTld,
} from "@/lib/domains/content";
import { applyRetailOverlay } from "@/lib/domains/domain-search-page-data";
import { stripBrandTitleSuffix } from "@/lib/domains/page-metadata";
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

  it("mergeDomainContent drops $0.01 SEO and stale 50-name CTA", () => {
    const merged = mergeDomainContent({
      single: {
        seoTitle:
          "Domain Name Search — Check Availability & Register from $0.01 | HostingBeyond",
        crossLinkHelper: "Need a whole shortlist? Run 50 names at once.",
      } as import("@/lib/domains/content").DomainPageCopy,
      shared: {
        transferDescription:
          "Transfers add a full extra year. A .com transfer is $9.99.",
      } as import("@/lib/domains/content").DomainSharedContent,
    });
    assert.equal(/\$0\.01/.test(merged.single.seoTitle), false);
    assert.equal(/\b50\s*names\b/i.test(merged.single.crossLinkHelper), false);
    assert.equal(
      /A \.com transfer is \$/i.test(merged.shared.transferDescription),
      false,
    );
  });

  it("applyRetailOverlay uses checkout register/renew/transfer", () => {
    const rows = [
      {
        id: ".com",
        visible: true,
        order: 0,
        tld: ".com",
        register: 9.99,
        renew: 19.99,
        transfer: 9.99,
        categories: ["popular" as const],
        note: "",
      },
    ];
    const overlay = applyRetailOverlay(
      rows,
      new Map([[".com", { register: 9.99, renew: 17.99, transfer: 12.99 }]]),
    );
    assert.equal(overlay[0].renew, 17.99);
    assert.equal(overlay[0].transfer, 12.99);
  });

  it("priceByTld reads overlay rows not stale CMS", () => {
    const overlay = applyRetailOverlay(
      [
        {
          id: ".com",
          visible: true,
          order: 0,
          tld: ".com",
          register: 9.99,
          renew: 19.99,
          transfer: 9.99,
          categories: ["popular" as const],
          note: "",
        },
      ],
      new Map([[".com", { register: 9.99, renew: 17.99, transfer: 12.99 }]]),
    );
    assert.equal(priceByTld(overlay, ".com")?.transfer, 12.99);
  });

  it("stripBrandTitleSuffix avoids HostingBeyond | HostingBeyond", () => {
    assert.equal(
      stripBrandTitleSuffix(
        "Domain Name Search — Check Availability & Register | HostingBeyond",
      ),
      "Domain Name Search — Check Availability & Register",
    );
  });
});
