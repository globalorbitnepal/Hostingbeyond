import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  dnaHostLabel,
  dnaZonePayload,
  parseDnaZoneRecords,
} from "@/lib/domains/providers/dna-zones";

describe("DNA zone parsing", () => {
  it("maps full names to host labels and the apex to @", () => {
    assert.equal(dnaHostLabel("www.example.com.", "example.com"), "www");
    assert.equal(dnaHostLabel("example.com.", "example.com"), "@");
    assert.equal(
      dnaHostLabel("mail.eu.example.com.", "example.com"),
      "mail.eu",
    );
  });

  it("flattens record sets into one row per value and skips SOA/NS", () => {
    const rows = parseDnaZoneRecords(
      [
        {
          name: "example.com.",
          type: "SOA",
          ttl: 3600,
          records: [
            { content: "ns1.example.com. hostmaster", disabled: false },
          ],
        },
        {
          name: "example.com.",
          type: "A",
          ttl: 300,
          records: [{ content: "203.0.113.10", disabled: false }],
        },
        {
          name: "www.example.com.",
          type: "A",
          ttl: 3600,
          records: [
            { content: "203.0.113.11", disabled: false },
            { content: "203.0.113.12", disabled: true },
          ],
        },
        {
          name: "example.com.",
          type: "MX",
          ttl: 3600,
          records: [{ content: "10 mail.example.com.", disabled: false }],
        },
      ],
      "example.com",
    );
    assert.equal(rows.length, 3);
    assert.deepEqual(
      rows.map((row) => `${row.type}:${row.host}:${row.value}`),
      ["A:@:203.0.113.10", "A:www:203.0.113.11", "MX:@:mail.example.com"],
    );
    const mx = parseDnaZoneRecords(
      [
        {
          name: "example.com.",
          type: "MX",
          ttl: 3600,
          records: [{ content: "20 mail.example.com." }],
        },
      ],
      "example.com",
    )[0];
    assert.equal(mx?.value, "mail.example.com");
    assert.equal(mx?.distance, 20);
  });

  it("builds the apex payload as an empty name", () => {
    const payload = dnaZonePayload("Example.com", {
      type: "a",
      host: "@",
      value: "203.0.113.10",
      ttl: 3600,
    });
    assert.equal(payload.zoneStruct.name, "");
    assert.equal(payload.zoneStruct.type, "A");
    assert.deepEqual(payload.zoneStruct.contents, ["203.0.113.10"]);
  });
});
