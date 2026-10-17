import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatCreditNoteNumber,
  formatInvoiceNumber,
} from "@/lib/billing/invoice-number";

describe("invoice number formatting", () => {
  it("pads invoice sequence", () => {
    assert.equal(formatInvoiceNumber(2026, 42), "INV-2026-000042");
  });

  it("pads credit note sequence", () => {
    assert.equal(formatCreditNoteNumber(2026, 3), "CN-2026-000003");
  });
});
