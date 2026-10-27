import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { defaultHostingPageContent } from "@/lib/orbit/hosting-page-content";

import { polishWebHostingPageContent } from "./web-hosting-page-polish";

describe("polishWebHostingPageContent", () => {
  it("keeps Orbit-edited FAQ and feature copy", () => {
    const page = defaultHostingPageContent();
    page.features = page.features.map((f) =>
      f.id === "domain"
        ? {
            ...f,
            title: "Orbit domain title",
            description: "Orbit domain body",
          }
        : f,
    );
    page.faqs = page.faqs.map((faq) =>
      faq.id === "refund" ? { ...faq, answer: "Orbit refund answer" } : faq,
    );

    const polished = polishWebHostingPageContent(page);
    const domain = polished.features.find((f) => f.id === "domain");
    const refund = polished.faqs.find((faq) => faq.id === "refund");
    assert.equal(domain?.title, "Orbit domain title");
    assert.equal(domain?.description, "Orbit domain body");
    assert.equal(refund?.answer, "Orbit refund answer");
  });
});
