import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { describe, it } from "node:test";

import { consumePrismaRateLimit } from "@/lib/beyond-master/postgres-rate-limit";
import { prisma } from "@/lib/prisma";
import {
  assertIntegrationDatabaseTarget,
  shouldRunDatabaseIntegrationTests,
} from "@/lib/test/integration-gate";

describe(
  "Beyond Master PostgreSQL rate limit (integration concurrency)",
  { skip: !shouldRunDatabaseIntegrationTests(), concurrency: 1 },
  () => {
    it("allows exactly max concurrent increments per window key", async () => {
      assertIntegrationDatabaseTarget();
      const bucketKey = `rate-int-${randomUUID().slice(0, 8)}`;
      const maxRequests = 5;
      const windowMs = 60_000;

      const outcomes = await Promise.all(
        Array.from({ length: 8 }, () =>
          consumePrismaRateLimit({
            bucketKey,
            maxRequests,
            windowMs,
          }),
        ),
      );
      assert.equal(outcomes.filter(Boolean).length, maxRequests);
      assert.equal(outcomes.filter((o) => !o).length, 8 - maxRequests);

      const row = await prisma.beyondMasterRateLimitBucket.findUnique({
        where: { bucketKey },
      });
      assert.ok(row);
      assert.equal(row!.count, maxRequests);

      await prisma.beyondMasterRateLimitBucket.deleteMany({
        where: { bucketKey },
      });
    });

    it("isolates different bucket keys", async () => {
      assertIntegrationDatabaseTarget();
      const a = `rate-a-${randomUUID().slice(0, 8)}`;
      const b = `rate-b-${randomUUID().slice(0, 8)}`;
      const [oa, ob] = await Promise.all([
        consumePrismaRateLimit({
          bucketKey: a,
          maxRequests: 1,
          windowMs: 60_000,
        }),
        consumePrismaRateLimit({
          bucketKey: b,
          maxRequests: 1,
          windowMs: 60_000,
        }),
      ]);
      assert.equal(oa, true);
      assert.equal(ob, true);
      await prisma.beyondMasterRateLimitBucket.deleteMany({
        where: { bucketKey: { in: [a, b] } },
      });
    });
  },
);
