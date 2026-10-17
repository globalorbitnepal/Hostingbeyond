import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createInFlightTransferRecord,
  findInFlightTransferForUserDomain,
  TRANSFER_INFLIGHT_UNIQUE_INDEX,
} from "@/lib/domains/transfer-inflight";
import { prisma } from "@/lib/prisma";

const TEST_EMAIL = "transfer-inflight-test@hostingbeyond.local";

import { isIntegrationDatabaseConfigured } from "@/lib/test/integration-gate";

async function ensureMigrationApplied() {
  const rows = await prisma.$queryRaw<{ indexname: string }[]>`
    SELECT indexname FROM pg_indexes
    WHERE indexname = ${TRANSFER_INFLIGHT_UNIQUE_INDEX}
  `;
  if (rows.length === 0) {
    throw new Error(
      `Missing index ${TRANSFER_INFLIGHT_UNIQUE_INDEX} — run prisma migrate deploy against the test database`,
    );
  }
}

describe(
  "Transfer in-flight unique (database)",
  { skip: !isIntegrationDatabaseConfigured(), concurrency: 1 },
  () => {
    let userId = "";

    it("prepares test user", async () => {
      await ensureMigrationApplied();
      const user = await prisma.customerUser.upsert({
        where: { email: TEST_EMAIL },
        create: { email: TEST_EMAIL, name: "Transfer Inflight Test" },
        update: {},
      });
      userId = user.id;
      await prisma.domainTransferRecord.deleteMany({
        where: { userId, domain: { contains: "inflight-race-" } },
      });
    });

    it("rejects a second in-flight row for the same user and domain (case-insensitive)", async () => {
      const domain = `inflight-race-${Date.now()}.com`;
      const first = await createInFlightTransferRecord({
        publicId: `TRF-T1-${Date.now()}`,
        userId,
        domain,
        tld: ".com",
        retailPrice: 12.99,
        total: 12.99,
        currency: "USD",
        authCodeHint: "ab***",
      });
      assert.equal(first.ok, true);

      const second = await createInFlightTransferRecord({
        publicId: `TRF-T2-${Date.now()}`,
        userId,
        domain: domain.toUpperCase(),
        tld: ".com",
        retailPrice: 12.99,
        total: 12.99,
        currency: "USD",
        authCodeHint: "cd***",
      });
      assert.equal(second.ok, false);
      if (!second.ok) {
        assert.equal(second.reason, "duplicate_inflight");
        assert.equal(second.existing.id, first.record.id);
      }
    });

    it("concurrent creates with different idempotency context yield one winner", async () => {
      const domain = `inflight-race-concurrent-${Date.now()}.com`;
      const attempts = await Promise.all(
        Array.from({ length: 8 }, (_, i) =>
          createInFlightTransferRecord({
            publicId: `TRF-C${i}-${Date.now()}`,
            userId,
            domain: i % 2 === 0 ? domain : domain.toUpperCase(),
            tld: ".com",
            retailPrice: 12.99,
            total: 12.99,
            currency: "USD",
            authCodeHint: "xy***",
          }),
        ),
      );
      const winners = attempts.filter((a) => a.ok);
      const losers = attempts.filter((a) => !a.ok);
      assert.equal(winners.length, 1);
      assert.equal(losers.length, 7);
      const inFlight = await findInFlightTransferForUserDomain(userId, domain);
      assert.ok(inFlight);
      assert.equal(inFlight!.id, winners[0]!.record.id);
    });

    it("allows a new transfer after the previous attempt failed", async () => {
      const domain = `inflight-race-retry-${Date.now()}.com`;
      const first = await createInFlightTransferRecord({
        publicId: `TRF-R1-${Date.now()}`,
        userId,
        domain,
        tld: ".com",
        retailPrice: 12.99,
        total: 12.99,
        currency: "USD",
        authCodeHint: "ab***",
      });
      assert.equal(first.ok, true);
      await prisma.domainTransferRecord.update({
        where: { id: first.record.id },
        data: { status: "FAILED" },
      });
      const retry = await createInFlightTransferRecord({
        publicId: `TRF-R2-${Date.now()}`,
        userId,
        domain,
        tld: ".com",
        retailPrice: 12.99,
        total: 12.99,
        currency: "USD",
        authCodeHint: "cd***",
      });
      assert.equal(retry.ok, true);
      assert.notEqual(retry.record.id, first.record.id);
    });

    it("cleans up test rows", async () => {
      await prisma.domainTransferRecord.deleteMany({
        where: { userId, domain: { contains: "inflight-race-" } },
      });
    });
  },
);
