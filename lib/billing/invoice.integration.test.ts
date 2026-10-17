import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Prisma } from "@prisma/client";

import { issueInvoiceForDomainOrder } from "@/lib/billing/invoice-builder";
import { prisma } from "@/lib/prisma";
import {
  assertIntegrationDatabaseTarget,
  isIntegrationDatabaseConfigured,
} from "@/lib/test/integration-gate";

describe(
  "invoice issuance (integration PostgreSQL)",
  { skip: !isIntegrationDatabaseConfigured(), concurrency: 1 },
  () => {
    const tag = `inv-${Date.now()}`;
    let userId = "";
    let orderId = "";

    it("prepares user and registered domain order", async () => {
      assertIntegrationDatabaseTarget();
      const user = await prisma.customerUser.upsert({
        where: { email: `${tag}@hostingbeyond.local` },
        create: { email: `${tag}@hostingbeyond.local` },
        update: {},
      });
      userId = user.id;
      const order = await prisma.domainOrder.create({
        data: {
          publicId: `DOM-${tag}`,
          userId,
          orderType: "register",
          domain: `${tag}.com`,
          tld: "com",
          status: "REGISTERED",
          retailPrice: new Prisma.Decimal(113),
          discount: new Prisma.Decimal(0),
          tax: null,
          total: new Prisma.Decimal(113),
          currency: "NPR",
          completedAt: new Date(),
        },
      });
      orderId = order.id;
    });

    it("concurrent issuance for the same order yields one invoice", async () => {
      const concurrentTag = `${tag}-race`;
      const raceOrder = await prisma.domainOrder.create({
        data: {
          publicId: `DOM-${concurrentTag}`,
          userId,
          orderType: "register",
          domain: `${concurrentTag}.com`,
          tld: "com",
          status: "REGISTERED",
          retailPrice: new Prisma.Decimal(50),
          discount: new Prisma.Decimal(0),
          tax: null,
          total: new Prisma.Decimal(50),
          currency: "USD",
          completedAt: new Date(),
        },
      });
      const results = await Promise.all([
        issueInvoiceForDomainOrder(raceOrder.id),
        issueInvoiceForDomainOrder(raceOrder.id),
        issueInvoiceForDomainOrder(raceOrder.id),
        issueInvoiceForDomainOrder(raceOrder.id),
      ]);
      for (const result of results) {
        assert.equal(result.ok, true);
      }
      const invoiceIds = results.map((r) => (r.ok ? r.invoiceId : ""));
      assert.ok(invoiceIds.every((id) => id === invoiceIds[0]));
      const count = await prisma.invoice.count({
        where: { domainOrderId: raceOrder.id },
      });
      assert.equal(count, 1);
      await prisma.invoiceLineItem.deleteMany({
        where: { invoice: { domainOrderId: raceOrder.id } },
      });
      await prisma.invoice.deleteMany({
        where: { domainOrderId: raceOrder.id },
      });
      await prisma.domainOrder.delete({ where: { id: raceOrder.id } });
    });

    it("issues one invoice idempotently", async () => {
      process.env.INVOICE_VAT_INCLUSIVE_PERCENT = "13";
      const first = await issueInvoiceForDomainOrder(orderId);
      assert.equal(first.ok, true);
      if (!first.ok) return;
      assert.equal(first.created, true);
      const second = await issueInvoiceForDomainOrder(orderId);
      assert.equal(second.ok, true);
      if (!second.ok) return;
      assert.equal(second.created, false);
      assert.equal(second.invoiceId, first.invoiceId);
      const invoice = await prisma.invoice.findUniqueOrThrow({
        where: { id: first.invoiceId },
      });
      assert.equal(invoice.total.toFixed(2), "113.00");
      assert.equal(invoice.tax.toFixed(2), "13.00");
      assert.equal(invoice.subtotal.toFixed(2), "100.00");
    });

    it("rejects cross-customer invoice read", async () => {
      const invoice = await prisma.invoice.findFirstOrThrow({
        where: { domainOrderId: orderId },
      });
      const other = await prisma.customerUser.create({
        data: { email: `${tag}-b@hostingbeyond.local` },
      });
      const found = await prisma.invoice.findFirst({
        where: { publicId: invoice.publicId, userId: other.id },
      });
      assert.equal(found, null);
      await prisma.customerUser.delete({ where: { id: other.id } });
    });

    it("cleans up test rows", async () => {
      await prisma.invoiceLineItem.deleteMany({
        where: { invoice: { userId } },
      });
      await prisma.invoice.deleteMany({ where: { userId } });
      await prisma.domainOrder.deleteMany({ where: { userId } });
      await prisma.customerUser.delete({ where: { id: userId } });
      delete process.env.INVOICE_VAT_INCLUSIVE_PERCENT;
    });
  },
);
