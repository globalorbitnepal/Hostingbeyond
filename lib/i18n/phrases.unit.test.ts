import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { convertUsdToLocal } from "@/config/pricing";
import { languagesForCountry } from "@/config/geo";
import { translatePhrase } from "@/lib/i18n/phrases";

describe("Hindi phrases and display currency", () => {
  it("keeps English unchanged and translates known Hindi phrases", () => {
    assert.equal(translatePhrase("en", "Web Hosting"), "Web Hosting");
    assert.equal(translatePhrase("hi", "Web Hosting"), "वेब होस्टिंग");
    assert.equal(
      translatePhrase("hi", "Unknown label xyz"),
      "Unknown label xyz",
    );
  });

  it("always offers English then Hindi in the header language list", () => {
    const us = languagesForCountry({ languages: ["en"] });
    assert.deepEqual(us.slice(0, 2), ["en", "hi"]);
    const inLangs = languagesForCountry({ languages: ["hi", "en"] });
    assert.equal(inLangs[0], "en");
    assert.equal(inLangs[1], "hi");
  });

  it("converts catalog USD to INR without changing the USD book", () => {
    assert.equal(convertUsdToLocal(9.99, "USD"), 9.99);
    assert.equal(convertUsdToLocal(10, "INR"), 950);
  });
});
