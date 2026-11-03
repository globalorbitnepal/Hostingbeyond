import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  dnsRecordSummary,
  normalizeDnsHost,
  normalizeDnsPriority,
  normalizeDnsTtl,
  parseNameSiloDnsRecords,
  validateDnsRecordInput,
  validateDnsValue,
} from "@/lib/domains/providers/namesilo-dns";

describe("DNS host normalisation", () => {
  it("accepts apex, subdomain and wildcard hosts", () => {
    assert.deepEqual(normalizeDnsHost("@", "example.com"), {
      ok: true,
      host: "@",
    });
    assert.deepEqual(normalizeDnsHost("www", "example.com"), {
      ok: true,
      host: "www",
    });
    assert.deepEqual(normalizeDnsHost("*.app", "example.com"), {
      ok: true,
      host: "*.app",
    });
    assert.deepEqual(normalizeDnsHost("shop.eu", "example.com"), {
      ok: true,
      host: "shop.eu",
    });
  });

  it("strips the zone when the customer pastes a full name", () => {
    assert.deepEqual(normalizeDnsHost("www.example.com", "example.com"), {
      ok: true,
      host: "www",
    });
    assert.deepEqual(normalizeDnsHost("example.com", "example.com"), {
      ok: true,
      host: "@",
    });
  });

  it("rejects URLs, paths and empty hosts", () => {
    for (const bad of ["", "  ", "https://example.com", "www/slash", "a b"]) {
      assert.equal(normalizeDnsHost(bad, "example.com").ok, false);
    }
  });
});

describe("DNS record value validation", () => {
  it("validates addresses and hostnames per type", () => {
    assert.equal(validateDnsValue("A", "203.0.113.10").ok, true);
    assert.equal(validateDnsValue("A", "999.1.1.1").ok, false);
    assert.equal(validateDnsValue("AAAA", "2001:db8::1").ok, true);
    assert.equal(validateDnsValue("CNAME", "target.example.net").ok, true);
    assert.equal(validateDnsValue("CNAME", "not a host").ok, false);
    assert.equal(validateDnsValue("MX", "mail.example.com").ok, true);
    assert.equal(validateDnsValue("SRV", "10 5 443 app.example.com").ok, true);
    assert.equal(validateDnsValue("SRV", "broken").ok, false);
  });

  it("keeps TXT values verbatim", () => {
    const txt = "v=spf1 include:_spf.example.com ~all";
    assert.deepEqual(validateDnsValue("TXT", txt), { ok: true, value: txt });
  });
});

describe("DNS record input", () => {
  it("clamps TTL and MX priority", () => {
    assert.equal(normalizeDnsTtl(10), 300);
    assert.equal(normalizeDnsTtl(999999), 86400);
    assert.equal(normalizeDnsPriority("A", 5), 0);
    assert.equal(normalizeDnsPriority("MX", 20), 20);
    assert.equal(normalizeDnsPriority("MX", "abc"), 10);
  });

  it("builds a registrar payload", () => {
    const result = validateDnsRecordInput(
      { type: "a", host: "www", value: "198.51.100.7", ttl: 1800 },
      "example.com",
    );
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.deepEqual(result.record, {
        type: "A",
        host: "www",
        value: "198.51.100.7",
        ttl: 1800,
        distance: 0,
      });
    }
  });

  it("rejects unsupported types", () => {
    const result = validateDnsRecordInput(
      { type: "PTR", host: "@", value: "x" },
      "example.com",
    );
    assert.equal(result.ok, false);
  });
});

describe("NameSilo reply parsing", () => {
  it("normalises a record list", () => {
    const records = parseNameSiloDnsRecords({
      resource_record: [
        {
          record_id: "abc",
          type: "a",
          host: "WWW",
          value: "1.2.3.4",
          ttl: "3600",
          distance: "0",
        },
        {
          record_id: "def",
          type: "MX",
          host: "",
          value: "mail.example.com",
          ttl: "60",
          distance: "5",
        },
      ],
    });
    assert.equal(records.length, 2);
    const a = records.find((row) => row.type === "A");
    const mx = records.find((row) => row.type === "MX");
    assert.deepEqual(a, {
      recordId: "abc",
      type: "A",
      host: "www",
      value: "1.2.3.4",
      ttl: 3600,
      distance: 0,
    });
    assert.equal(mx?.host, "@");
    assert.equal(mx?.ttl, 300);
    assert.equal(mx?.distance, 5);
  });

  it("handles a single object reply and skips junk", () => {
    const records = parseNameSiloDnsRecords({
      resource_record: { record_id: "1", type: "TXT", host: "@", value: "x" },
    });
    assert.equal(records.length, 1);
    assert.equal(
      parseNameSiloDnsRecords({ resource_record: [null, 5] }).length,
      0,
    );
  });
});

describe("DNS record summary", () => {
  it("shows priority only for MX and SRV", () => {
    assert.equal(
      dnsRecordSummary({
        recordId: "1",
        type: "MX",
        host: "@",
        value: "mail.example.com",
        ttl: 3600,
        distance: 10,
      }),
      "10 ·  → mail.example.com",
    );
    assert.equal(
      dnsRecordSummary({
        recordId: "2",
        type: "A",
        host: "www",
        value: "1.2.3.4",
        ttl: 3600,
        distance: 0,
      }),
      "www → 1.2.3.4",
    );
  });
});
