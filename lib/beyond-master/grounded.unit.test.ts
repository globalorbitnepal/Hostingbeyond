import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  extractDomainQuery,
  wantsDomainHelp,
} from "@/lib/beyond-master/domain-intent";
import { groundedBeyondMasterReply } from "@/lib/beyond-master/grounded";

describe("beyond master domain intent", () => {
  it("pulls a fqdn and a bare name from domain questions", () => {
    assert.equal(extractDomainQuery("is bakery.com available?"), "bakery.com");
    assert.equal(
      extractDomainQuery("find a domain called orbitshop"),
      "orbitshop",
    );
    assert.equal(wantsDomainHelp("Help me find and register a domain."), true);
    assert.equal(
      extractDomainQuery("Help me find and register a domain."),
      null,
    );
  });

  it("finds a domain name inside a Hindi question", () => {
    assert.equal(extractDomainQuery("kya bakery.com उपलब्ध है"), "bakery.com");
  });
});

describe("beyond master grounded replies", () => {
  it("asks for a name when domain help has no query", async () => {
    const reply = await groundedBeyondMasterReply(
      "Help me find and register a domain.",
      async () => {
        throw new Error("search should not run");
      },
    );
    assert.match(reply.text, /Tell me the name/);
    assert.equal(reply.domains.length, 0);
    assert.equal(reply.language, "en");
  });

  it("formats live domain rows from search", async () => {
    const reply = await groundedBeyondMasterReply(
      "check bakery.com",
      async () => ({
        query: "bakery.com",
        error: null,
        results: [
          {
            domain: "bakery.com",
            status: "available",
            register: 9.99,
            currency: "USD",
            href: "/domain-name-search?q=bakery.com",
          },
        ],
      }),
    );
    assert.match(reply.text, /bakery\.com/);
    assert.match(reply.text, /available/);
    assert.equal(reply.domains[0]?.domain, "bakery.com");
  });

  it("formats a Hindi domain answer in Hindi", async () => {
    const reply = await groundedBeyondMasterReply(
      "bakery.com उपलब्ध है?",
      async () => ({
        query: "bakery.com",
        error: null,
        results: [
          {
            domain: "bakery.com",
            status: "taken",
            register: null,
            currency: "USD",
            href: "/domain-name-search?q=bakery.com",
          },
        ],
      }),
    );
    assert.equal(reply.language, "hi");
    assert.match(reply.text, /उपलब्ध/);
    assert.match(reply.text, /पहले से बुक/);
  });

  it("greets short hellos in each language", async () => {
    const english = await groundedBeyondMasterReply("helo");
    assert.match(english.text, /Hi!/);

    const hindi = await groundedBeyondMasterReply("नमस्ते");
    assert.match(hindi.text, /नमस्ते!/);

    const nepali = await groundedBeyondMasterReply("नमस्कार");
    assert.match(nepali.text, /नमस्ते!/);
    assert.match(nepali.text, /डोमेन/);
  });

  it("points bulk search to the bulk page instead of the generic line", async () => {
    const reply = await groundedBeyondMasterReply(
      "cal u help mein bulk search",
    );
    assert.match(reply.text, /bulk-domain-search/);
    assert.equal(reply.text.includes("DNS, SSL, and billing"), false);
  });

  it("uses the signed-in first name in a greeting", async () => {
    const reply = await groundedBeyondMasterReply(
      "helo",
      async () => {
        throw new Error("no search");
      },
      "Aarav",
    );
    assert.match(reply.text, /^Hi Aarav!/);
  });

  it("answers each topic in the customer language", async () => {
    const dns = await groundedBeyondMasterReply("DNS कैसे बदलूँ?");
    assert.equal(dns.language, "hi");
    assert.match(dns.text, /account\/my-domains/);
    assert.match(dns.text, /3600/);

    const email = await groundedBeyondMasterReply(
      "व्यवसायिक इमेल कसरी सेटअप गर्ने?",
    );
    assert.equal(email.language, "ne");
    assert.match(email.text, /business-email/);

    const ssl = await groundedBeyondMasterReply("Do you include SSL?");
    assert.equal(ssl.language, "en");
    assert.match(ssl.text, /^SSL is included/);
  });

  it("gives different answers for different topics", async () => {
    const dns = await groundedBeyondMasterReply("how do I add an MX record");
    const billing = await groundedBeyondMasterReply("where is my invoice");
    const support = await groundedBeyondMasterReply("I need technical support");
    assert.notEqual(dns.text, billing.text);
    assert.notEqual(billing.text, support.text);
    assert.match(billing.text, /Invoices/);
    assert.match(support.text, /ticket/i);
  });
});
