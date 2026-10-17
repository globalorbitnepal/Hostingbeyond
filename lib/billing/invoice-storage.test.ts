import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, describe, it } from "node:test";

import {
  invoicePdfStorageKey,
  writeInvoicePdf,
} from "@/lib/billing/invoice-storage";

describe("invoicePdfStorageKey", () => {
  it("rejects empty sanitized ids", () => {
    assert.throws(() => invoicePdfStorageKey("///"), /invalid_invoice_id/);
  });

  it("strips unsafe characters", () => {
    assert.equal(invoicePdfStorageKey("clx_abc-123"), "clx_abc-123.pdf");
  });
});

describe("writeInvoicePdf", () => {
  let tempDir = "";

  after(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
      delete process.env.INVOICE_STORAGE_DIR;
    }
  });

  it("returns SHA-256 of on-disk bytes when the file already exists (EEXIST)", async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "hb-invoice-storage-"));
    process.env.INVOICE_STORAGE_DIR = tempDir;
    const key = invoicePdfStorageKey("concurrent_pdf_test");
    const firstBytes = Buffer.from("%PDF-1.4 first-writer-wins");
    const secondBytes = Buffer.from("%PDF-1.4 should-not-replace");
    const first = await writeInvoicePdf(key, firstBytes);
    const second = await writeInvoicePdf(key, secondBytes);
    const expected = createHash("sha256").update(firstBytes).digest("hex");
    assert.equal(first.sha256, expected);
    assert.equal(second.sha256, expected);
    assert.notEqual(
      second.sha256,
      createHash("sha256").update(secondBytes).digest("hex"),
    );
  });
});
