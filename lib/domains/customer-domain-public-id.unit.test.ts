import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { publicId } from "@/lib/domains/transfer-service";
import {
  parseCustomerDomainOrderPublicId,
  parseCustomerTransferPublicId,
} from "@/lib/domains/customer-domain-public-id";

describe("parseCustomerDomainOrderPublicId", () => {
  it("accepts ids from the server generator", () => {
    for (let i = 0; i < 20; i++) {
      const generated = publicId("DOM");
      assert.equal(parseCustomerDomainOrderPublicId(generated), generated);
    }
  });

  it("rejects malformed and hostile input", () => {
    assert.equal(parseCustomerDomainOrderPublicId(""), null);
    assert.equal(parseCustomerDomainOrderPublicId("DOM-AB12"), null);
    assert.equal(parseCustomerDomainOrderPublicId("DOM-ABCDEFG"), null);
    assert.equal(parseCustomerDomainOrderPublicId("dom-abc123"), null);
    assert.equal(parseCustomerDomainOrderPublicId("TRF-ABC123"), null);
    assert.equal(parseCustomerDomainOrderPublicId("../DOM-ABC123"), null);
    assert.equal(parseCustomerDomainOrderPublicId("DOM-ABC123\n"), null);
    /** Surrounding whitespace is trimmed, matching the invoice id guard. */
    assert.equal(
      parseCustomerDomainOrderPublicId("  DOM-ABC123  "),
      "DOM-ABC123",
    );
  });
});

describe("parseCustomerTransferPublicId", () => {
  it("accepts ids from the server generator", () => {
    const generated = publicId("TRF");
    assert.equal(parseCustomerTransferPublicId(generated), generated);
  });

  it("rejects domain order ids", () => {
    assert.equal(parseCustomerTransferPublicId(publicId("DOM")), null);
  });
});
