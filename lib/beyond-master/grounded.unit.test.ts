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
    assert.match(reply.text, /bakery.com/);
    assert.match(reply.text, /available/);
    assert.equal(reply.domains[0]?.domain, "bakery.com");
  });

  it("greets short hellos instead of dumping product lists", async () => {
    const reply = await groundedBeyondMasterReply("helo");
    assert.match(reply.text, /Hi! Tell me what you'd like to get started/);
    assert.equal(reply.text.includes("/web-hosting"), false);
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

  it("answers DNS from customer help, not a provider notice", async () => {
    const reply = await groundedBeyondMasterReply("Help me with DNS");
    assert.match(reply.text, /account\/my-domains/);
    assert.equal(
      reply.text.includes("not connected to a language model"),
      false,
    );
  });
});
