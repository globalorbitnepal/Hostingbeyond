import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isValidNameserverHost,
  normalizeNameserverList,
} from "@/lib/domains/nameserver-host";

describe("nameserver host validation", () => {
  it("accepts typical registrar nameservers", () => {
    assert.equal(isValidNameserverHost("ns1.example.com"), true);
    const list = normalizeNameserverList([
      "NS1.Example.com",
      "ns2.example.com",
    ]);
    assert.equal(list.ok, true);
    if (list.ok) {
      assert.deepEqual(list.nameservers, [
        "ns1.example.com",
        "ns2.example.com",
      ]);
    }
  });

  it("rejects IPs, URLs, injection, and single-label hosts", () => {
    assert.equal(isValidNameserverHost("127.0.0.1"), false);
    assert.equal(isValidNameserverHost("localhost"), false);
    assert.equal(isValidNameserverHost("http://ns1.example.com"), false);
    assert.equal(isValidNameserverHost("ns1.example.com\nns2.evil"), false);
    assert.equal(normalizeNameserverList(["ns1.example.com"]).ok, false);
  });
});
