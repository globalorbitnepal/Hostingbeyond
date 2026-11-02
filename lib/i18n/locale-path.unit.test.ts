import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  localeCanonicalRedirectPath,
  localePrefixRewritePath,
  localizePublicPath,
  stripLocalePrefixFromPath,
  websiteLanguageFromUrlSegment,
  websiteLanguageToUrlSegment,
} from "@/lib/i18n/locale-path";
import { WEBSITE_LANGUAGES } from "@/lib/i18n/website-languages";

describe("locale URL paths", () => {
  it("uses the flag country code as the SEO segment", () => {
    assert.equal(websiteLanguageToUrlSegment("en"), null);
    assert.equal(websiteLanguageToUrlSegment("hi"), "in");
    assert.equal(websiteLanguageToUrlSegment("ne"), "np");
    assert.equal(websiteLanguageToUrlSegment("bn"), "bd");
    assert.equal(websiteLanguageToUrlSegment("de"), "de");
    assert.equal(websiteLanguageToUrlSegment("ja"), "jp");
    assert.equal(websiteLanguageToUrlSegment("ko"), "kr");
    assert.equal(websiteLanguageToUrlSegment("zh-CN"), "cn");
    assert.equal(websiteLanguageToUrlSegment("id"), "id");
    assert.equal(websiteLanguageToUrlSegment("pt"), "pt");
  });

  it("maps every non-English language to its flag country in the URL", () => {
    for (const row of WEBSITE_LANGUAGES) {
      if (row.isDefault) {
        assert.equal(websiteLanguageToUrlSegment(row.code), null);
        continue;
      }
      const segment = websiteLanguageToUrlSegment(row.code);
      assert.equal(segment, row.flagCountryCode.toLowerCase(), row.code);
      assert.equal(websiteLanguageFromUrlSegment(segment!), row.code);
      assert.equal(localizePublicPath("/", row.code), `/${segment}`);
      assert.equal(
        localizePublicPath("/pricing", row.code),
        `/${segment}/pricing`,
      );
    }
  });

  it("parses and strips country prefixes", () => {
    assert.deepEqual(stripLocalePrefixFromPath("/de/pricing"), {
      language: "de",
      pathname: "/pricing",
      hadPrefix: true,
      prefixSegment: "de",
    });
    assert.deepEqual(stripLocalePrefixFromPath("/in"), {
      language: "hi",
      pathname: "/",
      hadPrefix: true,
      prefixSegment: "in",
    });
    assert.deepEqual(stripLocalePrefixFromPath("/np/contact"), {
      language: "ne",
      pathname: "/contact",
      hadPrefix: true,
      prefixSegment: "np",
    });
    assert.deepEqual(stripLocalePrefixFromPath("/bd"), {
      language: "bn",
      pathname: "/",
      hadPrefix: true,
      prefixSegment: "bd",
    });
    assert.deepEqual(stripLocalePrefixFromPath("/cn/contact"), {
      language: "zh-CN",
      pathname: "/contact",
      hadPrefix: true,
      prefixSegment: "cn",
    });
    assert.deepEqual(stripLocalePrefixFromPath("/pricing"), {
      language: "en",
      pathname: "/pricing",
      hadPrefix: false,
      prefixSegment: null,
    });
  });

  it("still parses legacy language prefixes so they can redirect", () => {
    assert.equal(websiteLanguageFromUrlSegment("hi"), "hi");
    assert.equal(websiteLanguageFromUrlSegment("ne"), "ne");
    assert.equal(websiteLanguageFromUrlSegment("bn"), "bn");
    assert.equal(websiteLanguageFromUrlSegment("zh"), "zh-CN");
    assert.equal(localeCanonicalRedirectPath("/hi"), "/in");
    assert.equal(localeCanonicalRedirectPath("/hi/pricing"), "/in/pricing");
    assert.equal(localeCanonicalRedirectPath("/ne"), "/np");
    assert.equal(localeCanonicalRedirectPath("/bn/contact"), "/bd/contact");
    assert.equal(localeCanonicalRedirectPath("/ja"), "/jp");
    assert.equal(localeCanonicalRedirectPath("/ko"), "/kr");
    assert.equal(localeCanonicalRedirectPath("/zh"), "/cn");
    assert.equal(localeCanonicalRedirectPath("/in"), null);
    assert.equal(localeCanonicalRedirectPath("/np/pricing"), null);
    assert.equal(localeCanonicalRedirectPath("/de"), null);
  });

  it("localizes paths onto country prefixes", () => {
    assert.equal(localizePublicPath("/contact", "hi"), "/in/contact");
    assert.equal(localizePublicPath("/ne/contact", "en"), "/contact");
    assert.equal(localizePublicPath("/hi", "bn"), "/bd");
    assert.equal(localizePublicPath("/", "fr"), "/fr");
  });

  it("rewrites prefixed SEO paths and never treats unprefixed as rewrite", () => {
    assert.equal(localePrefixRewritePath("/bd"), "/");
    assert.equal(localePrefixRewritePath("/in/pricing"), "/pricing");
    assert.equal(localePrefixRewritePath("/pricing"), null);
    assert.equal(localePrefixRewritePath("/"), null);
  });

  it("rewrites /en to the unprefixed English storefront", () => {
    assert.equal(websiteLanguageFromUrlSegment("en"), "en");
    assert.deepEqual(stripLocalePrefixFromPath("/en"), {
      language: "en",
      pathname: "/",
      hadPrefix: true,
      prefixSegment: "en",
    });
    assert.equal(localeCanonicalRedirectPath("/en"), "/");
    assert.equal(localeCanonicalRedirectPath("/en/pricing"), "/pricing");
    assert.equal(localePrefixRewritePath("/en"), "/");
    assert.equal(localePrefixRewritePath("/en/pricing"), "/pricing");
  });
});
