import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Prisma } from "@prisma/client";

import { buildMinimalInvoicePdf } from "@/lib/billing/invoice-pdf";

describe("buildMinimalInvoicePdf", () => {
  it("returns a PDF header and includes invoice number", () => {
    const buf = buildMinimalInvoicePdf({
      invoice: {
        invoiceNumber: "INV-2026-000001",
        currency: "USD",
        subtotal: new Prisma.Decimal(100),
        discount: new Prisma.Decimal(0),
        tax: new Prisma.Decimal(0),
        total: new Prisma.Decimal(100),
        taxTreatment: "NONE",
        taxRatePercent: null,
        issuedAt: new Date("2026-01-15T00:00:00.000Z"),
      },
      lineItems: [
        {
          description: "Domain registration: example.com",
          quantity: new Prisma.Decimal(1),
          unitAmount: new Prisma.Decimal(100),
          lineTotal: new Prisma.Decimal(100),
        },
      ],
    });
    const text = buf.toString("utf8", 0, 20);
    assert.equal(text.startsWith("%PDF-1.4"), true);
    assert.match(buf.toString("utf8"), /INV-2026-000001/);
  });
});
