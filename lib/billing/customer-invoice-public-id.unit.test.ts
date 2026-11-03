import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseCustomerInvoicePublicId } from "@/lib/billing/customer-invoice-public-id";

/** Mirrors `newPublicId()` in lib/billing/invoice-builder.ts. */
function generatedInvoicePublicId(): string {
  return `inv_${crypto.randomUUID().replace(/-/g, "")}`;
}

describe("parseCustomerInvoicePublicId", () => {
  it("accepts ids produced by the invoice builder generator", () => {
    for (let i = 0; i < 50; i += 1) {
      const generated = generatedInvoicePublicId();
      assert.equal(
        parseCustomerInvoicePublicId(generated),
        generated,
        "generated invoice publicId must survive the request guard",
      );
    }
  });

  it("accepts hyphenated ids", () => {
    assert.equal(parseCustomerInvoicePublicId("INV-ABC123"), "INV-ABC123");
  });

  it("trims surrounding whitespace", () => {
    const generated = generatedInvoicePublicId();
    assert.equal(parseCustomerInvoicePublicId(`  ${generated}  `), generated);
  });

  it("rejects path-like or empty values", () => {
    assert.equal(parseCustomerInvoicePublicId(""), null);
    assert.equal(parseCustomerInvoicePublicId("   "), null);
    assert.equal(parseCustomerInvoicePublicId(null), null);
    assert.equal(parseCustomerInvoicePublicId(undefined), null);
    assert.equal(parseCustomerInvoicePublicId("../secrets"), null);
    assert.equal(parseCustomerInvoicePublicId("a".repeat(80)), null);
  });

  it("rejects separators and injection characters", () => {
    assert.equal(parseCustomerInvoicePublicId("inv_../../etc/passwd"), null);
    assert.equal(parseCustomerInvoicePublicId("inv_abc%2Fdef"), null);
    assert.equal(parseCustomerInvoicePublicId("inv_abc def"), null);
    assert.equal(parseCustomerInvoicePublicId("inv_abc\n"), null);
    assert.equal(parseCustomerInvoicePublicId("<script>alert(1)"), null);
  });
});
