import { scorePageSeo } from "@/lib/orbit/page-seo-score";
import type { StoredPageSeo } from "@/lib/orbit/page-seo";

describe("scorePageSeo", () => {
  it("scores a complete entry highly", () => {
    const seo: StoredPageSeo = {
      metaTitle: "Domain Name Search — Check Availability | HostingBeyond",
      metaDescription:
        "Search domains on HostingBeyond with transparent renewal pricing, free WHOIS privacy on eligible TLDs, and instant registration.",
      keywords: "domain search, buy domain, register domain, whois privacy",
      ogTitle: "Domain Name Search | HostingBeyond",
      ogDescription:
        "Find and register domains with clear pricing and expert support.",
      ogImage: "/images/domains/hero.jpg",
      twitterTitle: "Domain Search | HostingBeyond",
      twitterDescription: "Register domains with transparent pricing.",
    };
    const result = scorePageSeo(seo, "/domain-name-search");
    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.grade).toBe("A");
  });

  it("scores empty SEO low", () => {
    const result = scorePageSeo({}, "/pricing");
    expect(result.score).toBeLessThan(30);
  });
});
