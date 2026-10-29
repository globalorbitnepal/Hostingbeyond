import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  localePrefixRewritePath,
  localizePublicPath,
  stripLocalePrefixFromPath,
  websiteLanguageFromUrlSegment,
  websiteLanguageToUrlSegment,
} from "@/lib/i18n/locale-path";

describe("locale URL paths", () => {
  it("maps languages to SEO segments (English unprefixed)", () => {
    assert.equal(websiteLanguageToUrlSegment("en"), null);
    assert.equal(websiteLanguageToUrlSegment("de"), "de");
    assert.equal(websiteLanguageToUrlSegment("zh-CN"), "zh");
  });

  it("parses and strips locale prefixes", () => {
    assert.deepEqual(stripLocalePrefixFromPath("/de/pricing"), {
      language: "de",
      pathname: "/pricing",
      hadPrefix: true,
    });
    assert.deepEqual(stripLocalePrefixFromPath("/zh/contact"), {
      language: "zh-CN",
      pathname: "/contact",
      hadPrefix: true,
    });
    assert.deepEqual(stripLocalePrefixFromPath("/pricing"), {
      language: "en",
      pathname: "/pricing",
      hadPrefix: false,
    });
  });

  it("localizes paths for non-English", () => {
    assert.equal(localizePublicPath("/contact", "de"), "/de/contact");
    assert.equal(localizePublicPath("/de/contact", "en"), "/contact");
    assert.equal(localizePublicPath("/", "fr"), "/fr");
  });

  it("rewrites prefixed SEO paths and never treats unprefixed as rewrite", () => {
    assert.equal(localePrefixRewritePath("/bn"), "/");
    assert.equal(localePrefixRewritePath("/de/pricing"), "/pricing");
    assert.equal(localePrefixRewritePath("/pricing"), null);
    assert.equal(localePrefixRewritePath("/"), null);
  });

  it("round-trips known segments", () => {
    for (const segment of ["de", "fr", "hi", "zh"] as const) {
      const lang = websiteLanguageFromUrlSegment(segment);
      assert.ok(lang);
      assert.equal(websiteLanguageToUrlSegment(lang), segment);
    }
  });
});
