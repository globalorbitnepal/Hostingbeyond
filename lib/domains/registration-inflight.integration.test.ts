import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { describe, it, after } from "node:test";

import { Prisma } from "@prisma/client";

import { inflightDomainOrderFilter } from "@/lib/domains/domain-order-inflight";
import { isIntegrationDatabaseConfigured } from "@/lib/test/integration-gate";
import { prisma } from "@/lib/prisma";

describe(
  "registration inflight (case + DB unique index)",
  { skip: !isIntegrationDatabaseConfigured(), concurrency: 1 },
  () => {
    const tag = `reg-inflight-${Date.now()}`;
    const mixedCaseDomain = `Mixed-${tag}.COM`;
    const lowerDomain = mixedCaseDomain.toLowerCase();
    let userId: string;
    let orderId: string;

    after(async () => {
      if (orderId) {
        await prisma.domainOrder.deleteMany({ where: { id: orderId } });
      }
      if (userId) {
        await prisma.customerUser.deleteMany({ where: { id: userId } });
      }
    });

    it("finds inflight register rows case-insensitively", async () => {
      const user = await prisma.customerUser.create({
        data: { email: `${tag}@example.test` },
      });
      userId = user.id;
      const order = await prisma.domainOrder.create({
        data: {
          publicId: `DOM-${tag}`,
          userId: user.id,
          orderType: "register",
          domain: mixedCaseDomain,
          tld: ".com",
          status: "PROCESSING",
          retailPrice: new Prisma.Decimal(10),
          total: new Prisma.Decimal(10),
          currency: "USD",
          idempotencyKey: `idem-${tag}-1`,
        },
      });
      orderId = order.id;

      const found = await prisma.domainOrder.findFirst({
        where: inflightDomainOrderFilter({
          domain: lowerDomain,
          orderType: "register",
        }),
      });
      assert.ok(found);
      assert.equal(found.id, order.id);
    });

    it("rejects concurrent duplicate register inflight via unique index (P2002)", async () => {
      const user = await prisma.customerUser.create({
        data: { email: `${tag}-dup@example.test` },
      });
      const domainBase = `dup-${tag}.com`;
      const first = await prisma.domainOrder.create({
        data: {
          publicId: `DOM-${tag}-a`,
          userId: user.id,
          orderType: "register",
          domain: domainBase,
          tld: ".com",
          status: "PROCESSING",
          retailPrice: new Prisma.Decimal(10),
          total: new Prisma.Decimal(10),
          currency: "USD",
          idempotencyKey: `idem-${tag}-a`,
        },
      });

      let caught: unknown;
      try {
        await prisma.domainOrder.create({
          data: {
            publicId: `DOM-${tag}-b`,
            userId: user.id,
            orderType: "register",
            domain: domainBase.toUpperCase(),
            tld: ".com",
            status: "PROCESSING",
            retailPrice: new Prisma.Decimal(10),
            total: new Prisma.Decimal(10),
            currency: "USD",
            idempotencyKey: `idem-${tag}-b`,
          },
        });
      } catch (error) {
        caught = error;
      }

      assert.ok(caught instanceof Prisma.PrismaClientKnownRequestError);
      assert.equal(
        (caught as Prisma.PrismaClientKnownRequestError).code,
        "P2002",
      );

      await prisma.domainOrder.delete({ where: { id: first.id } });
      await prisma.customerUser.delete({ where: { id: user.id } });
    });
  },
);
