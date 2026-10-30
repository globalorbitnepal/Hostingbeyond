import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseRdapDomain } from "@/lib/domains/public-whois";

const SAMPLE = {
  ldhName: "XTREND.COM",
  status: ["client delete prohibited", "client transfer prohibited"],
  events: [
    { eventAction: "registration", eventDate: "1998-02-02T05:00:00Z" },
    { eventAction: "expiration", eventDate: "2031-02-01T05:00:00Z" },
    { eventAction: "last changed", eventDate: "2026-02-02T12:00:00Z" },
  ],
  nameservers: [
    { ldhName: "CODY.NS.CLOUDFLARE.COM" },
    { ldhName: "joselyn.ns.cloudflare.com" },
    { ldhName: "CODY.NS.CLOUDFLARE.COM" },
  ],
  entities: [
    {
      roles: ["registrar"],
      vcardArray: [
        "vcard",
        [
          ["fn", {}, "text", "GoDaddy.com, LLC"],
          ["url", {}, "uri", "https://www.godaddy.com"],
        ],
      ],
      publicIds: [{ type: "IANA Registrar ID", identifier: "146" }],
      links: [{ href: "https://www.godaddy.com", rel: "about" }],
    },
  ],
  links: [{ href: "https://rdap.verisign.com/com/v1/domain/xtrend.com" }],
};

describe("parseRdapDomain", () => {
  it("keeps registration details and drops third-party links", () => {
    const record = parseRdapDomain(SAMPLE, "xtrend.com");
    assert.equal(record.domain, "xtrend.com");
    assert.equal(record.registeredOn, "1998-02-02");
    assert.equal(record.expiresOn, "2031-02-01");
    assert.equal(record.updatedOn, "2026-02-02");
    assert.equal(record.registrar, "GoDaddy.com, LLC");
    assert.equal(record.registrarIanaId, "146");
    assert.deepEqual(record.nameServers, [
      "cody.ns.cloudflare.com",
      "joselyn.ns.cloudflare.com",
    ]);
    assert.ok(record.statuses.includes("client delete prohibited"));
    assert.equal(JSON.stringify(record).includes("http"), false);
    assert.equal(JSON.stringify(record).includes("godaddy.com/"), false);
  });
});
